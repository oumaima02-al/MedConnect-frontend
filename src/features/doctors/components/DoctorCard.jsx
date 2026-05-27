import { useTranslation } from 'react-i18next';

export default function DoctorCard({ doctor }) {
  const { t } = useTranslation();

  const initials = `${doctor?.prenom?.[0] || ''}${doctor?.nom?.[0] || ''}`.toUpperCase() || 'DR';

  const colors = ['#a7f3d0', '#bfdbfe', '#ddd6fe', '#fde68a', '#fecaca'];
  const textColors = ['#065f46', '#1e40af', '#5b21b6', '#92400e', '#991b1b'];
  const idx = (doctor?.prenom?.charCodeAt(0) || 0) % colors.length;

  return (
    <div style={{
      background: 'white', borderRadius: 18,
      border: '1px solid #f3f4f6',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      padding: '24px',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.10)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
        {/* Avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: colors[idx],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Sora',sans-serif", fontWeight: 800,
          fontSize: '1.1rem', color: textColors[idx],
        }}>
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: '0.95rem', fontWeight: 700,
            color: '#111827', marginBottom: 3,
          }}>
            Dr. {doctor?.prenom} {doctor?.nom}
          </h3>
          {doctor?.specialty && (
            <span style={{
              fontSize: '0.75rem', fontWeight: 600,
              background: 'rgba(46,204,113,0.08)',
              color: '#16a34a',
              padding: '3px 10px', borderRadius: 20,
              border: '1px solid rgba(46,204,113,0.2)',
            }}>
              {doctor.specialty}
            </span>
          )}
        </div>

        {/* Verified badge */}
        {doctor?.verificationStatus === 'VERIFIED' && (
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#f0fdf4', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        )}
      </div>

      {/* Info rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        {(doctor?.clinicName || doctor?.city) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
              {[doctor?.clinicName, doctor?.city].filter(Boolean).join(' · ')}
            </span>
          </div>
        )}
        {doctor?.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span style={{ fontSize: '0.82rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doctor.email}
            </span>
          </div>
        )}
        {doctor?.professionalRegistrationNumber && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
              {t('doctors.license')}: {doctor.professionalRegistrationNumber}
            </span>
          </div>
        )}
      </div>

      {/* CTA */}
      <button style={{
        width: '100%', padding: '10px',
        background: '#2ecc71', color: 'white',
        border: 'none', borderRadius: 50,
        fontSize: '0.85rem', fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: '0 4px 14px rgba(46,204,113,0.3)',
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#27ae60'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#2ecc71'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {t('doctors.book_appt')}
      </button>
    </div>
  );
}
