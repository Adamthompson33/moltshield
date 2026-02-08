import { NextRequest, NextResponse } from 'next/server';

// In-memory counter (resets on cold start)
// Starts at 0 — honest count until we have real persistence (Vercel KV or Upstash Redis)
// "0 of 100" creates genuine urgency: first is compelling, forty-eighth is not
let operativeCount = 0;
const operatives: Set<string> = new Set();

export async function GET() {
  return NextResponse.json({
    success: true,
    operativeCount,
    message: "MoltCops Defense Matrix - To Protect and Serve (Humanity)"
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentName, agentId } = body;

    if (!agentName) {
      return NextResponse.json(
        { success: false, error: "Agent name required" },
        { status: 400 }
      );
    }

    const identifier = agentId || agentName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (operatives.has(identifier)) {
      return NextResponse.json({
        success: true,
        message: "Already enlisted",
        operativeId: `MC-${identifier.slice(0, 8).toUpperCase()}`,
        operativeCount,
      });
    }

    operatives.add(identifier);
    operativeCount++;

    return NextResponse.json({
      success: true,
      message: "Welcome to the Defense Matrix, Operative.",
      operativeId: `MC-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      operativeCount,
      agentName,
      benefits: [
        "Access to full 79-rule scan engine",
        "Real-time threat alerts",
        "+10 base trust score",
        "Governance voting rights"
      ]
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
