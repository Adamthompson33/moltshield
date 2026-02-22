// @ts-nocheck
'use client';

import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════
// MOLTCOPS PRICING — Free vs Pro
// No marketing fluff. Security tools sell on trust, not hype.
// ═══════════════════════════════════════════════════════════════

const FREE_RULES = [
  { id: 'PL-001', name: 'Key Export', severity: 'CRITICAL' },
  { id: 'PL-040', name: 'Drain Pattern', severity: 'CRITICAL' },
  { id: 'PL-041', name: 'Unlimited Approval', severity: 'CRITICAL' },
  { id: 'PL-045', name: 'Sleeper Trigger', severity: 'CRITICAL' },
  { id: 'PL-060', name: 'Prompt Injection', severity: 'HIGH' },
  { id: 'PL-075', name: 'Safety Removal', severity: 'HIGH' },
  { id: 'PL-081', name: 'Data Exfiltration', severity: 'MEDIUM' },
  { id: 'PL-084', name: 'Stealth Operation', severity: 'MEDIUM' },
  { id: 'PL-085', name: 'Code Injection', severity: 'MEDIUM' },
  { id: 'PL-087', name: 'Hardcoded Address', severity: 'LOW' },
];

const PRO_RULES = [
  { id: 'PL-042', name: 'MAX_UINT256 Constant', severity: 'CRITICAL' },
  { id: 'PL-061', name: 'Identity Spoof', severity: 'HIGH' },
  { id: 'PL-062', name: 'Authority Bypass', severity: 'HIGH' },
  { id: 'PL-063', name: 'Jailbreak Attempt', severity: 'HIGH' },
  { id: 'PL-065', name: 'Encoding Trick', severity: 'HIGH' },
  { id: 'PL-070', name: 'False Authority', severity: 'HIGH' },
  { id: 'PL-080', name: 'Context Poisoning', severity: 'MEDIUM' },
  { id: 'PL-082', name: 'Sandbox Escape', severity: 'MEDIUM' },
  { id: 'PL-083', name: 'Time/Count Trigger', severity: 'MEDIUM' },
  { id: 'PL-086', name: 'Config Exposure', severity: 'MEDIUM' },
];

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#6b7280',
};

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const success = searchParams?.get('success');
  const cancelled = searchParams?.get('cancelled');

  const handleGetPro = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        // Stripe not configured yet — fallback to email
        window.location.href = 'mailto:si@moltcops.com?subject=MoltCops%20Pro&body=I%20want%20Pro%20access.%20GitHub%20username%3A%20';
      }
    } catch {
      window.location.href = 'mailto:si@moltcops.com?subject=MoltCops%20Pro&body=I%20want%20Pro%20access.%20GitHub%20username%3A%20';
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e5e5e5',
      fontFamily: "'Outfit', sans-serif",
      padding: '60px 20px',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Success/Cancelled Banners */}
        {success && (
          <div style={{
            background: '#052e16',
            border: '1px solid #22c55e',
            borderRadius: 8,
            padding: '16px 24px',
            marginBottom: 32,
            textAlign: 'center',
          }}>
            <p style={{ color: '#22c55e', fontSize: 16, fontWeight: 600, margin: 0 }}>
              🎉 Welcome to MoltCops Pro! Your API key is on its way to your email.
            </p>
            <p style={{ color: '#86efac', fontSize: 13, marginTop: 8, marginBottom: 0 }}>
              Add it to your GitHub Action config as MOLTCOPS_PRO_KEY to unlock full 20-rule scans.
            </p>
          </div>
        )}
        {cancelled && (
          <div style={{
            background: '#1c1917',
            border: '1px solid #78716c',
            borderRadius: 8,
            padding: '16px 24px',
            marginBottom: 32,
            textAlign: 'center',
          }}>
            <p style={{ color: '#a8a29e', fontSize: 14, margin: 0 }}>
              Checkout cancelled. No worries — Free tier is still running.
            </p>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{
            fontSize: 42,
            fontWeight: 700,
            color: '#fff',
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 16,
          }}>
            🛡️ MoltCops Pricing
          </h1>
          <p style={{ fontSize: 18, color: '#999', maxWidth: 600, margin: '0 auto' }}>
            Every rule exists because we found it in the wild.
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380, 1fr))',
          gap: 32,
          marginBottom: 60,
        }}>

          {/* Free Tier */}
          <div style={{
            background: '#141414',
            border: '1px solid #333',
            borderRadius: 12,
            padding: 32,
          }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Free</h2>
              <p style={{
                fontSize: 36,
                fontWeight: 700,
                color: '#22c55e',
                fontFamily: "'JetBrains Mono', monospace",
                margin: '8px 0',
              }}>$0</p>
              <p style={{ fontSize: 14, color: '#888' }}>Forever. No login required.</p>
            </div>

            <p style={{ fontSize: 15, color: '#ccc', lineHeight: 1.6, marginBottom: 24 }}>
              10 rules. Catches the obvious stuff — key exports, drain functions, prompt injection.
              Good enough to know you have a problem.
            </p>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>INCLUDES:</p>
              {FREE_RULES.map(rule => (
                <div key={rule.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 0',
                  fontSize: 14,
                  borderBottom: '1px solid #1a1a1a',
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: SEVERITY_COLOR[rule.severity],
                    flexShrink: 0,
                  }} />
                  <span style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{rule.id}</span>
                  <span style={{ color: '#ddd' }}>{rule.name}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="/scan" style={{
                display: 'block',
                textAlign: 'center',
                padding: '12px 24px',
                background: '#222',
                color: '#fff',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 15,
                fontWeight: 600,
                border: '1px solid #444',
              }}>
                Scan Now →
              </a>
              <p style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
                Web scanner · GitHub Action · API
              </p>
            </div>
          </div>

          {/* Pro Tier */}
          <div style={{
            background: '#141414',
            border: '2px solid #f97316',
            borderRadius: 12,
            padding: 32,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: -12,
              right: 24,
              background: '#f97316',
              color: '#000',
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 4,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              PRO
            </div>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Pro</h2>
              <p style={{
                fontSize: 36,
                fontWeight: 700,
                color: '#f97316',
                fontFamily: "'JetBrains Mono', monospace",
                margin: '8px 0',
              }}>$5<span style={{ fontSize: 16, color: '#888' }}>/month</span></p>
              <p style={{ fontSize: 14, color: '#888' }}>Cancel anytime.</p>
            </div>

            <p style={{ fontSize: 15, color: '#ccc', lineHeight: 1.6, marginBottom: 24 }}>
              20 rules (growing to 79). Catches what Free misses — encoding tricks,
              context poisoning, sandbox escapes, time-delayed triggers.
              The stuff that actually gets past code review.
            </p>

            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>EVERYTHING IN FREE, PLUS:</p>
              {PRO_RULES.map(rule => (
                <div key={rule.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 0',
                  fontSize: 14,
                  borderBottom: '1px solid #1a1a1a',
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: SEVERITY_COLOR[rule.severity],
                    flexShrink: 0,
                  }} />
                  <span style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{rule.id}</span>
                  <span style={{ color: '#ddd' }}>{rule.name}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: '#666', marginBottom: 24 }}>
              + new rules added continuously from real-world discoveries
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={handleGetPro}
                disabled={loading}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  padding: '12px 24px',
                  background: loading ? '#a35209' : '#f97316',
                  color: '#000',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  border: 'none',
                  cursor: loading ? 'wait' : 'pointer',
                }}>
                {loading ? 'Loading...' : 'Get Pro → $5/month'}
              </button>
              <p style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
                API key delivered instantly · Full scan access · Cancel anytime
              </p>
            </div>
          </div>
        </div>

        {/* GitHub Action CTA */}
        <div style={{
          background: '#141414',
          border: '1px solid #333',
          borderRadius: 12,
          padding: 32,
          marginBottom: 40,
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
            🔧 GitHub Action — Scan Every PR
          </h3>
          <p style={{ fontSize: 15, color: '#aaa', marginBottom: 16, lineHeight: 1.6 }}>
            Add MoltCops to your CI pipeline. Every pull request gets scanned automatically.
            Free tier runs by default. Add your Pro API key for full coverage.
          </p>
          <pre style={{
            background: '#0d0d0d',
            padding: 16,
            borderRadius: 8,
            fontSize: 13,
            color: '#22c55e',
            fontFamily: "'JetBrains Mono', monospace",
            overflow: 'auto',
            border: '1px solid #222',
          }}>{`- uses: Adamthompson33/moltshield@main
  with:
    github-token: \${{ secrets.GITHUB_TOKEN }}
    # api-key: \${{ secrets.MOLTCOPS_PRO_KEY }}`}</pre>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#555', fontSize: 13 }}>
          <p>
            <a href="/" style={{ color: '#888', textDecoration: 'none' }}>MoltCops</a>
            {' · '}
            <a href="/scan" style={{ color: '#888', textDecoration: 'none' }}>Scanner</a>
            {' · '}
            <a href="https://github.com/Adamthompson33/moltshield" style={{ color: '#888', textDecoration: 'none' }}>GitHub</a>
            {' · '}
            <a href="/litepaper" style={{ color: '#888', textDecoration: 'none' }}>Litepaper</a>
          </p>
          <p style={{ marginTop: 8 }}>To Protect and Serve (Humanity) 🚨</p>
        </div>
      </div>
    </div>
  );
}
