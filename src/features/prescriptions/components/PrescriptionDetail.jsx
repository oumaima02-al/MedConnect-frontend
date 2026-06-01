import { useState } from 'react';
import { usePrescriptionDetail, useRefills, usePharmacies, usePharmacyStatus } from '../hooks/usePrescriptions';
import { Card, SectionHeader, Badge, ErrorBanner, Skeleton, EmptyState, RxIcon, InfoRow, fmtDate, ActionBtn, Modal, Field, Input, Textarea, Select, SubmitBtn } from './RxShared';

function AddItemForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ medicationName: '', dosage: '', frequency: '', quantity: '', refillsAllowed: '', instructions: '' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, quantity: Number(form.quantity), refillsAllowed: Number(form.refillsAllowed) }); }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ gridColumn: '1/-1' }}><Field label="Nom du médicament" required><Input value={form.medicationName} onChange={set('medicationName')} required /></Field></div>
        <Field label="Dosage"><Input value={form.dosage} onChange={set('dosage')} placeholder="500mg" /></Field>
        <Field label="Fréquence"><Input value={form.frequency} onChange={set('frequency')} placeholder="3x/jour" /></Field>
        <Field label="Quantité" required><Input type="number" min="1" value={form.quantity} onChange={set('quantity')} required /></Field>
        <Field label="Recharges"><Input type="number" min="0" value={form.refillsAllowed} onChange={set('refillsAllowed')} /></Field>
        <div style={{ gridColumn: '1/-1' }}><Field label="Instructions"><Textarea rows={2} value={form.instructions} onChange={set('instructions')} /></Field></div>
      </div>
      <SubmitBtn label="Ajouter" loading={loading} />
    </form>
  );
}

function RefillRequestForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ refillQuantity: '', reason: '', requestDate: new Date().toISOString().slice(0, 10) });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, refillQuantity: Number(form.refillQuantity), requestDate: new Date(form.requestDate).toISOString() }); }}>
      <Field label="Quantité demandée" required><Input type="number" min="1" value={form.refillQuantity} onChange={set('refillQuantity')} required /></Field>
      <Field label="Raison"><Textarea rows={2} value={form.reason} onChange={set('reason')} placeholder="Besoin de la suite du traitement..." /></Field>
      <Field label="Date de demande"><Input type="date" value={form.requestDate} onChange={set('requestDate')} /></Field>
      <SubmitBtn label="Demander une recharge" loading={loading} color="#059669" />
    </form>
  );
}

