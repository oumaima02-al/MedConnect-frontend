import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '../hooks/useAuth';

const schema = z.object({
  prenom:    z.string().min(2, 'Minimum 2 caractères'),
  nom:       z.string().min(2, 'Minimum 2 caractères'),
  telephone: z.string().min(8, 'Numéro invalide'),
  email:     z.string().email('Email invalide'),
  password:  z.string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
});

const Field = ({ label, error, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
      {label}
    </label>
    {children}
    {error && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 4 }}>{error}</p>}
  </div>
);

const inputStyle = (hasError) => ({
  width: '100%', padding: '11px 14px',
  border: `1.5px solid ${hasError ? '#fca5a5' : '#e5e7eb'}`,
  borderRadius: 10, fontSize: '0.87rem',
  outline: 'none', background: '#fafafa',
  fontFamily: 'inherit', color: '#111827',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
});

export default function RegisterForm({ onSuccess }) {
  const [showPwd, setShowPwd] = useState(false);
  const { handleRegister, loading, error } = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const result = await handleRegister(data);
    if (result.success) onSuccess?.(data.email);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Global error */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 10, padding: '11px 14px',
          fontSize: '0.83rem', color: '#dc2626',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Prenom + Nom */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Prénom" error={errors.prenom?.message}>
          <input
            {...register('prenom')}
            placeholder="Sara"
            style={inputStyle(!!errors.prenom)}
            onFocus={e => e.target.style.borderColor = '#2ecc71'}
            onBlur={e => e.target.style.borderColor = errors.prenom ? '#fca5a5' : '#e5e7eb'}
          />
        </Field>
        <Field label="Nom" error={errors.nom?.message}>
          <input
            {...register('nom')}
            placeholder="Benali"
            style={inputStyle(!!errors.nom)}
            onFocus={e => e.target.style.borderColor = '#2ecc71'}
            onBlur={e => e.target.style.borderColor = errors.nom ? '#fca5a5' : '#e5e7eb'}
          />
        </Field>
      </div>

      {/* Telephone */}
      <Field label="Téléphone" error={errors.telephone?.message}>
        <input
          {...register('telephone')}
          type="tel"
          placeholder="+212 6 00 00 00 00"
          style={inputStyle(!!errors.telephone)}
          onFocus={e => e.target.style.borderColor = '#2ecc71'}
          onBlur={e => e.target.style.borderColor = errors.telephone ? '#fca5a5' : '#e5e7eb'}
        />
      </Field>

      {/* Email */}
      <Field label="Email" error={errors.email?.message}>
        <input
          {...register('email')}
          type="email"
          placeholder="sara@email.com"
          style={inputStyle(!!errors.email)}
          onFocus={e => e.target.style.borderColor = '#2ecc71'}
          onBlur={e => e.target.style.borderColor = errors.email ? '#fca5a5' : '#e5e7eb'}
        />
      </Field>

      {/* Password */}
      <Field label="Mot de passe" error={errors.password?.message}>
        <div style={{ position: 'relative' }}>
          <input
            {...register('password')}
            type={showPwd ? 'text' : 'password'}
            placeholder="Min. 8 car., 1 majuscule, 1 chiffre"
            style={{ ...inputStyle(!!errors.password), paddingRight: 42 }}
            onFocus={e => e.target.style.borderColor = '#2ecc71'}
            onBlur={e => e.target.style.borderColor = errors.password ? '#fca5a5' : '#e5e7eb'}
          />
          <button type="button" onClick={() => setShowPwd(p => !p)} style={{
            position: 'absolute', right: 12, top: '50%',
            transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {showPwd
                ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
              }
            </svg>
          </button>
        </div>
      </Field>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', padding: '13px',
          background: loading ? '#86efac' : '#2ecc71',
          color: 'white', border: 'none', borderRadius: 50,
          fontSize: '0.93rem', fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 6px 20px rgba(46,204,113,0.35)',
          transition: 'all 0.2s', marginTop: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#27ae60'; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2ecc71'; }}
      >
        {loading && (
          <div style={{
            width: 15, height: 15,
            border: '2px solid rgba(255,255,255,0.4)',
            borderTopColor: 'white', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        )}
        {loading ? 'Inscription...' : 'Créer mon compte'}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
