const STATUS_CONFIG = {
  PENDING: {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
    border: '#fde68a',
    iconBg: '#fef9c3',
    title: 'Demande en cours de validation',
    description:
      'Votre demande a bien été soumise. Notre équipe la examinera dans les plus brefs délais (généralement sous 48–72 h ouvrables). Vous serez notifié par e-mail.',
    badge: { label: '⏳ En attente', color: '#d97706', bg: '#fef3c7' },
  },
  VERIFIED: {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
    border: '#86efac',
    iconBg: '#d1fae5',
    title: 'Compte pharmacien vérifié',
    description:
      'Félicitations ! Votre compte pharmacien a été vérifié. Vous avez maintenant accès aux fonctionnalités dédiées.',
    badge: { label: '✅ Vérifié', color: '#16a34a', bg: '#dcfce7' },
  },
  REJECTED: {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    bg: 'linear-gradient(135deg,#fff7f7,#fee2e2)',
    border: '#fca5a5',
    iconBg: '#fee2e2',
    title: 'Demande refusée',
    description:
      'Votre demande n\'a pas été approuvée. Veuillez vérifier que vos documents sont corrects et conformes, puis soumettez une nouvelle demande.',
    badge: { label: '❌ Refusée', color: '#dc2626', bg: '#fee2e2' },
  },
};

export default function StatusCard({ status, onRetry }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;

  return (
    <div style={{
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 20,
      padding: '32px 28px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', gap: 18,
    }}>
      {/* icon */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: cfg.iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        {cfg.icon}
      </div>

      {/* badge */}
      <span style={{
        padding: '5px 16px', borderRadius: 30,
        background: cfg.badge.bg, color: cfg.badge.color,
        fontSize: '0.8rem', fontWeight: 700,
      }}>
        {cfg.badge.label}
      </span>

      <div>
        <h2 style={{
          fontFamily: "'Sora',sans-serif", fontWeight: 700,
          fontSize: '1.15rem', color: '#111827', marginBottom: 8,
        }}>
          {cfg.title}
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.6, maxWidth: 420 }}>
          {cfg.description}
        </p>
      </div>

      {status === 'REJECTED' && onRetry && (
        <button
          id="bp-retry-btn"
          onClick={onRetry}
          style={{
            marginTop: 8, padding: '11px 28px', borderRadius: 12,
            background: 'linear-gradient(135deg,#2ecc71,#16a34a)',
            border: 'none', color: 'white',
            fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '0.9rem',
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(46,204,113,0.4)',
          }}
        >
          Soumettre une nouvelle demande
        </button>
      )}
    </div>
  );
}
