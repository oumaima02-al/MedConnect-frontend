import { useAuth } from '../../../context/AuthContext';
import AllergiesSection from '../../medical-records/components/AllergiesSection';
import { Icon } from '../../../components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';

export default function PatientAllergiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const patientId = user?.id || user?.userId || 'patient-1';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            width: 40, height: 40, borderRadius: 12, background: 'white', border: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <Icon name="logout" size={18} color="#6b7280" style={{ transform: 'rotate(180deg)' }} />
        </button>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            Mes Allergies
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: 4 }}>
            Consultez et gérez vos allergies et intolérances répertoriées.
          </p>
        </div>
      </div>

      <AllergiesSection patientId={patientId} />
      
      <div style={{ 
        marginTop: 24, padding: 20, borderRadius: 18, background: '#f8fafc', border: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'flex-start', gap: 16
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#3b82f612', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="file" size={16} color="#3b82f6" />
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Note importante</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
            Ces informations sont cruciales pour votre sécurité lors de consultations ou d'hospitalisations. 
            Seul un professionnel de santé peut modifier officiellement ces entrées après validation clinique.
          </p>
        </div>
      </div>
    </div>
  );
}
