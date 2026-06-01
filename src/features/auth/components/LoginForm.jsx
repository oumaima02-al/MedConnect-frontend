import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

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

const inputStyle = (hasError) => ({
  width: '100%', padding: '12px 16px',
  border: `1.5px solid ${hasError ? '#fca5a5' : '#e5e7eb'}`,
  borderRadius: 12, fontSize: '0.9rem',
  outline: 'none', background: '#fafafa',
  fontFamily: 'inherit', color: '#111827',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
});

// ─── MFA Step Component ────────────────────────────────────────────────────
function MfaStep({ sessionToken, email, onBack }) {
  const [code,    setCode]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length < 4) { setError('Code invalide'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await authService.verifyLogin({ email, code });
      authService.saveSession(data);
      
      const token = data.token || data.accessToken;
      const normalizedRole = (data.user?.role || data.roles?.[0] || '').replace('ROLE_', '');
      const userObj = data.user || {
        id: data.id || data.userId,
        email: data.email,
        role: normalizedRole,
      };

      login(userObj, token);
      
      const role = normalizedRole.toLowerCase();
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Code incorrect ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #a7f3d0, #6ee7b7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2"/>
            <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
          </svg>
        </div>
        <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#111827', marginBottom: 4 }}>
          Vérification en deux étapes
        </p>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
          Entrez le code envoyé à <strong>{email}</strong>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 10, padding: '10px 14px',
          fontSize: '0.83rem', color: '#dc2626',
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Code input */}
      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 7 }}>
            Code de vérification
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={code}
            onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
            placeholder="123456"
            autoFocus
            style={{
              ...inputStyle(!!error),
              textAlign: 'center',
              fontSize: '1.4rem',
              fontWeight: 700,
              letterSpacing: '0.3em',
            }}
            onFocus={e => e.target.style.borderColor = '#2ecc71'}
            onBlur={e => e.target.style.borderColor = error ? '#fca5a5' : '#e5e7eb'}
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.length < 4}
          style={{
            width: '100%', padding: '13px',
            background: loading || code.length < 4 ? '#86efac' : '#2ecc71',
            color: 'white', border: 'none', borderRadius: 50,
            fontSize: '0.95rem', fontWeight: 600,
            cursor: loading || code.length < 4 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 6px 20px rgba(46,204,113,0.35)',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {loading && (
            <div style={{
              width: 16, height: 16,
              border: '2px solid rgba(255,255,255,0.4)',
              borderTopColor: 'white', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          )}
          {loading ? 'Vérification...' : 'Valider'}
        </button>

        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none', border: 'none',
            color: '#9ca3af', fontSize: '0.82rem',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
          }}
        >
          ← Retour à la connexion
        </button>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Main Login Form ───────────────────────────────────────────────────────
export default function LoginForm({ onForgot }) {
  const [showPwd, setShowPwd] = useState(false);
  // MFA step state
  const [mfaStep,        setMfaStep]        = useState(false);
  const [mfaSessionToken, setMfaSessionToken] = useState('');
  const [mfaEmail,        setMfaEmail]        = useState('');

  const { handleLogin, loading, error, setError } = useLogin();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isVerified = new URLSearchParams(location.search).get('verified') === 'true';

  useEffect(() => {
    // Add Google GSI script if not present
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = initGoogle;
    } else {
      initGoogle();
    }

    function initGoogle() {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1047128362478-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
            callback: handleGoogleCredentialResponse,
          });

          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-btn'),
            { 
              theme: 'outline', 
              size: 'large', 
              shape: 'pill',
              width: '380', 
              text: 'signin_with',
              logo_alignment: 'center'
            }
          );
        } catch (err) {
          console.error('Failed to init Google Sign-In:', err);
        }
      }
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    const idToken = response.credential;
    setError('');
    try {
      const { data } = await authService.googleAuth({ idToken });
      authService.saveSession(data);
      
      const token = data.token || data.accessToken;
      const normalizedRole = (data.user?.role || data.roles?.[0] || '').replace('ROLE_', '');
      const userObj = data.user || {
        id: data.id || data.userId,
        email: data.email,
        role: normalizedRole,
      };

      login(userObj, token);
      
      const role = normalizedRole.toLowerCase();
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Erreur de connexion avec Google';
      setError(msg);
    }
  };

  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const result = await handleLogin(data);
    // If backend requires MFA, switch to MFA step
    if (result?.mfaRequired) {
      setMfaEmail(data.email);
      setMfaSessionToken(result.sessionToken);
      setMfaStep(true);
    }
  };

  // ── MFA step ──
  if (mfaStep) {
    return (
      <MfaStep
        email={mfaEmail}
        sessionToken={mfaSessionToken}
        onBack={() => { setMfaStep(false); setError(''); }}
      />
    );
  }

  // ── Normal login form ──
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
          style={inputStyle(!!errors.email)}
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
            style={{ ...inputStyle(!!errors.password), paddingRight: 46 }}
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
      <div 
        id="google-signin-btn" 
        style={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center',
          minHeight: '44px' 
        }} 
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
