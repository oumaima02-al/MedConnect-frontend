import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────
   STATS BAR
───────────────────────────────────────── */
export function StatsBar() {
  const { t } = useTranslation();

  const stats = [
    { val: '50%',  suffix: '', key: 'stats.winrate' },
    { val: '20K',  suffix: '+', key: 'stats.patients' },
    { val: '95',   suffix: '%', key: 'stats.satisfaction' },
    { val: '$45B', suffix: '', key: 'stats.funding' },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: 0,
      maxWidth: 900,
      margin: '0 auto 60px',
      padding: '0 52px',
    }}>
      {stats.map((s, i) => (
        <div key={s.key} style={{
          flex: 1, textAlign: 'center', padding: '28px 20px',
          background: 'white',
          borderRadius: i === 0 ? '20px 0 0 20px' : i === stats.length - 1 ? '0 20px 20px 0' : 0,
          borderRight: i < stats.length - 1 ? '1px solid #f3f4f6' : 'none',
          boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s',
          cursor: 'default',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '2rem', fontWeight: 800, color: '#111827',
          }}>
            {s.val}<span style={{ color: '#2ecc71' }}>{s.suffix}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 5, fontWeight: 500 }}>
            {t(s.key)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   HOW IT WORKS (Services)
───────────────────────────────────────── */
export function Services() {
  const { t } = useTranslation();

  const items = [
    {
      titleKey: 'services.records.title',
      descKey:  'services.records.desc',
      color:    '#dbeafe',
      iconColor:'#3b82f6',
      icon: (c) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    },
    {
      titleKey: 'services.prescriptions.title',
      descKey:  'services.prescriptions.desc',
      color:    '#dcfce7',
      iconColor:'#2ecc71',
      icon: (c) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
        </svg>
      ),
    },
    {
      titleKey: 'services.appointments.title',
      descKey:  'services.appointments.desc',
      color:    '#e0e7ff',
      iconColor:'#6366f1',
      icon: (c) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
  ];

  return (
    <section id="services" style={{ padding: '20px 52px 60px', maxWidth: 1140, margin: '0 auto' }}>
      {/* Section heading */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '3rem', fontWeight: 800,
          color: '#111827', lineHeight: 1.1,
          letterSpacing: '-1px',
        }}>
          <span style={{ fontStyle: 'italic', color: '#2ecc71' }}>{t('services.heading.better')}</span>{' '}
          {t('services.heading.rest')}
        </h2>
      </div>

      {/* 3 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {items.map(({ titleKey, descKey, color, iconColor, icon }) => (
          <div key={titleKey} style={{
            background: 'white',
            borderRadius: 24,
            padding: '32px 28px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
            border: '1px solid #f9fafb',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.05)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {icon(iconColor)}
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#111827',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                </svg>
              </div>
            </div>
            <h3 style={{
              fontFamily: "'Sora',sans-serif", fontSize: '1rem',
              fontWeight: 700, color: '#111827', marginBottom: 10,
            }}>
              {t(titleKey)}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.7 }}>
              {t(descKey)}
            </p>
          </div>
        ))}
      </div>

      {/* Extra 3 services row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 20 }}>
        {[
          { titleKey: 'services.tracking.title',   descKey: 'services.tracking.desc',   color: '#fef9c3', iconColor: '#eab308' },
          { titleKey: 'services.teleconsult.title', descKey: 'services.teleconsult.desc', color: '#fce7f3', iconColor: '#ec4899' },
          { titleKey: 'services.messaging.title',  descKey: 'services.messaging.desc',  color: '#ffedd5', iconColor: '#f97316' },
        ].map(({ titleKey, descKey, color, iconColor }) => (
          <div key={titleKey} style={{
            background: 'white', borderRadius: 24, padding: '28px 24px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)', border: '1px solid #f9fafb',
            transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.05)'; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              {t(titleKey)}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.7 }}>
              {t(descKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   ABOUT
───────────────────────────────────────── */
const DOCTOR2_IMG = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&q=80&fit=crop&crop=faces';

export function About() {
  const { t } = useTranslation();

  return (
    <section id="about" style={{ background: 'white', padding: '60px 52px', margin: '0 0 8px' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '5rem', maxWidth: 1140, margin: '0 auto', alignItems: 'center',
      }}>
        {/* Left */}
        <div>
          <h2 style={{
            fontFamily: "'Sora',sans-serif", fontSize: '2.4rem',
            fontWeight: 800, color: '#111827', lineHeight: 1.15,
            letterSpacing: '-0.5px', marginBottom: 20,
          }}>
            {t('about.title')}
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#6b7280', lineHeight: 1.8, marginBottom: 16 }}>
            {t('about.desc1')}
          </p>
          <p style={{ fontSize: '0.92rem', color: '#6b7280', lineHeight: 1.8, marginBottom: 32 }}>
            {t('about.desc2')}
          </p>
          <button style={{
            background: '#2ecc71', color: 'white', border: 'none',
            padding: '13px 30px', borderRadius: 50,
            fontSize: '0.9rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 6px 20px rgba(46,204,113,0.4)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#27ae60'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2ecc71'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {t('about.cta')}
          </button>
        </div>

        {/* Right — doctor photo + profile cards */}
        <div style={{ position: 'relative', height: 420 }}>
          {/* Blob */}
          <div style={{
            position: 'absolute', top: 10, right: 0,
            width: 320, height: 380,
            borderRadius: '50% 50% 45% 55% / 55% 45% 55% 45%',
            background: 'linear-gradient(135deg, #bbf7d0, #6ee7b7)',
            zIndex: 0,
          }} />
          {/* Photo */}
          <div style={{
            position: 'absolute', top: 20, right: 10,
            width: 280, height: 360,
            borderRadius: 28, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            zIndex: 1,
          }}>
            <img src={DOCTOR2_IMG} alt="Medical professional" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
          </div>
          {/* Profile cards */}
          {[
            { name: 'Dr. Sara Benali', role: t('roles.doctor.name'), top: 30, left: -20 },
            { name: 'Karim Alaoui',    role: t('roles.patient.name'), top: 160, left: -30 },
            { name: 'Pharmavie',       role: t('roles.pharmacy.name'), bottom: 40, left: -10 },
          ].map((p, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: p.top, bottom: p.bottom, left: p.left,
              background: 'white', borderRadius: 14,
              padding: '10px 16px',
              boxShadow: '0 8px 28px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', gap: 10,
              zIndex: 2,
              animation: `floatCard 4s ease-in-out infinite`,
              animationDelay: `${i * 1.3}s`,
              minWidth: 170,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: `hsl(${140 + i * 40}, 60%, 85%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 12,
                color: `hsl(${140 + i * 40}, 60%, 35%)`,
                flexShrink: 0,
              }}>
                {p.name.split(' ').map(w => w[0]).join('').slice(0,2)}
              </div>
              <div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>{p.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{p.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
export function Footer() {
  const { t } = useTranslation();
  return (
    <footer style={{ background: '#111827', padding: '32px 52px' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', maxWidth: 1140, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#2ecc71',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1rem', color: 'white' }}>Dawini</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{t('footer.copy')}</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['footer.privacy','footer.contact'].map(k => (
            <a key={k} href="#" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#2ecc71'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
            >
              {t(k)}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}