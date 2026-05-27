import { useState } from 'react';
import api from '../../../services/api';

const inputStyle = {
  width: '100%', padding: '11px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: 10, fontSize: '0.88rem',
  outline: 'none', background: '#fafafa',
  fontFamily: 'inherit', color: '#111827',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

export default function ProfileSecurityCard() {
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showSessions, setShowSessions] = useState(false);

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

        {/* Active sessions */}
        <div style={{
          border: '1.5px solid #f3f4f6', borderRadius: 14, padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showSessions && sessions.length > 0 ? 16 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: '#eff6ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>Sessions actives</p>
                <p style={{ fontSize: '0.76rem', color: '#9ca3af' }}>Gérez vos appareils connectés</p>
              </div>
            </div>
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
          </div>

          {/* Sessions list */}
          {showSessions && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
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
        </div>

        {/* Email verified status */}
        <div style={{
          border: '1.5px solid #f3f4f6', borderRadius: 14, padding: '18px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: '#f0fdf4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>Email vérifié</p>
              <p style={{ fontSize: '0.76rem', color: '#9ca3af' }}>Votre adresse email est confirmée</p>
            </div>
          </div>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600,
            background: '#f0fdf4', color: '#16a34a',
            padding: '4px 12px', borderRadius: 20,
          }}>
            Actif
          </span>
        </div>

      </div>
    </div>
  );
}
