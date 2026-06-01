import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { TcIcon, TC, Card, Skeleton, ErrorBanner, StatCard, EmptyState } from '../components/TcShared';
import { PatientWaitingRoom, DoctorQueueManager } from '../components/WaitingRoom';
import SessionRoom from '../components/SessionRoom';
import { useCreateSession, useSession } from '../hooks/useTeleconsult';

export default function TeleconsultPage() {
  const { user } = useAuth();
  const currentUserId = user?.id || user?.userId;
  const isDoctor = user?.role?.toUpperCase() === 'DOCTOR';

  // State for active session
  const [activeSession, setActiveSession] = useState(null);
  const [view, setView] = useState('DASHBOARD'); // DASHBOARD, WAITING_ROOM, SESSION

  const { create, loadingHeight: createLoading } = useCreateSession();

  // Helper to handle entry into a session
  const enterSession = (session) => {
    setActiveSession(session);
    if (isDoctor) {
      setView('SESSION');
    } else {
      // Patients go to waiting room first if not already admitted
      if (session.status === 'ACTIVE') {
        setView('SESSION');
      } else {
        setView('WAITING_ROOM');
      }
    }
  };

  // If we came from an appointment link (could use URL params in a real scenario)
  // For now, let's provide a "Create Demo Session" for testing if dashboard is empty
  const handleCreateTestSession = async () => {
    try {
      const session = await create({
        appointmentId: `appt-${Date.now()}`,
        doctorId: isDoctor ? currentUserId : 'doctor-1',
        patientId: isDoctor ? 'patient-1' : currentUserId
      });
      enterSession(session);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* ─── Role Dashboard View ────────────────────────────────── */}
      {view === 'DASHBOARD' && (
        <div style={{ animation: 'tc-fade-in 0.3s ease' }}>
          <style>{`@keyframes tc-fade-in { from{opacity:0} to{opacity:1} }`}</style>
          
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#111827', margin: 0 }}>
              Téléconsultation
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: 6 }}>
              {isDoctor ? 'Gérez vos consultations vidéo et votre file d\'attente.' : 'Prochaines consultations vidéo et salle d\'attente.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>
            <StatCard icon="video" label="Sessions aujourd'hui" value="0" color={TC.primary} />
            <StatCard icon="users" label="Patients en attente" value={isDoctor ? "0" : "N/A"} color={TC.success} />
            <StatCard icon="stethoscope" label="Consultations terminées" value="12" color="#6366f1" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isDoctor ? '1fr 350px' : '1fr', gap: 32 }}>
            
            {/* Main Area: Recent Sessions or Empty State */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>Sessions récentes</h3>
              </div>
              
              <Card style={{ padding: '0px' }}>
                <EmptyState 
                  icon="video" 
                  title="Prêt pour votre consultation ?" 
                  sub={isDoctor ? "Vous n'avez pas de session active. Vous pouvez créer une session de test pour vérifier vos paramètres." : "Vos consultations vidéo apparaîtront ici. Assurez-vous d'avoir un rendez-vous confirmé."}
                  action={handleCreateTestSession}
                  actionLabel={isDoctor ? "Démarrer une session de test" : "Tester ma caméra et mon micro"}
                />
              </Card>
            </div>

            {/* Doctor specific sidebar: Queue Management */}
            {isDoctor && (
              <div>
                <DoctorQueueManager 
                  doctorId={currentUserId} 
                  onAdmit={(session) => enterSession(session)} 
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Waiting Room View (Patient) ───────────────────────── */}
      {view === 'WAITING_ROOM' && (
        <div style={{ maxWidth: 500, margin: '60px auto' }}>
          <PatientWaitingRoom 
            sessionId={activeSession?.sessionId || activeSession?.id} 
            patientId={currentUserId}
            onAdmitted={() => setView('SESSION')}
          />
          <button 
            onClick={() => setView('DASHBOARD')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '24px auto 0', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'inherit' }}
          >
            <TcIcon name="x" size={14} color="#64748b" /> Quitter la salle d'attente
          </button>
        </div>
      )}

      {/* ─── Teleconsultation Room ─────────────────────────────── */}
      {view === 'SESSION' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: '#0f172a' }}>
          <SessionRoom 
            session={activeSession} 
            isDoctor={isDoctor}
            currentUserId={currentUserId}
            onEnd={() => setView('DASHBOARD')} 
          />
        </div>
      )}

    </div>
  );
}
