'use client';

import { useState, useEffect } from 'react';

interface WaitlistProps {
  onSignup?: (email: string, referralCode?: string) => void;
}

export default function Waitlist({ onSignup }: WaitlistProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [myReferralCode, setMyReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState(0);
  const [totalSignups, setTotalSignups] = useState(0); // Real count only

  useEffect(() => {
    // Check for referral code in URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setReferralCode(ref);

    // No fake increments — real count only
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;

    setSubmitting(true);
    
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_key: '2d1d577e-9d9d-456b-91ae-9a0347b7bcca', email, subject: 'MoltCops Waitlist Signup', type: 'waitlist', referralCode: referralCode || '', timestamp: new Date().toISOString() }),
      });
    } catch { /* continue anyway */ }
    
    // Generate referral code
    const code = `MCOP${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setMyReferralCode(code);
    setWaitlistPosition(totalSignups + 1);
    setSubmitted(true);
    setSubmitting(false);
    
    onSignup?.(email, referralCode || undefined);
  };

  const copyReferralLink = () => {
    if (!myReferralCode) return;
    const link = `${window.location.origin}?ref=${myReferralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (submitted) {
    return (
      <div style={{
        background: '#0c0e12',
        border: '1px solid #1a1d24',
        borderRadius: 12,
        padding: 24,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e', marginBottom: 6 }}>
            You're on the list!
          </div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Position #{waitlistPosition.toLocaleString()} of {(totalSignups + 1).toLocaleString()}
          </div>
        </div>

        {/* Referral section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,43,78,0.08), rgba(59,130,246,0.08))',
          border: '1px solid rgba(255,43,78,0.15)',
          borderRadius: 10,
          padding: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            🔥 Jump the queue
          </div>
          <div style={{ fontSize: 12, color: '#9ca0a9', marginBottom: 16, lineHeight: 1.5 }}>
            Share your referral link. Every 3 friends who join moves you up 10 spots.
          </div>

          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 12,
          }}>
            <div style={{
              flex: 1,
              padding: '10px 14px',
              background: '#080a0e',
              border: '1px solid #1a1d24',
              borderRadius: 6,
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#e2e4e9',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {`${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${myReferralCode}`}
            </div>
            <button
              onClick={copyReferralLink}
              style={{
                padding: '10px 16px',
                background: copied ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, #ff2b4e, #c41230)',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: 0.5,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                const text = `I just joined the $MCOP waitlist for MoltCops — AI agent security infrastructure.\n\nJoin me: ${window.location.origin}?ref=${myReferralCode}`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'rgba(29,161,242,0.1)',
                border: '1px solid rgba(29,161,242,0.2)',
                borderRadius: 6,
                color: '#1DA1F2',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Share on 𝕏
            </button>
            <button
              onClick={() => {
                const text = `Check out MoltCops — security infrastructure for AI agents. I'm on the $MCOP waitlist. ${window.location.origin}?ref=${myReferralCode}`;
                window.open(`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}?ref=${myReferralCode}`)}&text=${encodeURIComponent(text)}`, '_blank');
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'rgba(0,136,204,0.1)',
                border: '1px solid rgba(0,136,204,0.2)',
                borderRadius: 6,
                color: '#0088cc',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Share on Telegram
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: 12,
          marginTop: 16,
          justifyContent: 'center',
        }}>
          <div style={{
            padding: '8px 16px',
            background: '#080a0e',
            borderRadius: 6,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ff2b4e', fontFamily: "'JetBrains Mono', monospace" }}>
              0
            </div>
            <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>
              Referrals
            </div>
          </div>
          <div style={{
            padding: '8px 16px',
            background: '#080a0e',
            borderRadius: 6,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6', fontFamily: "'JetBrains Mono', monospace" }}>
              0
            </div>
            <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>
              Spots gained
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#0c0e12',
      border: '1px solid #1a1d24',
      borderRadius: 12,
      padding: 24,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          background: 'rgba(255,43,78,0.1)',
          border: '1px solid rgba(255,43,78,0.2)',
          borderRadius: 20,
          fontSize: 11,
          color: '#ff2b4e',
          marginBottom: 12,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span style={{
            width: 6,
            height: 6,
            background: '#ff2b4e',
            borderRadius: '50%',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          {totalSignups.toLocaleString()} on waitlist
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
          Join the $MCOP Waitlist
        </div>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
          Be first to access the full 79-rule MoltShield engine,
          reviewer rewards, and token allocation.
        </div>
      </div>

      {referralCode && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 12,
          color: '#22c55e',
          textAlign: 'center',
        }}>
          🎁 Referred by <strong>{referralCode}</strong> — you both get priority access
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              flex: 1,
              padding: '12px 16px',
              background: '#080a0e',
              border: '1px solid #1a1d24',
              borderRadius: 6,
              color: '#e2e4e9',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!email || submitting}
            style={{
              padding: '12px 20px',
              background: email && !submitting
                ? 'linear-gradient(135deg, #ff2b4e, #c41230)'
                : '#1a1d24',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: email && !submitting ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
            }}
          >
            {submitting ? (
              <>
                <span style={{
                  width: 12,
                  height: 12,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
                Joining...
              </>
            ) : (
              'Join Waitlist'
            )}
          </button>
        </div>
      </form>

      <div style={{
        marginTop: 16,
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        fontSize: 11,
        color: '#4b5563',
      }}>
        <span>🔒 No spam</span>
        <span>🎁 Referral rewards</span>
        <span>🏃 Skip the line</span>
      </div>
    </div>
  );
}
