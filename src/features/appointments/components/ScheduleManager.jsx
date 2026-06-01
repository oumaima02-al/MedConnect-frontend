import { useState, useEffect } from 'react';
import {
  Card, ApptIcon, EmptyState, Skeleton, ErrorBanner, SectionHeader,
  Modal, Field, Input, SubmitBtn, COLORS, fmtDate, SuccessBanner,
} from './ApptShared';
import { useDoctorSchedule } from '../hooks/useAppointments';
import { getAvailableSlots } from '../services/appointmentService';

const DAYS = [
  { value: 'MONDAY',    label: 'Lundi' },
  { value: 'TUESDAY',   label: 'Mardi' },
  { value: 'WEDNESDAY', label: 'Mercredi' },
  { value: 'THURSDAY',  label: 'Jeudi' },
  { value: 'FRIDAY',    label: 'Vendredi' },
  { value: 'SATURDAY',  label: 'Samedi' },
  { value: 'SUNDAY',    label: 'Dimanche' },
];

const DAY_LABELS = Object.fromEntries(DAYS.map(d => [d.value, d.label]));

// ─── Schedule Form ────────────────────────────────────────────
function ScheduleForm({ initial, onSave, loading }) {
  const [form, setForm] = useState({
    workDays: initial?.workDays || [],
    startTime: initial?.startTime || '08:00',
    endTime: initial?.endTime || '17:00',
    lunchStart: initial?.lunchStart || '12:00',
    lunchEnd: initial?.lunchEnd || '13:00',
    appointmentDurationMinutes: initial?.appointmentDurationMinutes || 30,
  });
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        workDays: initial.workDays || [],
        startTime: initial.startTime || '08:00',
        endTime: initial.endTime || '17:00',
        lunchStart: initial.lunchStart || '12:00',
        lunchEnd: initial.lunchEnd || '13:00',
        appointmentDurationMinutes: initial.appointmentDurationMinutes || 30,
      });
    }
  }, [initial]);

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      workDays: f.workDays.includes(day) ? f.workDays.filter(d => d !== day) : [...f.workDays, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (form.workDays.length === 0) { setErr('Sélectionnez au moins un jour de travail.'); return; }
    const dur = parseInt(form.appointmentDurationMinutes);
    if (!dur || dur < 1 || dur > 480) { setErr('La durée doit être entre 1 et 480 minutes.'); return; }
    setSubmitting(true);
    try {
      await onSave({ ...form, appointmentDurationMinutes: dur });
    } catch (e) {
      setErr(e?.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.84rem', color: '#dc2626' }}>{err}</div>}

      <Field label="Jours travaillés" required>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DAYS.map(d => (
            <button key={d.value} type="button" onClick={() => toggleDay(d.value)}
              style={{
                padding: '7px 14px', borderRadius: 20, border: `2px solid ${form.workDays.includes(d.value) ? COLORS.primary : '#e5e7eb'}`,
                background: form.workDays.includes(d.value) ? '#eff6ff' : 'white',
                color: form.workDays.includes(d.value) ? COLORS.primary : '#6b7280',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Début de journée" required>
          <Input id="sched-start" type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} required />
        </Field>
        <Field label="Fin de journée" required>
          <Input id="sched-end" type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} required />
        </Field>
        <Field label="Début pause déjeuner" required>
          <Input id="sched-lunch-start" type="time" value={form.lunchStart} onChange={e => setForm(f => ({ ...f, lunchStart: e.target.value }))} required />
        </Field>
        <Field label="Fin pause déjeuner" required>
          <Input id="sched-lunch-end" type="time" value={form.lunchEnd} onChange={e => setForm(f => ({ ...f, lunchEnd: e.target.value }))} required />
        </Field>
      </div>

      <Field label="Durée d'un RDV (minutes)" required hint="Entre 1 et 480 minutes">
        <Input id="sched-duration" type="number" value={form.appointmentDurationMinutes}
          onChange={e => setForm(f => ({ ...f, appointmentDurationMinutes: e.target.value }))}
          min="1" max="480" required
        />
      </Field>

      <SubmitBtn label={initial ? 'Mettre à jour le planning' : 'Créer le planning'} loading={loading || submitting} icon="schedule" />
    </form>
  );
}

// ─── Vacation Panel ───────────────────────────────────────────
function VacationPanel({ vacations, onAdd, onRemove }) {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const handleAdd = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setErr('Tous les champs sont requis.');
      return;
    }
    setSubmitting(true);
    try {
      await onAdd(form);
      setForm({ startDate: '', endDate: '', reason: '' });
      setAddOpen(false);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Erreur lors de l\'ajout.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <SectionHeader icon="wait" title="Périodes de congé" count={vacations.length} onAdd={() => setAddOpen(true)} addLabel="Ajouter un congé" color="#f59e0b" />

      {vacations.length === 0 ? (
        <EmptyState icon="wait" title="Aucun congé planifié" sub="Ajoutez vos périodes de vacances ou d'indisponibilité." />
      ) : (
        <div style={{ padding: '12px 20px' }}>
          {vacations.map(v => (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <ApptIcon name="calendar" size={14} color="#d97706" />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#92400e' }}>
                    {fmtDate(v.startDate)} → {fmtDate(v.endDate)}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#d97706', margin: 0 }}>{v.reason}</p>
              </div>
              <button id={`remove-vacation-${v.id}`} onClick={() => onRemove(v.id)}
                style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '5px 11px', cursor: 'pointer', fontSize: '0.75rem', color: '#dc2626', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ApptIcon name="trash" size={12} color="#dc2626" />Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Ajouter un congé" icon="wait" width={460}>
        <form onSubmit={handleAdd}>
          {err && <div style={{ color: '#dc2626', fontSize: '0.84rem', marginBottom: 12 }}>{err}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Date de début" required>
              <Input id="vac-start" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} min={today} required />
            </Field>
            <Field label="Date de fin" required>
              <Input id="vac-end" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} min={form.startDate || today} required />
            </Field>
          </div>
          <Field label="Raison" required>
            <Input id="vac-reason" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Ex: Congés annuels" required />
          </Field>
          <SubmitBtn label="Ajouter le congé" loading={submitting} icon="plus" color="#f59e0b" />
        </form>
      </Modal>
    </div>
  );
}

// ─── Available Slots View ─────────────────────────────────────
function AvailableSlotsView({ doctorId }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const fetchSlots = async (d) => {
    setLoading(true);
    setErr('');
    try {
      const res = await getAvailableSlots(doctorId, d);
      setSlots(res.data?.data ?? res.data ?? []);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Erreur de chargement des créneaux');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(date); }, [date]);


  const available = slots.filter(s => s.isAvailable);
  const booked    = slots.filter(s => !s.isAvailable);

  return (
    <div style={{ padding: '20px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none' }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontSize: '0.8rem', color: COLORS.primary, fontWeight: 600 }}>{available.length} disponibles</span>
          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>·</span>
          <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>{booked.length} réservés</span>
        </div>
      </div>

      {loading && <div style={{ color: '#9ca3af', fontSize: '0.84rem' }}>Chargement…</div>}
      {err && <ErrorBanner message={err} />}
      {!loading && !err && slots.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
          {slots.map(s => (
            <div key={s.id} style={{
              padding: '10px 8px', borderRadius: 12, textAlign: 'center',
              background: s.isAvailable ? '#f0fdf4' : '#fef2f2',
              border: `1.5px solid ${s.isAvailable ? '#bbf7d0' : '#fecaca'}`,
            }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: s.isAvailable ? '#16a34a' : '#dc2626' }}>{s.startTime}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: s.isAvailable ? '#4ade80' : '#f87171' }}>{s.isAvailable ? 'Libre' : 'Réservé'}</p>
            </div>
          ))}
        </div>
      )}
      {!loading && !err && slots.length === 0 && (
        <div style={{ textAlign: 'center', padding: 24, color: '#9ca3af', fontSize: '0.84rem' }}>Aucun créneau pour cette date.</div>
      )}
    </div>
  );
}

// ─── Schedule Manager (main) ──────────────────────────────────
export default function ScheduleManager({ doctorId }) {
  const { data: schedule, loading, error, refresh, create, update, addVacation, removeVacation } = useDoctorSchedule(doctorId);
  const [activeTab, setActiveTab] = useState('schedule');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const handleSaveSchedule = async (payload) => {
    setSavingSchedule(true);
    setSaveSuccess(false);
    try {
      if (schedule) await update(payload);
      else await create(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSavingSchedule(false);
    }
  };

  const TABS = [
    { key: 'schedule', label: 'Planning',           icon: 'schedule' },
    { key: 'slots',    label: 'Créneaux du jour',   icon: 'clock'    },
    { key: 'vacation', label: 'Congés',             icon: 'wait'     },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: '#111827', margin: 0 }}>Mon planning</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: 4 }}>Configurez vos horaires de travail, congés et visualisez vos créneaux.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 3, background: '#f1f5f9', borderRadius: 14, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 600, transition: 'all 0.15s',
              background: activeTab === t.key ? 'white' : 'transparent',
              color: activeTab === t.key ? '#111827' : '#6b7280',
              boxShadow: activeTab === t.key ? '0 1px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <ApptIcon name={t.icon} size={15} color={activeTab === t.key ? COLORS.primary : '#9ca3af'} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'schedule' && (
        <Card style={{ maxWidth: 680 }}>
          <SectionHeader icon="schedule" title={schedule ? 'Modifier mon planning' : 'Créer mon planning'} color={COLORS.primary} />
          <div style={{ padding: '24px 24px' }}>
            {loading && <Skeleton rows={4} />}
            {error && <ErrorBanner message={error} onRetry={refresh} />}
            {saveSuccess && <SuccessBanner message="Planning sauvegardé avec succès !" />}
            {!loading && (
              <>
                {schedule && (
                  <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid #f0f4f8' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 8px' }}>Planning actuel</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.82rem', color: '#374151' }}>
                        ⏰ {schedule.startTime} → {schedule.endTime}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#374151' }}>
                        🍽 {schedule.lunchStart} → {schedule.lunchEnd}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#374151' }}>
                        📅 {schedule.appointmentDurationMinutes} min / RDV
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {(schedule.workDays || []).map(d => (
                        <span key={d} style={{ padding: '2px 10px', borderRadius: 12, background: '#eff6ff', color: COLORS.primary, fontSize: '0.75rem', fontWeight: 600 }}>
                          {DAY_LABELS[d] || d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <ScheduleForm initial={schedule} onSave={handleSaveSchedule} loading={savingSchedule} />
              </>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'slots' && (
        <Card style={{ maxWidth: 800 }}>
          <SectionHeader icon="clock" title="Créneaux disponibles" color="#6366f1" />
          <AvailableSlotsView doctorId={doctorId} />
        </Card>
      )}

      {activeTab === 'vacation' && (
        <Card style={{ maxWidth: 700 }}>
          <VacationPanel
            vacations={schedule?.vacationPeriods || []}
            onAdd={addVacation}
            onRemove={removeVacation}
          />
        </Card>
      )}
    </div>
  );
}
