import { useState } from 'react';
import { useMedications } from '../hooks/useDMP';
import { useAuth } from '../../../context/AuthContext';
import {
  Card, SectionHeader, Badge, DataRow, Skeleton, EmptyState, ErrorBanner,
  Modal, Field, Input, Select, Textarea, SubmitBtn, ActionBtn, InfoRow, fmtDate, Icon,
} from './DMPShared';

const STATUS_LABEL = { ACTIVE: 'Actif', INACTIVE: 'Inactif' };

function MedicationForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    medicationName: initial.medicationName || '',
    dosage: initial.dosage || '',
    frequency: initial.frequency || '',
    startDate: initial.startDate ? initial.startDate.slice(0, 10) : '',
    prescribedBy: initial.prescribedBy || '',
    reason: initial.reason || '',
    sideEffects: initial.sideEffects || '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Médicament" required>
            <Input id="med-name" value={form.medicationName} onChange={set('medicationName')} placeholder="Ex: Metformine" required />
          </Field>
        </div>
        <Field label="Dosage"><Input id="med-dosage" value={form.dosage} onChange={set('dosage')} placeholder="Ex: 500mg" /></Field>
        <Field label="Fréquence"><Input id="med-freq" value={form.frequency} onChange={set('frequency')} placeholder="Ex: 2×/jour" /></Field>
        <Field label="Date début"><Input id="med-start" type="date" value={form.startDate} onChange={set('startDate')} /></Field>
        <Field label="Prescrit par"><Input id="med-doctor" value={form.prescribedBy} onChange={set('prescribedBy')} placeholder="Dr. Nom" /></Field>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Raison"><Input id="med-reason" value={form.reason} onChange={set('reason')} placeholder="Indication thérapeutique" /></Field>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Effets secondaires"><Textarea id="med-side" value={form.sideEffects} onChange={set('sideEffects')} rows={2} /></Field>
        </div>
      </div>
      <SubmitBtn label="Enregistrer le médicament" loading={loading} color="#7c3aed" />
    </form>
  );
}

export default function MedicationsSection({ patientId }) {
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  const { data: medications, loading, error, add, update, stop } = useMedications(patientId);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (form) => { setSaving(true); try { await add(form); setModal(null); } finally { setSaving(false); } };
  const handleEdit = async (form) => { setSaving(true); try { await update(modal.item.id, form); setModal(null); } finally { setSaving(false); } };
  const handleStop = async (id) => { if (!confirm('Arrêter ce médicament ?')) return; await stop(id); };

  const list = Array.isArray(medications) ? medications : [];

  return (
    <>
      <Card>
        <SectionHeader icon="pill" title="Médicaments" count={list.length} onAdd={isDoctor ? () => setModal('add') : null} color="#7c3aed" />

        {loading && <Skeleton />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && list.length === 0 && (
          <EmptyState icon="pill" message="Aucun médicament enregistré" sub={isDoctor ? "Ajoutez les traitements du patient." : "Aucun traitement actif."} />
        )}

        {!loading && list.map((m, i) => (
          <DataRow key={m.id || i}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: m.status === 'ACTIVE' ? '#faf5ff' : '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14,
            }}>
              <Icon name="pill" size={16} color={m.status === 'ACTIVE' ? '#7c3aed' : '#9ca3af'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{m.medicationName}</div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>
                {m.dosage}{m.frequency ? ` · ${m.frequency}` : ''}{m.prescribedBy ? ` · Dr. ${m.prescribedBy}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Badge label={STATUS_LABEL[m.status] || m.status} variant={m.status} />
              <div style={{ display: 'flex', gap: 4 }}>
                <ActionBtn id={`view-med-${m.id}`} icon="eye" color="#6b7280" title="Voir" onClick={() => setModal({ type: 'view', item: m })} />
                {isDoctor && (
                  <>
                    <ActionBtn id={`edit-med-${m.id}`} icon="edit" color="#1d4ed8" title="Modifier" onClick={() => setModal({ type: 'edit', item: m })} />
                    {m.status === 'ACTIVE' && (
                      <ActionBtn id={`stop-med-${m.id}`} icon="stop" color="#d97706" title="Arrêter" onClick={() => handleStop(m.id)} />
                    )}
                  </>
                )}
              </div>
            </div>
          </DataRow>
        ))}
      </Card>

      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Ajouter un médicament" width={560}>
        <MedicationForm onSubmit={handleAdd} loading={saving} />
      </Modal>
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title="Modifier le médicament" width={560}>
        {modal?.type === 'edit' && <MedicationForm initial={modal.item} onSubmit={handleEdit} loading={saving} />}
      </Modal>
      <Modal open={modal?.type === 'view'} onClose={() => setModal(null)} title="Détails du médicament" width={460}>
        {modal?.type === 'view' && (
          <div>
            <InfoRow label="Médicament" value={modal.item.medicationName} />
            <InfoRow label="Dosage" value={modal.item.dosage} />
            <InfoRow label="Fréquence" value={modal.item.frequency} />
            <InfoRow label="Prescrit par" value={modal.item.prescribedBy} />
            <InfoRow label="Raison" value={modal.item.reason} />
            <InfoRow label="Effets secondaires" value={modal.item.sideEffects} />
            <InfoRow label="Début" value={fmtDate(modal.item.startDate)} />
            <InfoRow label="Fin" value={fmtDate(modal.item.endDate)} />
            <InfoRow label="Statut" value={<Badge label={STATUS_LABEL[modal.item.status]} variant={modal.item.status} />} />
          </div>
        )}
      </Modal>
    </>
  );
}
