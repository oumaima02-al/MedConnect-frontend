import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import * as rxSvc from '../../prescriptions/services/prescriptionService';

export default function CreatePrescriptionPage() {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const doctorId = user?.id || user?.userId || '';

  const [step, setStep] = useState('form'); // 'form' | 'pharmacy' | 'done'
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState({});
  const [createdRxId, setCreatedRxId] = useState(null);

  // Pharmacy assignment state
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [assigningPharmacy, setAssigningPharmacy] = useState(false);
  const [pharmacyLoading, setPharmacyLoading] = useState(false);

  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '', quantity: 1, refillsAllowed: 0 },
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const [prescriptionDate, setPrescriptionDate] = useState(today);
  const [expiryDate, setExpiryDate] = useState('');

  // Load pharmacies once we reach pharmacy step
  useEffect(() => {
    if (step !== 'pharmacy') return;
    setPharmacyLoading(true);
    rxSvc.getPharmacies()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setPharmacies(Array.isArray(list) ? list : []);
      })
      .catch(() => setPharmacies([]))
      .finally(() => setPharmacyLoading(false));
  }, [step]);

  const addMed = () => setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '', quantity: 1, refillsAllowed: 0 }]);
  const removeMed = (idx) => setMedications(medications.filter((_, i) => i !== idx));
  const updateMed = (idx, field, val) => {
    const next = [...medications];
    next[idx] = { ...next[idx], [field]: val };
    setMedications(next);
    if (errors[`med_${idx}_${field}`]) {
      setErrors((er) => { const e = { ...er }; delete e[`med_${idx}_${field}`]; return e; });
    }
  };

  const validate = () => {
    const errs = {};
    if (!patientId) errs.global = 'ID patient manquant.';
    if (!doctorId) errs.global = 'ID médecin introuvable. Reconnectez-vous.';
    if (!prescriptionDate) errs.prescriptionDate = 'Date de prescription requise.';
    if (expiryDate && new Date(expiryDate) <= new Date(prescriptionDate))
      errs.expiryDate = 'La date d\'expiration doit être après la date de prescription.';

    medications.forEach((med, i) => {
      if (!med.name.trim()) errs[`med_${i}_name`] = 'Nom requis.';
      if (!med.dosage.trim()) errs[`med_${i}_dosage`] = 'Dosage requis.';
      if (!med.frequency.trim()) errs[`med_${i}_frequency`] = 'Fréquence requise.';
      if (Number(med.quantity) < 1) errs[`med_${i}_quantity`] = 'Quantité ≥ 1.';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError('');
    try {
      const payload = {
        patientId,
        doctorId,
        prescriptionDate: new Date(prescriptionDate).toISOString(),
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        status: 'ACTIVE',
        medications: medications.map((m) => ({
          medicationName: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          quantity: Number(m.quantity),
          refillsAllowed: Number(m.refillsAllowed),
          instructions: m.instructions,
        })),
      };
      const res = await rxSvc.createPrescription(payload);
      const rxId = res.data?.data?.id || res.data?.id;
      setCreatedRxId(rxId);
      setStep('pharmacy');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error
        || 'Erreur lors de la création de l\'ordonnance.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignPharmacy = async () => {
    if (!selectedPharmacy || !createdRxId) { setStep('done'); return; }
    setAssigningPharmacy(true);
    try {
      await rxSvc.assignPharmacy(createdRxId, selectedPharmacy);
    } catch (err) {
      console.warn('[CreateRx] Pharmacy assign failed:', err?.response?.status);
    } finally {
      setAssigningPharmacy(false);
      setStep('done');
    }
  };

  const inputStyle = (errKey) => ({
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: `1.5px solid ${errors[errKey] ? '#fca5a5' : '#e5e7eb'}`,
    outline: 'none', fontFamily: 'inherit', fontSize: '0.87rem',
    boxSizing: 'border-box', transition: 'border-color 0.18s',
  });

  // ── Done screen ───────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(46,204,113,0.25)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, color: '#111827', marginBottom: 8 }}>
          Ordonnance créée avec succès !
        </h2>
        {createdRxId && <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: 24 }}>ID Ordonnance: #{createdRxId.slice(-8)}</p>}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => navigate(`/doctor/patients/${patientId}`)}
            style={{ padding: '12px 24px', borderRadius: 12, background: '#2ecc71', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Retour au dossier patient
          </button>
          <button
            onClick={() => navigate('/doctor/prescriptions')}
            style={{ padding: '12px 24px', borderRadius: 12, background: '#f1f5f9', color: '#374151', border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Voir toutes les ordonnances
          </button>
        </div>
      </div>
    );
  }

  // ── Pharmacy assignment step ──────────────────────────────────────────
  if (step === 'pharmacy') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>
            Assigner à une pharmacie
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: 4 }}>
            Optionnel — vous pouvez ignorer cette étape.
          </p>
        </div>

        <div style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 24, padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {pharmacyLoading ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af' }}>Chargement des pharmacies…</div>
          ) : pharmacies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af' }}>
              <p>Aucune pharmacie disponible actuellement.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pharmacies.map((ph) => {
                const selected = selectedPharmacy === ph.id;
                return (
                  <div
                    key={ph.id}
                    onClick={() => setSelectedPharmacy(selected ? '' : ph.id)}
                    style={{
                      padding: '16px 20px', borderRadius: 14, cursor: 'pointer',
                      border: `2px solid ${selected ? '#2ecc71' : '#e2e8f0'}`,
                      background: selected ? '#f0fdf4' : 'white',
                      transition: 'all 0.18s',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#111827' }}>{ph.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 4 }}>
                      {ph.address} {ph.phone ? `· ${ph.phone}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              onClick={() => setStep('done')}
              style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Ignorer
            </button>
            <button
              onClick={handleAssignPharmacy}
              disabled={assigningPharmacy || !selectedPharmacy}
              style={{
                flex: 2, padding: '13px', borderRadius: 12, border: 'none',
                background: selectedPharmacy ? '#2ecc71' : '#e5e7eb',
                color: selectedPharmacy ? 'white' : '#9ca3af',
                fontWeight: 700, cursor: selectedPharmacy ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {assigningPharmacy && <span style={{ width: 14, height: 14, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
              {assigningPharmacy ? 'Assignation...' : 'Confirmer & terminer'}
            </button>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Main prescription form ────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: 14, fontFamily: 'inherit' }}>
          ← Retour
        </button>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>
          Nouvelle Ordonnance Numérique
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: 4 }}>Patient ID: {patientId}</p>
      </div>

      {apiError && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
          padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: '0.88rem',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {apiError}
        </div>
      )}
      {errors.global && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: '0.88rem' }}>
          {errors.global}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 24, padding: '32px', border: '1px solid #f3f4f6', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: '0.82rem', color: '#374151' }}>Date de prescription <span style={{ color: '#ef4444' }}>*</span></label>
              <input type="date" value={prescriptionDate} onChange={e => { setPrescriptionDate(e.target.value); setErrors(er => ({ ...er, prescriptionDate: '' })); }}
                style={inputStyle('prescriptionDate')} max={today} />
              {errors.prescriptionDate && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 3 }}>{errors.prescriptionDate}</p>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: '0.82rem', color: '#374151' }}>Date d'expiration <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optionnel)</span></label>
              <input type="date" value={expiryDate} onChange={e => { setExpiryDate(e.target.value); setErrors(er => ({ ...er, expiryDate: '' })); }}
                style={inputStyle('expiryDate')} min={prescriptionDate || today} />
              {errors.expiryDate && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: 3 }}>{errors.expiryDate}</p>}
            </div>
          </div>

          {/* Medications */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #f1f5f9', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827' }}>Médicaments & Posologie</h3>
              <button type="button" onClick={addMed} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: '1.5px solid #d1d5db', background: '#f9fafb', color: '#374151', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                + Ajouter
              </button>
            </div>

            {medications.map((med, idx) => (
              <div key={idx} style={{ padding: '18px 20px', borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Médicament #{idx + 1}</span>
                  {medications.length > 1 && (
                    <button type="button" onClick={() => removeMed(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit' }}>
                      Supprimer
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 14 }}>
                  {/* Name */}
                  <div style={{ gridColumn: '1 / span 1' }}>
                    <label style={{ display: 'block', marginBottom: 5, fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>Nom du médicament <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      value={med.name} onChange={e => updateMed(idx, 'name', e.target.value)}
                      placeholder="Ex: Amoxicilline 500mg"
                      style={inputStyle(`med_${idx}_name`)}
                      onFocus={e => e.target.style.borderColor = '#2ecc71'}
                      onBlur={e => e.target.style.borderColor = errors[`med_${idx}_name`] ? '#fca5a5' : '#e5e7eb'}
                    />
                    {errors[`med_${idx}_name`] && <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: 3 }}>{errors[`med_${idx}_name`]}</p>}
                  </div>
                  {/* Dosage */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>Dosage <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      value={med.dosage} onChange={e => updateMed(idx, 'dosage', e.target.value)}
                      placeholder="Ex: 1 gélule 3×/jour"
                      style={inputStyle(`med_${idx}_dosage`)}
                      onFocus={e => e.target.style.borderColor = '#2ecc71'}
                      onBlur={e => e.target.style.borderColor = errors[`med_${idx}_dosage`] ? '#fca5a5' : '#e5e7eb'}
                    />
                    {errors[`med_${idx}_dosage`] && <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: 3 }}>{errors[`med_${idx}_dosage`]}</p>}
                  </div>
                  {/* Frequency */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>Fréquence <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      value={med.frequency} onChange={e => updateMed(idx, 'frequency', e.target.value)}
                      placeholder="Ex: 7 jours"
                      style={inputStyle(`med_${idx}_frequency`)}
                      onFocus={e => e.target.style.borderColor = '#2ecc71'}
                      onBlur={e => e.target.style.borderColor = errors[`med_${idx}_frequency`] ? '#fca5a5' : '#e5e7eb'}
                    />
                    {errors[`med_${idx}_frequency`] && <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: 3 }}>{errors[`med_${idx}_frequency`]}</p>}
                  </div>
                  {/* Quantity */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>Quantité</label>
                    <input type="number" min="1"
                      value={med.quantity} onChange={e => updateMed(idx, 'quantity', e.target.value)}
                      style={inputStyle(`med_${idx}_quantity`)}
                      onFocus={e => e.target.style.borderColor = '#2ecc71'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                    {errors[`med_${idx}_quantity`] && <p style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: 3 }}>{errors[`med_${idx}_quantity`]}</p>}
                  </div>
                  {/* Refills */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>Renouvellements autorisés</label>
                    <input type="number" min="0"
                      value={med.refillsAllowed} onChange={e => updateMed(idx, 'refillsAllowed', e.target.value)}
                      style={{ ...inputStyle(), border: '1.5px solid #e5e7eb' }}
                      onFocus={e => e.target.style.borderColor = '#2ecc71'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  {/* Instructions */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>Instructions</label>
                    <input
                      value={med.instructions} onChange={e => updateMed(idx, 'instructions', e.target.value)}
                      placeholder="Ex: Prendre après repas"
                      style={{ ...inputStyle(), border: '1.5px solid #e5e7eb' }}
                      onFocus={e => e.target.style.borderColor = '#2ecc71'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            <button type="submit" disabled={submitting} style={{
              flex: 1, padding: '16px', borderRadius: 14,
              background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white', border: 'none', fontWeight: 700, fontSize: '0.95rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'inherit',
            }}>
              {submitting && <span style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
              {submitting ? 'Création en cours...' : 'Créer l\'ordonnance →'}
            </button>
            <button type="button" onClick={() => navigate(-1)} style={{
              padding: '16px 22px', borderRadius: 14, background: '#f1f5f9', color: '#64748b',
              border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Annuler
            </button>
          </div>
        </div>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
