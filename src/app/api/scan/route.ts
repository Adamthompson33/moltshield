import { NextRequest, NextResponse } from 'next/server';
import { runScan, SCAN_RULES } from '@/lib/scan-engine';

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
    for (const [key, val] of rateLimitMap.entries()) {
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
export async function GET() {
  return NextResponse.json({
    success: true,
    name: 'MoltShield Scan API',
    version: '1.0.0',
    rulesCount: SCAN_RULES.length,
    description: 'Server-side skill code security scanner',
    usage: {
      method: 'POST',
      body: '{ "code": "your skill code here" }',
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

    // Run the scan
    const result = runScan(code);

    // Return result with rate limit headers
    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': String(rateCheck.remaining),
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
