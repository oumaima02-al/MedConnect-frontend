import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicalService } from '../../../services/medicalService';

export default function ConsultationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    diagnosis: '',
    clinicalNotes: '',
    recommendations: '',
    followUpDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await medicalService.createConsultation({ patientId: id, ...form });
      alert('Consultation enregistrée avec succès');
      navigate(`/doctor/patients/${id}`);
    } catch (err) {
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 16 }}
        >
          ← Retour au dossier patient
        </button>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>
          Nouvelle Consultation Médicale
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 24, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>
              Diagnostic Principal <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              required
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', outline: 'none' }}
              placeholder="Ex: Hypertension artérielle stade 1"
              value={form.diagnosis}
              onChange={e => setForm({...form, diagnosis: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>
              Notes Cliniques & Observations
            </label>
            <textarea 
              rows={4}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', outline: 'none', resize: 'vertical' }}
              placeholder="Détails de l'examen clinique..."
              value={form.clinicalNotes}
              onChange={e => setForm({...form, clinicalNotes: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>
              Recommandations thérapeutiques
            </label>
            <textarea 
              rows={3}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', outline: 'none', resize: 'vertical' }}
              placeholder="Repos, régime sans sel, etc."
              value={form.recommendations}
              onChange={e => setForm({...form, recommendations: e.target.value})}
            />
          </div>

          <div style={{ width: '50%' }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.9rem', color: '#374151' }}>
              Date de suivi (Optionnel)
            </label>
            <input 
              type="date"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', outline: 'none' }}
              value={form.followUpDate}
              onChange={e => setForm({...form, followUpDate: e.target.value})}
            />
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
            <button 
              type="submit" 
              disabled={submitting}
              style={{ 
                flex: 1, padding: '16px', borderRadius: 14, background: '#2ecc71', color: 'white', 
                border: 'none', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer'
              }}>
              {submitting ? 'Enregistrement...' : 'Finaliser la Consultation'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              style={{ 
                padding: '16px 24px', borderRadius: 14, background: '#f1f5f9', color: '#64748b', 
                border: 'none', fontWeight: 700, cursor: 'pointer'
              }}>
              Annuler
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
