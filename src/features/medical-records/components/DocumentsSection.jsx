import { useState } from 'react';
import { useDocuments } from '../hooks/useDMP';
import { useAuth } from '../../../context/AuthContext';
import {
  Card, SectionHeader, Badge, DataRow, Skeleton, EmptyState, ErrorBanner,
  Modal, Field, Input, Select, Textarea, SubmitBtn, ActionBtn, InfoRow, fmtDate, Icon,
} from './DMPShared';

const TYPE_OPT = [
  { value: 'PRESCRIPTION', label: 'Ordonnance' },
  { value: 'REPORT', label: 'Rapport' },
  { value: 'CERTIFICATE', label: 'Certificat' },
  { value: 'OTHER', label: 'Autre' },
];
const TYPE_LABEL = { PRESCRIPTION: 'Ordonnance', REPORT: 'Rapport', CERTIFICATE: 'Certificat', OTHER: 'Autre' };
const TYPE_COLOR = { PRESCRIPTION: '#7c3aed', REPORT: '#0891b2', CERTIFICATE: '#059669', OTHER: '#6b7280' };
const TYPE_ICON  = { PRESCRIPTION: 'pill', REPORT: 'file-text', CERTIFICATE: 'shield', OTHER: 'file-text' };

function DocumentForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    documentName: '', documentType: 'PRESCRIPTION', fileUrl: '', uploadedBy: '', description: '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <Field label="Nom du document" required>
        <Input id="doc-name" value={form.documentName} onChange={set('documentName')} placeholder="Ex: Ordonnance du 01/01/2025" required />
      </Field>
      <Field label="Type"><Select id="doc-type" value={form.documentType} onChange={set('documentType')} options={TYPE_OPT} /></Field>
      <Field label="URL du fichier">
        <Input id="doc-url" value={form.fileUrl} onChange={set('fileUrl')} placeholder="https://…" />
      </Field>
      <Field label="Uploadé par">
        <Input id="doc-by" value={form.uploadedBy} onChange={set('uploadedBy')} placeholder="Dr. Nom ou patient" />
      </Field>
      <Field label="Description">
        <Textarea id="doc-desc" value={form.description} onChange={set('description')} rows={2} />
      </Field>
      <SubmitBtn label="Ajouter le document" loading={loading} color="#7c3aed" />
    </form>
  );
}

export default function DocumentsSection({ patientId }) {
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  const { data: documents, loading, error, upload, remove } = useDocuments(patientId);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleUpload = async (form) => { setSaving(true); try { await upload(form); setModal(null); } finally { setSaving(false); } };
  const handleDelete = async (id) => { if (!confirm('Supprimer ce document ?')) return; await remove(id); };

  const list = Array.isArray(documents) ? documents : [];

  return (
    <>
      <Card>
        <SectionHeader icon="file-text" title="Documents" count={list.length} onAdd={isDoctor ? () => setModal('add') : null} addLabel="Ajouter" color="#7c3aed" />
        {loading && <Skeleton />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && list.length === 0 && (
          <EmptyState icon="file-text" message="Aucun document" sub={isDoctor ? "Ajoutez ordonnances, rapports, certificats…" : "Aucun document disponible."} />
        )}
        {!loading && list.map((d, i) => (
          <DataRow key={d.id || i}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginRight: 14,
              background: `${TYPE_COLOR[d.documentType] || '#6b7280'}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={TYPE_ICON[d.documentType] || 'file-text'} size={16} color={TYPE_COLOR[d.documentType] || '#6b7280'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{d.documentName}</div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>
                {fmtDate(d.uploadedAt)}{d.uploadedBy ? ` · ${d.uploadedBy}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge label={TYPE_LABEL[d.documentType] || d.documentType} variant={d.documentType === 'PRESCRIPTION' ? 'READ_WRITE' : 'READ'} />
              <div style={{ display: 'flex', gap: 4 }}>
                {d.fileUrl && (
                  <a href={d.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                    <ActionBtn id={`dl-doc-${d.id}`} icon="download" color="#059669" title="Télécharger" onClick={() => {}} />
                  </a>
                )}
                <ActionBtn id={`view-doc-${d.id}`} icon="eye" color="#6b7280" title="Voir" onClick={() => setModal({ type: 'view', item: d })} />
                {isDoctor && (
                  <ActionBtn id={`delete-doc-${d.id}`} icon="trash" color="#dc2626" title="Supprimer" onClick={() => handleDelete(d.id)} />
                )}
              </div>
            </div>
          </DataRow>
        ))}
      </Card>

      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Ajouter un document" width={500}>
        <DocumentForm onSubmit={handleUpload} loading={saving} />
      </Modal>
      <Modal open={modal?.type === 'view'} onClose={() => setModal(null)} title="Détails du document" width={460}>
        {modal?.type === 'view' && (
          <div>
            <InfoRow label="Nom" value={modal.item.documentName} />
            <InfoRow label="Type" value={TYPE_LABEL[modal.item.documentType]} />
            <InfoRow label="Date" value={fmtDate(modal.item.uploadedAt)} />
            <InfoRow label="Uploadé par" value={modal.item.uploadedBy} />
            <InfoRow label="Description" value={modal.item.description} />
            {modal.item.fileUrl && (
              <a href={modal.item.fileUrl} target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
                color: '#7c3aed', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
              }}>
                <Icon name="download" size={14} color="#7c3aed" /> Télécharger le fichier
              </a>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
