import { useState } from 'react';
import { useAllergies } from '../hooks/useDMP';
import { useAuth } from '../../../context/AuthContext';
import {
  Card, SectionHeader, Badge, DataRow, Skeleton, EmptyState, ErrorBanner,
  Modal, Field, Input, Select, Textarea, SubmitBtn, ActionBtn, InfoRow, fmtDate, Icon,
} from './DMPShared';

const SEVERITY_OPTIONS = [
  { value: 'MILD', label: 'Légère' },
  { value: 'MODERATE', label: 'Modérée' },
  { value: 'SEVERE', label: 'Sévère' },
];

const SEVERITY_LABELS = { MILD: 'Légère', MODERATE: 'Modérée', SEVERE: 'Sévère' };

function AllergyForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    allergen: initial.allergen || '',
    severity: initial.severity || 'MILD',
    reaction: initial.reaction || '',
    notes: initial.notes || '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <Field label="Allergène" required>
        <Input id="allergy-allergen" value={form.allergen} onChange={set('allergen')} placeholder="Ex: Pénicilline, Arachides…" required />
      </Field>
      <Field label="Sévérité" required>
        <Select id="allergy-severity" value={form.severity} onChange={set('severity')} options={SEVERITY_OPTIONS} />
      </Field>
      <Field label="Réaction">
        <Input id="allergy-reaction" value={form.reaction} onChange={set('reaction')} placeholder="Ex: Urticaire, Choc anaphylactique…" />
      </Field>
      <Field label="Notes">
        <Textarea id="allergy-notes" value={form.notes} onChange={set('notes')} placeholder="Informations supplémentaires…" />
      </Field>
      <SubmitBtn label="Enregistrer l'allergie" loading={loading} color="#ef4444" />
    </form>
  );
}

export default function AllergiesSection({ patientId }) {
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  const { data: allergies, loading, error, add, update, remove } = useAllergies(patientId);
  const [modal, setModal] = useState(null); // null | 'add' | { type: 'edit', item } | { type: 'view', item }
  const [saving, setSaving] = useState(false);

  const handleAdd = async (form) => {
    setSaving(true);
    try { await add(form); setModal(null); } finally { setSaving(false); }
  };
  const handleEdit = async (form) => {
    setSaving(true);
    try { await update(modal.item.id, form); setModal(null); } finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette allergie ?')) return;
    await remove(id);
  };

  const list = Array.isArray(allergies) ? allergies : [];

  return (
    <>
      <Card>
        <SectionHeader
          icon="alert-triangle" title="Allergies" count={list.length}
          onAdd={isDoctor ? () => setModal('add') : null} addLabel="Ajouter" color="#ef4444"
        />

        {loading && <Skeleton />}
        {error && <ErrorBanner message={error} />}

        {!loading && !error && list.length === 0 && (
          <EmptyState 
            icon="alert-triangle" 
            message="Aucune allergie enregistrée" 
            sub={isDoctor ? "Ajoutez les allergies connues du patient." : "Aucune allergie n'a été signalée pour le moment."} 
          />
        )}

        {!loading && list.map((a, i) => (
          <DataRow key={a.id || i}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: a.severity === 'SEVERE' ? '#fef2f2' : a.severity === 'MODERATE' ? '#fffbeb' : '#f0fdf4',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14,
            }}>
              <Icon name="alert-triangle" size={16}
                color={a.severity === 'SEVERE' ? '#dc2626' : a.severity === 'MODERATE' ? '#d97706' : '#16a34a'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{a.allergen}</div>
              {a.reaction && <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>{a.reaction}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Badge label={SEVERITY_LABELS[a.severity] || a.severity} variant={a.severity} />
              <div style={{ display: 'flex', gap: 4 }}>
                <ActionBtn id={`view-allergy-${a.id}`} icon="eye" color="#6b7280" title="Voir" onClick={() => setModal({ type: 'view', item: a })} />
                {isDoctor && (
                  <>
                    <ActionBtn id={`edit-allergy-${a.id}`} icon="edit" color="#1d4ed8" title="Modifier" onClick={() => setModal({ type: 'edit', item: a })} />
                    <ActionBtn id={`delete-allergy-${a.id}`} icon="trash" color="#dc2626" title="Supprimer" onClick={() => handleDelete(a.id)} />
                  </>
                )}
              </div>
            </div>
          </DataRow>
        ))}
      </Card>

      {/* Add Modal */}
      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Ajouter une allergie" width={480}>
        <AllergyForm onSubmit={handleAdd} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title="Modifier l'allergie" width={480}>
        {modal?.type === 'edit' && <AllergyForm initial={modal.item} onSubmit={handleEdit} loading={saving} />}
      </Modal>

      {/* View Modal */}
      <Modal open={modal?.type === 'view'} onClose={() => setModal(null)} title="Détails de l'allergie" width={460}>
        {modal?.type === 'view' && (
          <div>
            <InfoRow label="Allergène" value={modal.item.allergen} />
            <InfoRow label="Sévérité" value={<Badge label={SEVERITY_LABELS[modal.item.severity]} variant={modal.item.severity} />} />
            <InfoRow label="Réaction" value={modal.item.reaction} />
            <InfoRow label="Notes" value={modal.item.notes} />
            <InfoRow label="Enregistré le" value={fmtDate(modal.item.createdAt)} />
          </div>
        )}
      </Modal>
    </>
  );
}
