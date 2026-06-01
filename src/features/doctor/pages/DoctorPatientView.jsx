import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicalService, dmpService } from '../../../services/medicalService';
import { Icon } from '../../../components/layout/AppLayout';

export default function DoctorPatientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(true); // Should be checked via API

  useEffect(() => {
    // Simulate fetching patient data
    setTimeout(() => {
      setPatient({
        id: id,
        name: 'Mehdi Cherkaoui',
        age: 34,
        bloodType: 'A+',
        history: [
          { date: '12 Mars 2024', type: 'Consultation', title: 'Grippe saisonnière', by: 'Dr. Idrissi' },
          { date: '05 Jan 2024', type: 'Lab', title: 'Bilan sanguin complet', by: 'Labo Pasteur' }
        ]
      });
      setLoading(false);
    }, 600);
  }, [id]);

  if (loading) return <div style={{ padding: 40 }}>Chargement du patient...</div>;

  if (!hasConsent) {
    return (
      <div style={{ padding: 40, background: '#fff7f7', border: '1px solid #fca5a5', borderRadius: 20, textAlign: 'center' }}>
        <h2 style={{ color: '#dc2626' }}>Accès restreint</h2>
        <p>Le patient n'a pas encore autorisé l'accès à son Dossier Médical Partagé.</p>
        <button style={{ marginTop: 16, padding: '10px 20px', borderRadius: 10, background: '#dc2626', color: 'white', border: 'none' }}>
          Demander l'accès
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      
      {/* Patient Header */}
      <div style={{ 
        background: 'white', borderRadius: 24, padding: '24px 32px', marginBottom: 28,
        border: '1px solid #f3f4f6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ 
            width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.4rem'
          }}>
            {patient.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              {patient.name}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 4 }}>
              Patient ID: #{patient.id} • {patient.age} ans • Groupe {patient.bloodType}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => navigate(`/doctor/patients/${id}/consultation`)}
            style={{ 
              padding: '12px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #2ecc71, #16a34a)', 
              color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}>
            <Icon name="grid" size={18} color="white" /> Nouvelles Consultation
          </button>
          <button 
            onClick={() => navigate(`/doctor/patients/${id}/prescription`)}
            style={{ 
              padding: '12px 20px', borderRadius: 12, border: '1.5px solid #2ecc71',
              color: '#16a34a', background: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}>
            <Icon name="pill" size={18} color="#2ecc71" /> Créer Ordonnance
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        {/* Medical Timeline */}
        <div style={{ 
          background: 'white', borderRadius: 24, padding: '28px', border: '1px solid #f3f4f6',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 700, marginBottom: 24 }}>
            Historique Médical Complet
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {patient.history.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, position: 'relative' }}>
                <div style={{ 
                  width: 2, background: '#f1f5f9', position: 'absolute', top: 30, bottom: -20, left: 20 
                }} />
                <div style={{ 
                  width: 42, height: 42, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1
                }}>
                  <Icon name={h.type === 'Lab' ? 'file' : 'calendar'} size={18} color="#64748b" />
                </div>
                <div style={{ flex: 1, paddingBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>{h.date}</span>
                    <span style={{ fontSize: '0.75rem', background: '#eef2ff', color: '#4338ca', padding: '2px 10px', borderRadius: 20, fontWeight: 700 }}>
                      {h.type}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#1e293b' }}>{h.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Etabli par: {h.by}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ background: '#f8fafc', borderRadius: 24, padding: '24px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Documents Cliniques
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button style={{ 
                padding: '12px', borderRadius: 12, background: 'white', border: '1px solid #e2e8f0', 
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left'
              }}>
                <Icon name="file" size={18} color="#3b82f6" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Ajouter Analyse Labo</span>
              </button>
              <button style={{ 
                padding: '12px', borderRadius: 12, background: 'white', border: '1px solid #e2e8f0', 
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left'
              }}>
                <Icon name="video" size={18} color="#8b5cf6" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Ajouter Imagerie</span>
              </button>
            </div>
          </div>

          <div style={{ background: '#fffbeb', borderRadius: 24, padding: '24px', border: '1px solid #fef3c7' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#92400e' }}>Notes du patient</h4>
            <p style={{ fontSize: '0.85rem', color: '#b45309', margin: 0, lineHeight: 1.5 }}>
              Dernière auto-évaluation vitales (hier): <br/>
              <strong>Poids:</strong> 72kg <br/>
              <strong>Tension:</strong> 13/8
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
