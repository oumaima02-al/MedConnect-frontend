import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateProfile } from '../hooks/useProfile';

const schema = z.object({
  prenom:    z.string().min(2, 'Minimum 2 caractères'),
  nom:       z.string().min(2, 'Minimum 2 caractères'),
  telephone: z.string().min(8, 'Numéro invalide'),
});

const ROLE_LABELS = {
  PATIENT:    { label: 'Patient',    color: '#2ecc71', bg: '#f0fdf4' },
  DOCTOR:     { label: 'Médecin',    color: '#3b82f6', bg: '#eff6ff' },
  PHARMACIST: { label: 'Pharmacie',  color: '#8b5cf6', bg: '#f5f3ff' },
  ADMIN:      { label: 'Admin',      color: '#ef4444', bg: '#fef2f2' },
};

const inputStyle = (hasError) => ({
  width: '100%', padding: '11px 14px',
  border: `1.5px solid ${hasError ? '#fca5a5' : '#e5e7eb'}`,
  borderRadius: 10, fontSize: '0.88rem',
  outline: 'none', background: '#fafafa',
  fontFamily: 'inherit', color: '#111827',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
});

export default function ProfileInfoCard({ profile }) {
  const [editing, setEditing] = useState(false);
  const { updateProfile, isLoading, error, success } = useUpdateProfile();

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      prenom:    profile?.prenom    || '',
      nom:       profile?.nom       || '',
      telephone: profile?.telephone || '',
    },
  });

  // Sync form when profile loads
  useEffect(() => {
    if (profile) reset({ prenom: profile.prenom, nom: profile.nom, telephone: profile.telephone });
  }, [profile, reset]);

  const onSubmit = (data) => {
    updateProfile(data, {
      onSuccess: () => setEditing(false),
    });
  };

  const onCancel = () => {
    reset();
    setEditing(false);
  };

  const role     = profile?.role || 'PATIENT';
  const roleInfo = ROLE_LABELS[role] || ROLE_LABELS.PATIENT;
  const initials = `${profile?.prenom?.[0] || ''}${profile?.nom?.[0] || ''}`.toUpperCase() || 'DA';

  return (
    <div style={{
      background: 'white', borderRadius: 20,
      border: '1px solid #f3f4f6',
      boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    }}>
      {/* Header banner */}
      <div style={{
        height: 100,
        background: 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 60%, #bbf7d0 100%)',
        position: 'relative',
      }} />

      {/* Avatar + role */}
      <div style={{ padding: '0 32px 28px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6ee7b7, #34d399)',
            border: '4px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Sora',sans-serif", fontWeight: 800,
            fontSize: '1.6rem', color: '#065f46',
            marginTop: -40, position: 'relative', zIndex: 1,
          }}>
            {initials}
          </div>

          {/* Edit / Save button */}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'white', border: '1.5px solid #e5e7eb',
                borderRadius: 10, padding: '8px 16px',
                fontSize: '0.85rem', fontWeight: 600, color: '#374151',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2ecc71'; e.currentTarget.style.color = '#2ecc71'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Modifier
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onCancel} style={{
                background: 'white', border: '1.5px solid #e5e7eb',
                borderRadius: 10, padding: '8px 16px',
                fontSize: '0.85rem', fontWeight: 600, color: '#6b7280',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Annuler
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading || !isDirty}
                style={{
                  background: isLoading || !isDirty ? '#86efac' : '#2ecc71',
                  border: 'none', borderRadius: 10, padding: '8px 18px',
                  fontSize: '0.85rem', fontWeight: 600, color: 'white',
                  cursor: isLoading || !isDirty ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {isLoading && (
                  <div style={{
                    width: 13, height: 13,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                )}
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          )}
        </div>

        {/* Name + role badge */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.3rem', fontWeight: 700, color: '#111827' }}>
              {profile?.prenom} {profile?.nom}
            </h2>
            <span style={{
              fontSize: '0.72rem', fontWeight: 600,
              background: roleInfo.bg, color: roleInfo.color,
              padding: '3px 10px', borderRadius: 20,
            }}>
              {roleInfo.label}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{profile?.email}</p>
        </div>

        {/* Success message */}
        {success && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 10, padding: '10px 14px',
            fontSize: '0.83rem', color: '#16a34a',
            display: 'flex', alignItems: 'center', gap: 7,
            marginBottom: 20,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Profil mis à jour avec succès
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 10, padding: '10px 14px',
            fontSize: '0.83rem', color: '#dc2626',
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {/* Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Prenom */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Prénom
            </label>
            {editing ? (
              <>
                <input {...register('prenom')} style={inputStyle(!!errors.prenom)}
                  onFocus={e => e.target.style.borderColor = '#2ecc71'}
                  onBlur={e => e.target.style.borderColor = errors.prenom ? '#fca5a5' : '#e5e7eb'}
                />
                {errors.prenom && <p style={{ fontSize: '0.73rem', color: '#ef4444', marginTop: 3 }}>{errors.prenom.message}</p>}
              </>
            ) : (
              <p style={{ fontSize: '0.92rem', fontWeight: 500, color: '#111827' }}>{profile?.prenom || '—'}</p>
            )}
          </div>

          {/* Nom */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Nom
            </label>
            {editing ? (
              <>
                <input {...register('nom')} style={inputStyle(!!errors.nom)}
                  onFocus={e => e.target.style.borderColor = '#2ecc71'}
                  onBlur={e => e.target.style.borderColor = errors.nom ? '#fca5a5' : '#e5e7eb'}
                />
                {errors.nom && <p style={{ fontSize: '0.73rem', color: '#ef4444', marginTop: 3 }}>{errors.nom.message}</p>}
              </>
            ) : (
              <p style={{ fontSize: '0.92rem', fontWeight: 500, color: '#111827' }}>{profile?.nom || '—'}</p>
            )}
          </div>

          {/* Email — non editable */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ fontSize: '0.92rem', fontWeight: 500, color: '#111827' }}>{profile?.email || '—'}</p>
              {profile?.emailVerified && (
                <span style={{
                  fontSize: '0.68rem', fontWeight: 600,
                  background: '#f0fdf4', color: '#16a34a',
                  padding: '2px 8px', borderRadius: 20,
                }}>
                  Vérifié
                </span>
              )}
            </div>
            {editing && <p style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: 3 }}>L'email ne peut pas être modifié</p>}
          </div>

          {/* Telephone */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Téléphone
            </label>
            {editing ? (
              <>
                <input {...register('telephone')} type="tel" style={inputStyle(!!errors.telephone)}
                  onFocus={e => e.target.style.borderColor = '#2ecc71'}
                  onBlur={e => e.target.style.borderColor = errors.telephone ? '#fca5a5' : '#e5e7eb'}
                />
                {errors.telephone && <p style={{ fontSize: '0.73rem', color: '#ef4444', marginTop: 3 }}>{errors.telephone.message}</p>}
              </>
            ) : (
              <p style={{ fontSize: '0.92rem', fontWeight: 500, color: '#111827' }}>{profile?.telephone || '—'}</p>
            )}
          </div>

          {/* Member since */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Membre depuis
            </label>
            <p style={{ fontSize: '0.92rem', fontWeight: 500, color: '#111827' }}>
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                : '—'}
            </p>
          </div>

          {/* Account status */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Statut du compte
            </label>
            <span style={{
              fontSize: '0.8rem', fontWeight: 600,
              background: profile?.enabled ? '#f0fdf4' : '#fef2f2',
              color: profile?.enabled ? '#16a34a' : '#dc2626',
              padding: '4px 12px', borderRadius: 20,
            }}>
              {profile?.enabled ? 'Actif' : 'Suspendu'}
            </span>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
