import { useState } from 'react';
import { useImaging } from '../hooks/useDMP';
import { useAuth } from '../../../context/AuthContext';
import {
  Card, SectionHeader, Badge, DataRow, Skeleton, EmptyState, ErrorBanner,
  Modal, Field, Input, Select, Textarea, SubmitBtn, ActionBtn, InfoRow, fmtDate, Icon,
} from './DMPShared';

const TYPE_OPT = [
  { value: 'XR', label: 'Radiographie (XR)' },
  { value: 'CT', label: 'Scanner (CT)' },
  { value: 'MRI', label: 'IRM (MRI)' },
  { value: 'ULTRASOUND', label: 'Échographie' },
  { value: 'OTHER', label: 'Autre' },
];
const TYPE_LABEL  = { XR: 'Radiographie', CT: 'Scanner', MRI: 'IRM', ULTRASOUND: 'Échographie', OTHER: 'Autre' };
const TYPE_COLOR  = { XR: '#dc2626', CT: '#0891b2', MRI: '#7c3aed', ULTRASOUND: '#059669', OTHER: '#6b7280' };

function ImagingForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    studyType: initial.studyType || 'XR',
    bodyPart: initial.bodyPart || '',
    studyDate: initial.studyDate ? initial.studyDate.slice(0, 10) : '',
    findings: initial.findings || '',
    radiologistNotes: initial.radiologistNotes || '',
    fileUrl: initial.fileUrl || '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Type d'examen"><Select id="img-type" value={form.studyType} onChange={set('studyType')} options={TYPE_OPT} /></Field>
        <Field label="Partie du corps"><Input id="img-body" value={form.bodyPart} onChange={set('bodyPart')} placeholder="Ex: Thorax, Genou…" /></Field>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Date"><Input id="img-date" type="date" value={form.studyDate} onChange={set('studyDate')} /></Field>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Résultats / Constatations"><Textarea id="img-findings" value={form.findings} onChange={set('findings')} rows={2} /></Field>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Notes radiologue"><Textarea id="img-notes" value={form.radiologistNotes} onChange={set('radiologistNotes')} rows={2} /></Field>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="URL de l'image"><Input id="img-url" value={form.fileUrl} onChange={set('fileUrl')} placeholder="https://…" /></Field>
        </div>
      </div>
      <SubmitBtn label="Enregistrer l'examen" loading={loading} color="#7c3aed" />
    </form>
  );
}

export default function ImagingSection({ patientId }) {
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  const { data: imaging, loading, error, add, update } = useImaging(patientId);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (form) => { setSaving(true); try { await add(form); setModal(null); } finally { setSaving(false); } };
  const handleEdit = async (form) => { setSaving(true); try { await update(modal.item.id, form); setModal(null); } finally { setSaving(false); } };

  const list = Array.isArray(imaging) ? imaging : [];

  return (
    <>
      <Card>
        <SectionHeader icon="image" title="Imagerie médicale" count={list.length} onAdd={isDoctor ? () => setModal('add') : null} color="#7c3aed" />
        {loading && <Skeleton />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && list.length === 0 && (
          <EmptyState icon="image" message="Aucun examen d'imagerie" sub={isDoctor ? "Ajoutez les examens radiologiques." : "Aucun examen d'imagerie disponible."} />
        )}
        {!loading && list.map((img, i) => (
          <DataRow key={img.id || i}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginRight: 14,
              background: `${TYPE_COLOR[img.studyType] || '#6b7280'}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="image" size={16} color={TYPE_COLOR[img.studyType] || '#6b7280'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>
                {TYPE_LABEL[img.studyType] || img.studyType}{img.bodyPart ? ` — ${img.bodyPart}` : ''}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>
                {fmtDate(img.studyDate)}{img.findings ? ` · ${img.findings.slice(0, 50)}…` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <ActionBtn id={`view-img-${img.id}`} icon="eye" color="#6b7280" title="Voir" onClick={() => setModal({ type: 'view', item: img })} />
              {isDoctor && (
                <ActionBtn id={`edit-img-${img.id}`} icon="edit" color="#1d4ed8" title="Modifier" onClick={() => setModal({ type: 'edit', item: img })} />
              )}
            </div>
          </DataRow>
        ))}
      </Card>

      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Ajouter un examen d'imagerie" width={560}>
        <ImagingForm onSubmit={handleAdd} loading={saving} />
      </Modal>
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title="Modifier l'examen" width={560}>
        {modal?.type === 'edit' && <ImagingForm initial={modal.item} onSubmit={handleEdit} loading={saving} />}
      </Modal>
      <Modal open={modal?.type === 'view'} onClose={() => setModal(null)} title="Détails de l'examen" width={480}>
        {modal?.type === 'view' && (
          <div>
            <InfoRow label="Type" value={TYPE_LABEL[modal.item.studyType]} />
            <InfoRow label="Partie du corps" value={modal.item.bodyPart} />
            <InfoRow label="Date" value={fmtDate(modal.item.studyDate)} />
            <InfoRow label="Résultats" value={modal.item.findings} />
            <InfoRow label="Notes radiologue" value={modal.item.radiologistNotes} />
            {modal.item.fileUrl && (
              <a href={modal.item.fileUrl} target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
                color: '#7c3aed', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
              }}>
                <Icon name="image" size={14} color="#7c3aed" /> Voir l'image
              </a>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
