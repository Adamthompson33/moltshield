import { NextRequest, NextResponse } from 'next/server';
import { generateProKey, revokeBySubscription } from '@/lib/api-keys';

// ═══════════════════════════════════════════════════════════════
// STRIPE WEBHOOK — Handle subscription events
//
// Events:
//   checkout.session.completed → generate Pro API key, email customer
//   customer.subscription.deleted → revoke API key
// ═══════════════════════════════════════════════════════════════

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Verify Stripe webhook signature using Web Crypto API
async function verifySignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!secret || secret === 'whsec_placeholder') return false;

  const parts = signature.split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
  const sig = parts.find(p => p.startsWith('v1='))?.slice(3);

  if (!timestamp || !sig) return false;

  // Check timestamp tolerance (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  // Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expected = Array.from(new Uint8Array(mac))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return expected === sig;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  // Verify webhook signature
  const valid = await verifySignature(body, signature, STRIPE_WEBHOOK_SECRET);
  if (!valid && STRIPE_WEBHOOK_SECRET !== 'whsec_placeholder') {
    console.error('Stripe webhook: invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  console.log(`Stripe webhook: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const email = session.customer_details?.email || session.customer_email || '';
      const customerId = session.customer || '';
      const subscriptionId = session.subscription || '';

      if (!email) {
        console.error('Stripe webhook: no email in checkout session');
        break;
      }

      // Generate Pro API key
      const proKey = generateProKey(email, customerId, subscriptionId);
      console.log(`Pro key generated for ${email}: ${proKey.key.slice(0, 12)}...`);

      // Send API key to customer via email
      // Using Stripe's built-in receipt + a metadata approach for now
      // In production: use AgentMail, Resend, or SendGrid
      await sendApiKeyEmail(email, proKey.key);

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const subscriptionId = subscription.id;

      const revoked = revokeBySubscription(subscriptionId);
      console.log(`Subscription ${subscriptionId} cancelled. Key revoked: ${revoked}`);

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      // Handle downgrades, payment failures, etc.
      if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
        console.log(`Subscription ${subscription.id} is ${subscription.status}`);
        // Don't revoke immediately — Stripe retries payments
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// ═══ Email Helper ═══

async function sendApiKeyEmail(email: string, apiKey: string): Promise<void> {
  // Try AgentMail first (Taylor's setup)
  const agentMailKey = process.env.AGENTMAIL_API_KEY;

  if (agentMailKey) {
    try {
      await fetch('https://api.agentmail.to/v0/inboxes/taylor@agentmail.to/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${agentMailKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: [email],
          subject: 'Your MoltCops Pro API Key',
          text: `Welcome to MoltCops Pro!\n\nYour API key: ${apiKey}\n\nSetup:\n1. GitHub Action: Add MOLTCOPS_PRO_KEY to your repo secrets, then add api-key: \${{ secrets.MOLTCOPS_PRO_KEY }} to your workflow.\n2. API: Include header X-MoltCops-Key: ${apiKey} in your /api/scan requests.\n\nYou now have access to all 20 rules (and growing). Full scan on every commit.\n\nQuestions? Reply to this email.\n\n— MoltCops Team\nhttps://moltcops.com`,
        }),
      });
      console.log(`API key email sent to ${email} via AgentMail`);
      return;
    } catch (e: any) {
      console.error(`AgentMail failed: ${e.message}. Logging key for manual delivery.`);
    }
  }

  // Fallback: log for manual delivery
  console.log(`=== MANUAL KEY DELIVERY NEEDED ===`);
  console.log(`Email: ${email}`);
  console.log(`API Key: ${apiKey}`);
  console.log(`=================================`);
}
