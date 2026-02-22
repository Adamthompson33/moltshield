import { NextRequest, NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════
// STRIPE CHECKOUT — Create $5/mo Pro subscription session
// ═══════════════════════════════════════════════════════════════

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || '';

export async function POST(request: NextRequest) {
  if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_placeholder') {
    return NextResponse.json(
      { success: false, error: 'Stripe not configured yet. Coming soon.' },
      { status: 503 }
    );
  }

  try {
    // Get the origin for redirect URLs
    const origin = request.headers.get('origin') || 'https://scan.moltcops.com';

    // Create Stripe Checkout Session
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'line_items[0][price]': STRIPE_PRICE_ID,
        'line_items[0][quantity]': '1',
        'success_url': `${origin}/pricing?success=true`,
        'cancel_url': `${origin}/pricing?cancelled=true`,
        'allow_promotion_codes': 'true',
      }).toString(),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Stripe checkout error:', err);
      return NextResponse.json(
        { success: false, error: 'Failed to create checkout session.' },
        { status: 500 }
      );
    }

    const session = await res.json();

    return NextResponse.json({
      success: true,
      url: session.url,
    });

  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error creating checkout.' },
      { status: 500 }
    );
  }
}

// GET — redirect to checkout (for simple button links)
export async function GET(request: NextRequest) {
  const response = await POST(request);
  const data = await response.json();

  if (data.success && data.url) {
    return NextResponse.redirect(data.url);
  }

  // Fallback: redirect to pricing with error
  return NextResponse.redirect(new URL('/pricing?error=stripe', request.url));
}
