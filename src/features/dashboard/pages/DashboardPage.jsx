import { useAuth } from '../../../context/AuthContext';
import { Icon } from '../../../components/layout/AppLayout';

/* ── Reusable stat card ────────────────────────── */
const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{
    background: 'white', borderRadius: 18, padding: '22px 24px',
    border: '1px solid #f3f4f6',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
  }}>
    <div>
      <p style={{ fontSize: '0.82rem', color: '#9ca3af', fontWeight: 500, marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.9rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 6 }}>{sub}</p>}
    </div>
    <div style={{
      width: 44, height: 44, borderRadius: 13,
      background: color + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon name={icon} size={20} color={color} />
    </div>
  </div>
);

/* ── Activity item ─────────────────────────────── */
const ActivityItem = ({ initials, name, detail, time, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #f9fafb' }}>
    <div style={{
      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
      background: color + '22',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 12,
      color: color,
    }}>
      {initials}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827', marginBottom: 2 }}>{name}</p>
      <p style={{ fontSize: '0.78rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{detail}</p>
    </div>
    <span style={{ fontSize: '0.75rem', color: '#9ca3af', flexShrink: 0 }}>{time}</span>
  </div>
);

/* ── Appointment row ───────────────────────────── */
const ApptRow = ({ name, time, type, status }) => {
  const statusColor = { confirmed: '#2ecc71', pending: '#f59e0b', cancelled: '#ef4444' }[status] || '#9ca3af';
  const statusLabel = { confirmed: 'Confirmé', pending: 'En attente', cancelled: 'Annulé' }[status] || status;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: '1px solid #f9fafb' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #a7f3d0, #6ee7b7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 11, color: '#065f46',
      }}>
        {name.split(' ').map(w => w[0]).join('').slice(0, 2)}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.87rem', fontWeight: 600, color: '#111827' }}>{name}</p>
        <p style={{ fontSize: '0.76rem', color: '#9ca3af' }}>{type}</p>
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{time}</span>
      <span style={{
        fontSize: '0.72rem', fontWeight: 600,
        background: statusColor + '18', color: statusColor,
        padding: '3px 10px', borderRadius: 20,
      }}>
        {statusLabel}
      </span>
    </div>
  );
};

/* ── PATIENT DASHBOARD ─────────────────────────── */
function PatientDashboard({ user }) {
  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: 4 }}>
          Bonjour, {user?.prenom}
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Voici un aperçu de votre santé aujourd'hui.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Prochain RDV"      value="Lun 19"   sub="Dr. Alami — 10h00"    color="#2ecc71" icon="calendar" />
        <StatCard label="Ordonnances"        value="2"        sub="1 à renouveler"        color="#3b82f6" icon="pill"     />
        <StatCard label="Dossier médical"    value="Complet"  sub="Mis à jour il y a 3j"  color="#8b5cf6" icon="file"    />
        <StatCard label="Messages"           value="3"        sub="Non lus"               color="#f59e0b" icon="message" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upcoming appointments */}
        <div style={{ background: 'white', borderRadius: 18, padding: '22px 24px', border: '1px solid #f3f4f6', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
              Prochains rendez-vous
            </h3>
            <button style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: '#2ecc71', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Voir tout
            </button>
          </div>
          <ApptRow name="Dr. Karim Alami"    time="Lun 10:00" type="Consultation générale" status="confirmed" />
          <ApptRow name="Dr. Sara Benali"    time="Mer 14:30" type="Cardiologie"           status="pending"   />
          <ApptRow name="Dr. Omar Idrissi"   time="Ven 09:00" type="Radiologie"            status="confirmed" />
        </div>

        {/* Recent activity */}
        <div style={{ background: 'white', borderRadius: 18, padding: '22px 24px', border: '1px solid #f3f4f6', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 16 }}>
            Activité récente
          </h3>
          <ActivityItem initials="KA" name="Dr. Karim Alami"  detail="Ordonnance émise — Amoxicilline 500mg" time="Aujourd'hui"  color="#2ecc71" />
          <ActivityItem initials="SB" name="Dr. Sara Benali"  detail="Résultats analyses disponibles"         time="Hier"         color="#3b82f6" />
          <ActivityItem initials="PH" name="Pharmavie"        detail="Médicaments prêts à retirer"            time="Il y a 2j"    color="#8b5cf6" />
        </div>
      </div>
    </>
  );
}

