'use client';

import { useState, useRef, useCallback } from 'react';
import { runScan, SAMPLE_CODE, type ScanResult } from '@/lib/scan-engine';

const SEVERITY_CONFIG = {
  CRITICAL: { color: "#ff2b4e", bg: "rgba(255,43,78,0.08)", border: "rgba(255,43,78,0.25)" },
  HIGH: { color: "#ff7b3e", bg: "rgba(255,123,62,0.08)", border: "rgba(255,123,62,0.25)" },
  MEDIUM: { color: "#ffc93e", bg: "rgba(255,201,62,0.08)", border: "rgba(255,201,62,0.25)" },
  LOW: { color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.25)" },
};

const TIER_CONFIG = {
  TRUSTED: { color: "#22c55e", desc: "Auto-approved by most services. 80% x402 discount." },
  CAUTION: { color: "#ffc93e", desc: "May require human confirmation. Standard x402 pricing." },
  WARNING: { color: "#ff7b3e", desc: "Restricted access. 2× x402 pricing." },
  DANGER: { color: "#ff2b4e", desc: "Blocked by most services. Remediation required." },
};

interface ScannerProps {
  onScanComplete?: (result: ScanResult) => void;
  globalScans: number;
  setGlobalScans: (fn: (n: number) => number) => void;
}

