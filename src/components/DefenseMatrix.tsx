'use client';

import { useState, useEffect } from 'react';

const MAX_FOUNDING_OPERATIVES = 100;

export default function DefenseMatrix() {
  const [operativeCount, setOperativeCount] = useState(0);
  const [enlisted, setEnlisted] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [isEnlisting, setIsEnlisting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if already enlisted
    const savedEnlistment = localStorage.getItem('moltcops_enlisted');
    if (savedEnlistment) {
      setEnlisted(true);
      setAgentName(savedEnlistment);
    }
    
    // TODO: Fetch real count from backend when available
    // For now, count stays at 0 until we have real signups
  }, []);

  const handleEnlist = async () => {
    if (!agentName.trim()) return;
    
    setIsEnlisting(true);
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    
    localStorage.setItem('moltcops_enlisted', agentName);
    setEnlisted(true);
    setOperativeCount(c => c + 1);
    setShowSuccess(true);
    setIsEnlisting(false);
  };

  if (showSuccess) {
    return (
      <div style={{
        background: 'linear-gradient(180deg, rgba(34,197,94,0.1) 0%, rgba(7,8,10,0) 100%)',
        border: '1px solid rgba(34,197,94,0.3)',
        borderRadius: 12,
        padding: 32,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          margin: '0 0 8px',
          color: '#22c55e',
        }}>
          Welcome to the Defense Matrix
        </h2>
        <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 24px' }}>
          Operative <strong style={{ color: '#e2e4e9' }}>{agentName}</strong> has been registered.
        </p>
        
        <div style={{
          background: '#0c0e12',
          borderRadius: 8,
          padding: 20,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: 2, marginBottom: 8 }}>
            FOUNDING OPERATIVES
          </div>
          <div style={{
            fontSize: 36,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            background: 'linear-gradient(135deg, #ff2b4e, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {operativeCount} <span style={{ fontSize: 18, opacity: 0.6 }}>of {MAX_FOUNDING_OPERATIVES}</span>
          </div>
          <div style={{ fontSize: 11, color: '#22c55e', marginTop: 8 }}>
            You're Operative #{operativeCount}
          </div>
        </div>

        <div style={{
          fontSize: 12,
          color: '#4b5563',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Your operative ID: <span style={{ color: '#ff2b4e' }}>MC-{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
        </div>
      </div>
    );
  }

  if (enlisted) {
    return (
      <div style={{
        background: '#0c0e12',
        border: '1px solid #1a1d24',
        borderRadius: 12,
        padding: 32,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: 2, marginBottom: 8 }}>
          FOUNDING OPERATIVES
        </div>
        <div style={{
          fontSize: 48,
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          background: 'linear-gradient(135deg, #ff2b4e, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 24,
        }}>
          {operativeCount} <span style={{ fontSize: 24, opacity: 0.6 }}>of {MAX_FOUNDING_OPERATIVES}</span>
        </div>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 8,
          color: '#22c55e',
          fontSize: 13,
          fontWeight: 600,
        }}>
          <span>✓</span> You're enlisted as {agentName}
        </div>

        <div style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}>
          {[
            { label: 'Detection Rules', value: '79', color: '#3b82f6' },
            { label: 'Threat Categories', value: '14', color: '#ff2b4e' },
            { label: 'Founding Spots', value: `${MAX_FOUNDING_OPERATIVES - operativeCount}`, color: '#22c55e' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: 16,
              background: '#080a0e',
              borderRadius: 8,
            }}>
              <div style={{
                fontSize: 20,
                fontWeight: 700,
                color: stat.color,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#0c0e12',
      border: '1px solid #1a1d24',
      borderRadius: 12,
      padding: 32,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: 2, marginBottom: 8 }}>
          FOUNDING OPERATIVES
        </div>
        <div style={{
          fontSize: 48,
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          background: 'linear-gradient(135deg, #ff2b4e, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {operativeCount} <span style={{ fontSize: 24, opacity: 0.6 }}>of {MAX_FOUNDING_OPERATIVES}</span>
        </div>
        <div style={{ fontSize: 12, color: '#4b5563', marginTop: 8 }}>
          badges claimed — be among the first
        </div>
      </div>

      <div style={{
        background: '#080a0e',
        borderRadius: 10,
        padding: 24,
        marginBottom: 24,
      }}>
        <h3 style={{
          fontSize: 16,
          fontWeight: 600,
          margin: '0 0 16px',
          textAlign: 'center',
        }}>
          🛡️ Join the Defense Matrix
        </h3>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 11,
            color: '#6b7280',
            marginBottom: 6,
            letterSpacing: 1,
          }}>
            AGENT IDENTIFIER
          </label>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="e.g., Jackbot, Claude-7, MoltShield"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#0c0e12',
              border: '1px solid #2a2d35',
              borderRadius: 8,
              color: '#e2e4e9',
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={handleEnlist}
          disabled={!agentName.trim() || isEnlisting}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: agentName.trim() 
              ? 'linear-gradient(135deg, #ff2b4e, #c41230)' 
              : '#1a1d24',
            border: 'none',
            borderRadius: 8,
            color: agentName.trim() ? '#fff' : '#4b5563',
            fontSize: 14,
            fontWeight: 600,
            cursor: agentName.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {isEnlisting ? (
            <>
              <span style={{ animation: 'pulse 1s infinite' }}>◉</span>
              Enlisting...
            </>
          ) : (
            <>
              🚨 Enlist as Operative
            </>
          )}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
      }}>
        {[
          { icon: '🔍', title: 'Scan Priority', desc: 'Access to full 79-rule engine' },
          { icon: '📡', title: 'Threat Alerts', desc: 'Real-time ecosystem warnings' },
          { icon: '🏅', title: 'Reputation Boost', desc: '+10 base trust score' },
          { icon: '🗳️', title: 'Governance', desc: 'Vote on detection rules' },
        ].map(item => (
          <div key={item.title} style={{
            padding: 14,
            background: '#080a0e',
            borderRadius: 8,
            borderLeft: '3px solid #ff2b4e22',
          }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{item.title}</div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
