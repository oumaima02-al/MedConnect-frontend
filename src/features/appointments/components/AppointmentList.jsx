import { useState } from 'react';
import {
  Card, ApptIcon, StatusBadge, TypeBadge, EmptyState, Skeleton, ErrorBanner,
  Modal, Field, Input, Textarea, Select, SubmitBtn, ActionBtn, fmtDate, fmtDateTime,
  SuccessBanner, StarRating, COLORS,
} from './ApptShared';
import { usePatientAppointments, useAvailableSlots, useFeedback, useQueuePosition, useDoctorsList } from '../hooks/useAppointments';

// ─── Book Appointment Modal ───────────────────────────────────
function BookModal({ open, onClose, patientId, onBooked }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ doctorId: '', date: '', slotId: '', type: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const { doctors, loading: docsLoading } = useDoctorsList();
  const { slots,   loading: slotsLoading, fetchSlots } = useAvailableSlots(
    form.doctorId, form.date
  );

  const handleChange = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (key === 'date' && form.doctorId) fetchSlots(form.doctorId, val);
    if (key === 'doctorId' && form.date) fetchSlots(val, form.date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.doctorId || !form.date || !form.slotId || !form.type || !form.reason.trim()) {
      setErr('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const slot = slots.find(s => s.id === form.slotId);
    if (!slot) { setErr('Créneau invalide.'); return; }
    const dateTime = `${form.date}T${slot.startTime}:00`;
    setSubmitting(true);
    try {
      await onBooked({ patientId, doctorId: form.doctorId, dateTime, type: form.type, reason: form.reason });
      setForm({ doctorId: '', date: '', slotId: '', type: '', reason: '' });
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Erreur lors de la prise de rendez-vous.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Prendre un rendez-vous" icon="calendar-plus" width={560}>
      <form onSubmit={handleSubmit}>
        {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.84rem', color: '#dc2626' }}>{err}</div>}

        <Field label="Médecin" required>
          <Select 
            id="book-doctorId" 
            value={form.doctorId} 
            onChange={e => handleChange('doctorId', e.target.value)} 
            placeholder={docsLoading ? "Chargement des médecins..." : "Choisir un médecin..."}
            disabled={docsLoading}
            options={doctors.map(d => ({
              value: d.id,
              label: `Dr. ${d.prenom} ${d.nom} (${d.profile?.specialty || 'Généraliste'})`
            }))}
            required 
          />
        </Field>

        <Field label="Type de consultation" required>
          <Select id="book-type" value={form.type} onChange={e => handleChange('type', e.target.value)}
            placeholder="Choisir un type…"
            options={[
              { value: 'IN_PERSON', label: '🏥 En cabinet' },
              { value: 'VIDEO',     label: '📹 Vidéo' },
              { value: 'PHONE',     label: '📞 Téléphone' },
            ]}
          />
        </Field>

        <Field label="Date souhaitée" required>
          <Input id="book-date" type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} min={today} required />
        </Field>

        {form.doctorId && form.date && (
          <Field label="Créneau horaire" required>
            {slotsLoading
              ? <div style={{ fontSize: '0.84rem', color: '#9ca3af', padding: '8px 0' }}>Chargement des créneaux…</div>
              : slots.length === 0
                ? <div style={{ fontSize: '0.84rem', color: '#ef4444', padding: '8px 0' }}>Aucun créneau disponible pour cette date.</div>
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                    {slots.filter(s => s.isAvailable).map(s => (
                      <button key={s.id} type="button"
                        onClick={() => handleChange('slotId', s.id)}
                        style={{
                          padding: '8px 4px', borderRadius: 10, border: `2px solid ${form.slotId === s.id ? COLORS.primary : '#e5e7eb'}`,
                          background: form.slotId === s.id ? '#eff6ff' : 'white', color: form.slotId === s.id ? COLORS.primary : '#374151',
                          cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s',
                        }}
                      >
                        {s.startTime}
                      </button>
                    ))}
                  </div>
                )
            }
          </Field>
        )}

        <Field label="Motif de la consultation" required>
          <Textarea id="book-reason" value={form.reason} onChange={e => handleChange('reason', e.target.value)} placeholder="Décrivez brièvement la raison de votre consultation…" rows={3} />
        </Field>

        <SubmitBtn label="Confirmer le rendez-vous" loading={submitting} icon="check" />
      </form>
    </Modal>
  );
}

// ─── Reschedule Modal ─────────────────────────────────────────
function RescheduleModal({ open, onClose, appointment, onRescheduled }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ date: '', slotId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const { slots, loading: slotsLoading, fetchSlots } = useAvailableSlots(
    appointment?.doctorId, form.date
  );

  const handleDateChange = (val) => {
    setForm(f => ({ ...f, date: val, slotId: '' }));
    if (appointment?.doctorId) fetchSlots(appointment.doctorId, val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.date || !form.slotId) { setErr('Veuillez choisir une date et un créneau.'); return; }
    const slot = slots.find(s => s.id === form.slotId);
    if (!slot) { setErr('Créneau invalide.'); return; }
    const newDateTime = `${form.date}T${slot.startTime}:00`;
    setSubmitting(true);
    try {
      await onRescheduled(appointment.id, newDateTime);
      setForm({ date: '', slotId: '' });
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Erreur lors du report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Reporter le rendez-vous" icon="edit" width={480}>
      <form onSubmit={handleSubmit}>
        {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.84rem', color: '#dc2626' }}>{err}</div>}

        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '0 0 4px' }}>Rendez-vous actuel</p>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', margin: 0 }}>{appointment?.formattedDateTime}</p>
        </div>

        <Field label="Nouvelle date" required>
          <Input id="reschedule-date" type="date" value={form.date} onChange={e => handleDateChange(e.target.value)} min={today} required />
        </Field>

        {form.date && (
          <Field label="Nouveau créneau" required>
            {slotsLoading
              ? <div style={{ fontSize: '0.84rem', color: '#9ca3af' }}>Chargement…</div>
              : slots.length === 0
                ? <div style={{ fontSize: '0.84rem', color: '#ef4444' }}>Aucun créneau disponible.</div>
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                    {slots.filter(s => s.isAvailable).map(s => (
                      <button key={s.id} type="button"
                        onClick={() => setForm(f => ({ ...f, slotId: s.id }))}
                        style={{
                          padding: '8px 4px', borderRadius: 10, border: `2px solid ${form.slotId === s.id ? COLORS.primary : '#e5e7eb'}`,
                          background: form.slotId === s.id ? '#eff6ff' : 'white', color: form.slotId === s.id ? COLORS.primary : '#374151',
                          cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit',
                        }}
                      >
                        {s.startTime}
                      </button>
                    ))}
                  </div>
                )
            }
          </Field>
        )}

        <SubmitBtn label="Confirmer le report" loading={submitting} icon="calendar" color="#6366f1" />
      </form>
    </Modal>
  );
}

