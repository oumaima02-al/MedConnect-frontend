import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dmpService } from '../../../services/medicalService';
import { adminService } from '../../admin/services/adminService';
import { Icon } from '../../../components/layout/AppLayout';

export default function DoctorPatientView() {
  const { id: patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [dmp, setDmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasConsent, setHasConsent] = useState(null); // null = checking

  useEffect(() => {
    if (!patientId) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch basic patient info
        let patientData = null;
        try {
          const userRes = await adminService.getUserById(patientId);
          patientData = userRes.data?.data || userRes.data;
        } catch {
          patientData = { id: patientId, prenom: 'Patient', nom: '', email: '' };
        }

        // Fetch DMP (if exists)
        let dmpData = null;
        try {
          const dmpRes = await dmpService.getDmp(patientId);
          dmpData = dmpRes.data?.data || dmpRes.data;
          setHasConsent(true); // If we can fetch the DMP, we have consent
        } catch (e) {
          if (e?.response?.status === 403) {
            setHasConsent(false);
          } else {
            setHasConsent(true); // 404 just means no DMP yet
            dmpData = null;
          }
        }

        setPatient(patientData);
        setDmp(dmpData);
      } catch (e) {
        setError('Impossible de charger les données du patient.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#2ecc71', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!hasConsent) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: 40, background: '#fff7f7', border: '1px solid #fca5a5', borderRadius: 20, textAlign: 'center', fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        </div>
        <h2 style={{ color: '#dc2626', fontFamily: "'Sora',sans-serif", fontWeight: 700 }}>Accès restreint</h2>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Le patient n'a pas encore autorisé l'accès à son Dossier Médical Partagé.
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{ marginTop: 20, padding: '10px 24px', borderRadius: 10, background: '#ef4444', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
        >
          Retour
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20, color: '#dc2626', textAlign: 'center', fontFamily: "'DM Sans',sans-serif" }}>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: 12, padding: '8px 20px', borderRadius: 10, background: '#dc2626', color: 'white', border: 'none', cursor: 'pointer' }}>Retour</button>
      </div>
    );
  }

  const patientName = patient ? `${patient.prenom || ''} ${patient.nom || ''}`.trim() || `Patient #${patientId}` : `Patient #${patientId}`;
  const initials = patientName.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2) || 'PT';

  // Build unified event timeline from DMP
  const timeline = [];
  if (dmp?.recentConsultations) {
    dmp.recentConsultations.forEach(c => timeline.push({ date: c.consultationDate, type: 'Consultation', title: c.diagnosis || c.notes || 'Consultation', by: c.doctorName || '—' }));
  }
  if (dmp?.recentLabResults) {
    dmp.recentLabResults.forEach(l => timeline.push({ date: l.testDate, type: 'Analyse', title: l.testName, by: l.labName || '—' }));
  }
  timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

  const allergies = dmp?.allergies || [];
  const medications = dmp?.currentMedications || [];
  const vitals = dmp?.healthNotebook?.slice?.(-1)?.[0] || null;

  const fmt = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return iso; }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: "'DM Sans',sans-serif" }}>

      {/* Patient Header */}
      <div style={{
        background: 'white', borderRadius: 24, padding: '24px 32px', marginBottom: 24,
        border: '1px solid #f3f4f6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.3rem',
          }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              {patientName}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: 4 }}>
              Patient ID: {patientId}
              {dmp?.allergies?.length > 0 && (
                <span style={{ marginLeft: 8, background: '#fef2f2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                  ⚠ {dmp.allergies.length} allergie(s)
                </span>
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/doctor/patients/${patientId}/consultation`)}
            style={{
              padding: '11px 18px', borderRadius: 12, background: 'linear-gradient(135deg, #2ecc71, #16a34a)',
              color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
            }}
          >
            <Icon name="grid" size={16} color="white" /> Nouvelle Consultation
          </button>
          <button
            onClick={() => navigate(`/doctor/patients/${patientId}/prescription`)}
            style={{
              padding: '11px 18px', borderRadius: 12, border: '1.5px solid #2ecc71',
              color: '#16a34a', background: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
            }}
          >
            <Icon name="pill" size={16} color="#2ecc71" /> Créer Ordonnance
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* Medical Timeline */}
        <div style={{ background: 'white', borderRadius: 24, padding: '28px', border: '1px solid #f3f4f6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: 20, color: '#111827' }}>
            Historique Médical
          </h3>
          {!dmp ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
              <p style={{ fontSize: '0.88rem' }}>Aucun dossier médical disponible pour ce patient.</p>
            </div>
          ) : timeline.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
              <p style={{ fontSize: '0.88rem' }}>Aucun événement médical enregistré.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {timeline.slice(0, 10).map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 18, position: 'relative' }}>
                  {i < timeline.length - 1 && (
                    <div style={{ width: 2, background: '#f1f5f9', position: 'absolute', top: 38, bottom: -4, left: 19 }} />
                  )}
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1,
                  }}>
                    <Icon name={h.type === 'Analyse' ? 'file' : 'calendar'} size={16} color="#64748b" />
                  </div>
                  <div style={{ flex: 1, paddingBottom: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600 }}>{fmt(h.date)}</span>
                      <span style={{ fontSize: '0.72rem', background: '#eef2ff', color: '#4338ca', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>{h.type}</span>
                    </div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', color: '#1e293b', fontWeight: 600 }}>{h.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Par: {h.by}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Latest vitals */}
          {vitals && (
            <div style={{ background: 'white', borderRadius: 20, padding: '20px 22px', border: '1px solid #f3f4f6', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              <h4 style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Constantes (dernières)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {vitals.bloodPressure && <div><span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Tension</span><p style={{ fontWeight: 700, color: '#111827', margin: 0 }}>{vitals.bloodPressure}</p></div>}
                {vitals.heartRate && <div><span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Pouls</span><p style={{ fontWeight: 700, color: '#111827', margin: 0 }}>{vitals.heartRate} bpm</p></div>}
                {vitals.weight && <div><span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Poids</span><p style={{ fontWeight: 700, color: '#111827', margin: 0 }}>{vitals.weight} kg</p></div>}
                {vitals.temperature && <div><span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Température</span><p style={{ fontWeight: 700, color: '#111827', margin: 0 }}>{vitals.temperature}°C</p></div>}
              </div>
            </div>
          )}

          {/* Allergies */}
          <div style={{ background: allergies.length > 0 ? '#fff7ed' : 'white', borderRadius: 20, padding: '20px 22px', border: `1px solid ${allergies.length > 0 ? '#fed7aa' : '#f3f4f6'}` }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.82rem', color: allergies.length > 0 ? '#92400e' : '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Allergies {allergies.length > 0 && `(${allergies.length})`}
            </h4>
            {allergies.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: 0 }}>Aucune allergie connue.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {allergies.map((a, i) => (
                  <span key={i} style={{ fontSize: '0.75rem', fontWeight: 700, background: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: 20 }}>
                    {a.allergen || a.name || a} {a.severity ? `(${a.severity})` : ''}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Current medications */}
          <div style={{ background: 'white', borderRadius: 20, padding: '20px 22px', border: '1px solid #f3f4f6' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Médicaments actifs {medications.length > 0 && `(${medications.length})`}
            </h4>
            {medications.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: 0 }}>Aucun médicament en cours.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {medications.slice(0, 5).map((m, i) => (
                  <div key={i} style={{ fontSize: '0.83rem', color: '#374151' }}>
                    <strong>{m.medicationName || m.name}</strong> – {m.dosage || ''}
                    {m.frequency && <span style={{ color: '#9ca3af' }}> · {m.frequency}</span>}
                  </div>
                ))}
                {medications.length > 5 && <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>+{medications.length - 5} autres</p>}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ background: '#f8fafc', borderRadius: 20, padding: '20px 22px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Actions cliniques</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => navigate(`/doctor/patients/${patientId}/consultation`)}
                style={{ padding: '11px 14px', borderRadius: 12, background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%' }}
              >
                <Icon name="grid" size={16} color="#2ecc71" />
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#374151' }}>Nouvelle consultation</span>
              </button>
              <button
                onClick={() => navigate(`/doctor/patients/${patientId}/prescription`)}
                style={{ padding: '11px 14px', borderRadius: 12, background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%' }}
              >
                <Icon name="pill" size={16} color="#3b82f6" />
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#374151' }}>Créer une ordonnance</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
