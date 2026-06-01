import { useState } from 'react';
import {
  Card, ApptIcon, StatusBadge, TypeBadge, EmptyState, Skeleton, ErrorBanner,
  Modal, Field, Input, Select, SubmitBtn, SectionHeader, COLORS, fmtDateTime,
} from './ApptShared';
import { useDoctorAppointments } from '../hooks/useAppointments';

// ─── Doctor Appointment Row ───────────────────────────────────
function DoctorApptRow({ appt, onNoShow }) {
  const canNoShow = appt.status === 'CONFIRMED' || appt.status === 'SCHEDULED';

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid #f8fafc', gap: 16, flexWrap: 'wrap' }}>
      {/* DateTime */}
      <div style={{ minWidth: 150 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <ApptIcon name="calendar" size={13} color={COLORS.primary} />
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>
            {new Date(appt.dateTime).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 19 }}>
          <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
            {new Date(appt.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Patient */}
      <div style={{ minWidth: 140 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ApptIcon name="user" size={15} color={COLORS.primary} />
          </div>
          <div>
            <p style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111827', margin: 0 }}>Patient</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{appt.patientId}</p>
          </div>
        </div>
      </div>

      {/* Type */}
      <div style={{ minWidth: 110 }}>
        <TypeBadge type={appt.type} />
      </div>

      {/* Reason */}
      <div style={{ flex: 1, minWidth: 150 }}>
        <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0 }}>{appt.reason}</p>
      </div>

      {/* Status + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <StatusBadge status={appt.status} />
        {canNoShow && (
          <button id={`noshow-${appt.id}`} onClick={() => onNoShow(appt)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit' }}>
            <ApptIcon name="alert" size={12} color="#d97706" />Absent
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Doctor Appointments View ─────────────────────────────────
export default function DoctorAppointments({ doctorId }) {
  const { data, loading, error, refresh, noShow } = useDoctorAppointments(doctorId);
  const [noShowTarget, setNoShowTarget] = useState(null);
  const [filter, setFilter]             = useState('ALL');
  const [dateFilter, setDateFilter]     = useState('');

  const appointments = Array.isArray(data) ? data : [];

  const STATUS_FILTERS = [
    { key: 'ALL',       label: 'Tous' },
    { key: 'SCHEDULED', label: 'Planifiés' },
    { key: 'CONFIRMED', label: 'Confirmés' },
    { key: 'COMPLETED', label: 'Terminés' },
    { key: 'CANCELLED', label: 'Annulés' },
    { key: 'NO_SHOW',   label: 'Absents' },
  ];

  let filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter);
  if (dateFilter) {
    filtered = filtered.filter(a => a.dateTime.startsWith(dateFilter));
  }
  const sorted = [...filtered].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  // Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = appointments.filter(a => a.dateTime.startsWith(todayStr)).length;
  const scheduledCount = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  const handleNoShow = async (appt) => {
    try {
      await noShow(appt.id);
      setNoShowTarget(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: '#111827', margin: 0 }}>Mon agenda</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: 4 }}>Gérez les consultations et plannings de vos patients.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: "Aujourd'hui", value: todayCount, icon: 'calendar', color: COLORS.primary },
          { label: 'À venir', value: scheduledCount, icon: 'clock', color: '#6366f1' },
          { label: 'Terminés', value: completedCount, icon: 'check-circle', color: '#10b981' },
          { label: 'Total', value: appointments.length, icon: 'list', color: '#f59e0b' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ApptIcon name={s.icon} size={20} color={s.color} />
              </div>
              <div>
                <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#111827', margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0 }}>{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
            {STATUS_FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{ padding: '5px 14px', borderRadius: 18, border: `1.5px solid ${filter === f.key ? COLORS.primary : '#e5e7eb'}`, background: filter === f.key ? '#eff6ff' : 'white', color: filter === f.key ? COLORS.primary : '#6b7280', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit' }}>
                {f.label}
              </button>
            ))}
          </div>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: '0.82rem', color: '#374151', fontFamily: 'inherit', outline: 'none' }}
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: '0.78rem', color: '#6b7280', fontFamily: 'inherit' }}>
              Effacer date
            </button>
          )}
          <button onClick={refresh} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 10, background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: '#6b7280', fontFamily: 'inherit' }}>
            <ApptIcon name="refresh" size={13} color="#9ca3af" />Actualiser
          </button>
        </div>
      </Card>

      {/* Appointment list */}
      <Card>
        <SectionHeader icon="list" title="Consultations" count={sorted.length} color={COLORS.primary} />
        {loading && <Skeleton rows={5} height={70} />}
        {error && !loading && <ErrorBanner message={error} onRetry={refresh} />}
        {!loading && !error && sorted.length === 0 && (
          <EmptyState icon="schedule" title="Aucune consultation" sub="Aucun rendez-vous ne correspond à vos filtres." />
        )}
        {!loading && !error && sorted.map(a => (
          <DoctorApptRow key={a.id} appt={a} onNoShow={setNoShowTarget} />
        ))}
      </Card>

      {/* No-show confirm modal */}
      <Modal open={!!noShowTarget} onClose={() => setNoShowTarget(null)} title="Marquer comme absent" icon="alert" width={420}>
        <div style={{ background: '#fffbeb', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid #fde68a' }}>
          <p style={{ fontSize: '0.85rem', color: '#92400e', margin: 0 }}>
            Vous allez marquer le rendez-vous du <strong>{noShowTarget?.formattedDateTime}</strong> comme "patient absent".
          </p>
        </div>
        <SubmitBtn label="Confirmer l'absence" color="#d97706" icon="alert" type="button" onClick={() => handleNoShow(noShowTarget)} />
      </Modal>
    </div>
  );
}
