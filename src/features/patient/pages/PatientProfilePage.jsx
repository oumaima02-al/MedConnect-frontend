import { usePatientProfile } from '../hooks/usePatient';
import PatientMedicalCard from '../components/PatientMedicalCard';

const Skeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    {[120, 80, 160].map((h, i) => (
      <div key={i} style={{
        height: h, borderRadius: 14,
        background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }} />
    ))}
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
  </div>
);

export default function PatientProfilePage() {
  const { patientProfile, isLoading, isError } = usePatientProfile();

  // Profile not created yet → show create form
  const isNew = !isLoading && !isError && !patientProfile;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "'Sora',sans-serif",
          fontSize: '1.5rem', fontWeight: 700,
          color: '#111827', marginBottom: 4,
        }}>
          Profil médical
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
          {isNew
            ? 'Complétez votre profil médical pour permettre à vos médecins de mieux vous soigner.'
            : 'Vos informations médicales accessibles par vos médecins traitants.'}
        </p>
      </div>

      {/* Banner — profile not complete */}
      {isNew && (
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb, #fef9c3)',
          border: '1px solid #fde68a',
          borderRadius: 14, padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
          marginBottom: 24,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: '#fef3c7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#92400e', marginBottom: 2 }}>
              Profil médical incomplet
            </p>
            <p style={{ fontSize: '0.8rem', color: '#b45309' }}>
              Renseignez votre groupe sanguin, allergies et antécédents pour que vos médecins puissent vous soigner en toute sécurité.
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && <Skeleton />}

      {/* Error */}
      {isError && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 14, padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#dc2626' }}>
              Impossible de charger le profil médical
            </p>
            <p style={{ fontSize: '0.8rem', color: '#f87171' }}>
              Vérifiez votre connexion et réessayez.
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <PatientMedicalCard
          patientProfile={patientProfile}
          isNew={isNew}
        />
      )}
    </div>
  );
}
