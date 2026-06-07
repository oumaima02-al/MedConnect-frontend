import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Icon } from '../../../components/layout/AppLayout';
import { useDoctorAppointments } from '../../appointments/hooks/useAppointments';

function patientNameFromAppointment(appointment) {
  return appointment.patientName || appointment.patientFullName || appointment.patientFullname || 'Patient';
}

export default function DoctorPatientsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const doctorId = user?.id || user?.userId;
  const { data: appointments = [], loading, error, refresh } = useDoctorAppointments(doctorId);
  const [query, setQuery] = useState('');
  const [manualPatientId, setManualPatientId] = useState('');

  const patients = useMemo(() => {
    const map = new Map();
    appointments.forEach((appointment) => {
      const patientId = appointment.patientId;
      if (!patientId) return;
      const current = map.get(patientId);
      const currentDate = current?.lastDate ? new Date(current.lastDate).getTime() : 0;
      const nextDate = appointment.dateTime ? new Date(appointment.dateTime).getTime() : 0;
      if (!current || nextDate > currentDate) {
        map.set(patientId, {
          id: patientId,
          name: patientNameFromAppointment(appointment),
          lastDate: appointment.dateTime,
          reason: appointment.reason,
          status: appointment.status,
          type: appointment.type,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.lastDate || 0) - new Date(a.lastDate || 0));
  }, [appointments]);

  const filtered = patients.filter((patient) => {
    const text = `${patient.name} ${patient.reason || ''}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  const openManualPatient = () => {
    const id = manualPatientId.trim();
    if (id) navigate(`/doctor/patients/${id}/dmp`);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap', marginBottom: 26 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: '1.7rem', color: '#111827' }}>Dossiers patients</h1>
          <p style={{ margin: '6px 0 0', color: '#94a3b8' }}>Ouvrez un patient pour consulter et completer son dossier medical.</p>
        </div>
        <button onClick={refresh} style={{ padding: '11px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="search" size={16} /> Actualiser
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 20, marginBottom: 24 }}>
        <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 18, padding: 18 }}>
          <label style={{ display: 'block', color: '#64748b', fontSize: '0.78rem', fontWeight: 800, marginBottom: 8 }}>Rechercher dans mes patients</label>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nom, motif..." style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', outline: 'none', fontFamily: 'inherit' }} />
        </div>
        <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 18, padding: 18 }}>
          <label style={{ display: 'block', color: '#64748b', fontSize: '0.78rem', fontWeight: 800, marginBottom: 8 }}>Ouvrir un patient directement</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={manualPatientId} onChange={e => setManualPatientId(e.target.value)} placeholder="Identifiant patient" style={{ minWidth: 0, flex: 1, border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={openManualPatient} disabled={!manualPatientId.trim()} style={{ border: 'none', borderRadius: 12, padding: '0 14px', background: manualPatientId.trim() ? '#16a34a' : '#e5e7eb', color: 'white', fontWeight: 800, cursor: manualPatientId.trim() ? 'pointer' : 'not-allowed' }}>Ouvrir</button>
          </div>
        </div>
      </div>

      {error && <div style={{ marginBottom: 16, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: 14 }}>Impossible de charger vos patients.</div>}
      {loading ? (
        <div style={{ color: '#94a3b8', fontWeight: 700 }}>Chargement des dossiers...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 20, padding: 42, textAlign: 'center', color: '#94a3b8' }}>
          Aucun patient trouve. Les patients apparaitront ici apres les rendez-vous.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {filtered.map((patient) => (
            <div key={patient.id} style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                  {patient.name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase() || 'PT'}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#111827', fontSize: '1rem' }}>{patient.name}</h3>
                  <p style={{ margin: '3px 0 0', color: '#94a3b8', fontSize: '0.78rem' }}>{patient.lastDate ? new Date(patient.lastDate).toLocaleDateString('fr-FR') : 'Date non renseignee'}</p>
                </div>
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', minHeight: 36 }}>{patient.reason || 'Motif non renseigne'}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigate(`/doctor/patients/${patient.id}`)} style={{ flex: 1, border: '1px solid #e2e8f0', background: 'white', color: '#334155', borderRadius: 12, padding: '10px 12px', fontWeight: 800, cursor: 'pointer' }}>Resume</button>
                <button onClick={() => navigate(`/doctor/patients/${patient.id}/dmp`)} style={{ flex: 1, border: 'none', background: '#16a34a', color: 'white', borderRadius: 12, padding: '10px 12px', fontWeight: 800, cursor: 'pointer' }}>DMP</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
