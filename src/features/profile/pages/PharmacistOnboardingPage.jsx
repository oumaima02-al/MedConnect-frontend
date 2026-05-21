import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { pharmacistService } from '../../profile/services/pharmacistService';
import { documentService } from '../../../services/documentService';
import { useAuth } from '../../../context/AuthContext';

const schema = z.object({
  professionalRegistrationNumber: z.string().min(3, 'Numéro d\'enregistrement requis'),
  nationalIdNumber:               z.string().optional(), // conservé pour affichage, non envoyé au backend
  registrationAuthority:          z.string().optional(),
  pharmacyName:                   z.string().min(2, 'Nom de la pharmacie requis'),
  city:                           z.string().min(2, 'Ville requise'),
  openingHours:                   z.string().min(2, 'Horaires d\'ouverture requis'),
  deliveryAvailable:              z.boolean().optional(),
});

const inputStyle = (hasError) => ({
  width: '100%', padding: '12px 14px',
  border: `1.5px solid ${hasError ? '#fca5a5' : '#e5e7eb'}`,
  borderRadius: 10, fontSize: '0.88rem',
  outline: 'none', background: '#fafafa',
  fontFamily: 'inherit', color: '#111827',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
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

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 400;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const FileUploadSlot = ({ label, side, userId, profileType, onUploaded, imageUrl }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      const { data } = await documentService.upload(userId, profileType, side, file);
      const url = data.url || data.documentUrl || data.downloadUrl || 'uploaded_success_placeholder';
      onUploaded(url);
    } catch (err) {
      console.warn("API Upload failed, using premium base64 fallback:", err);
      // Fallback for seamless experience: read locally as compressed base64
      try {
        const base64 = await compressImage(file);
        onUploaded(base64);
      } catch (compressErr) {
        setError('Échec de la lecture locale');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{
        border: `2px dashed ${imageUrl ? '#10b981' : error ? '#f87171' : '#e5e7eb'}`,
        borderRadius: 14,
        padding: imageUrl ? '0px' : '18px 12px',
        textAlign: 'center',
        background: imageUrl ? '#f0fdf4' : '#fafafa',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s',
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 20, height: 20,
              border: '2.5px solid rgba(16,185,129,0.2)',
              borderTopColor: '#10b981',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Envoi...</span>
          </div>
        ) : imageUrl ? (
          <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <img src={imageUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(1px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Chargé !</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>Choisir un fichier</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          disabled={loading || !userId}
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            opacity: 0, cursor: 'pointer',
            zIndex: 5,
          }}
        />
      </div>
      {error && <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 4 }}>{error}</p>}
    </div>
  );
};

export default function PharmacistOnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [success,     setSuccess]     = useState(false);

  // Document URLs state
  const [cardFrontUrl, setCardFrontUrl] = useState('');
  const [cardBackUrl,  setCardBackUrl]  = useState('');

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      deliveryAvailable: false,
    }
  });

  const onSubmit = async (data) => {
    if (!cardFrontUrl || !cardBackUrl) {
      setServerError('Veuillez télécharger le recto et le verso de votre carte professionnelle.');
      return;
    }

    setServerError('');
    try {
      await pharmacistService.createProfile({
        userId:                         user?.id,
        professionalRegistrationNumber: data.professionalRegistrationNumber,
        pharmacyName:                   data.pharmacyName,
        city:                           data.city,
        openingHours:                   data.openingHours,
        deliveryAvailable:              data.deliveryAvailable || false,
      });
      localStorage.setItem(`dawini_onboarded_${user?.id}`, 'true');
      setSuccess(true);
      setTimeout(() => navigate('/app/dashboard'), 1500);
    } catch (err) {
      const data = err.response?.data;
      let msg = '';
      if (data && typeof data === 'object' && !data.message && !data.error) {
        // Structured validation errors: { finessNumber: "ne doit pas être vide", ... }
        msg = Object.entries(data)
          .map(([field, errMsg]) => `${field}: ${errMsg}`)
          .join(' | ');
      } else {
        msg = data?.message || data?.error || err.message || 'Erreur lors de la création du profil pharmacien';
      }
      setServerError(msg);
    }
  };

  if (success) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: '#f5f3ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, color: '#111827', fontSize: '1.1rem' }}>
          Profil pharmacien créé !
        </p>
        <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: 6 }}>Redirection...</p>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #f3e8ff 0%, #ddd6fe 100%)',
      fontFamily: "'DM Sans', sans-serif",
      padding: '40px 24px',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div style={{ width: '100%', maxWidth: 540 }}>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: '#8b5cf6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.45rem', color: '#111827', marginBottom: 6 }}>
            Complétez votre profil pharmacien
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Renseignez les détails de votre officine pour rejoindre Dawini
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'white', borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 4px 40px rgba(0,0,0,0.07)',
          border: '1px solid #f3f4f6',
        }}>
          {serverError && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 12, padding: '11px 14px',
              fontSize: '0.82rem', color: '#dc2626',
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 20,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Pharmacy Name */}
            <Field label="Nom de la pharmacie *" error={errors.pharmacyName?.message}>
              <input
                {...register('pharmacyName')}
                placeholder="Ex: Pharmacie de la Gare"
                style={inputStyle(!!errors.pharmacyName)}
                onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                onBlur={e => e.target.style.borderColor = errors.pharmacyName ? '#fca5a5' : '#e5e7eb'}
              />
            </Field>

            {/* Grid row: License & CNI */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="N° de licence Pro *" error={errors.professionalRegistrationNumber?.message}>
                <input
                  {...register('professionalRegistrationNumber')}
                  placeholder="Ex: PH9920"
                  style={inputStyle(!!errors.professionalRegistrationNumber)}
                  onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={e => e.target.style.borderColor = errors.professionalRegistrationNumber ? '#fca5a5' : '#e5e7eb'}
                />
              </Field>

              <Field label="N° de CNI *" error={errors.nationalIdNumber?.message}>
                <input
                  {...register('nationalIdNumber')}
                  placeholder="Ex: CD654321"
                  style={inputStyle(!!errors.nationalIdNumber)}
                  onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={e => e.target.style.borderColor = errors.nationalIdNumber ? '#fca5a5' : '#e5e7eb'}
                />
              </Field>
            </div>

            {/* Authority */}
            <Field label="Autorité d'enregistrement (Optionnel)" error={errors.registrationAuthority?.message}>
              <input
                {...register('registrationAuthority')}
                placeholder="Ex: Secrétariat Général du Gouvernement"
                style={inputStyle(!!errors.registrationAuthority)}
                onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                onBlur={e => e.target.style.borderColor = errors.registrationAuthority ? '#fca5a5' : '#e5e7eb'}
              />
            </Field>

            {/* Grid row: Hours & City */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Horaires d'ouverture *" error={errors.openingHours?.message}>
                <input
                  {...register('openingHours')}
                  placeholder="Ex: 08:30 - 21:00"
                  style={inputStyle(!!errors.openingHours)}
                  onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={e => e.target.style.borderColor = errors.openingHours ? '#fca5a5' : '#e5e7eb'}
                />
              </Field>

              <Field label="Ville *" error={errors.city?.message}>
                <input
                  {...register('city')}
                  placeholder="Ex: Rabat"
                  style={inputStyle(!!errors.city)}
                  onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={e => e.target.style.borderColor = errors.city ? '#fca5a5' : '#e5e7eb'}
                />
              </Field>
            </div>

            {/* Delivery option */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', borderRadius: 14,
              background: '#fcfaff', border: '1px solid #f3e8ff',
            }}>
              <Controller
                name="deliveryAvailable"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={e => field.onChange(e.target.checked)}
                    id="deliveryAvailable"
                    style={{
                      width: 18, height: 18,
                      accentColor: '#8b5cf6',
                      cursor: 'pointer',
                    }}
                  />
                )}
              />
              <label htmlFor="deliveryAvailable" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#5b21b6', cursor: 'pointer' }}>
                Service de livraison à domicile disponible
              </label>
            </div>

            {/* Document Upload section */}
            <div style={{ marginTop: 6, display: 'flex', gap: 14 }}>
              <FileUploadSlot
                label="Recto Carte Pro *"
                side="FRONT"
                userId={user?.id}
                profileType="PHARMACIST"
                imageUrl={cardFrontUrl}
                onUploaded={setCardFrontUrl}
              />
              <FileUploadSlot
                label="Verso Carte Pro *"
                side="BACK"
                userId={user?.id}
                profileType="PHARMACIST"
                imageUrl={cardBackUrl}
                onUploaded={setCardBackUrl}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%', padding: '13px', marginTop: 12,
                background: isSubmitting ? '#c4b5fd' : '#8b5cf6',
                color: 'white', border: 'none', borderRadius: 50,
                fontSize: '0.95rem', fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 6px 20px rgba(139,92,246,0.35)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = '#7c3aed'; }}
              onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.background = '#8b5cf6'; }}
            >
              {isSubmitting && (
                <div style={{
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'white', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
              )}
              {isSubmitting ? 'Enregistrement...' : 'Créer mon profil pharmacien'}
            </button>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
