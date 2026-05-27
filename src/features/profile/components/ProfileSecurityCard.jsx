import { useState } from 'react';
import api from '../../../services/api';
import { authService } from '../../auth/services/authService';

/* ─── Shared styles ─────────────────────────────────────────── */
const inputStyle = {
  width: '100%', padding: '11px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: 10, fontSize: '0.88rem',
  outline: 'none', background: '#fafafa',
  fontFamily: 'inherit', color: '#111827',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const SectionBox = ({ children }) => (
  <div style={{ border: '1.5px solid #f3f4f6', borderRadius: 14, padding: '18px 20px' }}>
    {children}
  </div>
);

const SectionHeader = ({ icon, iconBg, iconColor, title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>{title}</p>
        <p style={{ fontSize: '0.76rem', color: '#9ca3af' }}>{subtitle}</p>
      </div>
    </div>
    {action}
  </div>
);

/* ─── MFA Setup Panel ───────────────────────────────────────── */
function MfaSetupPanel({ onClose }) {
  const [step,        setStep]        = useState('choose');  // 'choose' | 'setup' | 'verify' | 'done'
  const [mfaMethod,   setMfaMethod]   = useState('TOTP');
  const [phone,       setPhone]       = useState('');
  const [qrCode,      setQrCode]      = useState('');
  const [secret,      setSecret]      = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [code,        setCode]        = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const handleSetup = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await authService.setupMfa({
        mfaMethod,
        ...(mfaMethod === 'SMS' && phone ? { phoneNumber: phone } : {}),
      });
      const payload = data?.data || data;
      setQrCode(payload.qrCode || '');
      setSecret(payload.secret || '');
      setBackupCodes(payload.backupCodes || []);
      setStep('setup');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la configuration MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length < 4) { setError('Code trop court'); return; }
    setLoading(true); setError('');
    try {
      await authService.verifyMfaLogin({ code, sessionToken: '' });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step: Choose method ── */
  if (step === 'choose') return (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>
        Choisissez votre méthode d'authentification à deux facteurs :
      </p>

      {/* Method cards */}
      {[
        { key: 'TOTP', label: 'Application Authenticator', sub: 'Google Authenticator, Authy...', icon: '📱' },
        { key: 'SMS',  label: 'SMS', sub: 'Code envoyé par SMS', icon: '💬' },
      ].map(m => (
        <button
          key={m.key}
          onClick={() => setMfaMethod(m.key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
            border: `2px solid ${mfaMethod === m.key ? '#2ecc71' : '#e5e7eb'}`,
            background: mfaMethod === m.key ? '#f0fdf4' : 'white',
            fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
          <div>
            <p style={{ fontSize: '0.87rem', fontWeight: 600, color: '#111827' }}>{m.label}</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{m.sub}</p>
          </div>
          {mfaMethod === m.key && (
            <svg style={{ marginLeft: 'auto' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </button>
      ))}

      {/* SMS phone input */}
      {mfaMethod === 'SMS' && (
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+212 6 00 00 00 00"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#2ecc71'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
      )}

      {error && <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{
          flex: 1, padding: '10px', border: '1.5px solid #e5e7eb',
          borderRadius: 10, background: 'white', fontSize: '0.85rem',
          fontWeight: 600, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit',
        }}>Annuler</button>
        <button onClick={handleSetup} disabled={loading} style={{
          flex: 2, padding: '10px', border: 'none',
          borderRadius: 10, background: loading ? '#86efac' : '#2ecc71',
          fontSize: '0.85rem', fontWeight: 600, color: 'white',
          cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}>
          {loading && <div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />}
          {loading ? 'Configuration...' : 'Continuer →'}
        </button>
      </div>
    </div>
  );

  /* ── Step: Setup (show QR / secret) ── */
  if (step === 'setup') return (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {mfaMethod === 'TOTP' && (
        <>
          <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>
            Scannez ce QR code avec votre application Authenticator, puis entrez le code généré.
          </p>
          {qrCode ? (
            <div style={{ textAlign: 'center' }}>
              <img src={qrCode} alt="QR Code MFA" style={{ width: 180, height: 180, borderRadius: 12, border: '2px solid #e5e7eb' }} />
            </div>
          ) : (
            <div style={{
              background: '#f8fafc', borderRadius: 10, padding: '12px 16px',
              fontSize: '0.83rem', color: '#374151',
            }}>
              <p style={{ marginBottom: 4, fontWeight: 600 }}>Clé secrète manuelle :</p>
              <code style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#2ecc71', wordBreak: 'break-all' }}>
                {secret || 'Chargement...'}
              </code>
            </div>
          )}
        </>
      )}
      {mfaMethod === 'SMS' && (
        <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>
          Un SMS a été envoyé. Entrez le code reçu pour confirmer.
        </p>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
          Code de vérification
        </label>
        <input
          type="text" inputMode="numeric" maxLength={8}
          value={code}
          onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
          placeholder="123456"
          style={{ ...inputStyle, textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.25em', fontWeight: 700 }}
          onFocus={e => e.target.style.borderColor = '#2ecc71'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>

      {error && <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setStep('choose')} style={{
          flex: 1, padding: '10px', border: '1.5px solid #e5e7eb',
          borderRadius: 10, background: 'white', fontSize: '0.85rem',
          fontWeight: 600, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit',
        }}>← Retour</button>
        <button onClick={handleVerify} disabled={loading || code.length < 4} style={{
          flex: 2, padding: '10px', border: 'none',
          borderRadius: 10, background: loading || code.length < 4 ? '#86efac' : '#2ecc71',
          fontSize: '0.85rem', fontWeight: 600, color: 'white',
          cursor: loading || code.length < 4 ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}>
          {loading && <div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />}
          {loading ? 'Vérification...' : 'Activer la 2FA'}
        </button>
      </div>
    </div>
  );

  /* ── Step: Done ── */
  if (step === 'done') return (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: '#f0fdf4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, color: '#111827' }}>2FA activée !</p>
      <p style={{ fontSize: '0.82rem', color: '#9ca3af', textAlign: 'center' }}>
        Votre compte est maintenant protégé par l'authentification à deux facteurs.
      </p>

      {/* Backup codes */}
      {backupCodes.length > 0 && (
        <div style={{ width: '100%', background: '#fafafa', borderRadius: 10, padding: '12px 16px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            🔑 Codes de récupération — conservez-les en lieu sûr :
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {backupCodes.map((c, i) => (
              <code key={i} style={{
                fontFamily: 'monospace', fontSize: '0.82rem',
                background: '#f3f4f6', padding: '4px 8px',
                borderRadius: 6, color: '#374151',
              }}>{c}</code>
            ))}
          </div>
        </div>
      )}

      <button onClick={onClose} style={{
        width: '100%', padding: '10px', border: 'none',
        borderRadius: 10, background: '#2ecc71',
        fontSize: '0.85rem', fontWeight: 600, color: 'white',
        cursor: 'pointer', fontFamily: 'inherit',
      }}>Terminer</button>
    </div>
  );

  return null;
}

/* ─── Main ProfileSecurityCard ──────────────────────────────── */
export default function ProfileSecurityCard() {
  const [sessions,      setSessions]      = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showSessions,  setShowSessions]  = useState(false);
  const [showMfaSetup,  setShowMfaSetup]  = useState(false);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const { data } = await api.get('/auth/sessions');
      const sessionList = data?.sessions || data?.data?.sessions || data?.data || [];
      setSessions(sessionList);
      setShowSessions(true);
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    } catch {}
  };

  const logoutAll = async () => {
    try {
      await api.post('/auth/logout-all-devices');
      setSessions([]);
      setShowSessions(false);
    } catch {}
  };

  return (
    <div style={{
      background: 'white', borderRadius: 20,
      border: '1px solid #f3f4f6',
      boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
      padding: '28px 32px',
    }}>
      <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 20 }}>
        Sécurité
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── MFA Setup ───────────────────────────────────── */}
        <SectionBox>
          <SectionHeader
            iconBg="#fef9c3"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2"/>
                <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
              </svg>
            }
            title="Authentification à deux facteurs"
            subtitle="Renforcez la sécurité de votre compte"
            action={
              <button
                onClick={() => setShowMfaSetup(v => !v)}
                style={{
                  background: showMfaSetup ? '#fef2f2' : '#f0fdf4',
                  border: `1.5px solid ${showMfaSetup ? '#fecaca' : '#bbf7d0'}`,
                  borderRadius: 8, padding: '6px 14px',
                  fontSize: '0.8rem', fontWeight: 600,
                  color: showMfaSetup ? '#dc2626' : '#16a34a',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                }}
              >
                {showMfaSetup ? 'Annuler' : 'Configurer'}
              </button>
            }
          />
          {showMfaSetup && (
            <MfaSetupPanel onClose={() => setShowMfaSetup(false)} />
          )}
        </SectionBox>

        {/* ── Active Sessions ──────────────────────────────── */}
        <SectionBox>
          <SectionHeader
            iconBg="#eff6ff"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            }
            title="Sessions actives"
            subtitle="Gérez vos appareils connectés"
            action={
              <button
                onClick={showSessions ? () => setShowSessions(false) : fetchSessions}
                style={{
                  background: 'none', border: '1.5px solid #e5e7eb',
                  borderRadius: 8, padding: '6px 14px',
                  fontSize: '0.8rem', fontWeight: 600, color: '#374151',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
              >
                {loadingSessions ? 'Chargement...' : showSessions ? 'Masquer' : 'Voir sessions'}
              </button>
            }
          />

          {showSessions && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {sessions.length === 0 ? (
                <p style={{ fontSize: '0.83rem', color: '#9ca3af', textAlign: 'center', padding: '12px 0' }}>
                  Aucune session active
                </p>
              ) : (
                <>
                  {sessions.map((s) => (
                    <div key={s.sessionId} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#fafafa', borderRadius: 10, padding: '12px 14px',
                      border: '1px solid #f3f4f6',
                    }}>
                      <div>
                        <p style={{ fontSize: '0.83rem', fontWeight: 600, color: '#111827', marginBottom: 2 }}>
                          {s.userAgent?.split('(')[0]?.trim() || 'Appareil inconnu'}
                        </p>
                        <p style={{ fontSize: '0.73rem', color: '#9ca3af' }}>
                          {s.ipAddress} · Expire le {new Date(s.expiresAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <button
                        onClick={() => revokeSession(s.sessionId)}
                        style={{
                          background: '#fef2f2', border: 'none',
                          borderRadius: 8, padding: '5px 12px',
                          fontSize: '0.75rem', fontWeight: 600, color: '#ef4444',
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        Révoquer
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={logoutAll}
                    style={{
                      background: '#fef2f2', border: '1px solid #fecaca',
                      borderRadius: 10, padding: '10px',
                      fontSize: '0.83rem', fontWeight: 600, color: '#dc2626',
                      cursor: 'pointer', fontFamily: 'inherit', width: '100%',
                    }}
                  >
                    Déconnecter tous les appareils
                  </button>
                </>
              )}
            </div>
          )}
        </SectionBox>

        {/* ── Email Verified ───────────────────────────────── */}
        <SectionBox>
          <SectionHeader
            iconBg="#f0fdf4"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            }
            title="Email vérifié"
            subtitle="Votre adresse email est confirmée"
            action={
              <span style={{
                fontSize: '0.75rem', fontWeight: 600,
                background: '#f0fdf4', color: '#16a34a',
                padding: '4px 12px', borderRadius: 20,
              }}>
                Actif
              </span>
            }
          />
        </SectionBox>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
