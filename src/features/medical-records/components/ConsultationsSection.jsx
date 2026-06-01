import { useState } from 'react';
import { useConsultations } from '../hooks/useDMP';
import { useAuth } from '../../../context/AuthContext';
import {
  Card, SectionHeader, DataRow, Skeleton, EmptyState, ErrorBanner,
  Modal, Field, Input, Textarea, SubmitBtn, ActionBtn, InfoRow, fmtDate, Icon,
} from './DMPShared';

function ConsultationForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    doctorName: '', specialty: '', consultationDate: '', notes: '', diagnosis: '', recommendations: '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Médecin" required><Input id="consult-doctor" value={form.doctorName} onChange={set('doctorName')} placeholder="Dr. Nom" required /></Field>
        <Field label="Spécialité"><Input id="consult-specialty" value={form.specialty} onChange={set('specialty')} placeholder="Cardiologie…" /></Field>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Date"><Input id="consult-date" type="date" value={form.consultationDate} onChange={set('consultationDate')} /></Field>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Diagnostic"><Textarea id="consult-diag" value={form.diagnosis} onChange={set('diagnosis')} rows={2} placeholder="Résultat du diagnostic" /></Field>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Recommandations"><Textarea id="consult-reco" value={form.recommendations} onChange={set('recommendations')} rows={2} /></Field>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Notes"><Textarea id="consult-notes" value={form.notes} onChange={set('notes')} rows={2} /></Field>
        </div>
      </div>
      <SubmitBtn label="Enregistrer la consultation" loading={loading} color="#059669" />
    </form>
  );
}

export default function ConsultationsSection({ patientId }) {
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  const { data: consultations, loading, error, add } = useConsultations(patientId);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (form) => { setSaving(true); try { await add(form); setModal(null); } finally { setSaving(false); } };

  const list = Array.isArray(consultations) ? consultations : [];

  return (
    <>
      <Card>
        <SectionHeader icon="clipboard" title="Consultations" count={list.length} onAdd={isDoctor ? () => setModal('add') : null} color="#059669" />
        {loading && <Skeleton />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && list.length === 0 && (
          <EmptyState icon="clipboard" message="Aucune consultation enregistrée" sub={isDoctor ? "Ajoutez une nouvelle consultation pour ce patient." : "Aucun historique de consultation disponible."} />
        )}
        {!loading && list.map((c, i) => (
          <DataRow key={c.id || i}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginRight: 14,
              background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="clipboard" size={16} color="#059669" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>
                Dr. {c.doctorName}{c.specialty ? ` · ${c.specialty}` : ''}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>
                {fmtDate(c.consultationDate)}{c.diagnosis ? ` · ${c.diagnosis.slice(0, 60)}${c.diagnosis.length > 60 ? '…' : ''}` : ''}
              </div>
            </div>
            <ActionBtn id={`view-consult-${c.id}`} icon="eye" color="#6b7280" title="Voir détails" onClick={() => setModal({ type: 'view', item: c })} />
          </DataRow>
        ))}
      </Card>

      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Ajouter une consultation" width={560}>
        <ConsultationForm onSubmit={handleAdd} loading={saving} />
      </Modal>
      <Modal open={modal?.type === 'view'} onClose={() => setModal(null)} title="Détails de la consultation" width={500}>
        {modal?.type === 'view' && (
          <div>
            <InfoRow label="Médecin" value={`Dr. ${modal.item.doctorName}`} />
            <InfoRow label="Spécialité" value={modal.item.specialty} />
            <InfoRow label="Date" value={fmtDate(modal.item.consultationDate)} />
            <InfoRow label="Diagnostic" value={modal.item.diagnosis} />
            <InfoRow label="Recommandations" value={modal.item.recommendations} />
            <InfoRow label="Notes" value={modal.item.notes} />
          </div>
        )}
      </Modal>
    </>
  );
}
