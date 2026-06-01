import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dmpService } from '../../../services/medicalService';

export default function VitalsPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [vitals, setVitals] = useState({
    weight: '',
    temperature: '',
    systolic: '',
    diastolic: '',
    heartRate: ''
  });

  const validate = () => {
    if (!vitals.weight || !vitals.temperature || !vitals.systolic || !vitals.diastolic || !vitals.heartRate) {
      return 'Veuillez remplir tous les champs.';
    }
    const weightVal = parseFloat(vitals.weight);
    if (isNaN(weightVal) || weightVal <= 0) {
      return 'Le poids doit être un nombre supérieur à 0 kg.';
    }
    const tempVal = parseFloat(vitals.temperature);
    if (isNaN(tempVal) || tempVal < 30 || tempVal > 45) {
      return 'Veuillez entrer une température valide (entre 30°C et 45°C).';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    const error = validate();
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }

    setSubmitting(true);
    try {
      await dmpService.addVitals(vitals);
      setMessage({ type: 'success', text: 'Paramètres vitaux enregistrés avec succès !' });
      setTimeout(() => navigate('/patient/dmp'), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Erreur lors de l\'enregistrement' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
          Suivi de mes constantes
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.92rem', marginTop: 6 }}>
          Enregistrez vos paramètres vitaux pour un meilleur suivi médical par vos docteurs.
        </p>
      </div>

      {message.text && (
        <div style={{ 
          padding: '14px 18px', borderRadius: 14, marginBottom: 20, fontSize: '0.88rem', fontWeight: 600,
          background: message.type === 'error' ? '#fff1f2' : '#f0fdf4',
          color: message.type === 'error' ? '#e11d48' : '#16a34a',
          border: `1px solid ${message.type === 'error' ? '#fecdd3' : '#bbf7d0'}`,
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          {message.type === 'error' ? '⚠️' : '✅'} {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 28, padding: '32px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          
          <div style={{ gridColumn: '1 / span 1' }}>
            <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Poids (kg)</label>
            <input 
              type="number" step="0.1" placeholder="Ex: 75.5"
              style={{ width: '100%', padding: '14px', borderRadius: 14, border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
              value={vitals.weight}
              onChange={e => setVitals({...vitals, weight: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Température (°C)</label>
            <input 
              type="number" step="0.1" placeholder="Ex: 37.0"
              style={{ width: '100%', padding: '14px', borderRadius: 14, border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
              value={vitals.temperature}
              onChange={e => setVitals({...vitals, temperature: e.target.value})}
            />
          </div>

          <div style={{ gridColumn: '1 / span 2' }}>
            <label style={{ display: 'block', marginBottom: 12, fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>Tension Artérielle (mmHg)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input 
                type="number" placeholder="Systolique"
                style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                value={vitals.systolic}
                onChange={e => setVitals({...vitals, systolic: e.target.value})}
              />
              <span style={{ fontSize: '1.4rem', color: '#cbd5e1', fontWeight: 300 }}>/</span>
              <input 
                type="number" placeholder="Diastolique"
                style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                value={vitals.diastolic}
                onChange={e => setVitals({...vitals, diastolic: e.target.value})}
              />
            </div>
          </div>

          <div style={{ gridColumn: '1 / span 2' }}>
            <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Fréquence Cardiaque (bpm)</label>
            <input 
              type="number" placeholder="Ex: 72"
              style={{ width: '100%', padding: '14px', borderRadius: 14, border: '1.5px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
              value={vitals.heartRate}
              onChange={e => setVitals({...vitals, heartRate: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            style={{ 
              gridColumn: '1 / span 2', padding: '18px', borderRadius: 16, 
              background: submitting ? '#94a3b8' : '#2ecc71', 
              color: 'white', border: 'none', fontWeight: 700, fontSize: '1rem',
              cursor: submitting ? 'not-allowed' : 'pointer', marginTop: 12,
              boxShadow: submitting ? 'none' : '0 10px 20px -5px rgba(46,204,113,0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => !submitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={e => !submitting && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {submitting ? 'Traitement en cours...' : 'Enregistrer mes constantes'}
          </button>

        </div>
      </form>
    </div>
  );
}
