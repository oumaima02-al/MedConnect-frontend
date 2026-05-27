import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const DOCTOR_IMG = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&q=80&fit=crop&crop=faces';

const FloatCard = ({ style, children, delay = '0s' }) => (
  <div style={{
    position: 'absolute',
    background: 'white',
    borderRadius: 20,
    padding: '14px 18px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    animation: `floatCard 4s ease-in-out infinite`,
    animationDelay: delay,
    ...style,
  }}>
    {children}
  </div>
);

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section style={{
      maxWidth: 1140,
      margin: '0 auto',
      padding: '32px 52px 52px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '3rem',
      alignItems: 'center',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease',
    }}>
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>

      {/* LEFT */}
      <div>
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '3.2rem',
          fontWeight: 800,
          lineHeight: 1.1,
          color: '#111827',
          marginBottom: 20,
          letterSpacing: '-1px',
        }}>
          {t('hero.title.line1')}<br />
          {t('hero.title.line2')}<br />
          <span style={{ color: '#2ecc71' }}>{t('hero.title.line3')}</span>
        </h1>

        <p style={{
          fontSize: '1rem',
          color: '#6b7280',
          lineHeight: 1.75,
          marginBottom: 36,
          maxWidth: 440,
        }}>
          {t('hero.subtitle')}
        </p>

        <button
          onClick={() => navigate('/login')}
          style={{
            background: '#2ecc71',
            color: 'white',
            border: 'none',
            padding: '14px 32px',
            borderRadius: 50,
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 6px 20px rgba(46,204,113,0.45)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#27ae60'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(46,204,113,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#2ecc71'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,204,113,0.45)'; }}
        >
          {t('hero.cta.primary')}
        </button>

        {/* Trusted by */}
        <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex' }}>
            {['#a7f3d0','#6ee7b7','#34d399','#10b981'].map((c, i) => (
              <div key={i} style={{
                width: 36, height: 36, borderRadius: '50%',
                background: c, border: '2.5px solid white',
                marginLeft: i > 0 ? -10 : 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'white',
              }}>
                {['P','M','D','K'][i]}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>
              20K+
            </div>
            <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{t('hero.trusted')}</div>
          </div>
        </div>
      </div>

      {/* RIGHT — Visual */}
      <div style={{ position: 'relative', height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Blob background */}
        <div style={{
          position: 'absolute',
          width: 380, height: 380,
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
          background: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 50%, #bbf7d0 100%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }} />

        {/* Doctor photo */}
        <div style={{
          position: 'relative', zIndex: 1,
          width: 300, height: 380,
          borderRadius: 32,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.12)',
        }}>
          <img
            src={DOCTOR_IMG}
            alt="Doctor"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
          />
        </div>

        {/* Card — Stat 1: Awards */}
        <FloatCard style={{ top: 24, right: -16, zIndex: 2 }} delay="0s">
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>
            490
          </div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500, marginTop: 2 }}>
            {t('hero.card1')}
          </div>
        </FloatCard>

        {/* Card — Stat 2: Patients */}
        <FloatCard style={{ bottom: 80, right: -24, zIndex: 2 }} delay="1.3s">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(46,204,113,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', background: '#2ecc71',
                animation: 'pulseDot 2s infinite',
              }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#111827' }}>
                6 700
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>
                {t('hero.card2')}
              </div>
            </div>
          </div>
        </FloatCard>

        {/* Card — Stat 3: Experience */}
        <FloatCard style={{ bottom: 40, left: -16, zIndex: 2 }} delay="2.6s">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
                22 <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#9ca3af' }}>{t('hero.card3.unit')}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>
                {t('hero.card3.label')}
              </div>
            </div>
          </div>
        </FloatCard>

      </div>
    </section>
  );
}