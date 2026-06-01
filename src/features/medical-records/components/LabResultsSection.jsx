import { useState } from 'react';
import { useLabResults } from '../hooks/useDMP';
import { useAuth } from '../../../context/AuthContext';
import {
  Card, SectionHeader, Badge, DataRow, Skeleton, EmptyState, ErrorBanner,
  Modal, Field, Input, Select, Textarea, SubmitBtn, ActionBtn, InfoRow, fmtDate, Icon,
} from './DMPShared';

const CAT_OPT = [
  { value: 'HEMATOLOGY', label: 'Hématologie' },
  { value: 'CHEMISTRY', label: 'Chimie' },
  { value: 'MICROBIOLOGY', label: 'Microbiologie' },
  { value: 'OTHER', label: 'Autre' },
];
const CAT_LABEL = { HEMATOLOGY: 'Hématologie', CHEMISTRY: 'Chimie', MICROBIOLOGY: 'Microbiologie', OTHER: 'Autre' };
const STATUS_OPT = [{ value: 'NORMAL', label: 'Normal' }, { value: 'ABNORMAL', label: 'Anormal' }, { value: 'CRITICAL', label: 'Critique' }];
const STATUS_LABEL = { NORMAL: 'Normal', ABNORMAL: 'Anormal', CRITICAL: 'Critique' };

const CAT_COLOR = { HEMATOLOGY: '#dc2626', CHEMISTRY: '#0891b2', MICROBIOLOGY: '#059669', OTHER: '#6b7280' };

function LabForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    testName: initial.testName || '',
    category: initial.category || 'HEMATOLOGY',
    testDate: initial.testDate ? initial.testDate.slice(0, 10) : '',
    value: initial.value || '',
    unit: initial.unit || '',
    normalRange: initial.normalRange || '',
    status: initial.status || 'NORMAL',
    labName: initial.labName || '',
    notes: initial.notes || '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Analyse" required><Input id="lab-name" value={form.testName} onChange={set('testName')} placeholder="Ex: Glycémie, NFS…" required /></Field>
        </div>
        <Field label="Catégorie"><Select id="lab-cat" value={form.category} onChange={set('category')} options={CAT_OPT} /></Field>
        <Field label="Date"><Input id="lab-date" type="date" value={form.testDate} onChange={set('testDate')} /></Field>
        <Field label="Valeur"><Input id="lab-val" value={form.value} onChange={set('value')} placeholder="Ex: 5.6" /></Field>
        <Field label="Unité"><Input id="lab-unit" value={form.unit} onChange={set('unit')} placeholder="Ex: mmol/L" /></Field>
        <Field label="Plage normale"><Input id="lab-range" value={form.normalRange} onChange={set('normalRange')} placeholder="Ex: 3.9-6.1" /></Field>
        <Field label="Statut"><Select id="lab-status" value={form.status} onChange={set('status')} options={STATUS_OPT} /></Field>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Laboratoire"><Input id="lab-labname" value={form.labName} onChange={set('labName')} placeholder="Nom du laboratoire" /></Field>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Notes"><Textarea id="lab-notes" value={form.notes} onChange={set('notes')} rows={2} /></Field>
        </div>
      </div>
      <SubmitBtn label="Enregistrer le résultat" loading={loading} color="#0891b2" />
    </form>
  );
}

export default function LabResultsSection({ patientId }) {
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  const { data: results, loading, error, add, update } = useLabResults(patientId);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (form) => { setSaving(true); try { await add(form); setModal(null); } finally { setSaving(false); } };
  const handleEdit = async (form) => { setSaving(true); try { await update(modal.item.id, form); setModal(null); } finally { setSaving(false); } };

  const list = Array.isArray(results) ? results : [];

  return (
    <>
      <Card>
        <SectionHeader icon="git-commit" title="Résultats d'analyses" count={list.length} onAdd={isDoctor ? () => setModal('add') : null} color="#0891b2" />
        {loading && <Skeleton />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && list.length === 0 && (
          <EmptyState icon="git-commit" message="Aucun résultat d'analyse" sub={isDoctor ? "Ajoutez les résultats de biologie." : "Aucun résultat disponible."} />
        )}
        {!loading && list.map((r, i) => (
          <DataRow key={r.id || i}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginRight: 14,
              background: `${CAT_COLOR[r.category] || '#6b7280'}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="git-commit" size={16} color={CAT_COLOR[r.category] || '#6b7280'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{r.testName}</div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>
                {CAT_LABEL[r.category]}{r.value ? ` · ${r.value}${r.unit ? ' ' + r.unit : ''}` : ''}{r.normalRange ? ` (norme: ${r.normalRange})` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{fmtDate(r.testDate)}</span>
              <Badge label={STATUS_LABEL[r.status] || r.status} variant={r.status} />
              <div style={{ display: 'flex', gap: 4 }}>
                <ActionBtn id={`view-lab-${r.id}`} icon="eye" color="#6b7280" title="Voir" onClick={() => setModal({ type: 'view', item: r })} />
                {isDoctor && (
                  <ActionBtn id={`edit-lab-${r.id}`} icon="edit" color="#1d4ed8" title="Modifier" onClick={() => setModal({ type: 'edit', item: r })} />
                )}
              </div>
            </div>
          </DataRow>
        ))}
      </Card>

      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Ajouter un résultat d'analyse" width={560}>
        <LabForm onSubmit={handleAdd} loading={saving} />
      </Modal>
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title="Modifier le résultat" width={560}>
        {modal?.type === 'edit' && <LabForm initial={modal.item} onSubmit={handleEdit} loading={saving} />}
      </Modal>
      <Modal open={modal?.type === 'view'} onClose={() => setModal(null)} title="Détails du résultat" width={460}>
        {modal?.type === 'view' && (
          <div>
            <InfoRow label="Analyse" value={modal.item.testName} />
            <InfoRow label="Catégorie" value={CAT_LABEL[modal.item.category]} />
            <InfoRow label="Date" value={fmtDate(modal.item.testDate)} />
            <InfoRow label="Valeur" value={`${modal.item.value || ''}${modal.item.unit ? ' ' + modal.item.unit : ''}`} />
            <InfoRow label="Plage normale" value={modal.item.normalRange} />
            <InfoRow label="Statut" value={<Badge label={STATUS_LABEL[modal.item.status]} variant={modal.item.status} />} />
            <InfoRow label="Laboratoire" value={modal.item.labName} />
            <InfoRow label="Notes" value={modal.item.notes} />
          </div>
        )}
      </Modal>
    </>
  );
}
