import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { dmpService } from '../../../services/medicalService';
import { Icon } from '../../../components/layout/AppLayout';

const DMPCard = ({ title, children, actionLabel, onAction, icon, color }) => (
  <div style={{
    background: 'white', borderRadius: 20, padding: '24px',
    border: '1px solid #f3f4f6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    display: 'flex', flexDirection: 'column', gap: 16,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={20} color={color} />
        </div>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          {title}
        </h3>
      </div>
      {actionLabel && (
        <button onClick={onAction} style={{ background: 'none', border: 'none', color: '#2ecc71', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', padding: '4px 8px' }}>
          {actionLabel}
        </button>
      )}
    </div>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

function normalizeVital(v) {
  if (!v) return null;
  const systolic = v.bloodPressureSystolic;
  const diastolic = v.bloodPressureDiastolic;
  return {
    ...v,
    sortDate: v.measuredAt || v.entryDate || v.createdAt || v.updatedAt,
    bloodPressure: v.bloodPressure || (systolic && diastolic ? `${systolic}/${diastolic}` : ''),
    heartRate: v.heartRate,
    weight: v.weight,
    temperature: v.temperature,
  };
}

function vitalTime(v) {
  const t = Date.parse(v?.sortDate || '');
  return Number.isNaN(t) ? 0 : t;
}
function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          height: 20, borderRadius: 6, width: `${60 + i * 10}%`,
          background: 'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
        }} />
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

function EmptyRow({ text }) {
  return <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>{text}</p>;
}

function fmt(iso) {
  if (!iso) return '-';
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return iso; }
}

export default function PatientDmpPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = String(user?.role || '').toUpperCase();
  const patientId = user?.id || user?.userId || user?.sub;

  const [dmp, setDmp] = useState(null);
  const [healthNotebook, setHealthNotebook] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  useEffect(() => {
    if (!patientId || (role && !['PATIENT', 'USER'].includes(role))) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [dmpRes, notebookRes] = await Promise.allSettled([
          dmpService.getDmp(patientId),
          dmpService.getHealthNotebook(patientId),
        ]);

        if (dmpRes.status === 'fulfilled') {
          setDmp(dmpRes.value.data?.data || dmpRes.value.data);
        } else if (dmpRes.reason?.response?.status === 404) {
          setDmp(null);
        } else {
          setError('Impossible de charger votre dossier medical. Reessayez plus tard.');
        }

        if (notebookRes.status === 'fulfilled') {
          const rawNotebook = notebookRes.value.data?.data ?? notebookRes.value.data;
          setHealthNotebook(Array.isArray(rawNotebook) ? rawNotebook : rawNotebook?.content || rawNotebook?.items || []);
        } else {
          setHealthNotebook([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId, role]);

  const vitals = healthNotebook.length ? healthNotebook : (dmp?.healthNotebook || dmp?.healthNotebookEntries || dmp?.vitals || []);
  const normalizedVitals = vitals.map(normalizeVital).filter(Boolean).sort((a, b) => vitalTime(b) - vitalTime(a));
  const lastVital = normalizedVitals.find((v) => v.bloodPressure || v.heartRate || v.weight || v.temperature) || null;
  const validHeartRate = Number(lastVital?.heartRate) >= 30 && Number(lastVital?.heartRate) <= 220;
  const validTemperature = Number(lastVital?.temperature) >= 30 && Number(lastVital?.temperature) <= 45;
  const allergies = dmp?.allergies || [];
  const consultations = dmp?.recentConsultations || [];
  const medications = dmp?.currentMedications || [];
  const vaccinations = dmp?.vaccinations || [];


  const handleExportFhir = async () => {
    if (!patientId) return;
    setExporting(true);
    setExportMsg('');
    try {
      const res = await dmpService.exportFhir(patientId);
      const fhirBundle = res.data?.data ?? res.data;
      const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], { type: 'application/fhir+json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fhir-export-${patientId}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setExportMsg('Export telecharge avec succes.');
    } catch {
      setExportMsg('Erreur export FHIR.');
    } finally {
      setExporting(false);
      setTimeout(() => setExportMsg(''), 4000);
    }
  };
  if (!patientId) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#ef4444', fontFamily: "'DM Sans',sans-serif" }}>
        Session introuvable. <a href="/login" style={{ color: '#2ecc71' }}>Reconnectez-vous</a>.
      </div>
    );
  }

  if (role && !['PATIENT', 'USER'].includes(role)) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#6b7280', fontFamily: "'DM Sans',sans-serif" }}>
        Ce dossier patient n'est pas disponible pour ce role.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: 6 }}>
            Dossier Medical Partage (DMP)
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.92rem' }}>
            Toutes vos donnees de sante, centralisees et securisees par MediConnect.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <button onClick={handleExportFhir} disabled={exporting} style={{ padding: '12px 22px', borderRadius: 14, border: 'none', background: exporting ? '#9ca3af' : '#2ecc71', color: 'white', fontWeight: 800, cursor: exporting ? 'not-allowed' : 'pointer', boxShadow: exporting ? 'none' : '0 10px 18px rgba(46,204,113,0.25)' }}>
            {exporting ? 'Export...' : 'Exporter FHIR'}
          </button>
          {exportMsg && <span style={{ fontSize: '0.78rem', color: exportMsg.startsWith('Erreur') ? '#dc2626' : '#16a34a', fontWeight: 700 }}>{exportMsg}</span>}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: '14px 18px', color: '#dc2626', fontSize: '0.88rem', marginBottom: 24 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

        {/* Vitals */}
        <DMPCard title="Parametres Vitaux" icon="heart" color="#ef4444" actionLabel="Mettre a jour" onAction={() => navigate('/patient/vitals')}>
          {loading ? <Skeleton /> : lastVital ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                lastVital.bloodPressure && { label: 'Tension', value: lastVital.bloodPressure },
                lastVital.heartRate && { label: 'Pouls', value: `${lastVital.heartRate} bpm` },
                lastVital.weight && { label: 'Poids', value: `${lastVital.weight} kg` },
                validTemperature && { label: 'Temperature', value: `${lastVital.temperature} C` },
              ].filter(Boolean).map((v) => (
                <div key={v.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                  <span style={{ fontSize: '0.88rem', color: '#6b7280' }}>{v.label}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>{v.value}</span>
                </div>
              ))}
              {lastVital.entryDate && (
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, textAlign: 'right' }}>Derniere mise a jour: {fmt(lastVital.sortDate)}</p>
              )}
            </div>
          ) : <EmptyRow text="Aucune constante enregistree. Cliquez sur Mettre a jour." />}
        </DMPCard>

        {/* Allergies */}
        <DMPCard title="Allergies & Intolerances" icon="pill" color="#f59e0b" actionLabel="Gerer" onAction={() => navigate('/patient/allergies')}>
          {loading ? <Skeleton /> : allergies.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {allergies.map((a, i) => (
                <span key={i} style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
                  {a.allergen || a.name || a}
                  {a.severity && <span style={{ opacity: 0.7 }}> ({a.severity})</span>}
                </span>
              ))}
            </div>
          ) : <EmptyRow text="Aucune allergie connue." />}
        </DMPCard>

        {/* Current Medications */}
        <DMPCard title="Medicaments en cours" icon="pill" color="#7c3aed" actionLabel="Voir tout" onAction={() => navigate('/app/prescriptions')}>
          {loading ? <Skeleton /> : medications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {medications.slice(0, 4).map((m, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 12, background: '#faf5ff', border: '1px solid #e9d5ff' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#6b21a8' }}>{m.medicationName || m.name}</span>
                  {m.dosage && <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}> - {m.dosage}</span>}
                  {m.frequency && <p style={{ fontSize: '0.75rem', color: '#7c3aed', margin: '2px 0 0' }}>{m.frequency}</p>}
                </div>
              ))}
              {medications.length > 4 && <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0 }}>+{medications.length - 4} autres medicaments</p>}
            </div>
          ) : <EmptyRow text="Aucun medicament actif." />}
        </DMPCard>

        {/* Vaccinations */}
        <DMPCard title="Vaccinations" icon="file" color="#10b981" actionLabel="Voir tout" onAction={() => navigate('/app/medical-records')}>
          {loading ? <Skeleton /> : vaccinations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {vaccinations.slice(0, 3).map((v, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#111827' }}>{v.vaccineName}</span>
                    {v.nextDue && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>Prochain: {fmt(v.nextDue)}</p>}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, background: v.status === 'COMPLETED' ? '#d1fae5' : '#fef3c7', color: v.status === 'COMPLETED' ? '#065f46' : '#92400e', padding: '2px 8px', borderRadius: 20 }}>
                    {v.status === 'COMPLETED' ? 'Fait' : v.status === 'PENDING' ? 'En attente' : 'En retard'}
                  </span>
                </div>
              ))}
            </div>
          ) : <EmptyRow text="Aucune vaccination enregistree." />}
        </DMPCard>

        {/* Recent Consultations - full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <DMPCard title="Historique des Consultations" icon="calendar" color="#3b82f6" actionLabel="Voir tout" onAction={() => navigate('/app/medical-records')}>
            {loading ? <Skeleton /> : consultations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {consultations.slice(0, 3).map((c, i) => (
                  <div key={i} style={{ padding: '16px', borderRadius: 14, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.92rem' }}>{c.doctorName || 'Medecin non renseigne'}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{fmt(c.consultationDate)}</span>
                    </div>
                    {c.specialty && <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7280' }}><strong>Specialite:</strong> {c.specialty}</p>}
                    {c.diagnosis && <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7280' }}><strong>Diagnostic:</strong> {c.diagnosis}</p>}
                    {c.recommendations && <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7280' }}><strong>Recommandations:</strong> {c.recommendations}</p>}
                  </div>
                ))}
              </div>
            ) : <EmptyRow text="Aucune consultation enregistree dans votre dossier." />}
          </DMPCard>
        </div>

        {/* Consent Banner */}
        <div style={{
          gridColumn: '1 / -1',
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1.5px solid #86efac',
          borderRadius: 20, padding: '24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="user" color="white" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h4 style={{ margin: '0 0 4px', fontFamily: "'Sora',sans-serif", fontWeight: 700, color: '#065f46' }}>Controle d'acces medecin</h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#166534', lineHeight: 1.5 }}>Gerez quels medecins peuvent consulter votre historique medical complet.</p>
          </div>
          <button
            onClick={() => navigate('/patient/consent')}
            style={{ background: 'white', border: '1.5px solid #86efac', padding: '10px 20px', borderRadius: 12, color: '#166534', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Gerer les acces
          </button>
        </div>

      </div>
    </div>
  );
}








