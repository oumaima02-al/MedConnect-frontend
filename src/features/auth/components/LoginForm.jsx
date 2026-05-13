import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

const EyeIcon = ({ show }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {show
      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    }
  </svg>
);

export default function LoginForm({ onForgot }) {
  const [showPwd, setShowPwd] = useState(false);
  const { handleLogin, loading, error } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => handleLogin(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Global error */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 10, padding: '12px 16px',
          fontSize: '0.85rem', color: '#dc2626',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 7 }}>
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="votre@email.com"
          style={{
            width: '100%', padding: '12px 16px',
            border: `1.5px solid ${errors.email ? '#fca5a5' : '#e5e7eb'}`,
            borderRadius: 12, fontSize: '0.9rem',
            outline: 'none', background: '#fafafa',
            fontFamily: 'inherit', color: '#111827',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = '#2ecc71'}
          onBlur={e => e.target.style.borderColor = errors.email ? '#fca5a5' : '#e5e7eb'}
        />
        {errors.email && (
          <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 5 }}>{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
            Mot de passe
          </label>
          <button type="button" onClick={onForgot} style={{
            background: 'none', border: 'none', fontSize: '0.8rem',
            color: '#2ecc71', cursor: 'pointer', fontWeight: 600,
            fontFamily: 'inherit', padding: 0,
          }}>
            Mot de passe oublié ?
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            {...register('password')}
            type={showPwd ? 'text' : 'password'}
            placeholder="••••••••"
            style={{
              width: '100%', padding: '12px 46px 12px 16px',
              border: `1.5px solid ${errors.password ? '#fca5a5' : '#e5e7eb'}`,
              borderRadius: 12, fontSize: '0.9rem',
              outline: 'none', background: '#fafafa',
              fontFamily: 'inherit', color: '#111827',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#2ecc71'}
            onBlur={e => e.target.style.borderColor = errors.password ? '#fca5a5' : '#e5e7eb'}
          />
          <button
            type="button"
            onClick={() => setShowPwd(p => !p)}
            style={{
              position: 'absolute', right: 14, top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <EyeIcon show={showPwd} />
          </button>
        </div>
        {errors.password && (
          <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 5 }}>{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', padding: '13px',
          background: loading ? '#86efac' : '#2ecc71',
          color: 'white', border: 'none', borderRadius: 50,
          fontSize: '0.95rem', fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 6px 20px rgba(46,204,113,0.35)',
          transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#27ae60'; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2ecc71'; }}
      >
        {loading && (
          <div style={{
            width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
            borderTopColor: 'white', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        )}
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>ou</span>
        <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
      </div>

      {/* Google */}
      <button
        type="button"
        style={{
          width: '100%', padding: '12px',
          background: 'white', border: '1.5px solid #e5e7eb',
          borderRadius: 50, fontSize: '0.9rem',
          fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit', color: '#374151',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: 'border-color 0.2s, background 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continuer avec Google
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}