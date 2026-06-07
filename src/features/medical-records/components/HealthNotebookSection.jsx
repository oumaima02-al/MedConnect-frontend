import { useState } from 'react';
import { useHealthNotebook } from '../hooks/useDMP';
import { useAuth } from '../../../context/AuthContext';
import {
  Card, SectionHeader, Badge, DataRow, Skeleton, EmptyState, ErrorBanner,
  Modal, Field, Input, Textarea, SubmitBtn, InfoRow, fmtDate, Icon,
} from './DMPShared';

function normalizeEntry(entry) {
  if (!entry) return null;
  const systolic = entry.bloodPressureSystolic;
  const diastolic = entry.bloodPressureDiastolic;
  return {
    ...entry,
    sortDate: entry.measuredAt || entry.entryDate || entry.createdAt || entry.updatedAt,
    bloodPressure: entry.bloodPressure || (systolic && diastolic ? `${systolic}/${diastolic}` : ''),
    heartRate: Number(entry.heartRate) >= 30 && Number(entry.heartRate) <= 220 ? entry.heartRate : null,
    temperature: Number(entry.temperature) >= 30 && Number(entry.temperature) <= 45 ? entry.temperature : null,
    weight: Number(entry.weight) > 0 && Number(entry.weight) <= 400 ? entry.weight : null,
  };
}

function entryTime(entry) {
  const t = Date.parse(entry?.sortDate || '');
  return Number.isNaN(t) ? 0 : t;
}
const ALERT_LABEL = { NORMAL: 'Normal', WARNING: 'Attention', CRITICAL: 'Critique' };

function VitalsForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    entryDate: new Date().toISOString().slice(0, 10),
    bloodPressure: '', heartRate: '', temperature: '', weight: '', notes: '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); const [systolic, diastolic] = form.bloodPressure.split('/').map(Number); onSubmit({ measuredAt: new Date(form.entryDate).toISOString(), bloodPressureSystolic: systolic || null, bloodPressureDiastolic: diastolic || null, heartRate: form.heartRate ? Number(form.heartRate) : null, temperature: form.temperature ? Number(form.temperature) : null, weight: form.weight ? Number(form.weight) : null, patientNotes: form.notes }); }}>
      <Field label="Date"><Input id="vital-date" type="date" value={form.entryDate} onChange={set('entryDate')} /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Tension arterielle"><Input id="vital-bp" value={form.bloodPressure} onChange={set('bloodPressure')} placeholder="Ex: 120/80" /></Field>
        <Field label="Frequence cardiaque"><Input id="vital-hr" type="number" value={form.heartRate} onChange={set('heartRate')} placeholder="bpm" /></Field>
        <Field label="Temperature (Â°C)"><Input id="vital-temp" type="number" step="0.1" value={form.temperature} onChange={set('temperature')} placeholder="Ex: 37.2" /></Field>
        <Field label="Poids (kg)"><Input id="vital-weight" type="number" step="0.1" value={form.weight} onChange={set('weight')} placeholder="Ex: 70.5" /></Field>
      </div>
      <Field label="Notes"><Textarea id="vital-notes" value={form.notes} onChange={set('notes')} rows={2} /></Field>
      <SubmitBtn label="Enregistrer les constantes" loading={loading} color="#059669" />
    </form>
  );
}

// â”€â”€â”€ Mini Vital Widget â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function VitalWidget({ icon, label, value, unit, color }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: `${color}08`, border: `1px solid ${color}20`,
      borderRadius: 12, padding: '10px 14px',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={15} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '0.93rem', fontWeight: 700, color: '#111827' }}>
          {value} <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{unit}</span>
        </div>
      </div>
    </div>
  );
}

export default function HealthNotebookSection({ patientId }) {
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  const { data: entries, loading, error, addEntry } = useHealthNotebook(patientId);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (form) => { setSaving(true); try { await addEntry(form); setModal(false); } finally { setSaving(false); } };

  const list = (Array.isArray(entries) ? entries : []).map(normalizeEntry).filter(Boolean).sort((a, b) => entryTime(b) - entryTime(a));
  const latest = list.find(e => e.bloodPressure || e.heartRate || e.temperature || e.weight);

  return (
    <>
      <Card>
        <SectionHeader icon="heart" title="Carnet de sante" count={list.length} onAdd={isDoctor ? () => setModal(true) : null} addLabel="Saisir constantes" color="#059669" />

        {loading && <Skeleton rows={2} />}
        {error && <ErrorBanner message={error} />}

        {/* Latest vitals summary */}
        {!loading && latest && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Dernieres constantes - {fmtDate(latest.sortDate)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              <VitalWidget icon="droplet" label="Tension" value={latest.bloodPressure} unit="mmHg" color="#dc2626" />
              <VitalWidget icon="heart" label="Freq. cardiaque" value={latest.heartRate} unit="bpm" color="#ef4444" />
              <VitalWidget icon="thermometer" label="Temperature" value={latest.temperature} unit="C" color="#d97706" />
              <VitalWidget icon="activity" label="Poids" value={latest.weight} unit="kg" color="#0891b2" />
            </div>
          </div>
        )}

        {!loading && !error && list.length === 0 && (
          <EmptyState icon="heart" message="Aucune constante enregistree" sub={isDoctor ? "Commencez a suivre les signes vitaux." : "Aucune donnee de santÃ© disponible."} />
        )}

        {!loading && list.map((e, i) => (
          <DataRow key={e.id || i}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginRight: 14,
              background: e.alertStatus === 'CRITICAL' ? '#fef2f2' : e.alertStatus === 'WARNING' ? '#fffbeb' : '#f0fdf4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="heart" size={16}
                color={e.alertStatus === 'CRITICAL' ? '#dc2626' : e.alertStatus === 'WARNING' ? '#d97706' : '#059669'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.88rem' }}>{fmtDate(e.sortDate)}</div>
              <div style={{ fontSize: '0.76rem', color: '#9ca3af', marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {e.bloodPressure && <span>TA: {e.bloodPressure}</span>}
                {e.heartRate && <span>FC: {e.heartRate} bpm</span>}
                {e.temperature && <span>T: {e.temperature} C</span>}
                {e.weight && <span>Poids: {e.weight} kg</span>}
              </div>
            </div>
            <Badge label={ALERT_LABEL[e.alertStatus] || e.alertStatus} variant={e.alertStatus} />
          </DataRow>
        ))}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Saisir les constantes" width={500}>
        <VitalsForm onSubmit={handleAdd} loading={saving} />
      </Modal>
    </>
  );
}