/* ── DOCTOR DASHBOARD ──────────────────────────── */
function DoctorDashboard({ user }) {
  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: 4 }}>
          Bonjour, Dr. {user?.prenom} {user?.nom}
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Vous avez 8 consultations aujourd'hui.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Patients aujourd'hui" value="8"    sub="2 en attente"        color="#2ecc71" icon="users"    />
        <StatCard label="RDV confirmés"         value="6"    sub="sur 8 total"         color="#3b82f6" icon="calendar" />
        <StatCard label="Prescriptions émises"  value="12"   sub="Cette semaine"       color="#8b5cf6" icon="pill"     />
        <StatCard label="Messages"              value="5"    sub="Non lus"             color="#f59e0b" icon="message"  />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Today's schedule */}
        <div style={{ background: 'white', borderRadius: 18, padding: '22px 24px', border: '1px solid #f3f4f6', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Planning du jour</h3>
            <button style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: '#2ecc71', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Voir planning</button>
          </div>
          <ApptRow name="Yasmine Alaoui"  time="09:00" type="Consultation"         status="confirmed" />
          <ApptRow name="Mehdi Cherkaoui" time="10:00" type="Suivi post-opératoire" status="confirmed" />
          <ApptRow name="Fatima Zohra"    time="11:30" type="Renouvellement ordo."  status="pending"   />
          <ApptRow name="Karim Bennis"    time="14:00" type="Téléconsultation"      status="confirmed" />
          <ApptRow name="Sara El Idrissi" time="15:30" type="Première consultation" status="pending"   />
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Nouvelle prescription',   icon: 'pill',     color: '#2ecc71', bg: '#f0fdf4' },
            { label: 'Voir mes patients',        icon: 'users',    color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Messages patients',        icon: 'message',  color: '#8b5cf6', bg: '#f5f3ff' },
          ].map(({ label, icon, color, bg }) => (
            <button key={label} style={{
              background: bg, border: `1.5px solid ${color}22`,
              borderRadius: 14, padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              transition: 'transform 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: color + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name={icon} size={19} color={color} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>{label}</span>
              <svg style={{ marginLeft: 'auto' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}

          {/* Mini stats */}
          <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', border: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 10, fontWeight: 500 }}>Cette semaine</p>
            {[
              { label: 'Patients vus',      val: '34', color: '#2ecc71' },
              { label: 'Prescriptions',     val: '12', color: '#3b82f6' },
              { label: 'Téléconsultations', val: '6',  color: '#8b5cf6' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.83rem', color: '#6b7280' }}>{label}</span>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.95rem', color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── PHARMACIST DASHBOARD ──────────────────────── */
function PharmacistDashboard({ user }) {
  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: 4 }}>
          Bonjour, Ph. {user?.prenom} {user?.nom}
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>12 ordonnances en attente de traitement.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Ordonnances reçues"   value="12"  sub="Aujourd'hui"        color="#2ecc71" icon="pill"     />
        <StatCard label="En cours de prépa."   value="4"   sub="À préparer"         color="#f59e0b" icon="pill"     />
        <StatCard label="Prêtes à délivrer"    value="3"   sub="En attente patient" color="#3b82f6" icon="calendar" />
        <StatCard label="Délivrées"            value="28"  sub="Cette semaine"      color="#8b5cf6" icon="file"     />
      </div>

      <div style={{ background: 'white', borderRadius: 18, padding: '22px 24px', border: '1px solid #f3f4f6', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: 16 }}>
          Ordonnances récentes
        </h3>
        {[
          { patient: 'Yasmine Alaoui',  doctor: 'Dr. Alami',  meds: 'Amoxicilline 500mg, Ibuprofène', status: 'pending',   time: 'Il y a 10 min' },
          { patient: 'Karim Bennis',    doctor: 'Dr. Benali',  meds: 'Metformine 850mg',               status: 'confirmed', time: 'Il y a 25 min' },
          { patient: 'Sara El Mansouri',doctor: 'Dr. Idrissi', meds: 'Atorvastatine 40mg, Aspirine',   status: 'confirmed', time: 'Il y a 1h'     },
        ].map(({ patient, doctor, meds, status, time }) => {
          const statusColor = { confirmed: '#2ecc71', pending: '#f59e0b' }[status];
          const statusLabel = { confirmed: 'Prête', pending: 'En préparation' }[status];
          return (
            <div key={patient} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 0', borderBottom: '1px solid #f9fafb' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: '#f0fdf4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="pill" size={17} color="#2ecc71" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>{patient}</p>
                <p style={{ fontSize: '0.76rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {doctor} · {meds}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{
                  display: 'block', fontSize: '0.72rem', fontWeight: 600,
                  background: statusColor + '18', color: statusColor,
                  padding: '3px 10px', borderRadius: 20, marginBottom: 4,
                }}>
                  {statusLabel}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ── MAIN EXPORT ───────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || 'PATIENT';

  return (
    <div>
      {role === 'PATIENT'    && <PatientDashboard    user={user} />}
      {role === 'DOCTOR'     && <DoctorDashboard     user={user} />}
      {role === 'PHARMACIST' && <PharmacistDashboard user={user} />}
    </div>
  );
}