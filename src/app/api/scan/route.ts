import { NextRequest, NextResponse } from 'next/server';
import { runScan, SCAN_RULES, FREE_RULES, PRO_RULES, ScanTier } from '@/lib/scan-engine';

// ═══════════════════════════════════════════════════════════════
// PRO TIER AUTH
// For now: API key in X-MoltCops-Key header
// Future: x402 micropayment per scan ($0.01)
// ═══════════════════════════════════════════════════════════════

const PRO_API_KEYS = new Set(
  (process.env.MOLTCOPS_PRO_KEYS || '').split(',').filter(Boolean)
);

function authenticateTier(request: NextRequest): ScanTier {
  const apiKey = request.headers.get('x-moltcops-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  if (apiKey && PRO_API_KEYS.has(apiKey)) return 'pro';
  // Future: check x402 payment receipt here
  return 'free';
}

// ═══════════════════════════════════════════════════════════════
// MOLTSHIELD SCAN API — Server-side scanning endpoint
// Rate limited: 10 scans per IP per minute
// ═══════════════════════════════════════════════════════════════

// Simple in-memory rate limiter (resets on cold start)
// In production, use Vercel KV or Upstash Redis
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, val] of Array.from(rateLimitMap.entries())) {
      if (val.resetAt < now) rateLimitMap.delete(key);
    }
  }

  if (!record || record.resetAt < now) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_WINDOW_MS };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: record.resetAt - now };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count, resetIn: record.resetAt - now };
}

function getClientIP(request: NextRequest): string {
  // Try various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  // Fallback - in Vercel, this should be available
  return request.headers.get('x-vercel-forwarded-for') || 'unknown';
}

// GET - Return API info and rule count
export async function GET(request: NextRequest) {
  const tier = authenticateTier(request);
  return NextResponse.json({
    success: true,
    name: 'MoltShield Scan API',
    version: '2.0.0',
    tier,
    rulesCount: tier === 'pro' ? PRO_RULES.length : FREE_RULES.length,
    totalRules: SCAN_RULES.length,
    description: 'Server-side skill code security scanner',
    pricing: {
      free: { rules: FREE_RULES.length, cost: '$0' },
      pro: { rules: PRO_RULES.length, cost: '$0.01/scan or $5/month' },
    },
    usage: {
      method: 'POST',
      body: '{ "code": "your skill code here" }',
      headers: 'X-MoltCops-Key: <your-pro-key> (optional, for Pro tier)',
      rateLimit: `${RATE_LIMIT} requests per minute`,
    },
  });
}

// POST - Run scan on submitted code
export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  // Check rate limit
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded',
        retryAfterMs: rateCheck.resetIn,
        retryAfterSeconds: Math.ceil(rateCheck.resetIn / 1000),
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)),
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + rateCheck.resetIn),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { code } = body;

    // Validate input
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid "code" field. Expected a string.' },
        { status: 400 }
      );
    }

    // Limit code size (100KB max)
    if (code.length > 100_000) {
      return NextResponse.json(
        { success: false, error: 'Code too large. Maximum size is 100KB.' },
        { status: 400 }
      );
    }

    // Empty code check
    if (code.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Code is empty.' },
        { status: 400 }
      );
    }

    // Determine tier from auth
    const tier = authenticateTier(request);

    // Run the scan with appropriate tier
    const result = runScan(code, tier);

    // Add upgrade hint for free tier
    const upgradeHint = tier === 'free' ? {
      upgrade: {
        message: `Scanned with ${FREE_RULES.length} free rules. Upgrade to Pro for ${PRO_RULES.length} rules including encoding tricks, jailbreak detection, context poisoning, and more.`,
        proRulesCount: PRO_RULES.length,
        missedCategories: PRO_RULES.filter(r => r.tier === 'pro').map(r => r.category),
      },
    } : {};

    // Return result with rate limit headers
    return NextResponse.json(
      {
        success: true,
        ...result,
        ...upgradeHint,
      },
      {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': String(rateCheck.remaining),
          'X-MoltCops-Tier': tier,
        },
      }
    );
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }

    console.error('Scan API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during scan.' },
      { status: 500 }
    );
  }
}
