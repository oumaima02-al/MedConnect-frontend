import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { TcIcon, TC, Card, Modal, ErrorBanner, SuccessBanner, StatCard, EmptyState } from '../components/TcShared';
import { PatientWaitingRoom, DoctorQueueManager } from '../components/WaitingRoom';
import SessionRoom from '../components/SessionRoom';
import { useCreateSession } from '../hooks/useTeleconsult';

function readLocalTeleconsultSessions(userId, isDoctor) {
  try {
    const sessions = JSON.parse(localStorage.getItem('MedConnect_local_teleconsult_sessions') || '[]');
    return sessions.filter(session => {
      if (!userId) return true;
      return isDoctor ? String(session.doctorId) === String(userId) : String(session.patientId) === String(userId);
    });
  } catch {
    return [];
  }
}

export default function TeleconsultPage() {
  const { user } = useAuth();
  const currentUserId = user?.id || user?.userId;
  const isDoctor = user?.role?.toUpperCase() === 'DOCTOR';

  const [activeSession, setActiveSession] = useState(null);
  const [view, setView] = useState('DASHBOARD');
  const [deviceTestOpen, setDeviceTestOpen] = useState(false);
  const [deviceTestLoading, setDeviceTestLoading] = useState(false);
  const [deviceTestError, setDeviceTestError] = useState('');
  const [deviceTestSuccess, setDeviceTestSuccess] = useState('');
  const [deviceStream, setDeviceStream] = useState(null);

  const { create } = useCreateSession();
  const localSessions = readLocalTeleconsultSessions(currentUserId, isDoctor);

  const stopDeviceTest = () => {
    deviceStream?.getTracks?.().forEach(track => track.stop());
    setDeviceStream(null);
  };

  const enterSession = (session) => {
    setActiveSession(session);
    if (isDoctor || session.status === 'ACTIVE') {
      setView('SESSION');
    } else {
      setView('WAITING_ROOM');
    }
  };

  const handleDeviceTest = async () => {
    setDeviceTestOpen(true);
    setDeviceTestLoading(true);
    setDeviceTestError('');
    setDeviceTestSuccess('');
    stopDeviceTest();

    if (!navigator.mediaDevices?.getUserMedia) {
      setDeviceTestError('Votre navigateur ne permet pas le test camera/micro sur cette page.');
      setDeviceTestLoading(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setDeviceStream(stream);
      setDeviceTestSuccess('Camera et micro detectes avec succes.');
    } catch (e) {
      const denied = e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError';
      const missing = e?.name === 'NotFoundError' || e?.name === 'DevicesNotFoundError';
      setDeviceTestError(
        denied
          ? 'Acces refuse. Autorisez la camera et le micro dans le navigateur puis reessayez.'
          : missing
            ? 'Aucune camera ou aucun micro detecte sur cet appareil.'
            : 'Impossible de tester la camera et le micro pour le moment.'
      );
    } finally {
      setDeviceTestLoading(false);
    }
  };

  const handleCreateTestSession = async () => {
    if (!isDoctor) {
      await handleDeviceTest();
      return;
    }

    try {
      const session = await create({
        appointmentId: `appt-${Date.now()}`,
        doctorId: currentUserId,
        patientId: 'patient-1'
      });
      enterSession(session);
    } catch (e) {
      setDeviceTestOpen(true);
      setDeviceTestError('Impossible de demarrer une session de test pour le moment.');
    }
  };

  useEffect(() => () => {
    deviceStream?.getTracks?.().forEach(track => track.stop());
  }, [deviceStream]);

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      {view === 'DASHBOARD' && (
        <div style={{ animation: 'tc-fade-in 0.3s ease' }}>
          <style>{`@keyframes tc-fade-in { from{opacity:0} to{opacity:1} }`}</style>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#111827', margin: 0 }}>
              Teleconsultation
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: 6 }}>
              {isDoctor ? "Gerez vos consultations video et votre file d'attente." : "Prochaines consultations video et salle d'attente."}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>
            <StatCard icon="video" label="Sessions aujourd'hui" value="0" color={TC.primary} />
            <StatCard icon="users" label="Patients en attente" value={isDoctor ? '0' : 'N/A'} color={TC.success} />
            <StatCard icon="stethoscope" label="Consultations terminees" value="12" color="#6366f1" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isDoctor ? '1fr 350px' : '1fr', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>Sessions recentes</h3>
              </div>

              {localSessions.length > 0 ? (
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  {localSessions.map(session => (
                    <button
                      key={session.sessionId || session.id}
                      type="button"
                      onClick={() => enterSession(session)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 20px', border: 'none', borderBottom: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TcIcon name="video" size={20} color={TC.primary} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 800, color: '#111827' }}>
                            {isDoctor ? session.patientName || 'Patient' : session.doctorName || 'Medecin'}
                          </p>
                          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                            {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : 'Teleconsultation confirmee'}
                          </p>
                        </div>
                      </div>
                      <span style={{ padding: '7px 12px', borderRadius: 10, background: '#f0fdf4', color: '#16a34a', fontWeight: 800, fontSize: '0.78rem' }}>
                        Entrer
                      </span>
                    </button>
                  ))}
                </Card>
              ) : (
                <Card style={{ padding: '0px' }}>
                  <EmptyState
                    icon="video"
                    title="Pret pour votre consultation ?"
                    sub={isDoctor ? "Vous n'avez pas de session active. Vous pouvez creer une session de test pour verifier vos parametres." : "Vos consultations video apparaitront ici. Assurez-vous d'avoir un rendez-vous confirme."}
                    action={handleCreateTestSession}
                    actionLabel={isDoctor ? 'Demarrer une session de test' : 'Tester ma camera et mon micro'}
                  />
                </Card>
              )}
            </div>

            {isDoctor && (
              <div>
                <DoctorQueueManager doctorId={currentUserId} onAdmit={(session) => enterSession(session)} />
              </div>
            )}
          </div>
        </div>
      )}

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

      {view === 'SESSION' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: '#0f172a' }}>
          <SessionRoom
            session={activeSession}
            isDoctor={isDoctor}
            currentUserId={currentUserId}
            currentUser={user}
            onEnd={() => setView('DASHBOARD')}
          />
        </div>
      )}

      <Modal
        open={deviceTestOpen}
        onClose={() => {
          stopDeviceTest();
          setDeviceTestOpen(false);
        }}
        title="Test camera et micro"
        icon="video"
        width={620}
      >
        <ErrorBanner message={deviceTestError} onRetry={handleDeviceTest} />
        <SuccessBanner message={deviceTestSuccess} />
        <div style={{ borderRadius: 14, overflow: 'hidden', background: '#0f172a', minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {deviceTestLoading ? (
            <p style={{ color: 'white', fontWeight: 700 }}>Test en cours...</p>
          ) : deviceStream ? (
            <video
              autoPlay
              muted
              playsInline
              ref={(node) => {
                if (node && node.srcObject !== deviceStream) node.srcObject = deviceStream;
              }}
              style={{ width: '100%', height: 320, objectFit: 'cover' }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#cbd5e1', padding: 24 }}>
              <TcIcon name="video" size={42} color="#94a3b8" />
              <p style={{ margin: '12px 0 0', fontWeight: 700 }}>Cliquez sur Reessayer pour lancer le test.</p>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            stopDeviceTest();
            setDeviceTestOpen(false);
          }}
          style={{ marginTop: 16, width: '100%', padding: 12, borderRadius: 10, border: 'none', background: TC.primary, color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Fermer
        </button>
      </Modal>
    </div>
  );
}


