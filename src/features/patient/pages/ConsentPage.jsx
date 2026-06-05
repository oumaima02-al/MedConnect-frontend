import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { dmpService } from '../../../services/medicalService';
import { Icon } from '../../../components/layout/AppLayout';
import { useDoctorsList } from '../../appointments/hooks/useAppointments';

function SelectField({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: '#374151' }}>{label}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#f8fafc', fontSize: '0.95rem', color: '#111827', outline: 'none', fontFamily: 'inherit' }}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

const SPECIALTIES = [
  'Cardiologie', 'Généraliste', 'Dermatologie', 'Pédiatrie', 'Ophtalmologie',
  'Neurologie', 'Gynécologie', 'Psychiatrie', 'Orthopédie', 'Gastro-entérologie',
];

function fmt(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

export default function ConsentPage() {
  const { user } = useAuth();
  const patientId = user?.id || user?.userId || user?.sub;

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ doctorId: '', specialty: '', accessLevel: 'READ_ONLY', reason: '' });

  const { doctors: systemDocs, loading: docsLoading } = useDoctorsList();

  // Load consented doctors from API
  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    dmpService.getConsents(patientId)
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setDoctors(Array.isArray(list) ? list : []);
      })
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, [patientId]);

  const showToastMsg = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRevoke = async (doctorId, doctorName) => {
    if (!window.confirm(`Révoquer l'accès de ${doctorName} à votre DMP ?`)) return;
    setActionLoading(true);
    try {
      await dmpService.revokeConsent(patientId, doctorId, 'Révocation manuelle par le patient');
      setDoctors(prev => prev.filter(d => (d.doctorId || d.id) !== doctorId));
      showToastMsg('success', `Accès de ${doctorName} révoqué avec succès.`);
    } catch (err) {
      showToastMsg('error', err?.response?.data?.message || 'Erreur lors de la révocation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGrant = async (e) => {
    e.preventDefault();
    if (!newDoc.doctorId) { showToastMsg('error', 'Veuillez sélectionner un médecin.'); return; }
    setActionLoading(true);
    try {
      await dmpService.grantConsent(patientId, {
        doctorId: newDoc.doctorId,
        accessLevel: newDoc.accessLevel,
        reason: newDoc.reason || undefined,
      });
      // Re-fetch consent list
      const res = await dmpService.getConsents(patientId);
      setDoctors(res.data?.data || res.data || []);
      showToastMsg('success', 'Accès accordé avec succès.');
      setShowModal(false);
      setNewDoc({ doctorId: '', specialty: '', accessLevel: 'READ_ONLY', reason: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erreur lors de l\'autorisation.';
      showToastMsg('error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const ACCESS_LEVELS = [
    { value: 'READ_ONLY', label: 'Lecture seule' },
    { value: 'READ_WRITE', label: 'Lecture & écriture' },
    { value: 'FULL', label: 'Accès complet' },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', fontFamily: "'DM Sans',sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 12,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1.5px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
          borderRadius: 14, padding: '14px 18px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          animation: 'slideUp 0.3s ease',
          maxWidth: 360,
        }}>
          <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
          <span style={{ fontSize: '1.1rem' }}>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <p style={{ margin: 0, fontSize: '0.86rem', color: toast.type === 'error' ? '#dc2626' : '#15803d', fontWeight: 500 }}>{toast.text}</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            Gestion des accès médicaux
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: 6 }}>Contrôlez qui peut consulter votre Dossier Médical Partagé.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '12px 22px', borderRadius: 12, background: '#16a34a', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit' }}
        >
          <Icon name="user" color="white" /> Accorder un accès
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 24, padding: '28px 32px', border: '1px solid #f3f4f6', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 20, color: '#111827' }}>
          Médecins autorisés {!loading && `(${doctors.length})`}
        </h3>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2].map(i => (
              <div key={i} style={{ height: 68, borderRadius: 16, background: 'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        ) : doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔒</div>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Aucun médecin n'a accès à votre DMP actuellement.<br />
              Cliquez sur « Accorder un accès » pour commencer.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {doctors.map((dr, i) => {
              const drId = dr.doctorId || dr.id;
              const drName = dr.doctorName || `Médecin #${drId?.slice?.(-6)}`;
              const level = dr.accessLevel || 'READ_ONLY';
              const levelLabel = { READ_ONLY: 'Lecture seule', READ_WRITE: 'Lecture & écriture', FULL: 'Accès complet' }[level] || level;
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 20px', borderRadius: 16, background: '#f8fafc', border: '1px solid #f1f5f9',
                  opacity: actionLoading ? 0.6 : 1, transition: 'opacity 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="user" color="#4338ca" />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.94rem', color: '#111827' }}>{drName}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#9ca3af' }}>
                        {dr.specialty && `${dr.specialty} • `}
                        <span style={{ color: '#6366f1', fontWeight: 600 }}>{levelLabel}</span>
                        {dr.grantedAt && ` • Depuis le ${fmt(dr.grantedAt)}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(drId, drName)}
                    disabled={actionLoading}
                    style={{ padding: '8px 16px', borderRadius: 10, background: '#fef2f2', color: '#dc2626', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: actionLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                  >
                    Révoquer
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 28, padding: '16px 20px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: 14, border: '1px solid #86efac' }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#166534', lineHeight: 1.6 }}>
            <strong>Sécurité:</strong> Les médecins n'accèdent à votre DMP que si vous leur accordez explicitement l'autorisation.
            Vous pouvez révoquer cet accès à tout moment sans justification.
          </p>
        </div>
      </div>

      {/* Grant Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: 24, width: '100%', maxWidth: 440, boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.2rem', fontWeight: 800, marginBottom: 6, color: '#111827' }}>Autoriser un médecin</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: 24 }}>Ce médecin pourra consulter votre dossier médical.</p>
            <form onSubmit={handleGrant}>
              <SelectField
                label="Médecin"
                value={newDoc.doctorId}
                onChange={e => {
                  const d = systemDocs.find(sd => sd.id === e.target.value);
                  setNewDoc({ ...newDoc, doctorId: e.target.value, specialty: d?.profile?.specialty || '' });
                }}
                disabled={docsLoading}
                placeholder={docsLoading ? 'Chargement...' : 'Choisir un médecin...'}
                options={systemDocs.map(d => ({ value: d.id, label: `Dr. ${d.prenom} ${d.nom}` }))}
              />
              <SelectField
                label="Niveau d'accès"
                value={newDoc.accessLevel}
                onChange={e => setNewDoc({ ...newDoc, accessLevel: e.target.value })}
                placeholder=""
                options={ACCESS_LEVELS}
              />
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: '#374151' }}>
                  Raison <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optionnel)</span>
                </label>
                <input
                  value={newDoc.reason}
                  onChange={e => setNewDoc({ ...newDoc, reason: e.target.value })}
                  placeholder="Ex: Suivi cardiologique post-opératoire"
                  style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button" onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #e5e7eb', background: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Annuler
                </button>
                <button
                  type="submit" disabled={actionLoading || !newDoc.doctorId}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: newDoc.doctorId ? '#16a34a' : '#e5e7eb', color: newDoc.doctorId ? 'white' : '#9ca3af', fontWeight: 700, cursor: newDoc.doctorId ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {actionLoading && <span style={{ width: 14, height: 14, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
                  Confirmer
                </button>
              </div>
            </form>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
