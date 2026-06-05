import { useState, useEffect } from 'react';
import { useAdminUsers, useAdminUserActions } from '../hooks/useAdmin';
import { doctorService } from '../../doctors/services/doctorService';
import { pharmacistService } from '../../pharmacists/services/pharmacistService';
import { adminService } from '../services/adminService';
import AdminDocumentViewer from '../components/AdminDocumentViewer';

const ROLES = ['PATIENT', 'DOCTOR', 'PHARMACIST', 'ADMIN'];

const ROLE_STYLE = {
  PATIENT:    { color: '#16a34a', bg: '#f0fdf4' },
  DOCTOR:     { color: '#2563eb', bg: '#eff6ff' },
  PHARMACIST: { color: '#7c3aed', bg: '#f5f3ff' },
  ADMIN:      { color: '#dc2626', bg: '#fef2f2' },
};

const Badge = ({ role }) => {
  const s = ROLE_STYLE[role] || ROLE_STYLE.PATIENT;
  return (
    <span style={{
      fontSize: '0.72rem', fontWeight: 700,
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: 20,
    }}>{role}</span>
  );
};

/* ── Create / Edit Modal ─────────────────────────────────────────────────── */
function UserModal({ user, onClose, onCreate, onUpdate }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    prenom:    user?.prenom    || '',
    nom:       user?.nom       || '',
    email:     user?.email     || '',
    telephone: user?.telephone || '',
    password:  '',
    role:      user?.role      || user?.roles?.[0]?.replace('ROLE_', '') || 'PATIENT',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const inputS = {
    width: '100%', padding: '10px 12px',
    border: '1.5px solid #e5e7eb', borderRadius: 9,
    fontSize: '0.86rem', outline: 'none',
    background: '#fafafa', fontFamily: 'inherit',
    color: '#111827', boxSizing: 'border-box',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!form.prenom.trim()) { setError('Le prénom est requis.'); return; }
    if (!form.nom.trim()) { setError('Le nom est requis.'); return; }
    if (!form.email.trim()) { setError('L\'email est requis.'); return; }
    if (!isEdit && form.password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return; }
    setLoading(true); setError('');
    try {
      if (isEdit) {
        await onUpdate({ id: user.id, ...form });
      } else {
        await onCreate(form);
      }
      // onClose is called by the parent after toast; do NOT call it here
      // so the loading state is visible until parent resolves.
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.error || err.response?.data?.message
        || err.response?.data?.detail || 'Erreur lors de l\'enregistrement.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 20,
        padding: '32px 28px', width: '100%', maxWidth: 460,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#111827', marginBottom: 20 }}>
          {isEdit ? 'Modifier utilisateur' : 'Créer un utilisateur'}
        </h2>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 9, padding: '10px 14px',
            fontSize: '0.82rem', color: '#dc2626', marginBottom: 16,
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#9ca3af', marginBottom:5, textTransform:'uppercase' }}>Prénom</label>
              <input value={form.prenom} onChange={e => set('prenom', e.target.value)} placeholder="Sara" required style={inputS} onFocus={e=>e.target.style.borderColor='#2ecc71'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#9ca3af', marginBottom:5, textTransform:'uppercase' }}>Nom</label>
              <input value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Benali" required style={inputS} onFocus={e=>e.target.style.borderColor='#2ecc71'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
            </div>
          </div>
          <div>
            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#9ca3af', marginBottom:5, textTransform:'uppercase' }}>Email</label>
            <input value={form.email} onChange={e => set('email', e.target.value)} type="email" placeholder="sara@email.com" required style={inputS} onFocus={e=>e.target.style.borderColor='#2ecc71'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#9ca3af', marginBottom:5, textTransform:'uppercase' }}>Téléphone</label>
            <input value={form.telephone} onChange={e => set('telephone', e.target.value)} type="tel" placeholder="+212 6 00 00 00 00" style={inputS} onFocus={e=>e.target.style.borderColor='#2ecc71'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
          </div>
          {!isEdit && (
            <div>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#9ca3af', marginBottom:5, textTransform:'uppercase' }}>Mot de passe</label>
              <input value={form.password} onChange={e => set('password', e.target.value)} type="password" placeholder="••••••••" required style={inputS} onFocus={e=>e.target.style.borderColor='#2ecc71'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
            </div>
          )}
          <div>
            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#9ca3af', marginBottom:5, textTransform:'uppercase' }}>Rôle</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} style={{ ...inputS, cursor:'pointer' }}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button type="button" onClick={onClose} style={{
              flex:1, padding:'10px', border:'1.5px solid #e5e7eb', borderRadius:10,
              background:'white', fontSize:'0.85rem', fontWeight:600, color:'#6b7280',
              cursor:'pointer', fontFamily:'inherit',
            }}>Annuler</button>
            <button type="submit" disabled={loading} style={{
              flex:2, padding:'10px', border:'none', borderRadius:10,
              background: loading ? '#86efac' : '#2ecc71',
              fontSize:'0.85rem', fontWeight:600, color:'white',
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit',
              display:'flex', alignItems:'center', justifyContent:'center', gap:7,
            }}>
              {loading && <div style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />}
              {loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

/* ── Confirm Delete Modal ────────────────────────────────────────────────── */
function ConfirmModal({ user, onClose, onConfirm, loading }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.45)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
    }} onClick={loading ? null : onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'white', borderRadius:20, padding:'28px 24px',
        width:'100%', maxWidth:380, boxShadow:'0 20px 60px rgba(0,0,0,0.15)',
        textAlign:'center',
      }}>
        <div style={{ 
          width:52, height:52, borderRadius:'50%', background:'#fef2f2', 
          display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' 
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </div>
        <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, color:'#111827', marginBottom:6 }}>Supprimer l'utilisateur ?</p>
        <p style={{ fontSize:'0.83rem', color:'#9ca3af', marginBottom:22 }}>
          {user?.prenom} {user?.nom} ({user?.email}) sera supprimé définitivement.
        </p>
        <div style={{ display:'flex', gap:10 }}>
          <button 
            onClick={onClose} 
            disabled={loading}
            style={{ 
              flex:1, padding:'10px', border:'1.5px solid #e5e7eb', borderRadius:10, 
              background:'white', fontSize:'0.85rem', fontWeight:600, color:'#6b7280', 
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit' 
            }}
          >
            Annuler
          </button>
          <button 
            onClick={onConfirm} 
            disabled={loading}
            style={{ 
              flex:1, padding:'10px', border:'none', borderRadius:10, 
              background: loading ? '#fca5a5' : '#ef4444', 
              fontSize:'0.85rem', fontWeight:600, color:'white', 
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7
            }}
          >
            {loading && <div style={{ width:12, height:12, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />}
            {loading ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Lightbox component ─────────────────────────────────────────────────── */
function Lightbox({ src, title, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'relative', maxWidth: '90%', maxHeight: '90%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: -48, right: 0,
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
          width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', cursor: 'pointer', fontSize: '1.2rem', transition: 'background 0.2s'
        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
           onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
          ✕
        </button>
        <img src={src} alt={title} style={{
          maxWidth: '100%', maxHeight: '80vh', borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '3px solid rgba(255,255,255,0.1)'
        }} />
        <span style={{ color: 'white', fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          {title}
        </span>
      </div>
    </div>
  );
}

/* ── Audits Panel ───────────────────────────────────────────────────────── */
function AuditsPanel() {
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('PENDING'); // 'PENDING' | 'VERIFIED' | 'REJECTED'
  const [lightbox, setLightbox] = useState(null); // { src, title }
  const [actionLoading, setActionLoading] = useState({}); // { [userId]: 'APPROVE' | 'REJECT' }
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', msg }

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getUsers({ page: 0, size: 200 });
      const usersList = res.data?.data?.content || res.data?.content || res.data || [];

      // Include ALL non-admin users — a user with role USER/PATIENT can have a pending profile
      const candidates = usersList.filter(u => {
        const r = (u.role || u.roles?.[0] || '').replace('ROLE_', '').toUpperCase();
        return r !== 'ADMIN';
      });

      const resolved = await Promise.allSettled(
        candidates.map(async (u) => {
          const userRole = (u.role || u.roles?.[0] || '').replace('ROLE_', '').toUpperCase();

          let pRes = null;
          let activeRole = userRole;

          // Try DOCTOR profile first
          try {
            const r = await doctorService.getProfile(u.id);
            const profile = r?.data?.data || r?.data;
            if (profile && Object.keys(profile).length > 0) {
              pRes = profile;
              activeRole = 'DOCTOR';
            }
          } catch (e) { /* 404 = no doctor profile */ }

          // If no doctor profile, try PHARMACIST
          if (!pRes) {
            try {
              const r = await pharmacistService.getProfile(u.id);
              const profile = r?.data?.data || r?.data;
              if (profile && Object.keys(profile).length > 0) {
                pRes = profile;
                activeRole = 'PHARMACIST';
              }
            } catch (e) { /* 404 = no pharmacist profile */ }
          }

          if (!pRes) return null; // No profile found for this user

          return { ...u, activeRole, profile: pRes, hasProfile: true };
        })
      );

      // Keep only fulfilled results that found a profile
      const withProfiles = resolved
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value);

      setPros(withProfiles);
    } catch (err) {
      console.error('[AuditsPanel] loadData error:', err);
      setError('Impossible de charger les dossiers pour audit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleVerify = async (user, status) => {
    setActionLoading(prev => ({ ...prev, [user.id]: status }));
    try {
      if (user.activeRole === 'DOCTOR') {
        await adminService.verifyDoctor(user.id, status);
      } else {
        await adminService.verifyPharmacist(user.id, status);
      }
      showToast('success', `Dossier de ${user.activeRole === 'DOCTOR' ? 'Dr.' : 'Ph.'} ${user.prenom} ${user.nom} a été ${status === 'VERIFIED' ? 'approuvé' : 'rejeté'} avec succès !`);
      
      // Update local state dynamically
      setPros(prev => prev.map(p => {
        if (p.id === user.id) {
          return {
            ...p,
            profile: {
              ...p.profile,
              status: status,
              verified: status === 'VERIFIED'
            }
          };
        }
        return p;
      }));
    } catch (err) {
      showToast('error', `Échec de l'opération: ${err.response?.data?.error || 'Erreur serveur'}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [user.id]: null }));
    }
  };

  const getProfileStatus = (p) => {
    const st = p.profile?.verificationStatus || p.profile?.status;
    if (st) return String(st).toUpperCase();
    return p.profile?.verified ? 'VERIFIED' : 'PENDING';
  };

  const filteredPros = pros.filter(p => {
    const status = getProfileStatus(p);
    return status === filter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 1000,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', padding: '12px 24px', borderRadius: 12,
          fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.88rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
          zIndex: 9999,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Internal status tabs */}
      <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', padding: 4, borderRadius: 12, width: 'fit-content' }}>
        {[
          { key: 'PENDING', label: 'En attente', color: '#f59e0b' },
          { key: 'VERIFIED', label: 'Approuvés', color: '#10b981' },
          { key: 'REJECTED', label: 'Rejetés', color: '#ef4444' },
        ].map(t => {
          const active = filter === t.key;
          const count = pros.filter(p => getProfileStatus(p) === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              style={{
                border: 'none',
                background: active ? 'white' : 'transparent',
                color: active ? '#0f172a' : '#64748b',
                padding: '8px 16px',
                borderRadius: 9,
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              <span>{t.label}</span>
              <span style={{
                background: active ? t.color + '18' : '#e2e8f0',
                color: active ? t.color : '#64748b',
                padding: '1px 6px',
                borderRadius: 20,
                fontSize: '0.72rem',
                fontWeight: 700,
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {Array(2).fill(0).map((_, i) => (
            <div key={i} style={{ height: 300, background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f1f5f9' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  <div style={{ height: 16, background: '#f1f5f9', borderRadius: 4, width: '40%' }} />
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '25%' }} />
                </div>
              </div>
              <div style={{ height: 100, background: '#f8fafc', borderRadius: 12 }} />
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ height: 40, flex: 1, background: '#f1f5f9', borderRadius: 10 }} />
                <div style={{ height: 40, flex: 1, background: '#f1f5f9', borderRadius: 10 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '16px 20px', borderRadius: 12, fontSize: '0.85rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {!loading && !error && filteredPros.length === 0 && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{
            width: 54, height: 54, borderRadius: '50%', background: '#f8fafc',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 style={{ fontFamily: "'Sora', sans-serif", color: '#0f172a', fontWeight: 700, marginBottom: 6 }}>
            Aucun dossier à traiter
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.83rem' }}>
            Tous les dossiers ont été audités pour ce filtre.
          </p>
        </div>
      )}

      {!loading && !error && filteredPros.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {filteredPros.map(p => {
            const isDoc = p.activeRole === 'DOCTOR';
            const profile = p.profile;
            return (
              <div key={p.id} style={{
                background: 'white',
                borderRadius: 20,
                border: '1px solid #e2e8f0',
                padding: '24px 28px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                position: 'relative',
              }}>
                {/* Header info */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: isDoc ? 'linear-gradient(135deg, #dbeafe, #bfdbfe)' : 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '0.9rem',
                    color: isDoc ? '#1e40af' : '#6b21a8'
                  }}>
                    {isDoc ? 'Dr' : 'Ph'}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Sora', sans-serif", color: '#0f172a', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                      {isDoc ? `Dr. ${p.prenom} ${p.nom}` : `${p.prenom} ${p.nom}`}
                    </h3>
                    <span style={{
                      fontSize: '0.73rem', fontWeight: 700,
                      color: isDoc ? '#2ecc71' : '#7c3aed',
                      background: isDoc ? '#f0fdf4' : '#f5f3ff',
                      padding: '2px 8px', borderRadius: 20, marginTop: 4, display: 'inline-block'
                    }}>
                      {isDoc ? `Spécialité: ${profile?.specialty || 'Non définie'}` : `Pharmacie: ${profile?.pharmacyName}`}
                    </span>
                  </div>
                </div>

                {/* Grid Details */}
                <div style={{
                  background: '#f8fafc',
                  borderRadius: 14,
                  padding: '16px 20px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  fontSize: '0.8rem',
                }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: 2 }}>{isDoc ? "N° Inscription" : "N° Licence"}</span>
                    <strong style={{ color: '#0f172a' }}>{profile?.professionalRegistrationNumber || profile?.rppsLicense || profile?.finessNumber || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: 2 }}>N° CNI</span>
                    <strong style={{ color: '#0f172a' }}>{profile?.nationalIdNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: 2 }}>Ville</span>
                    <strong style={{ color: '#0f172a' }}>{profile?.city}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: 2 }}>
                      {isDoc ? "Cabinet/Clinique" : "Horaires d'ouverture"}
                    </span>
                    <strong style={{ color: '#0f172a' }}>
                      {isDoc ? profile?.clinicName : profile?.openingHours}
                    </strong>
                  </div>
                  {isDoc ? (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748b', display: 'block', marginBottom: 2 }}>Langues parlées</span>
                      <strong style={{ color: '#0f172a' }}>{profile?.languages?.join(', ')}</strong>
                    </div>
                  ) : (
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748b', display: 'block', marginBottom: 2 }}>Livraison</span>
                      <strong style={{ color: '#0f172a' }}>
                        {profile?.deliveryAvailable ? '✓ Disponible' : '✗ Non disponible'}
                      </strong>
                    </div>
                  )}
                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 4 }}>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: 2 }}>Email & Téléphone</span>
                    <strong style={{ color: '#0f172a' }}>{p.email} | {p.telephone || 'Non renseigné'}</strong>
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div>
                  <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.8rem', color: '#0f172a', fontWeight: 700, marginBottom: 10 }}>
                    Documents Professionnels
                  </h4>
                  <AdminDocumentViewer userId={p.id} userName={`${p.prenom} ${p.nom}`} />
                </div>

                {/* Footer Buttons */}
                {filter === 'PENDING' && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button
                      onClick={() => handleVerify(p, 'REJECTED')}
                      disabled={actionLoading[p.id]}
                      style={{
                        flex: 1, padding: '11px',
                        border: '1.5px solid #ef4444',
                        background: 'transparent',
                        color: '#ef4444',
                        borderRadius: 12,
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#fef2f2';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {actionLoading[p.id] === 'REJECTED' ? 'Chargement...' : 'Rejeter'}
                    </button>
                    <button
                      onClick={() => handleVerify(p, 'VERIFIED')}
                      disabled={actionLoading[p.id]}
                      style={{
                        flex: 2, padding: '11px',
                        border: 'none',
                        background: '#10b981',
                        color: 'white',
                        borderRadius: 12,
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        boxShadow: '0 4px 12px rgba(16,185,129,0.2)',
                        transition: 'all 0.2s',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#059669';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#10b981';
                      }}
                    >
                      {actionLoading[p.id] === 'VERIFIED' ? 'Chargement...' : 'Approuver'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightbox && (
        <Lightbox src={lightbox.src} title={lightbox.title} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

/* ── Admin Users Page ────────────────────────────────────────────────────── */
export default function AdminUsersPage() {
  const { users, total, page, setPage, filters, updateFilter, resetFilters, isLoading, isError } = useAdminUsers();
  const { deleteUser, suspendUser, createUser, updateUser } = useAdminUserActions();

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'audits'
  const [modal,  setModal]  = useState(null); // null | 'create' | { mode:'edit', user } | { mode:'delete', user }
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const closeModal = () => setModal(null);

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      {/* Modals */}
      {modal === 'create' && (
        <UserModal
          onClose={closeModal}
          onCreate={async (data) => { 
            try {
              await createUser.mutateAsync(data); 
              showToast('success', 'Utilisateur créé avec succès !');
              closeModal();
            } catch (err) {
              console.error('Create failed:', err);
              throw err;
            }
          }}
          onUpdate={null}
        />
      )}
      {modal?.mode === 'edit' && (
        <UserModal
          user={modal.user}
          onClose={closeModal}
          onCreate={null}
          onUpdate={async (data) => {
            await updateUser.mutateAsync(data);
            showToast('success', 'Utilisateur mis à jour avec succès !');
            closeModal();
          }}
        />
      )}
      {modal?.mode === 'delete' && (
        <ConfirmModal
          user={modal.user}
          loading={deleteUser.isPending}
          onClose={closeModal}
          onConfirm={async () => {
            if (!modal.user?.id) {
              showToast('error', 'ID utilisateur introuvable.');
              return;
            }
            try {
              await deleteUser.mutateAsync(modal.user.id);
              showToast('success', `L'utilisateur ${modal.user.prenom} a été supprimé avec succès !`);
              closeModal();
            } catch (err) {
              const errMsg = err.response?.data?.error || err.response?.data?.message || 'Erreur serveur';
              showToast('error', `Erreur lors de la suppression: ${errMsg}`);
            }
          }}
        />
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', padding: '12px 24px', borderRadius: 12,
          fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '0.88rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toast.msg}
        </div>
      )}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Page header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1.5rem', fontWeight:700, color:'#111827', marginBottom:4 }}>
            {activeTab === 'users' ? 'Gestion des utilisateurs' : 'Dossiers professionnels & Audits'}
          </h1>
          <p style={{ fontSize:'0.88rem', color:'#9ca3af' }}>
            {activeTab === 'users' ? `${total} utilisateur${total !== 1 ? 's' : ''} au total` : 'Vérification et approbation des pièces justificatives médicales'}
          </p>
        </div>
        {activeTab === 'users' && (
          <button
            onClick={() => setModal('create')}
            style={{
              display:'flex', alignItems:'center', gap:8,
              background:'#2ecc71', border:'none', borderRadius:12,
              padding:'10px 20px', fontSize:'0.88rem', fontWeight:600,
              color:'white', cursor:'pointer', fontFamily:'inherit',
              boxShadow:'0 4px 14px rgba(46,204,113,0.35)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouvel utilisateur
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #e2e8f0', marginBottom: 24, paddingBottom: 1 }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 16px 12px 8px',
            fontSize: '0.92rem',
            fontWeight: 600,
            color: activeTab === 'users' ? '#2ecc71' : '#64748b',
            borderBottom: `2.5px solid ${activeTab === 'users' ? '#2ecc71' : 'transparent'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab('audits')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 16px 12px 8px',
            fontSize: '0.92rem',
            fontWeight: 600,
            color: activeTab === 'audits' ? '#2ecc71' : '#64748b',
            borderBottom: `2.5px solid ${activeTab === 'audits' ? '#2ecc71' : 'transparent'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
          Dossiers professionnels
        </button>
      </div>

      {activeTab === 'users' ? (
        <>
          {/* Filters bar */}
          <div style={{
            background:'white', borderRadius:16, border:'1px solid #f3f4f6',
            boxShadow:'0 2px 12px rgba(0,0,0,0.04)',
            padding:'16px 20px', marginBottom:20,
            display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:12, alignItems:'center',
          }}>
            {/* Search */}
            <div style={{ position:'relative' }}>
              <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={filters.query}
                onChange={e => updateFilter('query', e.target.value)}
                placeholder="Rechercher par nom, email..."
                style={{
                  width:'100%', padding:'9px 12px 9px 36px',
                  border:'1.5px solid #e5e7eb', borderRadius:9,
                  fontSize:'0.86rem', outline:'none',
                  background:'#fafafa', fontFamily:'inherit', color:'#111827',
                  boxSizing:'border-box',
                }}
                onFocus={e=>e.target.style.borderColor='#2ecc71'}
                onBlur={e=>e.target.style.borderColor='#e5e7eb'}
              />
            </div>

            {/* Role filter */}
            <select
              value={filters.role}
              onChange={e => updateFilter('role', e.target.value)}
              style={{
                padding:'9px 12px', border:'1.5px solid #e5e7eb', borderRadius:9,
                fontSize:'0.86rem', outline:'none', background:'#fafafa',
                fontFamily:'inherit', color:'#374151', cursor:'pointer',
              }}
            >
              <option value="">Tous les rôles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {/* Status filter */}
            <select
              value={filters.enabled}
              onChange={e => updateFilter('enabled', e.target.value)}
              style={{
                padding:'9px 12px', border:'1.5px solid #e5e7eb', borderRadius:9,
                fontSize:'0.86rem', outline:'none', background:'#fafafa',
                fontFamily:'inherit', color:'#374151', cursor:'pointer',
              }}
            >
              <option value="">Tous statuts</option>
              <option value="true">Actifs</option>
              <option value="false">Suspendus</option>
            </select>

            {/* Reset */}
            {(filters.query || filters.role || filters.enabled) && (
              <button onClick={resetFilters} style={{
                padding:'9px 14px', border:'1px solid #fecaca',
                borderRadius:9, background:'#fef2f2',
                fontSize:'0.82rem', fontWeight:600, color:'#dc2626',
                cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
              }}>
                Réinitialiser
              </button>
            )}
          </div>

          {/* Table */}
          <div style={{
            background:'white', borderRadius:18, border:'1px solid #f3f4f6',
            boxShadow:'0 2px 12px rgba(0,0,0,0.04)', overflow:'hidden',
          }}>
            {/* Table header */}
            <div style={{
              display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr',
              padding:'12px 20px', borderBottom:'1.5px solid #f3f4f6',
              background:'#fafafa',
            }}>
              {['Utilisateur', 'Email', 'Rôle', 'Statut', 'Actions'].map(h => (
                <span key={h} style={{ fontSize:'0.73rem', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Loading skeletons */}
            {isLoading && Array(8).fill(0).map((_, i) => (
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr',
                padding:'14px 20px', borderBottom:'1px solid #f9fafb', alignItems:'center',
              }}>
                {[120, 160, 70, 55, 80].map((w, j) => (
                  <div key={j} style={{
                    height:14, width:w, borderRadius:7,
                    background:'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)',
                    backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite',
                  }} />
                ))}
              </div>
            ))}

            {/* Error */}
            {isError && (
              <div style={{ padding:'40px 20px', textAlign:'center' }}>
                <p style={{ fontSize:'0.88rem', color:'#ef4444' }}>Impossible de charger les utilisateurs.</p>
              </div>
            )}

            {/* Rows */}
            {!isLoading && !isError && users.map((u) => (
              <div key={u.id} style={{
                display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr',
                padding:'14px 20px', borderBottom:'1px solid #f9fafb', alignItems:'center',
                transition:'background 0.15s',
              }}
                onMouseEnter={e=>e.currentTarget.style.background='#fafafa'}
                onMouseLeave={e=>e.currentTarget.style.background='white'}
              >
                {/* Name + initials */}
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{
                    width:34, height:34, borderRadius:'50%',
                    background:'linear-gradient(135deg,#a7f3d0,#6ee7b7)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.78rem', color:'#065f46',
                    flexShrink:0,
                  }}>
                    {`${u.prenom?.[0]||''}${u.nom?.[0]||''}`.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p style={{ fontSize:'0.87rem', fontWeight:600, color:'#111827' }}>{u.prenom} {u.nom}</p>
                    <p style={{ fontSize:'0.73rem', color:'#9ca3af' }}>ID: {u.id?.slice?.(0,8) || u.id}</p>
                  </div>
                </div>

                {/* Email */}
                <p style={{ fontSize:'0.84rem', color:'#6b7280' }}>{u.email}</p>

                {/* Role */}
                <Badge role={u.role || u.roles?.[0]?.replace('ROLE_', '') || 'PATIENT'} />

                {/* Status */}
                <span style={{
                  fontSize:'0.75rem', fontWeight:600,
                  background: u.enabled ? '#f0fdf4' : '#fef2f2',
                  color: u.enabled ? '#16a34a' : '#dc2626',
                  padding:'3px 10px', borderRadius:20,
                }}>
                  {u.enabled ? 'Actif' : 'Suspendu'}
                </span>

                {/* Actions */}
                <div style={{ display:'flex', gap:6 }}>
                  {/* Edit */}
                  <button
                    onClick={() => setModal({ mode:'edit', user:u })}
                    title="Modifier"
                    style={{
                      background:'#eff6ff', border:'none', borderRadius:8,
                      padding:'6px 10px', cursor:'pointer',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  {/* Suspend */}
                  <button
                    onClick={async () => {
                      try {
                        await suspendUser.mutateAsync(u.id);
                        showToast('success', `Statut de ${u.prenom} mis à jour avec succès.`);
                      } catch (err) {
                        showToast('error', 'Erreur lors de la mise à jour du statut.');
                      }
                    }}
                    title={u.enabled ? "Suspendre" : "Activer"}
                    style={{
                      background: u.enabled ? '#fef9c3' : '#f0fdf4', border:'none', borderRadius:8,
                      padding:'6px 10px', cursor:'pointer',
                    }}
                  >
                    {u.enabled ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => setModal({ mode:'delete', user:u })}
                    title="Supprimer"
                    style={{
                      background:'#fef2f2', border:'none', borderRadius:8,
                      padding:'6px 10px', cursor:'pointer',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Empty */}
            {!isLoading && !isError && users.length === 0 && (
              <div style={{ padding:'60px 20px', textAlign:'center' }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <p style={{ fontFamily:"'Sora',sans-serif", fontWeight:600, color:'#374151', marginBottom:4 }}>Aucun utilisateur trouvé</p>
                <p style={{ fontSize:'0.83rem', color:'#9ca3af' }}>Essayez de modifier vos filtres.</p>
              </div>
            )}

            {/* Pagination */}
            {total > 20 && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderTop:'1.5px solid #f3f4f6' }}>
                <p style={{ fontSize:'0.82rem', color:'#9ca3af' }}>
                  Page {page + 1} · {total} utilisateurs
                </p>
                <div style={{ display:'flex', gap:8 }}>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={{
                      padding:'6px 14px', border:'1.5px solid #e5e7eb', borderRadius:8,
                      background: page === 0 ? '#f9fafb' : 'white', fontSize:'0.82rem',
                      fontWeight:600, color: page === 0 ? '#d1d5db' : '#374151',
                      cursor: page === 0 ? 'not-allowed' : 'pointer', fontFamily:'inherit',
                    }}
                  >← Précédent</button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={(page + 1) * 20 >= total}
                    style={{
                      padding:'6px 14px', border:'1.5px solid #e5e7eb', borderRadius:8,
                      background: (page + 1) * 20 >= total ? '#f9fafb' : 'white', fontSize:'0.82rem',
                      fontWeight:600, color: (page + 1) * 20 >= total ? '#d1d5db' : '#374151',
                      cursor: (page + 1) * 20 >= total ? 'not-allowed' : 'pointer', fontFamily:'inherit',
                    }}
                  >Suivant →</button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <AuditsPanel />
      )}
    </div>
  );
}
