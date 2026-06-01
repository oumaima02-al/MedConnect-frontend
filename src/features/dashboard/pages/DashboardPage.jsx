import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/layout/AppLayout';
import { useDoctorStatus } from '../../become-doctor/hooks/useDoctorStatus';

/* ── Reusable stat card ────────────────────────── */
const StatCard = ({ label, value, sub, color, icon, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      background: 'white', borderRadius: 18, padding: '22px 24px',
      border: '1px solid #f3f4f6',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      cursor: onClick ? 'pointer' : 'default',
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
const ApptRow = ({ name, time, type, status, onClick }) => {
  const statusColor = { confirmed: '#2ecc71', pending: '#f59e0b', cancelled: '#ef4444' }[status] || '#9ca3af';
  const statusLabel = { confirmed: 'Confirmé', pending: 'En attente', cancelled: 'Annulé' }[status] || status;
  return (
    <div 
      onClick={onClick}
      style={{ 
        display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', 
        borderBottom: '1px solid #f9fafb',
        cursor: onClick ? 'pointer' : 'default',
      }}>
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
  const navigate = useNavigate();
  const localStatus = localStorage.getItem('MedConnect_doctor_status');
  const { status } = useDoctorStatus(user?.id);
  const doctorStatus = status || localStatus;

  const statusConfig = {
    PENDING:  { label: '⏳ En attente de validation', bg: '#fffbeb', border: '#fde68a', color: '#d97706' },
    VERIFIED: { label: '✅ Compte médecin vérifié', bg: '#f0fdf4', border: '#86efac', color: '#16a34a' },
    REJECTED: { label: '❌ Demande refusée — Réessayer', bg: '#fff7f7', border: '#fca5a5', color: '#dc2626' },
  };
  const statusCfg = statusConfig[doctorStatus];

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: 4 }}>
          Bonjour, {user?.prenom || user?.name || 'Cher Patient'}
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Voici un aperçu de votre santé aujourd'hui.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Prochain RDV"      value="Lun 19"   sub="Dr. Alami — 10h00"    color="#2ecc71" icon="calendar" />
        <StatCard label="Ordonnances"        value="2"        sub="1 à renouveler"        color="#3b82f6" icon="pill"     />
        <StatCard label="Mon DMP"            value="Consulter" sub="Mis à jour il y a 3j"  color="#8b5cf6" icon="file"   onClick={() => navigate('/patient/dmp')} />
        <StatCard label="Vitals"             value="Saisir"    sub="Dernière: Hier"       color="#ef4444" icon="heart"  onClick={() => navigate('/patient/vitals')} />
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

      {/* ── Become a Doctor CTA ── */}
      {!doctorStatus && (
        <div style={{
          marginTop: 24,
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: '1.5px solid #86efac', borderRadius: 18,
          padding: '22px 26px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg,#2ecc71,#16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(46,204,113,0.35)',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: 3 }}>
                Vous êtes professionnel de santé ?
              </p>
              <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                Rejoignez le réseau MediConnect en tant que médecin certifié.
              </p>
            </div>
          </div>
          <button
            id="dashboard-become-doctor-btn"
            onClick={() => navigate('/app/become-doctor')}
            style={{
              flexShrink: 0, padding: '11px 24px', borderRadius: 11,
              background: 'linear-gradient(135deg,#2ecc71,#16a34a)',
              border: 'none', color: 'white',
              fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '0.88rem',
              cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(46,204,113,0.35)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Devenir Médecin →
          </button>
        </div>
      )}

      {/* ── Status banner (submitted) ── */}
      {statusCfg && (
        <div style={{
          marginTop: 24,
          background: statusCfg.bg,
          border: `1.5px solid ${statusCfg.border}`,
          borderRadius: 18, padding: '16px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: statusCfg.color }}>
            {statusCfg.label}
          </p>
          {doctorStatus === 'REJECTED' && (
            <button
              id="dashboard-retry-doctor-btn"
              onClick={() => navigate('/app/become-doctor')}
              style={{
                padding: '8px 18px', borderRadius: 9,
                border: '1.5px solid #fca5a5', background: 'white',
                color: '#dc2626', fontFamily: 'inherit', fontWeight: 600,
                fontSize: '0.82rem', cursor: 'pointer',
              }}
            >
              Réessayer
            </button>
          )}
        </div>
      )}
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
          <ApptRow name="Yasmine Alaoui"  time="09:00" type="Consultation"         status="confirmed" onClick={() => navigate('/doctor/patients/yasmine-1')} />
          <ApptRow name="Mehdi Cherkaoui" time="10:00" type="Suivi post-opératoire" status="confirmed" onClick={() => navigate('/doctor/patients/mehdi-1')} />
          <ApptRow name="Fatima Zohra"    time="11:30" type="Renouvellement ordo."  status="pending"   onClick={() => navigate('/doctor/patients/fatima-1')} />
          <ApptRow name="Karim Bennis"    time="14:00" type="Téléconsultation"      status="confirmed" onClick={() => navigate('/doctor/patients/karim-1')} />
          <ApptRow name="Sara El Idrissi" time="15:30" type="Première consultation" status="pending"   onClick={() => navigate('/doctor/patients/sara-1')} />
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Nouvelle prescription',   icon: 'pill',     color: '#2ecc71', bg: '#f0fdf4', path: '/doctor/prescriptions/new' },
            { label: 'Voir mes patients',        icon: 'users',    color: '#3b82f6', bg: '#eff6ff', path: '/doctor/patients' },
            { label: 'Messages patients',        icon: 'message',  color: '#8b5cf6', bg: '#f5f3ff', path: '/doctor/messages' },
          ].map(({ label, icon, color, bg, path }) => (
            <button key={label} 
              onClick={() => navigate(path)}
              style={{
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
  const rawRole = user?.role || 'PATIENT';
  const role = rawRole.toUpperCase();
  const path = window.location.pathname;

  // For Admin testing: render dashboard based on path or role
  const isDocPath = path.includes('/doctor');
  const isPatPath = path.includes('/patient');

  const isPatientScope = role === 'PATIENT' || role === 'USER' || isPatPath;
  const isDoctorScope  = role === 'DOCTOR' || isDocPath;
  const isPharmScope   = role === 'PHARMACIST';

  if (role === 'ADMIN') {
    if (isDocPath) return <DoctorDashboard user={user} />;
    if (isPatPath) return <PatientDashboard user={user} />;
    return <div style={{padding:40, textAlign:'center', fontFamily:'DM Sans'}}>Admin Dashboard Overview — Go to Audit tab</div>;
  }

  return (
    <div>
      {isPatientScope && <PatientDashboard user={user} />}
      {isDoctorScope && <DoctorDashboard user={user} />}
      {isPharmScope && <PharmacistDashboard user={user} />}
    </div>
  );
}
