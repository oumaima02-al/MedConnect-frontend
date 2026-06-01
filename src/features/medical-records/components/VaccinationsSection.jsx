import { useState } from 'react';
import { useVaccinations } from '../hooks/useDMP';
import { useAuth } from '../../../context/AuthContext';
import {
  Card, SectionHeader, Badge, DataRow, Skeleton, EmptyState, ErrorBanner,
  Modal, Field, Input, SubmitBtn, ActionBtn, InfoRow, fmtDate, Icon,
} from './DMPShared';

const STATUS_LABEL = { COMPLETED: 'Complété', PENDING: 'En attente', OVERDUE: 'En retard' };

function VaccinationForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    vaccineName: '', vaccinationDate: '', nextDue: '', administeredBy: '', site: '', batchNumber: '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <Field label="Vaccin" required><Input id="vax-name" value={form.vaccineName} onChange={set('vaccineName')} placeholder="Ex: Vaccin COVID-19, DTP…" required /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Date administrée"><Input id="vax-date" type="date" value={form.vaccinationDate} onChange={set('vaccinationDate')} /></Field>
        <Field label="Prochaine dose"><Input id="vax-next" type="date" value={form.nextDue} onChange={set('nextDue')} /></Field>
        <Field label="Administré par"><Input id="vax-by" value={form.administeredBy} onChange={set('administeredBy')} placeholder="Dr. Nom" /></Field>
        <Field label="Site injection"><Input id="vax-site" value={form.site} onChange={set('site')} placeholder="Ex: Bras gauche" /></Field>
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="N° de lot"><Input id="vax-batch" value={form.batchNumber} onChange={set('batchNumber')} placeholder="Numéro de lot" /></Field>
        </div>
      </div>
      <SubmitBtn label="Enregistrer la vaccination" loading={loading} color="#d97706" />
    </form>
  );
}

export default function VaccinationsSection({ patientId }) {
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  const { data: vaccinations, loading, error, add, remove } = useVaccinations(patientId);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (form) => { setSaving(true); try { await add(form); setModal(null); } finally { setSaving(false); } };
  const handleDelete = async (id) => { if (!confirm('Supprimer cette vaccination ?')) return; await remove(id); };

  const list = Array.isArray(vaccinations) ? vaccinations : [];

  return (
    <>
      <Card>
        <SectionHeader icon="syringe" title="Vaccinations" count={list.length} onAdd={isDoctor ? () => setModal('add') : null} color="#d97706" />
        {loading && <Skeleton />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && list.length === 0 && (
          <EmptyState icon="syringe" message="Aucune vaccination enregistrée" sub={isDoctor ? "Ajoutez les vaccins administrés au patient." : "Aucun historique de vaccination."} />
        )}
        {!loading && list.map((v, i) => (
          <DataRow key={v.id || i}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginRight: 14,
              background: v.status === 'OVERDUE' ? '#fef2f2' : v.status === 'PENDING' ? '#fffbeb' : '#f0fdf4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="syringe" size={16}
                color={v.status === 'OVERDUE' ? '#dc2626' : v.status === 'PENDING' ? '#d97706' : '#16a34a'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{v.vaccineName}</div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>
                {fmtDate(v.vaccinationDate)}{v.nextDue ? ` · Rappel: ${fmtDate(v.nextDue)}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge label={STATUS_LABEL[v.status] || v.status} variant={v.status} />
              <div style={{ display: 'flex', gap: 4 }}>
                <ActionBtn id={`view-vax-${v.id}`} icon="eye" color="#6b7280" title="Voir" onClick={() => setModal({ type: 'view', item: v })} />
                {isDoctor && (
                  <ActionBtn id={`delete-vax-${v.id}`} icon="trash" color="#dc2626" title="Supprimer" onClick={() => handleDelete(v.id)} />
                )}
              </div>
            </div>
          </DataRow>
        ))}
      </Card>

      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Ajouter une vaccination" width={500}>
        <VaccinationForm onSubmit={handleAdd} loading={saving} />
      </Modal>
      <Modal open={modal?.type === 'view'} onClose={() => setModal(null)} title="Détails de la vaccination" width={460}>
        {modal?.type === 'view' && (
          <div>
            <InfoRow label="Vaccin" value={modal.item.vaccineName} />
            <InfoRow label="Date" value={fmtDate(modal.item.vaccinationDate)} />
            <InfoRow label="Prochaine dose" value={fmtDate(modal.item.nextDue)} />
            <InfoRow label="Administré par" value={modal.item.administeredBy} />
            <InfoRow label="Site" value={modal.item.site} />
            <InfoRow label="N° de lot" value={modal.item.batchNumber} />
            <InfoRow label="Statut" value={<Badge label={STATUS_LABEL[modal.item.status]} variant={modal.item.status} />} />
          </div>
        )}
      </Modal>
    </>
  );
}