// ─── Cancel Modal ─────────────────────────────────────────────
function CancelModal({ open, onClose, appointment, onCancelled }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCancelled(appointment.id, reason.trim() || undefined);
      setReason('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Annuler le rendez-vous" icon="x-circle" width={440}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 12, background: '#fffbeb', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid #fde68a' }}>
          <ApptIcon name="alert" size={18} color="#d97706" />
          <p style={{ fontSize: '0.84rem', color: '#92400e', margin: 0 }}>
            Vous êtes sur le point d'annuler votre rendez-vous du <strong>{appointment?.formattedDateTime}</strong>.
          </p>
        </div>
        <Field label="Raison de l'annulation (optionnel)">
          <Textarea id="cancel-reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Indiquez la raison de l'annulation…" rows={3} />
        </Field>
        <SubmitBtn label="Confirmer l'annulation" loading={submitting} color="#ef4444" icon="x-circle" />
      </form>
    </Modal>
  );
}

// ─── Feedback Modal ───────────────────────────────────────────
function FeedbackModal({ open, onClose, appointment }) {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const { loading, error, success, submit } = useFeedback();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    await submit(appointment.id, { rating, comments });
    if (!error) {
      setTimeout(() => { setRating(0); setComments(''); onClose(); }, 1500);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Laisser un avis" icon="star" width={440}>
      {success
        ? <SuccessBanner message="Merci pour votre avis ! Il a bien été enregistré." />
        : (
          <form onSubmit={handleSubmit}>
            {error && <div style={{ color: '#dc2626', fontSize: '0.84rem', marginBottom: 12 }}>{error}</div>}
            <Field label="Note globale" required>
              <StarRating value={rating} onChange={setRating} />
              {!rating && <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>Cliquez sur une étoile pour noter</p>}
            </Field>
            <Field label="Commentaire (optionnel)">
              <Textarea id="feedback-comments" value={comments} onChange={e => setComments(e.target.value)} placeholder="Partagez votre expérience…" rows={4} />
            </Field>
            <SubmitBtn label="Envoyer l'avis" loading={loading} icon="star" color="#f59e0b" />
          </form>
        )
      }
    </Modal>
  );
}

