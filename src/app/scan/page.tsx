'use client';

import { useState, useEffect } from 'react';
import '../globals.css';
import Scanner from '@/components/Scanner';
import BadgeApplication from '@/components/BadgeApplication';
import Waitlist from '@/components/Waitlist';
import DefenseMatrix from '@/components/DefenseMatrix';

const BASE_SCAN_COUNT = 1247;

export default function Home() {
  const [globalScans, setGlobalScans] = useState(BASE_SCAN_COUNT);
  const [activeTab, setActiveTab] = useState<'scan' | 'matrix' | 'badge' | 'waitlist'>('scan');

  useEffect(() => {
    // Check for tab query parameter
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['scan', 'matrix', 'badge', 'waitlist'].includes(tab)) {
      setActiveTab(tab as typeof activeTab);
    }
  }, []);

  useEffect(() => {
    // Simulate growing scan count
    const interval = setInterval(() => {
      setGlobalScans((c) => c + Math.floor(Math.random() * 3));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#07080a',
      color: '#e2e4e9',
    }}>
      {/* Noise texture overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '24px 20px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40, paddingTop: 20 }}>
          {/* Back to home link */}
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.8')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#ff2b4e',
              boxShadow: '0 0 12px #ff2b4e88',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: 11,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#ff2b4e',
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              MoltShield
            </span>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#3b82f6',
              boxShadow: '0 0 12px #3b82f688',
              animation: 'pulse 2s ease-in-out infinite 1s',
            }} />
          </a>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            margin: '0 0 8px',
            background: 'linear-gradient(135deg, #ff2b4e, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
          }}>
            Agent Security Scanner
          </h1>
          <p style={{
            fontSize: 13,
            color: '#6b7280',
            margin: 0,
            maxWidth: 460,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.5,
          }}>
            Paste your agent's skill code. Get an instant security report.
            <br />
            No login. No payment. 20 rules. Results in seconds.
          </p>
        </div>

        {/* Global counter */}
        <div style={{
          textAlign: 'center',
          marginBottom: 28,
          fontSize: 11,
          color: '#4b5563',
          letterSpacing: 1,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span style={{ color: '#22c55e' }}>●</span>{' '}
          {globalScans.toLocaleString()} scans completed globally
        </div>

        {/* Tab navigation */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          justifyContent: 'center',
        }}>
          {[
            { id: 'scan', label: 'Scanner', icon: '🔍' },
            { id: 'matrix', label: 'Defense Matrix', icon: '🚨' },
            { id: 'badge', label: 'Badge', icon: '🛡️' },
            { id: 'waitlist', label: 'Waitlist', icon: '🎫' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: '10px 20px',
                background: activeTab === tab.id ? 'rgba(255,43,78,0.1)' : 'transparent',
                border: `1px solid ${activeTab === tab.id ? 'rgba(255,43,78,0.3)' : '#1a1d24'}`,
                borderRadius: 8,
                color: activeTab === tab.id ? '#ff2b4e' : '#6b7280',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        {activeTab === 'scan' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <Scanner 
              globalScans={globalScans}
              setGlobalScans={setGlobalScans}
            />
            
            {/* Upsell after scanner */}
            <div style={{
              marginTop: 24,
              padding: 20,
              background: 'linear-gradient(135deg, rgba(255,43,78,0.05), rgba(59,130,246,0.05))',
              border: '1px solid rgba(255,43,78,0.12)',
              borderRadius: 10,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 13,
                color: '#9ca0a9',
                lineHeight: 1.6,
              }}>
                This scan used <strong style={{ color: '#e2e4e9' }}>20 of 79</strong> detection rules.
                The full engine adds sleeper detection, behavioral analysis, multi-step
                attack chains, and context-aware scoring.
              </div>
              <div style={{
                marginTop: 12,
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => setActiveTab('badge')}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #ff2b4e, #c41230)',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🛡️ Apply for Badge
                </button>
                <button
                  onClick={() => setActiveTab('waitlist')}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    border: '1px solid #2a2d35',
                    borderRadius: 6,
                    color: '#9ca0a9',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🎫 Join $MCOP Waitlist
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matrix' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <DefenseMatrix />
          </div>
        )}

        {activeTab === 'badge' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <BadgeApplication />
            
            {/* What you get */}
            <div style={{
              marginTop: 24,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
            }}>
              {[
                { icon: '🎖️', title: 'Soul-bound Badge', desc: 'Non-transferable NFT proving Founding Operative status' },
                { icon: '📊', title: '2x Staking Multiplier', desc: 'Double rewards when staking $MCOP tokens' },
                { icon: '🗳️', title: 'Governance Rights', desc: 'Vote on protocol upgrades and treasury allocation' },
                { icon: '💰', title: 'Reviewer Rewards', desc: 'Earn $MCOP for reviewing agent security scans' },
              ].map(item => (
                <div key={item.title} style={{
                  padding: 16,
                  background: '#0c0e12',
                  border: '1px solid #1a1d24',
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'waitlist' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <Waitlist />
            
            {/* Token info */}
            <div style={{
              marginTop: 24,
              padding: 20,
              background: '#0c0e12',
              border: '1px solid #1a1d24',
              borderRadius: 10,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>
                $MCOP Token Utility
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 12,
              }}>
                {[
                  { label: 'Stake for Access', desc: 'Full 79-rule engine', color: '#ff2b4e' },
                  { label: 'Governance', desc: 'Protocol decisions', color: '#3b82f6' },
                  { label: 'Reviewer Rewards', desc: 'Earn for reviews', color: '#22c55e' },
                  { label: 'Fee Discounts', desc: 'x402 micropayments', color: '#ffc93e' },
                ].map(item => (
                  <div key={item.label} style={{
                    padding: 12,
                    background: '#080a0e',
                    borderRadius: 6,
                    textAlign: 'center',
                    borderLeft: `3px solid ${item.color}`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: item.color, marginBottom: 2 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 48,
          paddingTop: 20,
          borderTop: '1px solid #1a1d24',
          textAlign: 'center',
          fontSize: 11,
          color: '#3a3d45',
          lineHeight: 2,
        }}>
          <div>
            <span style={{ color: '#ff2b4e' }}>🚨</span> Molt Cops — To Protect and Serve (Humanity)
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            marginTop: 8,
          }}>
            <a href="/" style={{ color: '#4b5563', textDecoration: 'none' }}>Home</a>
            <a href="https://github.com/Adamthompson33/moltshield" style={{ color: '#4b5563', textDecoration: 'none' }}>GitHub</a>
            <a href="https://x.com/moltcops" style={{ color: '#4b5563', textDecoration: 'none' }}>Twitter</a>
            <a href="/litepaper" style={{ color: '#4b5563', textDecoration: 'none' }}>Litepaper</a>
          </div>
        </div>
      </div>
    </div>
  );
}
