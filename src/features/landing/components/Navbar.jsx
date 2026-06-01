import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const LANGS = ['fr', 'en', 'ar'];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const switchLang = (lang) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 52px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      transition: 'background 0.3s ease',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#2ecc71',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>
          MedConnect
        </span>
      </div>

      {/* Links */}
      <ul style={{ display: 'flex', gap: 36, listStyle: 'none', margin: 0, padding: 0 }}>
        {[
          { key: 'nav.home', href: '#' },
          { key: 'nav.howitworks', href: '#services' },
          { key: 'nav.about', href: '#about' },
        ].map(({ key, href }) => (
          <li key={key}>
            <a href={href} style={{
              textDecoration: 'none', fontSize: '0.88rem',
              fontWeight: 500, color: '#374151', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = '#2ecc71'}
              onMouseLeave={e => e.target.style.color = '#374151'}
            >
              {t(key)}
            </a>
          </li>
        ))}
      </ul>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {LANGS.map(lang => (
            <button key={lang} onClick={() => switchLang(lang)} style={{
              padding: '3px 8px', borderRadius: 6, border: '1px solid',
              borderColor: i18n.language === lang ? '#2ecc71' : 'rgba(46,204,113,0.3)',
              background: i18n.language === lang ? '#2ecc71' : 'transparent',
              color: i18n.language === lang ? 'white' : '#374151',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}>
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
        <button onClick={() => navigate('/login')} style={{
          background: '#2ecc71', color: 'white', border: 'none',
          padding: '10px 24px', borderRadius: 50,
          fontSize: '0.85rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 4px 16px rgba(46,204,113,0.4)',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#27ae60'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#2ecc71'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {t('nav.contact')}
        </button>
      </div>
    </nav>
  );
}
