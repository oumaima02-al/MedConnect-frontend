import { useState } from 'react';
import { usePatientPrescriptions } from '../hooks/usePrescriptions';
import { useAuth } from '../../../context/AuthContext';
import { Card, SectionHeader, Badge, DataRow, Skeleton, EmptyState, ErrorBanner, ActionBtn, fmtDate, RxIcon, Modal, Field, Input, Select, SubmitBtn } from './RxShared';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRED', label: 'Expirée' },
  { value: 'CANCELLED', label: 'Annulée' },
];

function CreatePrescriptionForm({ patientId, onSubmit, loading }) {
  const [form, setForm] = useState({
    patientId: patientId || '',
    doctorId: '',
    prescriptionDate: new Date().toISOString().slice(0, 10),
    expiryDate: '',
    status: 'ACTIVE',
    medications: [{ medicationName: '', dosage: '', frequency: '', quantity: '', refillsAllowed: '' }],
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const setMed = (i, k) => (e) => {
    const meds = [...form.medications];
    meds[i] = { ...meds[i], [k]: e.target.value };
    setForm(f => ({ ...f, medications: meds }));
  };

  const addMed = () => setForm(f => ({ ...f, medications: [...f.medications, { medicationName: '', dosage: '', frequency: '', quantity: '', refillsAllowed: '' }] }));
  const removeMed = (i) => setForm(f => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      prescriptionDate: new Date(form.prescriptionDate).toISOString(),
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
      medications: form.medications.map(m => ({ ...m, quantity: Number(m.quantity), refillsAllowed: Number(m.refillsAllowed) })),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="ID Patient" required><Input id="rx-patient" value={form.patientId} onChange={set('patientId')} placeholder="patient-id" required /></Field>
        <Field label="ID Médecin" required><Input id="rx-doctor" value={form.doctorId} onChange={set('doctorId')} placeholder="doctor-id" required /></Field>
        <Field label="Date prescription"><Input id="rx-date" type="date" value={form.prescriptionDate} onChange={set('prescriptionDate')} /></Field>
        <Field label="Date expiration"><Input id="rx-expiry" type="date" value={form.expiryDate} onChange={set('expiryDate')} /></Field>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Statut"><Select id="rx-status" value={form.status} onChange={set('status')} options={STATUS_OPTIONS} /></Field>
        </div>
      </div>

      {/* Medications */}
      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Médicaments</span>
          <button type="button" onClick={addMed} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 600, color: '#7c3aed', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
            <RxIcon name="plus" size={13} color="#7c3aed" /> Ajouter
          </button>
        </div>

        {form.medications.map((med, i) => (
          <div key={i} style={{ background: '#f8fafc', border: '1px solid #f3f4f6', borderRadius: 12, padding: '14px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7c3aed' }}>Médicament {i + 1}</span>
              {form.medications.length > 1 && (
                <button type="button" onClick={() => removeMed(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}>
                  <RxIcon name="x" size={14} color="#dc2626" />
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <Field label="Nom du médicament"><Input value={med.medicationName} onChange={setMed(i, 'medicationName')} placeholder="Ex: Amoxicilline" /></Field>
              </div>
              <Field label="Dosage"><Input value={med.dosage} onChange={setMed(i, 'dosage')} placeholder="Ex: 500mg" /></Field>
              <Field label="Fréquence"><Input value={med.frequency} onChange={setMed(i, 'frequency')} placeholder="Ex: 3×/jour" /></Field>
              <Field label="Quantité"><Input type="number" value={med.quantity} onChange={setMed(i, 'quantity')} placeholder="Ex: 30" min="1" /></Field>
              <Field label="Recharges autorisées"><Input type="number" value={med.refillsAllowed} onChange={setMed(i, 'refillsAllowed')} placeholder="Ex: 2" min="0" /></Field>
            </div>
          </div>
        ))}
      </div>

      <SubmitBtn label="Créer l'ordonnance" loading={loading} />
    </form>
  );
}

export default function PrescriptionList({ patientId, onSelect }) {
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  const { data, loading, error, create, cancel } = usePatientPrescriptions(patientId);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (form) => {
    setSaving(true);
    try { await create(form); setModal(false); } finally { setSaving(false); }
  };

  const handleCancel = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Annuler cette ordonnance ?')) return;
    await cancel(id);
  };

  const list = Array.isArray(data) ? data : [];

  const STATUS_COLOR = { ACTIVE: '#16a34a', EXPIRED: '#6b7280', CANCELLED: '#dc2626' };

  return (
    <>
      <Card>
        <SectionHeader
          icon="pill" title="Mes ordonnances" count={list.length}
          onAdd={isDoctor ? () => setModal(true) : null} addLabel="Nouvelle ordonnance" color="#7c3aed"
        />
        {loading && <Skeleton rows={4} />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && list.length === 0 && (
          <EmptyState 
            icon="pill" 
            message="Aucune ordonnance" 
            sub={isDoctor ? "Commencez par créer une nouvelle ordonnance." : "Aucune ordonnance active disponible."} 
          />
        )}

        {!loading && list.map((rx, i) => (
          <DataRow key={rx.id || i}>
            {/* Left icon */}
            <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, marginRight: 14, background: `${STATUS_COLOR[rx.status] || '#6b7280'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RxIcon name="pill" size={17} color={STATUS_COLOR[rx.status] || '#6b7280'} />
            </div>
            {/* Info */}
            <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSelect(rx.id)}>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>
                Ordonnance #{rx.id?.slice(-8) || i + 1}
              </div>
              <div style={{ fontSize: '0.77rem', color: '#9ca3af', marginTop: 2 }}>
                {fmtDate(rx.prescriptionDate)}{rx.expiryDate ? ` · Expire: ${fmtDate(rx.expiryDate)}` : ''}
                {rx.doctorId ? ` · Dr. ${rx.doctorId}` : ''}
              </div>
            </div>
            {/* Status + actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Badge variant={rx.status} />
              <div style={{ display: 'flex', gap: 2 }}>
                <ActionBtn id={`view-rx-${rx.id}`} icon="eye" color="#7c3aed" title="Voir détails" onClick={() => onSelect(rx.id)} />
                {isDoctor && rx.status === 'ACTIVE' && (
                  <ActionBtn id={`cancel-rx-${rx.id}`} icon="x" color="#dc2626" title="Annuler" onClick={(e) => handleCancel(rx.id, e)} />
                )}
              </div>
            </div>
          </DataRow>
        ))}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Nouvelle ordonnance" width={600}>
        <CreatePrescriptionForm patientId={patientId} onSubmit={handleCreate} loading={saving} />
      </Modal>
    </>
  );
}
