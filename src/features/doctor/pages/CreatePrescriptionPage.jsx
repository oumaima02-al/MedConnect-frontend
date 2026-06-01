import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicalService } from '../../../services/medicalService';
import { Icon } from '../../../components/layout/AppLayout';

export default function CreatePrescriptionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [medications, setMedications] = useState([{ name: '', dosage: '', duration: '', instructions: '' }]);

  const addMed = () => setMedications([...medications, { name: '', dosage: '', duration: '', instructions: '' }]);
  const removeMed = (idx) => setMedications(medications.filter((_, i) => i !== idx));

  const updateMed = (idx, field, val) => {
    const next = [...medications];
    next[idx][field] = val;
    setMedications(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await medicalService.createPrescription({ patientId: id, medications });
      alert('Ordonnance créée avec succès');
      navigate(`/doctor/patients/${id}`);
    } catch (err) {
      alert('Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 850, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', marginBottom: 16 }}>
          ← Retour
        </button>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>
          Nouvelle Ordonnance Numérique
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 24, padding: '32px', border: '1px solid #f3f4f6', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ borderBottom: '1.5px solid #f1f5f9', pb: 20, mb: 10 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Médicaments & Posologie</h3>
          </div>

          {medications.map((med, idx) => (
            <div key={idx} style={{ 
              padding: '20px', borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0',
              position: 'relative', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 16
            }}>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>MÉDICAMENT #{idx + 1}</span>
                {medications.length > 1 && (
                  <button type="button" onClick={() => removeMed(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Supprimer</button>
                )}
              </div>
              
              <div style={{ gridColumn: '1 / span 1' }}>
                <label style={{ display: 'block', mb: 6, fontSize: '0.8rem', fontWeight: 600 }}>Nom du médicament</label>
                <input 
                  required placeholder="Ex: Amoxicilline 500mg"
                  style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #e5e7eb' }}
                  value={med.name}
                  onChange={e => updateMed(idx, 'name', e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', mb: 6, fontSize: '0.8rem', fontWeight: 600 }}>Dosage</label>
                <input 
                  required placeholder="Ex: 1 gélule 3x/jour"
                  style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #e5e7eb' }}
                  value={med.dosage}
                  onChange={e => updateMed(idx, 'dosage', e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', mb: 6, fontSize: '0.8rem', fontWeight: 600 }}>Durée</label>
                <input 
                  required placeholder="Ex: 7 jours"
                  style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #e5e7eb' }}
                  value={med.duration}
                  onChange={e => updateMed(idx, 'duration', e.target.value)}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <input 
                  placeholder="Instructions particulières (après repas, etc.)"
                  style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #e5e7eb' }}
                  value={med.instructions}
                  onChange={e => updateMed(idx, 'instructions', e.target.value)}
                />
              </div>
            </div>
          ))}

          <button type="button" onClick={addMed} style={{ 
            padding: '12px', border: '2px dashed #e2e8f0', borderRadius: 14, background: 'none', 
            color: '#64748b', fontWeight: 600, cursor: 'pointer'
          }}>
            + Ajouter un autre médicament
          </button>

          <div style={{ marginTop: 20, display: 'flex', gap: 16 }}>
            <button type="submit" disabled={submitting} style={{ 
              flex: 1, padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
              color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer'
            }}>
              {submitting ? 'Création...' : 'Signer et Envoyer l\'Ordonnance'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