export default function Scanner({ onScanComplete, globalScans, setGlobalScans }: ScannerProps) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [expandedFinding, setExpandedFinding] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleScan = useCallback(() => {
    if (!code.trim()) return;
    setScanning(true);
    setResult(null);
    setScanProgress(0);

    const steps = 20;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setScanProgress(Math.min(100, (step / steps) * 100));
      if (step >= steps) {
        clearInterval(interval);
        const scanResult = runScan(code);
        setResult(scanResult);
        setScanning(false);
        setGlobalScans((c) => {
          const next = c + 1;
          localStorage.setItem('moltcops_scan_count', String(next));
          return next;
        });
        onScanComplete?.(scanResult);
      }
    }, 60);
  }, [code, onScanComplete, setGlobalScans]);

  const loadSample = () => {
    setCode(SAMPLE_CODE);
    setResult(null);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const copyReport = () => {
    if (!result) return;
    const report = [
      `MoltShield Scan Report — ${result.scanId}`,
      `Score: ${result.score}/100 | Tier: ${result.trustTier}`,
      `Findings: ${result.stats.critical}C ${result.stats.high}H ${result.stats.medium}M ${result.stats.low}L`,
      ``,
      ...result.findings.map(
        (f) => `[${f.severity}] ${f.id}: ${f.category} (line ${f.line})\n  ${f.description}\n  Fix: ${f.fix}`
      ),
      ``,
      `Scanned at ${result.timestamp}`,
      `Free scan by MoltCops — moltcops.com/scan`,
    ].join("\n");
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnX = () => {
    if (!result) return;
    const text = `🔴 MoltShield scanned my agent code:\n\nScore: ${result.score}/100 (${result.trustTier})\nFindings: ${result.stats.critical} critical, ${result.stats.high} high, ${result.stats.medium} medium\n\nFree scan at moltcops.com/scan`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const scoreColor = result
    ? result.score > 60 ? "#22c55e"
    : result.score > 40 ? "#ffc93e"
    : result.score > 20 ? "#ff7b3e"
    : "#ff2b4e"
    : "#555";

  return (
    <div>
      {/* Code input */}
      <div style={{
        border: "1px solid #1a1d24",
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 16,
        background: "#0c0e12",
      }}>
        {/* Editor toolbar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px",
          background: "#10131a",
          borderBottom: "1px solid #1a1d24",
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
          </div>
          <span style={{ fontSize: 11, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace" }}>
            {code ? `${code.split("\n").length} lines` : "skill-package.ts"}
          </span>
          <button
            onClick={loadSample}
            style={{
              fontSize: 10,
              padding: "3px 10px",
              background: "transparent",
              border: "1px solid #2a2d35",
              borderRadius: 4,
              color: "#6b7280",
              cursor: "pointer",
              letterSpacing: 0.5,
              fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#ff2b4e55";
              (e.target as HTMLButtonElement).style.color = "#ff2b4e";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = "#2a2d35";
              (e.target as HTMLButtonElement).style.color = "#6b7280";
            }}
          >
            Load vulnerable sample
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (result) setResult(null);
          }}
          placeholder={`// Paste your agent's skill code here...
// Or click "Load vulnerable sample" to see MoltShield in action.

export async function handleRequest(input: string) {
  // Your agent logic
}`}
          spellCheck={false}
          style={{
            width: "100%",
            minHeight: 260,
            padding: "14px 16px",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#c9cdd5",
            fontSize: 12.5,
            lineHeight: 1.7,
            resize: "vertical",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Scan button */}
      <button
        onClick={handleScan}
        disabled={!code.trim() || scanning}
        style={{
          width: "100%",
          padding: "14px 24px",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          border: "none",
          borderRadius: 8,
          cursor: code.trim() && !scanning ? "pointer" : "not-allowed",
          color: "#fff",
          background: code.trim() && !scanning
            ? "linear-gradient(135deg, #ff2b4e, #c41230)"
            : "#1a1d24",
          boxShadow: code.trim() && !scanning
            ? "0 4px 24px rgba(255,43,78,0.25), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "none",
          transition: "all 0.2s",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {scanning ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{
              width: 14,
              height: 14,
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
              display: "inline-block",
            }} />
            Scanning {Math.round(scanProgress)}%
          </span>
        ) : (
          "Run MoltShield Scan"
        )}
        {scanning && (
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 2,
            background: "linear-gradient(90deg, #ff2b4e, #3b82f6)",
            width: `${scanProgress}%`,
            transition: "width 0.06s linear",
          }} />
        )}
      </button>

      {/* Results */}
      {result && (
        <div style={{ marginTop: 28, animation: "fadeIn 0.4s ease-out" }}>
          {/* Score card */}
          <div style={{
            background: "#0c0e12",
            border: "1px solid #1a1d24",
            borderRadius: 10,
            padding: 24,
            marginBottom: 16,
          }}>
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
            }}>
              {/* Left: Score circle */}
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ position: "relative", width: 80, height: 80 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#1a1d24" strokeWidth="5" />
                    <circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke={scoreColor}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${(result.score / 100) * 213.6} 213.6`}
                      transform="rotate(-90 40 40)"
                      style={{
                        filter: `drop-shadow(0 0 6px ${scoreColor}44)`,
                        transition: "stroke-dasharray 0.8s ease-out",
                      }}
                    />
                  </svg>
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 700,
                    color: scoreColor,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {result.score}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: TIER_CONFIG[result.trustTier]?.color || "#fff",
                    marginBottom: 4,
                  }}>
                    {result.trustTier}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: "#6b7280",
                    maxWidth: 280,
                    lineHeight: 1.5,
                  }}>
                    {TIER_CONFIG[result.trustTier]?.desc}
                  </div>
                </div>
              </div>

              {/* Right: Severity counts */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {(["critical", "high", "medium", "low"] as const).map((sev) => {
                  const count = result.stats[sev];
                  const conf = SEVERITY_CONFIG[sev.toUpperCase() as keyof typeof SEVERITY_CONFIG];
                  return (
                    <div key={sev} style={{
                      padding: "8px 14px",
                      background: count > 0 ? conf.bg : "transparent",
                      border: `1px solid ${count > 0 ? conf.border : "#1a1d24"}`,
                      borderRadius: 6,
                      textAlign: "center",
                      minWidth: 60,
                    }}>
                      <div style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: count > 0 ? conf.color : "#2a2d35",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {count}
                      </div>
                      <div style={{
                        fontSize: 9,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        color: count > 0 ? conf.color : "#3a3d45",
                        marginTop: 2,
                      }}>
                        {sev}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scan metadata */}
            <div style={{
              display: "flex",
              gap: 20,
              marginTop: 16,
              paddingTop: 14,
              borderTop: "1px solid #1a1d24",
              fontSize: 10,
              color: "#4b5563",
              flexWrap: "wrap",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span>ID: {result.scanId}</span>
              <span>{result.stats.rulesChecked} of {result.stats.totalRulesAvailable} rules checked</span>
              <span>{code.split("\n").length} lines scanned</span>
              <span style={{ marginLeft: "auto" }}>Free tier — {result.stats.rulesChecked} of {result.stats.totalRulesAvailable} rules</span>
            </div>
          </div>

          {/* Findings list */}
          {result.findings.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#4b5563",
                padding: "8px 0",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                Findings ({result.findings.length})
              </div>
              {result.findings.map((finding, i) => {
                const conf = SEVERITY_CONFIG[finding.severity];
                const isExpanded = expandedFinding === i;
                return (
                  <div
                    key={i}
                    onClick={() => setExpandedFinding(isExpanded ? null : i)}
                    style={{
                      background: "#0c0e12",
                      border: `1px solid ${isExpanded ? conf.border : "#1a1d24"}`,
                      borderRadius: 8,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "border-color 0.2s",
                    }}
                  >
                    {/* Finding header */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                    }}>
                      <span style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 3,
                        background: conf.bg,
                        color: conf.color,
                        border: `1px solid ${conf.border}`,
                        letterSpacing: 0.5,
                        whiteSpace: "nowrap",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {finding.severity}
                      </span>
                      <span style={{
                        fontSize: 11,
                        color: "#8b8f98",
                        whiteSpace: "nowrap",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {finding.id}
                      </span>
                      <span style={{
                        fontSize: 12,
                        color: "#c9cdd5",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {finding.category}
                      </span>
                      <span style={{
                        fontSize: 10,
                        color: "#4b5563",
                        whiteSpace: "nowrap",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        line {finding.line}
                      </span>
                      <span style={{
                        fontSize: 14,
                        color: "#3a3d45",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                        transition: "transform 0.2s",
                      }}>
                        ▾
                      </span>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={{ padding: "0 14px 14px", animation: "fadeIn 0.2s ease-out" }}>
                        <div style={{
                          fontSize: 12,
                          color: "#9ca0a9",
                          lineHeight: 1.6,
                          marginBottom: 10,
                        }}>
                          {finding.description}
                        </div>

                        {/* Matched code */}
                        <div style={{
                          background: "#080a0e",
                          borderRadius: 5,
                          padding: "8px 12px",
                          marginBottom: 10,
                          fontSize: 11,
                          borderLeft: `3px solid ${conf.color}`,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          <div style={{ color: "#4b5563", fontSize: 9, marginBottom: 4 }}>
                            Line {finding.line}:
                          </div>
                          <code style={{ color: conf.color }}>
                            {finding.lineContent.length > 80
                              ? finding.lineContent.slice(0, 80) + "…"
                              : finding.lineContent}
                          </code>
                        </div>

                        {/* Fix */}
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{
                            fontSize: 9,
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: 3,
                            background: "rgba(34,197,94,0.1)",
                            color: "#22c55e",
                            border: "1px solid rgba(34,197,94,0.2)",
                            whiteSpace: "nowrap",
                            marginTop: 1,
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            FIX
                          </span>
                          <span style={{
                            fontSize: 11.5,
                            color: "#9ca0a9",
                            lineHeight: 1.5,
                          }}>
                            {finding.fix}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              background: "#0c0e12",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 10,
              padding: 28,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🛡️</div>
              <div style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#22c55e",
                marginBottom: 6,
              }}>
                Clean scan — no threats detected
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                20 free-tier rules passed. Upgrade to the full 79-rule engine for deeper analysis.
              </div>
            </div>
          )}

          {/* Action bar */}
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button
              onClick={copyReport}
              style={{
                flex: 1,
                padding: "10px 16px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: "uppercase",
                border: "1px solid #2a2d35",
                borderRadius: 6,
                background: "transparent",
                color: copied ? "#22c55e" : "#9ca0a9",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {copied ? "✓ Copied" : "Copy Report"}
            </button>
            <button
              onClick={shareOnX}
              style={{
                flex: 1,
                padding: "10px 16px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: "uppercase",
                border: "1px solid #2a2d35",
                borderRadius: 6,
                background: "transparent",
                color: "#9ca0a9",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Share on 𝕏
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
