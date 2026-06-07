import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicalService } from '../../../services/medicalService';

export default function ConsultationPage() {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    diagnosis: '',
    clinicalNotes: '',
    recommendations: '',
    followUpDate: '',
  });

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.diagnosis.trim()) errs.diagnosis = 'Le diagnostic principal est requis.';
    if (form.clinicalNotes.trim().length > 0 && form.clinicalNotes.trim().length < 10)
      errs.clinicalNotes = 'Les notes doivent contenir au moins 10 caractères.';
    if (form.followUpDate) {
      const d = new Date(form.followUpDate);
      if (d <= new Date()) errs.followUpDate = 'La date de suivi doit être dans le futur.';
    }
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
        doctorName: 'Dr.',          // will be enriched by backend from JWT
        specialty: '',
        consultationDate: new Date().toISOString(),
        diagnosis: form.diagnosis,
        notes: form.clinicalNotes,
        recommendations: form.recommendations,
      };
      if (form.followUpDate) payload.followUpDate = new Date(form.followUpDate).toISOString();

      await medicalService.createConsultation(patientId, payload);
      setSuccess(true);
      setTimeout(() => navigate(`/doctor/patients/${patientId}`), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error
        || 'Erreur lors de l\'enregistrement. Réessayez.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: `1.5px solid ${errors[field] ? '#fca5a5' : '#e5e7eb'}`,
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  });

  if (success) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(46,204,113,0.25)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, color: '#111827', marginBottom: 8 }}>Consultation enregistrée !</h2>
        <p style={{ color: '#6b7280' }}>Redirection vers le dossier patient…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 16, fontFamily: 'inherit' }}
        >
          ← Retour au dossier patient
        </button>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: 0 }}>
          Nouvelle Consultation Médicale
        </h1>
        <p style={{ color: '#9ca3af', marginTop: 4, fontSize: '0.88rem' }}>Patient selectionne</p>
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

      <form onSubmit={handleSubmit} style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 24, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Diagnosis */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>
              Diagnostic Principal <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              style={inputStyle('diagnosis')}
              placeholder="Ex: Hypertension artérielle stade 1"
              value={form.diagnosis}
              onChange={set('diagnosis')}
              onFocus={e => e.target.style.borderColor = '#2ecc71'}
              onBlur={e => e.target.style.borderColor = errors.diagnosis ? '#fca5a5' : '#e5e7eb'}
            />
            {errors.diagnosis && (
              <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: 4 }}>{errors.diagnosis}</p>
            )}
          </div>

          {/* Clinical Notes */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>
              Notes Cliniques & Observations
            </label>
            <textarea
              rows={4}
              style={{ ...inputStyle('clinicalNotes'), resize: 'vertical' }}
              placeholder="Détails de l'examen clinique, symptômes observés..."
              value={form.clinicalNotes}
              onChange={set('clinicalNotes')}
              onFocus={e => e.target.style.borderColor = '#2ecc71'}
              onBlur={e => e.target.style.borderColor = errors.clinicalNotes ? '#fca5a5' : '#e5e7eb'}
            />
            {errors.clinicalNotes && (
              <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: 4 }}>{errors.clinicalNotes}</p>
            )}
          </div>

          {/* Recommendations */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>
              Recommandations thérapeutiques
            </label>
            <textarea
              rows={3}
              style={{ ...inputStyle('recommendations'), resize: 'vertical' }}
              placeholder="Repos, régime sans sel, réévaluation dans 3 mois..."
              value={form.recommendations}
              onChange={set('recommendations')}
              onFocus={e => e.target.style.borderColor = '#2ecc71'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Follow-up date */}
          <div style={{ width: '50%' }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>
              Date de suivi <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optionnel)</span>
            </label>
            <input
              type="date"
              style={inputStyle('followUpDate')}
              min={new Date().toISOString().slice(0, 10)}
              value={form.followUpDate}
              onChange={set('followUpDate')}
              onFocus={e => e.target.style.borderColor = '#2ecc71'}
              onBlur={e => e.target.style.borderColor = errors.followUpDate ? '#fca5a5' : '#e5e7eb'}
            />
            {errors.followUpDate && (
              <p style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: 4 }}>{errors.followUpDate}</p>
            )}
          </div>

          {/* Actions */}
          <div style={{ marginTop: 8, display: 'flex', gap: 14 }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1, padding: '16px', borderRadius: 14,
                background: submitting ? '#86efac' : 'linear-gradient(135deg,#2ecc71,#16a34a)',
                color: 'white', border: 'none', fontWeight: 700, fontSize: '0.95rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
            >
              {submitting && (
                <span style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              )}
              {submitting ? 'Enregistrement...' : 'Finaliser la Consultation'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '16px 24px', borderRadius: 14, background: '#f1f5f9',
                color: '#64748b', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
