import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { dmpService } from '../../../services/medicalService';
import { Icon } from '../../../components/layout/AppLayout';

const DMPCard = ({ title, children, actionLabel, onAction, icon, color }) => (
  <div style={{
    background: 'white', borderRadius: 20, padding: '24px',
    border: '1px solid #f3f4f6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    display: 'flex', flexDirection: 'column', gap: 16
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: color + '12',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon name={icon} size={20} color={color} />
        </div>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          {title}
        </h3>
      </div>
      {actionLabel && (
        <button 
          onClick={onAction}
          style={{ 
            background: 'none', border: 'none', color: '#2ecc71', fontWeight: 600, 
            fontSize: '0.82rem', cursor: 'pointer', padding: '4px 8px'
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

export default function PatientDmpPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dmp, setDmp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching DMP
    setTimeout(() => {
      setDmp({
        vitals: [
          { type: 'Tension', value: '12/8', date: '20 Mai 2024' },
          { type: 'Poids', value: '72 kg', date: '15 Mai 2024' }
        ],
        allergies: ['Pénicilline', 'Pollen'],
        consultations: [
          { doctor: 'Dr. Karim Alami', specialty: 'Cardiologue', date: '10 Avril 2024', diagnosis: 'Hypertension légère' }
        ]
      });
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement de votre dossier médical...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: 6 }}>
          Dossier Médical Partagé (DMP)
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
          Toutes vos données de santé, centralisées et sécurisées par MediConnect.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        
        {/* Vitals Summary */}
        <DMPCard 
          title="Paramètres Vitaux" icon="heart" color="#ef4444" actionLabel="Mettre à jour" 
          onAction={() => navigate('/patient/vitals')}
        >
          {dmp.vitals.map((v, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
              <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{v.type}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{v.value}</span>
            </div>
          ))}
        </DMPCard>

        {/* Allergies */}
        <DMPCard 
          title="Allergies & Intolérances" icon="pill" color="#f59e0b" actionLabel="Ajouter"
          onAction={() => navigate('/patient/allergies')}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {dmp.allergies.map((a, i) => (
              <span key={i} style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
                {a}
              </span>
            ))}
          </div>
        </DMPCard>

        {/* Recent Consultations */}
        <div style={{ gridColumn: '1 / -1' }}>
          <DMPCard title="Historique Médical" icon="file" color="#3b82f6" actionLabel="Voir tout" onAction={() => navigate('/app/medical-records')}>
            {dmp.consultations.map((c, i) => (
              <div key={i} style={{ 
                padding: '16px', borderRadius: 14, background: '#f8fafc', border: '1px solid #f1f5f9',
                display: 'flex', flexDirection: 'column', gap: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{c.doctor}</span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{c.date}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  <strong>Spécialité:</strong> {c.specialty} <br/>
                  <strong>Diagnostic:</strong> {c.diagnosis}
                </div>
              </div>
            ))}
          </DMPCard>
        </div>

        {/* Consent Banner */}
        <div style={{ 
          gridColumn: '1 / -1', marginTop: 12,
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1.5px solid #86efac',
          borderRadius: 20, padding: '24px', display: 'flex', alignItems: 'center', gap: 20
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="user" color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', fontFamily: "'Sora',sans-serif", fontWeight: 700, color: '#065f46' }}>Contrôle d'accès</h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#166534' }}>Gérez quels médecins peuvent consulter votre historique médical complet.</p>
          </div>
          <button 
            onClick={() => navigate('/patient/consent')}
            style={{ 
              background: 'white', border: '1.5px solid #86efac', padding: '10px 20px', borderRadius: 12,
              color: '#166534', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
            }}
          >
            Gérer les accès
          </button>
        </div>

      </div>
    </div>
  );
}

