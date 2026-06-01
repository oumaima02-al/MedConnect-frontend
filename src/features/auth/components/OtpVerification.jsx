import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOtpVerification } from '../hooks/useAuth';

export default function OtpVerification({ email, onBack, onSuccess }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const { handleVerify, handleResend, loading, error, resendCool } = useOtpVerification();

  // Auto-focus first input
  useEffect(() => { inputs.current[0]?.focus(); }, []);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const onSubmit = async () => {
    const code = otp.join('');
    if (code.length === 6) {
      const res = await handleVerify({ email, code });
      if (res?.success) {
        navigate('/login?verified=true');
        onSuccess?.();
      }
    }
  };

  const isComplete = otp.every(d => d !== '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', textAlign: 'center' }}>

      {/* Icon */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(46,204,113,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>

      <div>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          Vérifiez votre email
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.6 }}>
          Un code à 6 chiffres a été envoyé à<br />
          <strong style={{ color: '#111827' }}>{email}</strong>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 10, padding: '10px 16px',
          fontSize: '0.83rem', color: '#dc2626', width: '100%',
          boxSizing: 'border-box',
        }}>
          {error}
        </div>
      )}

      {/* OTP inputs */}
      <div style={{ display: 'flex', gap: 10 }} onPaste={handlePaste}>
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={el => inputs.current[idx] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(e.target.value, idx)}
            onKeyDown={e => handleKeyDown(e, idx)}
            style={{
              width: 46, height: 52,
              textAlign: 'center',
              fontSize: '1.4rem', fontWeight: 700,
              border: `2px solid ${digit ? '#2ecc71' : '#e5e7eb'}`,
              borderRadius: 12,
              background: digit ? 'rgba(46,204,113,0.04)' : '#fafafa',
              outline: 'none',
              color: '#111827',
              fontFamily: "'Sora',sans-serif",
              transition: 'all 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = '#2ecc71'}
            onBlur={e => e.target.style.borderColor = digit ? '#2ecc71' : '#e5e7eb'}
          />
        ))}
      </div>

      {/* Verify button */}
      <button
        onClick={onSubmit}
        disabled={!isComplete || loading}
        style={{
          width: '100%', padding: '13px',
          background: isComplete && !loading ? '#2ecc71' : '#d1fae5',
          color: isComplete && !loading ? 'white' : '#6b7280',
          border: 'none', borderRadius: 50,
          fontSize: '0.93rem', fontWeight: 600,
          cursor: isComplete && !loading ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
          boxShadow: isComplete ? '0 6px 20px rgba(46,204,113,0.35)' : 'none',
          transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {loading && (
          <div style={{
            width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)',
            borderTopColor: 'white', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        )}
        {loading ? 'Vérification...' : 'Vérifier le code'}
      </button>

      {/* Resend */}
      <p style={{ fontSize: '0.83rem', color: '#9ca3af' }}>
        Vous n'avez pas reçu le code ?{' '}
        <button
          type="button"
          onClick={() => handleResend({ email })}
          disabled={resendCool > 0}
          style={{
            background: 'none', border: 'none', padding: 0,
            color: resendCool > 0 ? '#9ca3af' : '#2ecc71',
            fontWeight: 600, cursor: resendCool > 0 ? 'default' : 'pointer',
            fontSize: '0.83rem', fontFamily: 'inherit',
          }}
        >
          {resendCool > 0 ? `Renvoyer (${resendCool}s)` : 'Renvoyer'}
        </button>
      </p>

      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.83rem', color: '#6b7280', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 5,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Retour
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
