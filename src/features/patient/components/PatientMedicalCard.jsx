import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePatientProfile, useUpdatePatientProfile } from '../hooks/usePatient';

const schema = z.object({
  bloodType:      z.string().min(1, 'Groupe sanguin requis'),
  medicalHistory: z.string().optional(),
  allergies:      z.array(z.object({ value: z.string().min(1) })).optional(),
});

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const inputStyle = (hasError) => ({
  width: '100%', padding: '11px 14px',
  border: `1.5px solid ${hasError ? '#fca5a5' : '#e5e7eb'}`,
  borderRadius: 10, fontSize: '0.88rem',
  outline: 'none', background: '#fafafa',
  fontFamily: 'inherit', color: '#111827',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
});

export default function PatientMedicalCard({ patientProfile, isNew = false }) {
  const [editing, setEditing] = useState(isNew);

  const createHook = useCreatePatientProfile();
  const updateHook = useUpdatePatientProfile();

  const active   = isNew ? createHook : updateHook;
  const onAction = isNew ? createHook.createPatientProfile : updateHook.updatePatientProfile;

  const { register, handleSubmit, control, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      bloodType:      patientProfile?.bloodType      || '',
      medicalHistory: patientProfile?.medicalHistory || '',
      allergies:      (patientProfile?.allergies || []).map(a => ({ value: a })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'allergies' });

  useEffect(() => {
    if (patientProfile) {
      reset({
        bloodType:      patientProfile.bloodType      || '',
        medicalHistory: patientProfile.medicalHistory || '',
        allergies:      (patientProfile.allergies || []).map(a => ({ value: a })),
      });
    }
  }, [patientProfile, reset]);

  const onSubmit = (data) => {
    const payload = {
      bloodType:      data.bloodType,
      medicalHistory: data.medicalHistory || '',
      allergies:      (data.allergies || []).map(a => a.value).filter(Boolean),
    };
    onAction(payload, {
      onSuccess: () => setEditing(false),
    });
  };

  return (
    <div style={{
      background: 'white', borderRadius: 20,
      border: '1px solid #f3f4f6',
      boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
      padding: '28px 32px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: '#fef2f2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
              Dossier médical
            </h3>
            <p style={{ fontSize: '0.76rem', color: '#9ca3af' }}>
              {isNew ? 'Complétez votre profil médical' : 'Vos informations médicales'}
            </p>
          </div>
        </div>

        {/* Edit / Save */}
        {!isNew && (
          !editing ? (
            <button onClick={() => setEditing(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'white', border: '1.5px solid #e5e7eb',
              borderRadius: 10, padding: '7px 15px',
              fontSize: '0.82rem', fontWeight: 600, color: '#374151',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2ecc71'; e.currentTarget.style.color = '#2ecc71'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Modifier
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { reset(); setEditing(false); }} style={{
                background: 'white', border: '1.5px solid #e5e7eb',
                borderRadius: 10, padding: '7px 14px',
                fontSize: '0.82rem', fontWeight: 600, color: '#6b7280',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Annuler
              </button>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={active.isLoading || (!isDirty && !isNew)}
                style={{
                  background: active.isLoading ? '#86efac' : '#2ecc71',
                  border: 'none', borderRadius: 10, padding: '7px 16px',
                  fontSize: '0.82rem', fontWeight: 600, color: 'white',
                  cursor: active.isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {active.isLoading && (
                  <div style={{
                    width: 12, height: 12,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                )}
                {active.isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          )
        )}
      </div>

      {/* Success */}
      {active.success && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 10, padding: '10px 14px',
          fontSize: '0.83rem', color: '#16a34a',
          display: 'flex', alignItems: 'center', gap: 7, marginBottom: 20,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {isNew ? 'Profil médical créé avec succès !' : 'Dossier médical mis à jour !'}
        </div>
      )}

      {/* Error */}
      {active.error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 10, padding: '10px 14px',
          fontSize: '0.83rem', color: '#dc2626', marginBottom: 20,
        }}>
          {active.error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Blood type */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Groupe sanguin
          </label>
          {editing ? (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {BLOOD_TYPES.map(bt => {
                  const isSelected = false;
                  return (
                    <label key={bt} style={{ cursor: 'pointer' }}>
                      <input {...register('bloodType')} type="radio" value={bt} style={{ display: 'none' }} />
                      <span
                        style={{
                          display: 'inline-block', padding: '7px 18px',
                          border: '1.5px solid #e5e7eb', borderRadius: 10,
                          fontSize: '0.88rem', fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.15s',
                          fontFamily: 'inherit',
                        }}
                        onClick={() => {}}
                      >
                        {bt}
                      </span>
                    </label>
                  );
                })}
              </div>
              {/* Hidden select for react-hook-form */}
              <select {...register('bloodType')} style={{ ...inputStyle(!!errors.bloodType), marginTop: 8 }}>
                <option value="">Choisir un groupe sanguin</option>
                {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
              {errors.bloodType && <p style={{ fontSize: '0.73rem', color: '#ef4444', marginTop: 3 }}>{errors.bloodType.message}</p>}
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontFamily: "'Sora',sans-serif", fontSize: '1.5rem', fontWeight: 800,
                color: '#ef4444',
              }}>
                {patientProfile?.bloodType || '—'}
              </span>
              {patientProfile?.bloodType && (
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600,
                  background: '#fef2f2', color: '#ef4444',
                  padding: '3px 10px', borderRadius: 20,
                }}>
                  Groupe sanguin
                </span>
              )}
            </div>
          )}
        </div>

        {/* Allergies */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Allergies
          </label>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fields.map((field, idx) => (
                <div key={field.id} style={{ display: 'flex', gap: 8 }}>
                  <input
                    {...register(`allergies.${idx}.value`)}
                    placeholder="ex: Pénicilline, Lactose..."
                    style={{ ...inputStyle(false), flex: 1 }}
                    onFocus={e => e.target.style.borderColor = '#2ecc71'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: '#fef2f2', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ value: '' })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: 'rgba(46,204,113,0.06)', border: '1.5px dashed #a7f3d0',
                  borderRadius: 10, padding: '9px 14px',
                  fontSize: '0.83rem', fontWeight: 600, color: '#16a34a',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Ajouter une allergie
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {patientProfile?.allergies?.length > 0
                ? patientProfile.allergies.map((a, i) => (
                  <span key={i} style={{
                    background: '#fef9c3', color: '#92400e',
                    padding: '4px 12px', borderRadius: 20,
                    fontSize: '0.82rem', fontWeight: 600,
                    border: '1px solid #fde68a',
                  }}>
                    {a}
                  </span>
                ))
                : <span style={{ fontSize: '0.88rem', color: '#9ca3af' }}>Aucune allergie connue</span>
              }
            </div>
          )}
        </div>

        {/* Medical history */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Antécédents médicaux
          </label>
          {editing ? (
            <textarea
              {...register('medicalHistory')}
              rows={4}
              placeholder="Décrivez vos antécédents médicaux, maladies chroniques, opérations..."
              style={{
                ...inputStyle(!!errors.medicalHistory),
                resize: 'vertical', lineHeight: 1.6,
              }}
              onFocus={e => e.target.style.borderColor = '#2ecc71'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          ) : (
            <p style={{
              fontSize: '0.88rem', color: patientProfile?.medicalHistory ? '#374151' : '#9ca3af',
              lineHeight: 1.7,
            }}>
              {patientProfile?.medicalHistory || 'Aucun antécédent renseigné'}
            </p>
          )}
        </div>

        {/* If isNew — submit button at bottom */}
        {isNew && (
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={active.isLoading}
            style={{
              width: '100%', padding: '13px',
              background: active.isLoading ? '#86efac' : '#2ecc71',
              color: 'white', border: 'none', borderRadius: 50,
              fontSize: '0.93rem', fontWeight: 600,
              cursor: active.isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 6px 20px rgba(46,204,113,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {active.isLoading && (
              <div style={{
                width: 15, height: 15,
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: 'white', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            )}
            {active.isLoading ? 'Enregistrement...' : 'Compléter mon profil médical'}
          </button>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}