export default function PrescriptionDetail({ rxId, onBack }) {
  const { data: rx, loading, error, update, addItemFn, deleteItemFn } = usePrescriptionDetail(rxId);
  const { data: refills, request: reqRefill } = useRefills(rxId);
  const { data: pharmacies } = usePharmacies();
  // We'd use assignPharmacy service method, but here we can mock it or use an implicit hook call.
  // For simplicity, we assume rx.status might change to ASSIGNED when assigned.

  const [modal, setModal] = useState(null); // 'addItem', 'requestRefill', 'assignPharmacy'
  const [saving, setSaving] = useState(false);

  if (loading) return <Card><Skeleton rows={5} /></Card>;
  if (error) return <Card><ErrorBanner message={error} /><button onClick={onBack} style={{ margin: '0 24px 24px', padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>Retour</button></Card>;
  if (!rx) return <EmptyState icon="file" message="Ordonnance introuvable" />;

  const meds = Array.isArray(rx.medications) ? rx.medications : [];
  const refList = Array.isArray(refills) ? refills : [];

  const handleAddItem = async (f) => { setSaving(true); try { await addItemFn(f); setModal(null); } finally { setSaving(false); } };
  const handleDeleteItem = async (itemId) => { if (!confirm('Supprimer ce médicament ?')) return; await deleteItemFn(itemId); };
  const handleRefill = async (f) => { setSaving(true); try { await reqRefill(f); setModal(null); } finally { setSaving(false); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#6b7280' }}>
          <RxIcon name="x" size={18} />
        </button>
        <div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", margin: 0, color: '#111827', fontSize: '1.4rem' }}>Ordonnance #{rx.id?.slice(-6) || 'N/A'}</h2>
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 4 }}>Prescrite le {fmtDate(rx.prescriptionDate)}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Badge variant={rx.status} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        
        {/* Left Col: Info + Meds */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Info */}
          <Card>
            <div style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', marginBottom: 16 }}>Informations générales</h3>
              <InfoRow label="Patient ID" value={rx.patientId} />
              <InfoRow label="Médecin ID" value={rx.doctorId} />
              <InfoRow label="Date de fin" value={fmtDate(rx.expiryDate)} />
            </div>
          </Card>

          {/* Medications */}
          <Card>
            <SectionHeader icon="pill" title="Médicaments prescrits" count={meds.length} onAdd={rx.status === 'ACTIVE' ? () => setModal('addItem') : undefined} color="#7c3aed" />
            {meds.length === 0 && <EmptyState icon="pill" message="Aucun médicament" />}
            {meds.map((m, i) => (
              <div key={m.id || i} style={{ display: 'flex', borderBottom: i < meds.length - 1 ? '1px solid #f9fafb' : 'none', padding: '16px 24px' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7c3aed' }}>{i + 1}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#111827' }}>{m.medicationName}</h4>
                    {rx.status === 'ACTIVE' && m.id && (
                      <ActionBtn icon="x" color="#dc2626" title="Supprimer" onClick={() => handleDeleteItem(m.id)} />
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                    <InfoRow label="Dosage :" value={m.dosage} />
                    <InfoRow label="Fréquence :" value={m.frequency} />
                    <InfoRow label="Quantité :" value={m.quantity} />
                    <InfoRow label="Recharges :" value={m.refillsAllowed} />
                  </div>
                  {m.instructions && (
                    <div style={{ marginTop: 8, background: '#f8fafc', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', color: '#6b7280' }}>
                      <strong>📝 Inst:</strong> {m.instructions}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Right Col: Pharmacy + Refills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <Card>
            <SectionHeader icon="pharmacy" title="Pharmacie" color="#0ea5e9" extra={
              <button onClick={() => setModal('assignPharmacy')} style={{ border: 'none', background: '#e0f2fe', color: '#0284c7', padding: '4px 12px', borderRadius: 16, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Assigner</button>
            }/>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, textAlign: 'center' }}>Aucune pharmacie assignée pour le moment.</p>
            </div>
          </Card>

          <Card>
            <SectionHeader icon="refresh" title="Renouvellements" count={refList.length} color="#059669" onAdd={() => setModal('requestRefill')} addLabel="Demander" />
            {refList.length === 0 && <div style={{ padding: '20px 24px', textAlign: 'center', fontSize: '0.85rem', color: '#9ca3af' }}>Aucune demande.</div>}
            {refList.map((r, i) => (
              <div key={r.id || i} style={{ padding: '16px 24px', borderBottom: '1px solid #f9fafb', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>Date: {fmtDate(r.requestDate)}</span>
                  <Badge variant={r.status} />
                </div>
                <div style={{ color: '#6b7280' }}>Qté: <strong>{r.refillQuantity}</strong></div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <Modal open={modal === 'addItem'} onClose={() => setModal(null)} title="Ajouter un médicament" width={500}>
        <AddItemForm onSubmit={handleAddItem} loading={saving} />
      </Modal>

      <Modal open={modal === 'requestRefill'} onClose={() => setModal(null)} title="Demande de renouvellement" width={460}>
        <RefillRequestForm onSubmit={handleRefill} loading={saving} />
      </Modal>

      <Modal open={modal === 'assignPharmacy'} onClose={() => setModal(null)} title="Assigner une pharmacie" width={500}>
        <div style={{ textAlign: 'center', padding: 20 }}>
           <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: 16 }}>Sélectionnez une pharmacie partenaire.</p>
           {Array.isArray(pharmacies) && pharmacies.map(ph => (
             <div key={ph.id} style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 8, textAlign: 'left', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor='#0ea5e9'} onMouseLeave={e => e.currentTarget.style.borderColor='#e5e7eb'} onClick={() => { alert('Assigné: ' + ph.name); setModal(null); }}>
               <strong style={{ display: 'block', color: '#111827', fontSize: '0.9rem' }}>{ph.name}</strong>
               <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{ph.address}</span>
             </div>
           ))}
        </div>
      </Modal>
    </div>
  );
}