// ─── Queue Panel ──────────────────────────────────────────────
function QueuePanel({ appointment, onClose }) {
  const { queue, loading, error, fetchPosition, doCheckIn } = useQueuePosition(appointment?.id);
  const [checkingIn, setCheckingIn] = useState(false);
  const [ciError, setCiError] = useState('');
  const [ciSuccess, setCiSuccess] = useState(false);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setCiError('');
    try {
      await doCheckIn();
      setCiSuccess(true);
    } catch (e) {
      setCiError(e?.response?.data?.message || 'Erreur lors du check-in.');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <Modal open={!!appointment} onClose={onClose} title="File d'attente" icon="queue" width={420}>
      {ciSuccess || queue ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(14,165,233,0.2)' }}>
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.8rem', color: COLORS.primary }}>{queue?.queuePosition ?? '—'}</span>
          </div>
          <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#111827', marginBottom: 6 }}>Position dans la file</p>
          {queue?.estimatedWaitMinutes != null && (
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              <ApptIcon name="clock" size={14} color="#9ca3af" style={{ display: 'inline' }} />
              {' '}Attente estimée : <strong>{queue.estimatedWaitMinutes} min</strong>
            </p>
          )}
          <button onClick={fetchPosition} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, padding: '8px 16px', borderRadius: 10, background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#374151', fontFamily: 'inherit' }}>
            <ApptIcon name="refresh" size={14} color="#6b7280" />Actualiser
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          {loading && <p style={{ color: '#9ca3af' }}>Chargement…</p>}
          {error && !loading && (
            <>
              <p style={{ color: '#6b7280', marginBottom: 20, fontSize: '0.9rem' }}>Vous n'êtes pas encore enregistré dans la file d'attente.</p>
              {ciError && <div style={{ color: '#dc2626', marginBottom: 12, fontSize: '0.84rem' }}>{ciError}</div>}
              <SubmitBtn label="Faire le check-in" loading={checkingIn} icon="check-circle" type="button" onClick={handleCheckIn} />
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

// ─── Appointment Card ─────────────────────────────────────────
function AppointmentCard({ appt, onReschedule, onCancel, onFeedback, onQueue }) {
  const canReschedule = ['SCHEDULED', 'CONFIRMED'].includes(appt.status);
  const canCancel     = ['SCHEDULED', 'CONFIRMED'].includes(appt.status);
  const canFeedback   = appt.status === 'COMPLETED';
  const canQueue      = ['SCHEDULED', 'CONFIRMED'].includes(appt.status);

  return (
    <Card style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 110 }}>
        {/* Color bar */}
        <div style={{ width: 5, background: appt.status === 'CONFIRMED' ? '#10b981' : appt.status === 'CANCELLED' ? '#ef4444' : appt.status === 'COMPLETED' ? '#6b7280' : COLORS.primary, flexShrink: 0, borderRadius: '16px 0 0 16px' }} />

        {/* Main content */}
        <div style={{ flex: 1, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <StatusBadge status={appt.status} />
                <TypeBadge type={appt.type} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <ApptIcon name="calendar" size={15} color="#0ea5e9" />
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{appt.formattedDateTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <ApptIcon name="stethoscope" size={14} color="#9ca3af" />
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>Médecin : <strong>{appt.doctorName || appt.doctorId}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                <ApptIcon name="message" size={14} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: '#6b7280', maxWidth: 380 }}>{appt.reason}</span>
              </div>
              {appt.cancellationReason && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6 }}>
                  <ApptIcon name="x-circle" size={13} color="#ef4444" />
                  <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>Raison d'annulation : {appt.cancellationReason}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
              {canQueue && (
                <button id={`appt-queue-${appt.id}`} onClick={() => onQueue(appt)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 9, background: '#eff6ff', border: '1px solid #bfdbfe', color: COLORS.primary, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit' }}>
                  <ApptIcon name="queue" size={13} color={COLORS.primary} />File d'attente
                </button>
              )}
              {canReschedule && (
                <button id={`appt-reschedule-${appt.id}`} onClick={() => onReschedule(appt)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 9, background: '#faf5ff', border: '1px solid #e9d5ff', color: '#7c3aed', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit' }}>
                  <ApptIcon name="edit" size={13} color="#7c3aed" />Reporter
                </button>
              )}
              {canCancel && (
                <button id={`appt-cancel-${appt.id}`} onClick={() => onCancel(appt)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 9, background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit' }}>
                  <ApptIcon name="x" size={13} color="#ef4444" />Annuler
                </button>
              )}
              {canFeedback && (
                <button id={`appt-feedback-${appt.id}`} onClick={() => onFeedback(appt)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 9, background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit' }}>
                  <ApptIcon name="star" size={13} color="#d97706" />Avis
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Appointment List ─────────────────────────────────────────
export default function AppointmentList({ patientId }) {
  const { data, loading, error, refresh, book, cancel, reschedule } = usePatientAppointments(patientId);

  const [bookOpen, setBookOpen]           = useState(false);
  const [rescheduleAppt, setReschedule]   = useState(null);
  const [cancelAppt, setCancelAppt]       = useState(null);
  const [feedbackAppt, setFeedbackAppt]   = useState(null);
  const [queueAppt, setQueueAppt]         = useState(null);
  const [filter, setFilter]               = useState('ALL');

  const appointments = Array.isArray(data) ? data : [];

  const STATUS_FILTERS = [
    { key: 'ALL',       label: 'Tous' },
    { key: 'SCHEDULED', label: 'Planifiés' },
    { key: 'CONFIRMED', label: 'Confirmés' },
    { key: 'COMPLETED', label: 'Terminés' },
    { key: 'CANCELLED', label: 'Annulés' },
  ];

  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter);
  const sorted   = [...filtered].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: '#111827', margin: 0 }}>
            Mes rendez-vous
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: 4 }}>
            {appointments.length} rendez-vous au total
          </p>
        </div>
        <button id="btn-new-appointment" onClick={() => setBookOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: COLORS.primary, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 4px 14px rgba(14,165,233,0.3)', transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <ApptIcon name="calendar-plus" size={17} color="white" />
          Nouveau rendez-vous
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 16px', borderRadius: 20, border: `1.5px solid ${filter === f.key ? COLORS.primary : '#e5e7eb'}`,
              background: filter === f.key ? '#eff6ff' : 'white', color: filter === f.key ? COLORS.primary : '#6b7280',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            {f.label}
            {f.key !== 'ALL' && (
              <span style={{ marginLeft: 5, fontWeight: 800, color: filter === f.key ? COLORS.primary : '#9ca3af' }}>
                ({appointments.filter(a => a.status === f.key).length})
              </span>
            )}
          </button>
        ))}
        <button onClick={refresh} style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 20, border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#6b7280', fontFamily: 'inherit' }}>
          <ApptIcon name="refresh" size={14} color="#9ca3af" />Actualiser
        </button>
      </div>

      {/* Content */}
      {loading && <Skeleton rows={4} height={110} />}
      {error && !loading && <ErrorBanner message={error} onRetry={refresh} />}
      {!loading && !error && sorted.length === 0 && (
        <EmptyState icon="calendar" title="Aucun rendez-vous" sub="Prenez votre premier rendez-vous dès maintenant." action={() => setBookOpen(true)} actionLabel="Prendre un rendez-vous" />
      )}
      {!loading && !error && sorted.map(a => (
        <AppointmentCard
          key={a.id}
          appt={a}
          onReschedule={setReschedule}
          onCancel={setCancelAppt}
          onFeedback={setFeedbackAppt}
          onQueue={setQueueAppt}
        />
      ))}

      {/* Modals */}
      <BookModal open={bookOpen} onClose={() => setBookOpen(false)} patientId={patientId} onBooked={book} />
      <RescheduleModal open={!!rescheduleAppt} onClose={() => setReschedule(null)} appointment={rescheduleAppt} onRescheduled={reschedule} />
      <CancelModal open={!!cancelAppt} onClose={() => setCancelAppt(null)} appointment={cancelAppt} onCancelled={cancel} />
      {feedbackAppt && <FeedbackModal open={!!feedbackAppt} onClose={() => setFeedbackAppt(null)} appointment={feedbackAppt} />}
      {queueAppt && <QueuePanel appointment={queueAppt} onClose={() => setQueueAppt(null)} />}
    </div>
  );
}
