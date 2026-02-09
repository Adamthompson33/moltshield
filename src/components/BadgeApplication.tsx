'use client';

import { useState } from 'react';

interface BadgeApplicationProps {
  onApplicationSubmit?: (data: ApplicationData) => void;
}

interface ApplicationData {
  name: string;
  email: string;
  twitter: string;
  github: string;
  role: string;
  experience: string;
  motivation: string;
  walletAddress: string;
}

const ROLES = [
  { value: 'security_researcher', label: 'Security Researcher', icon: '🔬' },
  { value: 'smart_contract_auditor', label: 'Smart Contract Auditor', icon: '📜' },
  { value: 'ai_engineer', label: 'AI/ML Engineer', icon: '🤖' },
  { value: 'protocol_developer', label: 'Protocol Developer', icon: '⚙️' },
  { value: 'defi_builder', label: 'DeFi Builder', icon: '💰' },
  { value: 'web3_security', label: 'Web3 Security', icon: '🛡️' },
  { value: 'red_team', label: 'Red Team / Pen Tester', icon: '🎯' },
  { value: 'other', label: 'Other', icon: '✨' },
];

export default function BadgeApplication({ onApplicationSubmit }: BadgeApplicationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<ApplicationData>({
    name: '',
    email: '',
    twitter: '',
    github: '',
    role: '',
    experience: '',
    motivation: '',
    walletAddress: '',
  });

  const updateField = (field: keyof ApplicationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      // Submit to Web3Forms
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: '2d1d577e-9d9d-456b-91ae-9a0347b7bcca',
          ...formData,
          subject: `New Founding Operative Application: ${formData.name}`,
          applicationId: `APP-${Date.now().toString(36).toUpperCase()}`,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        onApplicationSubmit?.(formData);
        setSubmitted(true);
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit application. Please try again.');
    }
    
    setSubmitting(false);
  };

  const canProceedStep1 = formData.name && formData.email && formData.role;
  const canProceedStep2 = formData.experience && formData.motivation;
  const canSubmit = formData.walletAddress?.match(/^0x[a-fA-F0-9]{40}$/);

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        style={{
          background: 'linear-gradient(135deg, rgba(255,43,78,0.08), rgba(59,130,246,0.08))',
          border: '1px solid rgba(255,43,78,0.2)',
          borderRadius: 12,
          padding: 24,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,43,78,0.4)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,43,78,0.2)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56,
            height: 56,
            background: 'linear-gradient(135deg, #ff2b4e, #c41230)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
          }}>
            🛡️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              Become a Founding Operative
            </div>
            <div style={{ fontSize: 13, color: '#9ca0a9', lineHeight: 1.5 }}>
              First 100 badges. Free mint. Staking rights for $MCOP governance and reviewer rewards.
            </div>
          </div>
          <div style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #ff2b4e, #c41230)',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            Apply
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: 16,
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: 11,
          color: '#6b7280',
        }}>
          <span>🎖️ Soul-bound NFT</span>
          <span>📊 Staking multiplier</span>
          <span>🗳️ Governance voting</span>
          <span>💰 Reviewer rewards</span>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{
        background: '#0c0e12',
        border: '1px solid rgba(34,197,94,0.3)',
        borderRadius: 12,
        padding: 32,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', marginBottom: 8 }}>
          Application Submitted
        </div>
        <div style={{ fontSize: 14, color: '#9ca0a9', lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
          We'll review your application and reach out within 48 hours.
          Check your email for confirmation.
        </div>
        <div style={{
          marginTop: 20,
          padding: 12,
          background: 'rgba(34,197,94,0.1)',
          borderRadius: 8,
          fontSize: 12,
          color: '#22c55e',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Application ID: APP-{Date.now().toString(36).toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#0c0e12',
      border: '1px solid #1a1d24',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: '#10131a',
        borderBottom: '1px solid #1a1d24',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🛡️</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Founding Operative Application</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Step {step} of 3</div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: 18,
            padding: 4,
          }}
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: '#1a1d24' }}>
        <div style={{
          height: '100%',
          width: `${(step / 3) * 100}%`,
          background: 'linear-gradient(90deg, #ff2b4e, #3b82f6)',
          transition: 'width 0.3s',
        }} />
      </div>

      {/* Form content */}
      <div style={{ padding: 24 }}>
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca0a9', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Your name or pseudonym"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#080a0e',
                  border: '1px solid #1a1d24',
                  borderRadius: 6,
                  color: '#e2e4e9',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca0a9', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#080a0e',
                  border: '1px solid #1a1d24',
                  borderRadius: 6,
                  color: '#e2e4e9',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca0a9', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Twitter
                </label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => updateField('twitter', e.target.value)}
                  placeholder="@handle"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: '#080a0e',
                    border: '1px solid #1a1d24',
                    borderRadius: 6,
                    color: '#e2e4e9',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca0a9', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  GitHub
                </label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => updateField('github', e.target.value)}
                  placeholder="username"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: '#080a0e',
                    border: '1px solid #1a1d24',
                    borderRadius: 6,
                    color: '#e2e4e9',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca0a9', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Primary Role *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {ROLES.map(role => (
                  <div
                    key={role.value}
                    onClick={() => updateField('role', role.value)}
                    style={{
                      padding: '10px 12px',
                      background: formData.role === role.value ? 'rgba(255,43,78,0.1)' : '#080a0e',
                      border: `1px solid ${formData.role === role.value ? 'rgba(255,43,78,0.4)' : '#1a1d24'}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{role.icon}</span>
                    <span style={{ color: formData.role === role.value ? '#ff2b4e' : '#9ca0a9' }}>
                      {role.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca0a9', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                Relevant Experience *
              </label>
              <textarea
                value={formData.experience}
                onChange={(e) => updateField('experience', e.target.value)}
                placeholder="Describe your experience in security, AI, or Web3. Include any notable audits, vulnerabilities found, or projects built."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#080a0e',
                  border: '1px solid #1a1d24',
                  borderRadius: 6,
                  color: '#e2e4e9',
                  fontSize: 14,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9ca0a9', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                Why MoltCops? *
              </label>
              <textarea
                value={formData.motivation}
                onChange={(e) => updateField('motivation', e.target.value)}
                placeholder="What interests you about AI agent security? How would you contribute as a Founding Operative?"
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#080a0e',
                  border: '1px solid #1a1d24',
                  borderRadius: 6,
                  color: '#e2e4e9',
                  fontSize: 14,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{
              padding: 20,
              background: '#080a0e',
              borderRadius: 8,
              marginBottom: 24,
              border: '1px solid #1a1d24',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🔗</span> Connect Wallet
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 16, lineHeight: 1.5 }}>
                Your badge will be minted to this address. It's soul-bound (non-transferable) and proves your status as a Founding Operative.
              </div>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) => updateField('walletAddress', e.target.value)}
                placeholder="0x..."
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: '#0c0e12',
                  border: `1px solid ${formData.walletAddress && !canSubmit ? '#ff2b4e' : '#1a1d24'}`,
                  borderRadius: 6,
                  color: '#e2e4e9',
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: 'none',
                }}
              />
              {formData.walletAddress && !canSubmit && (
                <div style={{ fontSize: 11, color: '#ff2b4e', marginTop: 8 }}>
                  Please enter a valid Ethereum address (0x + 40 hex characters)
                </div>
              )}
            </div>

            <div style={{
              padding: 16,
              background: 'rgba(255,43,78,0.05)',
              borderRadius: 8,
              border: '1px solid rgba(255,43,78,0.1)',
            }}>
              <div style={{ fontSize: 12, color: '#9ca0a9', lineHeight: 1.6 }}>
                <strong style={{ color: '#e2e4e9' }}>What you're agreeing to:</strong>
                <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                  <li>Review agent code and flag security issues honestly</li>
                  <li>Maintain confidentiality of reviewed code</li>
                  <li>Stake reputation on your reviews (slashing for malicious reviews)</li>
                  <li>Follow the MoltCops reviewer code of conduct</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #1a1d24',
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #2a2d35',
              borderRadius: 6,
              color: '#9ca0a9',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Back
          </button>
        ) : (
          <div />
        )}
        
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
            style={{
              padding: '10px 24px',
              background: (step === 1 ? canProceedStep1 : canProceedStep2)
                ? 'linear-gradient(135deg, #ff2b4e, #c41230)'
                : '#1a1d24',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: (step === 1 ? canProceedStep1 : canProceedStep2) ? 'pointer' : 'not-allowed',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            style={{
              padding: '10px 24px',
              background: canSubmit && !submitting
                ? 'linear-gradient(135deg, #ff2b4e, #c41230)'
                : '#1a1d24',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
              letterSpacing: 1,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
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
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
