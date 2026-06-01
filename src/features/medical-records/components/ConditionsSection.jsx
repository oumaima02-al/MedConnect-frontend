import { useState } from 'react';
import { useConditions } from '../hooks/useDMP';
import { useAuth } from '../../../context/AuthContext';
import {
  Card, SectionHeader, Badge, DataRow, Skeleton, EmptyState, ErrorBanner,
  Modal, Field, Input, Select, Textarea, SubmitBtn, ActionBtn, InfoRow, fmtDate, Icon,
} from './DMPShared';

const SEVERITY_OPT = [{ value: 'MILD', label: 'Légère' }, { value: 'MODERATE', label: 'Modérée' }, { value: 'SEVERE', label: 'Sévère' }];
const SEVERITY_LABEL = { MILD: 'Légère', MODERATE: 'Modérée', SEVERE: 'Sévère' };
const STATUS_LABEL = { ACTIVE: 'Actif', INACTIVE: 'Inactif', RESOLVED: 'Résolu' };

function ConditionForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    conditionName: initial.conditionName || '',
    diagnosisDate: initial.diagnosisDate ? initial.diagnosisDate.slice(0, 10) : '',
    severity: initial.severity || 'MILD',
    diagnosedBy: initial.diagnosedBy || '',
    notes: initial.notes || '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <Field label="Condition" required><Input id="cond-name" value={form.conditionName} onChange={set('conditionName')} placeholder="Ex: Diabète type 2" required /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Date diagnostic"><Input id="cond-date" type="date" value={form.diagnosisDate} onChange={set('diagnosisDate')} /></Field>
        <Field label="Sévérité"><Select id="cond-severity" value={form.severity} onChange={set('severity')} options={SEVERITY_OPT} /></Field>
      </div>
      <Field label="Diagnostiqué par"><Input id="cond-doctor" value={form.diagnosedBy} onChange={set('diagnosedBy')} placeholder="Dr. Nom" /></Field>
      <Field label="Notes"><Textarea id="cond-notes" value={form.notes} onChange={set('notes')} rows={2} /></Field>
      <SubmitBtn label="Enregistrer la condition" loading={loading} color="#0891b2" />
    </form>
  );
}

export default function ConditionsSection({ patientId }) {
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  const { data: conditions, loading, error, add, update, remove } = useConditions(patientId);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (form) => { setSaving(true); try { await add(form); setModal(null); } finally { setSaving(false); } };
  const handleEdit = async (form) => { setSaving(true); try { await update(modal.item.id, form); setModal(null); } finally { setSaving(false); } };
  const handleDelete = async (id) => { if (!confirm('Supprimer cette condition ?')) return; await remove(id); };

  const list = Array.isArray(conditions) ? conditions : [];

  const COLOR_MAP = { ACTIVE: '#0891b2', INACTIVE: '#9ca3af', RESOLVED: '#16a34a' };

  return (
    <>
      <Card>
        <SectionHeader icon="activity" title="Maladies chroniques" count={list.length} onAdd={isDoctor ? () => setModal('add') : null} color="#0891b2" />
        {loading && <Skeleton />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && list.length === 0 && (
          <EmptyState icon="activity" message="Aucune maladie chronique enregistrée" sub={isDoctor ? "Ajoutez les pathologies connues du patient." : "Aucune maladie signalée."} />
        )}
        {!loading && list.map((c, i) => (
          <DataRow key={c.id || i}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginRight: 14,
              background: `${COLOR_MAP[c.status] || '#9ca3af'}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="activity" size={16} color={COLOR_MAP[c.status] || '#9ca3af'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{c.conditionName}</div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>
                {c.diagnosedBy ? `Dr. ${c.diagnosedBy}` : ''}{c.diagnosisDate ? ` · ${fmtDate(c.diagnosisDate)}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge label={SEVERITY_LABEL[c.severity]} variant={c.severity} />
              <Badge label={STATUS_LABEL[c.status] || c.status} variant={c.status} />
              <div style={{ display: 'flex', gap: 4 }}>
                <ActionBtn id={`view-cond-${c.id}`} icon="eye" color="#6b7280" title="Voir" onClick={() => setModal({ type: 'view', item: c })} />
                {isDoctor && (
                  <>
                    <ActionBtn id={`edit-cond-${c.id}`} icon="edit" color="#1d4ed8" title="Modifier" onClick={() => setModal({ type: 'edit', item: c })} />
                    <ActionBtn id={`delete-cond-${c.id}`} icon="trash" color="#dc2626" title="Supprimer" onClick={() => handleDelete(c.id)} />
                  </>
                )}
              </div>
            </div>
          </DataRow>
        ))}
      </Card>
      {/* Modals remain same, only triggered by isDoctor buttons */}
      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Ajouter une maladie chronique" width={500}>
        <ConditionForm onSubmit={handleAdd} loading={saving} />
      </Modal>
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title="Modifier la condition" width={500}>
        {modal?.type === 'edit' && <ConditionForm initial={modal.item} onSubmit={handleEdit} loading={saving} />}
      </Modal>
      <Modal open={modal?.type === 'view'} onClose={() => setModal(null)} title="Détails de la condition" width={460}>
        {modal?.type === 'view' && (
          <div>
            <InfoRow label="Condition" value={modal.item.conditionName} />
            <InfoRow label="Diagnostiqué le" value={fmtDate(modal.item.diagnosisDate)} />
            <InfoRow label="Sévérité" value={<Badge label={SEVERITY_LABEL[modal.item.severity]} variant={modal.item.severity} />} />
            <InfoRow label="Statut" value={<Badge label={STATUS_LABEL[modal.item.status]} variant={modal.item.status} />} />
            <InfoRow label="Médecin" value={modal.item.diagnosedBy} />
            <InfoRow label="Notes" value={modal.item.notes} />
          </div>
        )}
      </Modal>
    </>
  );
}
