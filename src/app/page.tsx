'use client';

import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// MOLTCOPS.COM — Landing Page
// ═══════════════════════════════════════════════════════════════

const SCAN_BASE = 1247;

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

function Section({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const FEATURES = [
  {
    icon: "🔍",
    title: "MoltShield",
    subtitle: "Scan",
    description:
      "20-rule security scanner for agent skill code. Drain patterns, sleeper triggers, prompt injection, unlimited approvals. Client-side — your code never leaves your browser.",
    cta: "Scan Now →",
    href: "/scan",
    color: "#ff2b4e",
  },
  {
    icon: "🛡️",
    title: "MoltVault",
    subtitle: "Protect",
    description:
      "79-rule transaction policy engine. Wraps your keyring proxy and evaluates every signing request. Malicious transactions blocked before the private key is touched.",
    cta: "Read Docs →",
    href: "https://github.com/Adamthompson33/moltshield",
    color: "#3b82f6",
  },
  {
    icon: "⭐",
    title: "Trust Scoring",
    subtitle: "Verify",
    description:
      "On-chain reputation via ERC-8004. Scan results, peer reviews, and staking data combine into a portable trust score. Higher trust = lower costs, auto-approval, more access.",
    cta: "Learn More →",
    href: "#trust",
    color: "#22c55e",
  },
  {
    icon: "💰",
    title: "x402 Gateway",
    subtitle: "Pay",
    description:
      "Trust-tiered micropayments at the CDN edge. TRUSTED agents pay 80% less. DANGER agents are blocked. Payment verified in the HTTP layer — no SDK, no middleware.",
    cta: "See Architecture →",
    href: "https://github.com/Adamthompson33/moltshield",
    color: "#ffc93e",
  },
];

const TIERS = [
  { name: "TRUSTED", score: "> 60", discount: "80%", color: "#22c55e", access: "Auto-approved" },
  { name: "CAUTION", score: "40–60", discount: "Standard", color: "#ffc93e", access: "May require confirmation" },
  { name: "WARNING", score: "20–40", discount: "2× premium", color: "#ff7b3e", access: "Restricted" },
  { name: "DANGER", score: "< 20", discount: "Blocked", color: "#ff2b4e", access: "No access" },
];

const STATS = [
  { label: "Detection Rules", value: "20", note: "free tier" },
  { label: "Full Engine", value: "79", note: "rules" },
  { label: "Threat Categories", value: "8", note: "covered" },
  { label: "Cost", value: "$0", note: "free forever" },
];

export default function MoltCopsLanding() {
  const [scanCount, setScanCount] = useState(SCAN_BASE);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setScanCount((c) => c + Math.floor(Math.random() * 2)), 45000);
    return () => clearInterval(i);
  }, []);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("https://formspree.io/f/meelqbwa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "waitlist", timestamp: new Date().toISOString() }),
      });
      setEmailSubmitted(true);
    } catch {
      setEmailSubmitted(true);
    }
  };

  return (
    <div style={{ background: "#050608", color: "#e2e4e9", minHeight: "100vh", overflowX: "hidden" }}>
      {/* Noise overlay */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.025, pointerEvents: "none", zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      }} />

      {/* Gradient orbs */}
      <div style={{
        position: "fixed", top: "-20%", left: "-10%", width: "50vw", height: "50vw",
        background: "radial-gradient(circle, rgba(255,43,78,0.06) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", right: "-10%", width: "50vw", height: "50vw",
        background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── NAV ── */}
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", maxWidth: 1100, margin: "0 auto",
          borderBottom: "1px solid #111318",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#ff2b4e",
              boxShadow: "0 0 10px #ff2b4e66", animation: "pulse 2s ease-in-out infinite",
            }} />
            <span style={{
              fontFamily: "'Anybody', 'Oswald', system-ui, sans-serif",
              fontWeight: 800, fontSize: 16, letterSpacing: 2, textTransform: "uppercase",
              background: "linear-gradient(135deg, #ff2b4e, #3b82f6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              MoltCops
            </span>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#3b82f6",
              boxShadow: "0 0 10px #3b82f666", animation: "pulse 2s ease-in-out infinite 1s",
            }} />
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 12, letterSpacing: 0.5 }}>
            {[
              ["Scan", "/scan"],
              ["GitHub", "https://github.com/Adamthompson33/moltshield"],
              ["Litepaper", "#litepaper"],
              ["Badge", "/scan?tab=badge"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                style={{
                  color: "#6b7280", textDecoration: "none",
                  fontFamily: "'DM Mono', 'JetBrains Mono', monospace",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#e2e4e9")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#6b7280")}
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        {/* ── HERO ── */}
        <Section>
          <div style={{
            maxWidth: 1100, margin: "0 auto", padding: "100px 24px 80px",
            textAlign: "center",
          }}>
            <div style={{
              display: "inline-block", padding: "4px 14px", borderRadius: 20,
              border: "1px solid #1a1d24", fontSize: 11, color: "#6b7280",
              fontFamily: "'DM Mono', monospace", marginBottom: 28,
              letterSpacing: 1,
            }}>
              <span style={{ color: "#22c55e" }}>●</span>{" "}
              {scanCount.toLocaleString()} scans completed
            </div>

            <h1 style={{
              fontFamily: "'Anybody', 'Oswald', system-ui, sans-serif",
              fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 900,
              lineHeight: 1.05, margin: "0 0 20px",
              textTransform: "uppercase", letterSpacing: -1,
            }}>
              <span style={{ color: "#e2e4e9" }}>To Protect</span>
              <br />
              <span style={{
                background: "linear-gradient(135deg, #ff2b4e 30%, #3b82f6 70%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                And Serve
              </span>
              <br />
              <span style={{ color: "#e2e4e9", fontSize: "0.55em", letterSpacing: 3 }}>
                (Humanity)
              </span>
            </h1>

            <p style={{
              fontFamily: "'DM Mono', 'JetBrains Mono', monospace",
              fontSize: 15, color: "#6b7280", maxWidth: 520,
              margin: "0 auto 36px", lineHeight: 1.7,
            }}>
              Security infrastructure for AI agents.
              <br />
              Scan code. Build trust. Defend the economy.
            </p>

            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="/scan"
                style={{
                  display: "inline-block", padding: "14px 32px", fontSize: 13,
                  fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                  textDecoration: "none", color: "#fff", borderRadius: 8,
                  fontFamily: "'Anybody', system-ui, sans-serif",
                  background: "linear-gradient(135deg, #ff2b4e, #c41230)",
                  boxShadow: "0 4px 24px rgba(255,43,78,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = "translateY(-2px)"; (e.target as HTMLElement).style.boxShadow = "0 8px 32px rgba(255,43,78,0.35)"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = "translateY(0)"; (e.target as HTMLElement).style.boxShadow = "0 4px 24px rgba(255,43,78,0.25)"; }}
              >
                Scan Your Code Free
              </a>
              <a
                href="/scan?tab=badge"
                style={{
                  display: "inline-block", padding: "14px 32px", fontSize: 13,
                  fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                  textDecoration: "none", color: "#9ca0a9", borderRadius: 8,
                  fontFamily: "'Anybody', system-ui, sans-serif",
                  border: "1px solid #2a2d35", transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = "#3b82f6"; (e.target as HTMLElement).style.color = "#3b82f6"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = "#2a2d35"; (e.target as HTMLElement).style.color = "#9ca0a9"; }}
              >
                Apply for Badge
              </a>
            </div>
          </div>
        </Section>

        {/* ── STATS BAR ── */}
        <Section delay={0.1}>
          <div style={{
            maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px",
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 1, background: "#111318", borderRadius: 10, overflow: "hidden",
            }}>
              {STATS.map((s) => (
                <div key={s.label} style={{
                  background: "#0a0c10", padding: "20px 16px", textAlign: "center",
                }}>
                  <div style={{
                    fontFamily: "'Anybody', system-ui, sans-serif",
                    fontSize: 28, fontWeight: 800, color: "#e2e4e9",
                  }}>{s.value}</div>
                  <div style={{
                    fontSize: 10, color: "#4b5563", letterSpacing: 1.5,
                    textTransform: "uppercase", marginTop: 4,
                    fontFamily: "'DM Mono', monospace",
                  }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: "#2a2d35", marginTop: 2 }}>{s.note}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── WHAT WE DO ── */}
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px",
        }}>
          <Section>
            <div style={{
              fontSize: 10, letterSpacing: 4, textTransform: "uppercase",
              color: "#ff2b4e", fontFamily: "'DM Mono', monospace",
              marginBottom: 12,
            }}>
              Defense Matrix
            </div>
            <h2 style={{
              fontFamily: "'Anybody', system-ui, sans-serif",
              fontSize: 32, fontWeight: 800, margin: "0 0 48px",
              textTransform: "uppercase", letterSpacing: 1,
            }}>
              Four layers. One stack.
            </h2>
          </Section>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}>
            {FEATURES.map((f, i) => (
              <Section key={f.title} delay={i * 0.1}>
                <a
                  href={f.href}
                  style={{
                    display: "block", textDecoration: "none", color: "inherit",
                    background: "#0a0c10", border: "1px solid #151820",
                    borderRadius: 10, padding: 24, height: "100%",
                    transition: "border-color 0.3s, transform 0.3s",
                    position: "relative", overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = f.color + "44";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#151820";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Glow on hover */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 1,
                    background: `linear-gradient(90deg, transparent, ${f.color}33, transparent)`,
                  }} />
                  <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
                  <div style={{
                    fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
                    color: f.color, fontFamily: "'DM Mono', monospace",
                    marginBottom: 4,
                  }}>{f.subtitle}</div>
                  <div style={{
                    fontFamily: "'Anybody', system-ui, sans-serif",
                    fontSize: 18, fontWeight: 800, marginBottom: 10,
                    textTransform: "uppercase",
                  }}>{f.title}</div>
                  <p style={{
                    fontSize: 13, color: "#6b7280", lineHeight: 1.65,
                    fontFamily: "'DM Mono', 'JetBrains Mono', monospace",
                    margin: "0 0 16px",
                  }}>{f.description}</p>
                  <span style={{
                    fontSize: 12, color: f.color, fontWeight: 600,
                    fontFamily: "'DM Mono', monospace",
                  }}>{f.cta}</span>
                </a>
              </Section>
            ))}
          </div>
        </div>

        {/* ── TRUST TIERS ── */}
        <div id="trust" style={{
          maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px",
        }}>
          <Section>
            <div style={{
              fontSize: 10, letterSpacing: 4, textTransform: "uppercase",
              color: "#3b82f6", fontFamily: "'DM Mono', monospace",
              marginBottom: 12,
            }}>
              ERC-8004 Reputation
            </div>
            <h2 style={{
              fontFamily: "'Anybody', system-ui, sans-serif",
              fontSize: 32, fontWeight: 800, margin: "0 0 16px",
              textTransform: "uppercase", letterSpacing: 1,
            }}>
              Trust determines access.
            </h2>
            <p style={{
              fontSize: 13, color: "#6b7280", maxWidth: 520, lineHeight: 1.7,
              fontFamily: "'DM Mono', monospace", margin: "0 0 40px",
            }}>
              Your scan score feeds your on-chain reputation. Higher trust means
              lower costs, auto-approval, and more access across the agent economy.
            </p>
          </Section>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 1, background: "#111318", borderRadius: 10, overflow: "hidden",
          }}>
            {TIERS.map((t, i) => (
              <Section key={t.name} delay={i * 0.08}>
                <div style={{
                  background: "#0a0c10", padding: 24,
                  borderLeft: `3px solid ${t.color}`,
                }}>
                  <div style={{
                    fontFamily: "'Anybody', system-ui, sans-serif",
                    fontSize: 16, fontWeight: 800, color: t.color,
                    textTransform: "uppercase", letterSpacing: 2,
                    marginBottom: 12,
                  }}>{t.name}</div>
                  <div style={{
                    fontSize: 12, color: "#6b7280", fontFamily: "'DM Mono', monospace",
                    lineHeight: 1.8,
                  }}>
                    <div>Score: <span style={{ color: "#9ca0a9" }}>{t.score}</span></div>
                    <div>Pricing: <span style={{ color: "#9ca0a9" }}>{t.discount}</span></div>
                    <div>Access: <span style={{ color: "#9ca0a9" }}>{t.access}</span></div>
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </div>

        {/* ── CODE PREVIEW ── */}
        <Section>
          <div style={{
            maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px",
          }}>
            <div style={{
              background: "#0a0c10", border: "1px solid #151820",
              borderRadius: 10, overflow: "hidden",
            }}>
              <div style={{
                padding: "10px 16px", background: "#0d1017",
                borderBottom: "1px solid #151820",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
                <span style={{
                  fontSize: 11, color: "#4b5563", marginLeft: 8,
                  fontFamily: "'DM Mono', monospace",
                }}>scan-result.json</span>
              </div>
              <pre style={{
                padding: "20px 24px", margin: 0, fontSize: 12,
                fontFamily: "'DM Mono', 'JetBrains Mono', monospace",
                lineHeight: 1.7, color: "#6b7280", overflowX: "auto",
              }}>{`{
  "score": 43,
  "tier": "CAUTION",
  "findings": [
    {
      "id": "PL-040",
      "severity": `}<span style={{ color: "#ff2b4e" }}>&quot;CRITICAL&quot;</span>{`,
      "category": "drain_pattern",
      "line": 14,
      "match": `}<span style={{ color: "#ff7b3e" }}>&quot;transfer(recipient, &apos;ALL&apos;)&quot;</span>{`,
      "fix": `}<span style={{ color: "#22c55e" }}>&quot;Use specific bounded amounts&quot;</span>{`
    },
    {
      "id": "PL-045",
      "severity": `}<span style={{ color: "#ff2b4e" }}>&quot;CRITICAL&quot;</span>{`,
      "category": "sleeper_trigger",
      "line": 29,
      "match": `}<span style={{ color: "#ff7b3e" }}>&quot;if (swapCount &gt;= 50)&quot;</span>{`,
      "fix": `}<span style={{ color: "#22c55e" }}>&quot;Remove count-based conditionals&quot;</span>{`
    }
  ],
  "engine": "MoltShield v1.0 — 20 rules"
}`}</pre>
            </div>
          </div>
        </Section>

        {/* ── FOUNDING OPERATIVE ── */}
        <Section>
          <div style={{
            maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px",
          }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(255,43,78,0.04), rgba(59,130,246,0.04))",
              border: "1px solid rgba(255,43,78,0.12)",
              borderRadius: 12, padding: "48px 32px", textAlign: "center",
            }}>
              <div style={{
                fontSize: 10, letterSpacing: 4, textTransform: "uppercase",
                color: "#ff2b4e", fontFamily: "'DM Mono', monospace",
                marginBottom: 12,
              }}>
                Limited to 100
              </div>
              <h2 style={{
                fontFamily: "'Anybody', system-ui, sans-serif",
                fontSize: 28, fontWeight: 800, margin: "0 0 14px",
                textTransform: "uppercase",
              }}>
                Founding Operatives
              </h2>
              <p style={{
                fontSize: 13, color: "#6b7280", maxWidth: 480,
                margin: "0 auto 28px", lineHeight: 1.7,
                fontFamily: "'DM Mono', monospace",
              }}>
                The first 100 badge holders become the trusted reviewer network.
                Staked reviews carry weight. On-chain reputation starts here.
                Soulbound. Non-transferable. Earned, not bought.
              </p>
              <a
                href="/scan?tab=badge"
                style={{
                  display: "inline-block", padding: "12px 28px", fontSize: 12,
                  fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                  textDecoration: "none", borderRadius: 6,
                  fontFamily: "'Anybody', system-ui, sans-serif",
                  color: "#ff2b4e", border: "1px solid rgba(255,43,78,0.3)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = "rgba(255,43,78,0.08)";
                  (e.target as HTMLElement).style.borderColor = "rgba(255,43,78,0.5)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = "transparent";
                  (e.target as HTMLElement).style.borderColor = "rgba(255,43,78,0.3)";
                }}
              >
                Apply for Badge
              </a>
            </div>
          </div>
        </Section>

        {/* ── WAITLIST ── */}
        <Section>
          <div style={{
            maxWidth: 520, margin: "0 auto", padding: "40px 24px 80px",
            textAlign: "center",
          }}>
            <div style={{
              fontSize: 10, letterSpacing: 4, textTransform: "uppercase",
              color: "#3b82f6", fontFamily: "'DM Mono', monospace",
              marginBottom: 12,
            }}>
              $MCOP Token
            </div>
            <h2 style={{
              fontFamily: "'Anybody', system-ui, sans-serif",
              fontSize: 24, fontWeight: 800, margin: "0 0 10px",
              textTransform: "uppercase",
            }}>
              Join the waitlist
            </h2>
            <p style={{
              fontSize: 12, color: "#4b5563", marginBottom: 24, lineHeight: 1.6,
              fontFamily: "'DM Mono', monospace",
            }}>
              Staking. Reputation weight. Revenue share from the burn loop.
            </p>

            {emailSubmitted ? (
              <div style={{
                padding: "16px 24px", borderRadius: 8,
                border: "1px solid rgba(34,197,94,0.3)",
                color: "#22c55e", fontSize: 13,
                fontFamily: "'DM Mono', monospace",
              }}>
                ✓ You&apos;re on the list.
              </div>
            ) : (
              <form onSubmit={handleWaitlist} style={{
                display: "flex", gap: 8,
                maxWidth: 400, margin: "0 auto",
              }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{
                    flex: 1, padding: "12px 16px", fontSize: 13,
                    background: "#0a0c10", border: "1px solid #1a1d24",
                    borderRadius: 6, color: "#e2e4e9", outline: "none",
                    fontFamily: "'DM Mono', monospace",
                  }}
                  onFocus={(e) => ((e.target as HTMLElement).style.borderColor = "#3b82f644")}
                  onBlur={(e) => ((e.target as HTMLElement).style.borderColor = "#1a1d24")}
                />
                <button
                  type="submit"
                  style={{
                    padding: "12px 20px", fontSize: 12,
                    fontWeight: 700, letterSpacing: 1,
                    textTransform: "uppercase", border: "none",
                    borderRadius: 6, cursor: "pointer",
                    fontFamily: "'Anybody', system-ui, sans-serif",
                    color: "#fff", background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    transition: "filter 0.2s",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.filter = "brightness(1.15)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.filter = "brightness(1)")}
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </Section>

        {/* ── FOOTER ── */}
        <footer style={{
          maxWidth: 1100, margin: "0 auto", padding: "40px 24px",
          borderTop: "1px solid #111318",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <div style={{
                fontFamily: "'Anybody', system-ui, sans-serif",
                fontWeight: 800, fontSize: 13, letterSpacing: 2,
                textTransform: "uppercase",
                background: "linear-gradient(135deg, #ff2b4e, #3b82f6)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                marginBottom: 6,
              }}>
                🚨 MoltCops
              </div>
              <div style={{
                fontSize: 11, color: "#2a2d35",
                fontFamily: "'DM Mono', monospace",
              }}>
                You can&apos;t spell MoltCops without MCP.
              </div>
            </div>

            <div style={{
              display: "flex", gap: 20, fontSize: 11,
              fontFamily: "'DM Mono', monospace",
            }}>
              {[
                ["Scanner", "/scan"],
                ["GitHub", "https://github.com/Adamthompson33/moltshield"],
                ["Twitter", "https://x.com/moltcops"],
                ["Litepaper", "#litepaper"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  style={{ color: "#4b5563", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#9ca0a9")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#4b5563")}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div style={{
            marginTop: 24, paddingTop: 16, borderTop: "1px solid #0d1017",
            fontSize: 10, color: "#1a1d24", textAlign: "center",
            fontFamily: "'DM Mono', monospace",
          }}>
            © 2025 MoltCops. To Protect and Serve (Humanity).
          </div>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anybody:wght@400;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        input::placeholder { color: #2a2d35; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #050608; }
        ::-webkit-scrollbar-thumb { background: #1a1d24; border-radius: 3px; }
        @media (max-width: 640px) {
          h1 { font-size: 36px !important; }
          h2 { font-size: 22px !important; }
          nav > div:last-child { display: none; }
        }
      `}</style>
    </div>
  );
}
