import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { pharmacistService } from '../../pharmacists/services/pharmacistService';
import { documentService } from '../../../services/documentService';
import { usePharmacistStatus } from '../hooks/usePharmacistStatus';

import Stepper from '../components/Stepper';
import PharmacistForm from '../components/PharmacistForm';
import DocumentUpload from '../components/DocumentUpload';
import StatusCard from '../components/StatusCard';

/* ── Toast ────────────────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
  const isErr = type === 'error';
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 12,
      background: isErr ? '#fef2f2' : '#f0fdf4',
      border: `1.5px solid ${isErr ? '#fca5a5' : '#86efac'}`,
      borderRadius: 14, padding: '14px 18px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      animation: 'slideUp 0.3s ease',
      maxWidth: 360,
    }}>
      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: isErr ? '#fee2e2' : '#dcfce7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isErr
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        }
      </div>
      <p style={{ fontSize: '0.85rem', color: isErr ? '#dc2626' : '#15803d', fontWeight: 500, flex: 1 }}>{message}</p>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}

/* ── Success screen ───────────────────────────────────────────────── */
function SuccessScreen({ onGoToDashboard }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', gap: 24, padding: '40px 20px',
    }}>
      <div style={{
        width: 90, height: 90, borderRadius: '50%',
        background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 30px rgba(46,204,113,0.3)',
        animation: 'popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)',
      }}>
        <style>{`@keyframes popIn { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }`}</style>
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>

      <div>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: 10 }}>
          Demande soumise avec succès !
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.7, maxWidth: 440 }}>
          Votre demande est en cours de validation. Notre équipe administrative examinera vos informations et documents sous <strong>48 à 72 heures ouvrables</strong>. Vous recevrez une notification d'ici peu.
        </p>
      </div>

      <div style={{
        background: 'linear-gradient(135deg,#fffbeb,#fef9c3)',
        border: '1px solid #fde68a', borderRadius: 14,
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14,
        maxWidth: 420,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <p style={{ fontSize: '0.82rem', color: '#92400e', lineHeight: 1.5, textAlign: 'left' }}>
          Votre demande est actuellement <strong>En attente</strong>. Consultez votre tableau de bord pour suivre l'avancement.
        </p>
      </div>

      <button
        id="bp-go-dashboard"
        onClick={onGoToDashboard}
        style={{
          padding: '12px 32px', borderRadius: 12,
          background: 'linear-gradient(135deg,#2ecc71,#16a34a)',
          border: 'none', color: 'white',
          fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '0.95rem',
          cursor: 'pointer', boxShadow: '0 4px 18px rgba(46,204,113,0.4)',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        Retour au tableau de bord
      </button>
    </div>
  );
}

/* ── INITIAL FORM VALUES ─────────────────────────────────────────── */
const INITIAL_FORM = {
  professionalRegistrationNumber: '',
  nationalIdNumber: '', 
  registrationAuthority: '',
  pharmacyName: '', 
  city: '', 
  openingHours: '',
  deliveryAvailable: false,
};

const INITIAL_FILES = { cardFrontImage: null, cardBackImage: null };
const INITIAL_PREVIEWS = { cardFrontImage: null, cardBackImage: null };

/* ── MAIN PAGE ───────────────────────────────────────────────────── */
export default function BecomePharmacistPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { status, isLoading: statusLoading, refetch } = usePharmacistStatus(user?.id);

  const [step, setStep] = useState(0);      // 0=Info, 1=Docs, 2=Confirmation
  const [done, setDone] = useState(false);  // final success screen

  const [form, setForm]       = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});

  const [files, setFiles]     = useState(INITIAL_FILES);
  const [previews, setPreviews] = useState(INITIAL_PREVIEWS);
  const [fileErrors, setFileErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4500); return () => clearTimeout(t); }
  }, [toast]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  /* ── Handle file selection ──────────────────────────────────────── */
  const handleFile = (key, file) => {
    if (!file) {
      setFiles(f => ({ ...f, [key]: null }));
      setPreviews(p => ({ ...p, [key]: null }));
      return;
    }
    setFiles(f => ({ ...f, [key]: file }));
    const reader = new FileReader();
    reader.onload = (e) => setPreviews(p => ({ ...p, [key]: e.target.result }));
    reader.readAsDataURL(file);
    setFileErrors(e => ({ ...e, [key]: undefined }));
  };

  /* ── Step 0 validation ──────────────────────────────────────────── */
  const validateStep0 = () => {
    const errs = {};
    if (!form.professionalRegistrationNumber.trim()) errs.professionalRegistrationNumber = 'Ce champ est requis.';
    if (!form.nationalIdNumber.trim()) errs.nationalIdNumber = 'Ce champ est requis.';
    if (!form.pharmacyName.trim()) errs.pharmacyName = 'Le nom de la pharmacie est requis.';
    if (!form.city.trim()) errs.city = 'La ville est requise.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Step 1 validation ──────────────────────────────────────────── */
  const validateStep1 = () => {
    const errs = {};
    if (!files.cardFrontImage) errs.cardFrontImage = 'Le recto est obligatoire.';
    if (!files.cardBackImage)  errs.cardBackImage  = 'Le verso est obligatoire.';
    setFileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Next step ──────────────────────────────────────────────────── */
  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep(s => s + 1);
  };

  /* ── Submit ─────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Step 1: Upload FRONT document
      const frontRes = await documentService.upload(user?.id, 'PHARMACIST', 'FRONT', files.cardFrontImage);
      const cardFrontImageUrl = frontRes?.data?.url || frontRes?.data?.path || 'uploaded';

      // Step 2: Upload BACK document
      const backRes = await documentService.upload(user?.id, 'PHARMACIST', 'BACK', files.cardBackImage);
      const cardBackImageUrl = backRes?.data?.url || backRes?.data?.path || 'uploaded';

      // Step 3: Send pharmacist profile with document URLs
      await pharmacistService.createProfile({
        userId: user?.id,
        ...form,
        cardFrontImageUrl,
        cardBackImageUrl,
      });

      // Step 4: Verify documents are persisted in backend
      try {
        const verifyRes = await documentService.getDocumentsByUser(user?.id);
        const docs = verifyRes.data?.data || verifyRes.data || [];
        if (docs.length < 2) {
          console.warn('[BecomePharmacist] Not all documents confirmed in DB yet:', docs);
        } else {
          console.log('[BecomePharmacist] All documents saved and verified ✓', docs);
        }
      } catch (verifyErr) {
        // Non-blocking — upload already succeeded
        console.error('[BecomePharmacist] Post-upload verification failed:', verifyErr);
      }

      // Persist status locally so dashboard updates immediately
      localStorage.setItem('MedConnect_pharmacist_status', 'PENDING');

      showToast('Votre demande a été soumise avec succès !');
      setDone(true);
      refetch();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Allow retry if rejected ──────────────────────────────────── */
  const handleRetry = () => {
    setForm(INITIAL_FORM);
    setFiles(INITIAL_FILES);
    setPreviews(INITIAL_PREVIEWS);
    setFormErrors({});
    setFileErrors({});
    setStep(0);
    setDone(false);
    localStorage.removeItem('MedConnect_pharmacist_status');
    refetch();
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', fontFamily: "'DM Sans',sans-serif" }}>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Loading status */}
      {statusLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid #e5e7eb', borderTopColor: '#2ecc71',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {!statusLoading && (
        <>
          {/* ── Header ─────────────────────────────────────── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 13,
                background: 'linear-gradient(135deg,#2ecc71,#16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(46,204,113,0.35)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <div>
                <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: 2 }}>
                  Devenir Pharmacien
                </h1>
                <p style={{ fontSize: '0.88rem', color: '#9ca3af' }}>
                  Rejoignez le réseau MediConnect en tant que pharmacien
                </p>
              </div>
            </div>
          </div>

          {/* ── Status already set (PENDING / VERIFIED) ────── */}
          {(status === 'PENDING' || status === 'VERIFIED') && !done && (
            <StatusCard status={status} />
          )}

          {/* ── Rejected → allow retry ────────────────────── */}
          {status === 'REJECTED' && !done && (
            <>
              <StatusCard status="REJECTED" onRetry={handleRetry} />
            </>
          )}

          {/* ── No application or retry flow ─────────────── */}
          {(!status || status === 'REJECTED') && (
            <>
              {done ? (
                <SuccessScreen onGoToDashboard={() => navigate('/app/dashboard')} />
              ) : (
                <div style={{
                  background: 'white', borderRadius: 20,
                  border: '1px solid #f3f4f6',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  padding: '36px 40px',
                }}>
                  <Stepper current={step} />

                  {/* ── Step 0: Info ──────────────────────── */}
                  {step === 0 && (
                    <>
                      <div style={{ marginBottom: 28 }}>
                        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#111827', marginBottom: 6 }}>
                          Informations professionnelles
                        </h2>
                        <p style={{ fontSize: '0.84rem', color: '#9ca3af' }}>
                          Renseignez vos informations de pharmacie afin que nous puissions vérifier votre profil.
                        </p>
                      </div>
                      <PharmacistForm
                        values={form}
                        onChange={(patch) => setForm(f => ({ ...f, ...patch }))}
                        errors={formErrors}
                      />
                    </>
                  )}

                  {/* ── Step 1: Documents ─────────────────── */}
                  {step === 1 && (
                    <>
                      <div style={{ marginBottom: 28 }}>
                        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#111827', marginBottom: 6 }}>
                          Documents justificatifs
                        </h2>
                        <p style={{ fontSize: '0.84rem', color: '#9ca3af' }}>
                          Téléversez les deux faces de votre carte professionnelle pour vérification.
                        </p>
                      </div>
                      <DocumentUpload
                        files={files}
                        previews={previews}
                        onFile={handleFile}
                        errors={fileErrors}
                      />
                    </>
                  )}

                  {/* ── Step 2: Confirmation ──────────────── */}
                  {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div style={{ marginBottom: 4 }}>
                        <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#111827', marginBottom: 6 }}>
                          Confirmez votre demande
                        </h2>
                        <p style={{ fontSize: '0.84rem', color: '#9ca3af' }}>
                          Vérifiez vos informations avant de soumettre la demande.
                        </p>
                      </div>

                      {/* Summary card */}
                      <div style={{ background: '#f8fafc', borderRadius: 14, padding: '20px 24px', border: '1px solid #f3f4f6' }}>
                        <p style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Récapitulatif
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
                          {[
                            ['Nom Pharmacie',     form.pharmacyName],
                            ['N° inscription',    form.professionalRegistrationNumber],
                            ['CIN / CNIE',        form.nationalIdNumber],
                            ['Autorité',          form.registrationAuthority || '—'],
                            ['Ville',             form.city || '—'],
                            ['Horaires',          form.openingHours || '—'],
                            ['Livraison',         form.deliveryAvailable ? 'Oui' : 'Non'],
                            ['Documents',         [files.cardFrontImage && 'Recto ✓', files.cardBackImage && 'Verso ✓'].filter(Boolean).join(', ')],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 2 }}>{k}</p>
                              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>{v}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Disclaimer */}
                      <div style={{
                        background: 'linear-gradient(135deg,#fff7ed,#ffedd5)',
                        border: '1px solid #fed7aa', borderRadius: 12,
                        padding: '14px 18px', fontSize: '0.82rem', color: '#9a3412', lineHeight: 1.6,
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        En soumettant cette demande, vous certifiez que toutes les informations fournies sont <strong>exactes et véridiques</strong>. Toute fausse déclaration entraîne la suspension immédiate du compte.
                      </div>
                    </div>
                  )}

                  {/* ── Navigation buttons ────────────────── */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, paddingTop: 24, borderTop: '1px solid #f3f4f6' }}>
                    <button
                      id="bp-prev-btn"
                      type="button"
                      onClick={() => setStep(s => s - 1)}
                      disabled={step === 0}
                      style={{
                        padding: '10px 24px', borderRadius: 10,
                        border: '1.5px solid #e5e7eb', background: 'white',
                        color: step === 0 ? '#d1d5db' : '#374151',
                        fontFamily: 'inherit', fontWeight: 600, fontSize: '0.88rem',
                        cursor: step === 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.18s',
                      }}
                    >
                      ← Précédent
                    </button>

                    {step < 2 ? (
                      <button
                        id="bp-next-btn"
                        type="button"
                        onClick={handleNext}
                        style={{
                          padding: '10px 28px', borderRadius: 10,
                          background: 'linear-gradient(135deg,#2ecc71,#16a34a)',
                          border: 'none', color: 'white',
                          fontFamily: 'inherit', fontWeight: 600, fontSize: '0.88rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(46,204,113,0.35)',
                          transition: 'transform 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        Suivant →
                      </button>
                    ) : (
                      <button
                        id="bp-submit-btn"
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{
                          padding: '10px 28px', borderRadius: 10,
                          background: submitting ? '#86efac' : 'linear-gradient(135deg,#2ecc71,#16a34a)',
                          border: 'none', color: 'white',
                          fontFamily: 'inherit', fontWeight: 600, fontSize: '0.88rem',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          boxShadow: submitting ? 'none' : '0 4px 14px rgba(46,204,113,0.35)',
                          display: 'flex', alignItems: 'center', gap: 10,
                          transition: 'all 0.2s',
                        }}
                      >
                        {submitting && (
                          <span style={{
                            display: 'inline-block', width: 16, height: 16,
                            border: '2.5px solid rgba(255,255,255,0.4)',
                            borderTopColor: 'white', borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                          }} />
                        )}
                        {submitting ? 'Envoi en cours…' : 'Soumettre la demande'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
