import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import OtpVerification from '../components/OtpVerification';

const DOCTOR_IMG = 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&q=80&fit=crop&crop=faces';

const TABS = [
  { key: 'login',    label: 'Connexion' },
  { key: 'register', label: 'Inscription' },
];

export default function AuthPage() {
  const [tab,           setTab]           = useState('login');
  const [step,          setStep]          = useState('form');   // 'form' | 'otp' | 'forgot'
  const [pendingEmail,  setPendingEmail]  = useState('');

  // After register → show OTP
  const onRegisterSuccess = (email) => {
    setPendingEmail(email);
    setStep('otp');
  };

  // Back from OTP → back to register tab
  const onOtpBack = () => {
    setStep('form');
    setTab('register');
  };

  // Switch tab — reset step
  const switchTab = (t) => {
    setTab(t);
    setStep('form');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'linear-gradient(180deg, #e8f6f0 0%, #d6eaf8 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>

      {/* ── LEFT — Illustration panel ─────────────────── */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        overflow: 'hidden',
      }}>
        {/* Blob */}
        <div style={{
          position: 'absolute',
          width: 500, height: 500,
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
          background: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 60%, #bbf7d0 100%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.55,
        }} />

        {/* Logo top-left */}
        <Link to="/" style={{
          position: 'absolute', top: 28, left: 36,
          display: 'flex', alignItems: 'center', gap: 8,
          textDecoration: 'none',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#2ecc71',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>
            Dawini
          </span>
        </Link>

        {/* Doctor photo */}
        <div style={{
          position: 'relative', zIndex: 1,
          width: 300, height: 380,
          borderRadius: 32,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.14)',
          marginBottom: 32,
        }}>
          <img src={DOCTOR_IMG} alt="Medical" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
        </div>

        {/* Quote card */}
        <div style={{
          position: 'relative', zIndex: 1,
          background: 'white',
          borderRadius: 20,
          padding: '20px 24px',
          maxWidth: 320,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 12 }}>
            "Dawini a transformé ma façon de gérer mes patients. Tout est centralisé et sécurisé."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #a7f3d0, #6ee7b7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 13, color: '#065f46',
            }}>SB</div>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>
                Dr. Sara Benali
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Cardiologue — Casablanca</div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', gap: 20, marginTop: 24,
        }}>
          {[
            { val: '20K+', label: 'Patients' },
            { val: '200+', label: 'Médecins' },
            { val: '95%',  label: 'Satisfaction' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#111827' }}>
                {s.val}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT — Form panel ────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {step === 'otp' ? (
            /* ── OTP step ── */
            <div style={{
              background: 'white', borderRadius: 24,
              padding: '40px 36px',
              boxShadow: '0 4px 40px rgba(0,0,0,0.07)',
              border: '1px solid #f3f4f6',
            }}>
              <OtpVerification email={pendingEmail} onBack={onOtpBack} />
            </div>

          ) : (
            <>
              {/* Header */}
              <div style={{ marginBottom: 28 }}>
                <h1 style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: '1.8rem', fontWeight: 800,
                  color: '#111827', marginBottom: 6,
                }}>
                  {tab === 'login' ? 'Bon retour' : 'Créer un compte'}
                </h1>
                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  {tab === 'login'
                    ? 'Connectez-vous à votre espace Dawini'
                    : 'Rejoignez des milliers de professionnels de santé'}
                </p>
              </div>

              {/* Tabs */}
              <div style={{
                display: 'flex',
                background: '#f3f4f6',
                borderRadius: 12,
                padding: 4,
                marginBottom: 28,
              }}>
                {TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => switchTab(key)}
                    style={{
                      flex: 1, padding: '9px',
                      border: 'none', borderRadius: 9,
                      fontSize: '0.88rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      background: tab === key ? 'white' : 'transparent',
                      color: tab === key ? '#111827' : '#9ca3af',
                      boxShadow: tab === key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Form card */}
              <div style={{
                background: 'white', borderRadius: 24,
                padding: tab === 'register' ? '32px 32px' : '36px 36px',
                boxShadow: '0 4px 40px rgba(0,0,0,0.07)',
                border: '1px solid #f3f4f6',
              }}>
                {tab === 'login'
                  ? <LoginForm onForgot={() => setStep('forgot')} />
                  : <RegisterForm onSuccess={onRegisterSuccess} />
                }
              </div>

              {/* Footer note */}
              <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', color: '#9ca3af' }}>
                {tab === 'login' ? (
                  <>Pas encore de compte ?{' '}
                    <button onClick={() => switchTab('register')} style={{
                      background: 'none', border: 'none', padding: 0,
                      color: '#2ecc71', fontWeight: 600, cursor: 'pointer',
                      fontSize: '0.82rem', fontFamily: 'inherit',
                    }}>
                      S'inscrire
                    </button>
                  </>
                ) : (
                  <>Déjà un compte ?{' '}
                    <button onClick={() => switchTab('login')} style={{
                      background: 'none', border: 'none', padding: 0,
                      color: '#2ecc71', fontWeight: 600, cursor: 'pointer',
                      fontSize: '0.82rem', fontFamily: 'inherit',
                    }}>
                      Se connecter
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}