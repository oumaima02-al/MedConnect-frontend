import { useState } from 'react';
import { useConsents } from '../hooks/useDMP';
import { useAuth } from '../../../context/AuthContext';
import {
  Card, SectionHeader, Badge, DataRow, Skeleton, EmptyState, ErrorBanner,
  Modal, Field, Input, Select, SubmitBtn, ActionBtn, InfoRow, fmtDate, Icon,
} from './DMPShared';

const ACCESS_OPT = [
  { value: 'READ', label: 'Lecture seule' },
  { value: 'READ_WRITE', label: 'Lecture & écriture' },
  { value: 'FULL', label: 'Accès complet' },
];
const ACCESS_LABEL = { READ: 'Lecture', READ_WRITE: 'Lect. & Écrit.', FULL: 'Accès complet' };

function ConsentForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ doctorId: '', accessLevel: 'READ', expiresAt: '' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined }); }}>
      <Field label="Medecin" required>
        <Input id="consent-docid" value={form.doctorId} onChange={set('doctorId')} placeholder="Selectionner le medecin" required />
      </Field>
      <Field label="Niveau d'accès">
        <Select id="consent-level" value={form.accessLevel} onChange={set('accessLevel')} options={ACCESS_OPT} />
      </Field>
      <Field label="Expire le">
        <Input id="consent-exp" type="date" value={form.expiresAt} onChange={set('expiresAt')} />
      </Field>
      <SubmitBtn label="Accorder l'accès" loading={loading} color="#059669" />
    </form>
  );
}

function RevokeForm({ onSubmit, loading }) {
  const [reason, setReason] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(reason); }}>
      <Field label="Raison de la révocation">
        <Input id="revoke-reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Raison (optionnel)" />
      </Field>
      <SubmitBtn label="Révoquer l'accès" loading={loading} color="#dc2626" />
    </form>
  );
}

export default function ConsentSection({ patientId }) {
  const { user } = useAuth();
  const isPatient = user?.role === 'PATIENT';

  const { data: consents, loading, error, grant, revoke } = useConsents(patientId);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleGrant = async (form) => { setSaving(true); try { await grant(form); setModal(null); } finally { setSaving(false); } };
  const handleRevoke = async (reason) => {
    setSaving(true);
    try { await revoke(modal.doctorId, reason); setModal(null); } finally { setSaving(false); }
  };

  const list = Array.isArray(consents) ? consents : [];

  return (
    <>
      <Card>
        <SectionHeader 
          icon="shield" title="Gestion des accès" count={list.length} 
          onAdd={isPatient ? () => setModal('add') : null} 
          addLabel="Accorder accès" color="#059669" 
        />
        {loading && <Skeleton />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && list.length === 0 && (
          <EmptyState 
            icon="shield" 
            message="Aucun accès accordé" 
            sub={isPatient ? "Accordez l'accès à vos données médicales." : "Aucun consentement accordé pour ce dossier."} 
          />
        )}
        {!loading && list.map((c, i) => (
          <DataRow key={c.id || i}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginRight: 14,
              background: c.status === 'ACTIVE' ? '#f0fdf4' : '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="lock" size={16} color={c.status === 'ACTIVE' ? '#059669' : '#9ca3af'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>Medecin: {c.doctorName || c.doctorFullName || 'Medecin'}</div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>
                Accordé: {fmtDate(c.grantedAt)}{c.expiresAt ? ` · Expire: ${fmtDate(c.expiresAt)}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge label={ACCESS_LABEL[c.accessLevel] || c.accessLevel} variant={c.accessLevel} />
              <Badge label={c.status === 'ACTIVE' ? 'Actif' : 'Révoqué'} variant={c.status} />
              {isPatient && c.status === 'ACTIVE' && (
                <ActionBtn
                  id={`revoke-consent-${c.id}`}
                  icon="x" color="#dc2626" title="Révoquer"
                  onClick={() => setModal({ type: 'revoke', doctorId: c.doctorId, doctorName: c.doctorName || c.doctorFullName || 'Medecin' })}
                />
              )}
            </div>
          </DataRow>
        ))}
      </Card>

      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Accorder un accès" width={460}>
        <ConsentForm onSubmit={handleGrant} loading={saving} />
      </Modal>
      <Modal open={modal?.type === 'revoke'} onClose={() => setModal(null)} title="Révoquer l'accès" width={440}>
        <p style={{ fontSize: '0.88rem', color: '#6b7280', marginBottom: 16 }}>
          Vous allez révoquer l'accès du médecin <strong>{modal?.doctorName || 'Medecin'}</strong> à votre dossier médical.
        </p>
        <RevokeForm onSubmit={handleRevoke} loading={saving} />
      </Modal>
    </>
  );
}
