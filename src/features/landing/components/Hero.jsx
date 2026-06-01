import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const DOCTOR_IMG = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&q=80&fit=crop&crop=faces';

const FloatCard = ({ style, children, delay = '0s' }) => (
  <div style={{
    position: 'absolute',
    background: 'rgba(255, 255, 255, 0.72)',
    backdropFilter: 'blur(12px)',
    borderRadius: 24,
    padding: '16px 22px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.4)',
    animation: `floatCard 5s ease-in-out infinite`,
    animationDelay: delay,
    border: '1px solid rgba(255,255,255,0.2)',
    zIndex: 10,
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
      maxWidth: 1200,
      margin: '0 auto',
      padding: '60px 52px 100px',
      display: 'grid',
      gridTemplateColumns: '1.05fr 0.95fr',
      gap: '4rem',
      alignItems: 'center',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(30px)',
      transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes blobFloat {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -54%) scale(1.05); }
        }
      `}</style>

      {/* LEFT */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#dcfce7', borderRadius: 50, marginBottom: 24 }}>
           <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ecc71', animation: 'pulseDot 2s infinite' }} />
           <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Disponible 24/7</span>
        </div>
        
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: '4.2rem',
          fontWeight: 800,
          lineHeight: 1.05,
          color: '#111827',
          marginBottom: 24,
          letterSpacing: '-2px',
        }}>
          {t('hero.title.line1')}<br />
          <span style={{ color: '#2ecc71' }}>{t('hero.title.line2')}</span><br />
          {t('hero.title.line3')}
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: '#4b5563',
          lineHeight: 1.7,
          marginBottom: 44,
          maxWidth: 500,
        }}>
          {t('hero.subtitle')}
        </p>

        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#111827',
              color: 'white',
              border: 'none',
              padding: '18px 36px',
              borderRadius: 50,
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)'; }}
          >
            {t('hero.cta.primary')}
          </button>
          
          <button
            style={{
              background: 'white',
              color: '#111827',
              border: '1px solid #e5e7eb',
              padding: '18px 36px',
              borderRadius: 50,
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Découvrir l'app
          </button>
        </div>

        {/* Trusted by */}
        <div style={{ marginTop: 52, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex' }}>
            {['https://i.pravatar.cc/150?u=1','https://i.pravatar.cc/150?u=2','https://i.pravatar.cc/150?u=3','https://i.pravatar.cc/150?u=4'].map((img, i) => (
              <img key={i} src={img} style={{
                width: 44, height: 44, borderRadius: '50%',
                border: '3px solid white',
                marginLeft: i > 0 ? -14 : 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} />
            ))}
          </div>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#111827' }}>
              +25,000 Utilisateurs
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>nous font confiance chaque jour</div>
          </div>
        </div>
      </div>

      {/* RIGHT — Visual */}
      <div style={{ position: 'relative', height: 540, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Blob background */}
        <div style={{
          position: 'absolute',
          width: 460, height: 460,
          borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%',
          background: 'radial-gradient(circle at 30% 30%, #a7f3d0 0%, #6ee7b7 100%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          opacity: 0.6,
          filter: 'blur(40px)',
          animation: 'blobFloat 10s ease-in-out infinite',
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
