import { useProfile } from '../hooks/useProfile';
import ProfileInfoCard     from '../components/ProfileInfoCard';
import ProfileSecurityCard from '../components/ProfileSecurityCard';

const Skeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    {[200, 140].map((h, i) => (
      <div key={i} style={{
        height: h, borderRadius: 20,
        background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }} />
    ))}
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
  </div>
);

export default function ProfilePage() {
  const { profile, isLoading, isError } = useProfile();

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "'Sora',sans-serif",
          fontSize: '1.5rem', fontWeight: 700,
          color: '#111827', marginBottom: 4,
        }}>
          Mon profil
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
          Gérez vos informations personnelles et la sécurité de votre compte.
        </p>
      </div>

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
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#dc2626' }}>Impossible de charger le profil</p>
            <p style={{ fontSize: '0.8rem', color: '#f87171' }}>Vérifiez votre connexion et réessayez.</p>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && profile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ProfileInfoCard     profile={profile} />
          <ProfileSecurityCard />
        </div>
      )}
    </div>
  );
}