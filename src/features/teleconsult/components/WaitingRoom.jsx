import { useState } from 'react';
import {
  TcIcon, TC, Card, Skeleton, ErrorBanner, SuccessBanner, fmtTime, SubmitBtn, EmptyState
} from './TcShared';
import { useDocterQueue, useWaitingRoom } from '../hooks/useTeleconsult';

// ─── Patient View: Waiting Queue Position ─────────────────────
function PatientWaitingRoom({ sessionId, patientId, onAdmitted }) {
  const { queueInfo, loading, error, join } = useWaitingRoom(sessionId, patientId);
  const [joining, setJoining] = useState(false);

  // If admitted, we should probably trigger a callback to enter the room
  if (queueInfo?.admitted) {
    onAdmitted && onAdmitted();
  }

  const handleJoin = async () => {
    setJoining(true);
    try {
      await join();
    } catch (e) {
      console.error(e);
    } finally {
      setJoining(false);
    }
  };

  return (
    <Card style={{ padding: '32px 24px', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${TC.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <TcIcon name="clock" size={36} color={TC.primary} />
      </div>
      
      <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.2rem', marginBottom: 10 }}>Salle d'attente</h2>
      
      {error && <ErrorBanner message={error} />}

      {!queueInfo ? (
        <>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 24 }}>
            Le médecin n'est pas encore prêt. Veuillez rejoindre la salle d'attente pour être averti dès qu'il pourra vous recevoir.
          </p>
          <SubmitBtn label="Rejoindre la file d'attente" onClick={handleJoin} loading={joining} icon="plus" />
        </>
      ) : (
        <div style={{ animation: 'tc-fade 0.3s ease' }}>
          <style>{`@keyframes tc-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }`}</style>
          <div style={{ background: '#f8fafc', borderRadius: 16, padding: '24px', border: `1px solid ${TC.border}`, marginBottom: 12 }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 16 }}>Votre position actuelle</p>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'white', border: `4px solid ${TC.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: TC.primary, fontFamily: "'Sora',sans-serif" }}>#{queueInfo.position}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#64748b', fontSize: '0.88rem' }}>
              <TcIcon name="clock" size={14} color="#94a3b8" />
              <span>Attente estimée : <strong>{queueInfo.estimatedWaitMinutes} min</strong></span>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
            Veuillez ne pas fermer cette page. Vous serez automatiquement redirigé vers la consultation.
          </p>
        </div>
      )}
    </Card>
  );
}

// ─── Doctor View: Managing the Queue ──────────────────────────
function DoctorQueueManager({ doctorId, onAdmit }) {
  const { queueData, loading, error, refresh, admitNext } = useDocterQueue(doctorId);
  const [admitting, setAdmitting] = useState(null);

  const handleAdmit = async (pId) => {
    setAdmitting(pId);
    try {
      const session = await admitNext(pId);
      onAdmit && onAdmit(session);
    } catch (e) {
      console.error(e);
    } finally {
      setAdmitting(null);
    }
  };

  const queue = queueData?.queue || [];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>File d'attente</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: 4 }}>Gérez les patients en attente de consultation.</p>
        </div>
        <button onClick={refresh} style={{ background: 'white', border: `1px solid ${TC.border}`, borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
          <TcIcon name="refresh" size={14} color="#64748b" /> Actualiser
        </button>
      </div>

      {loading && !queueData && <Skeleton rows={3} />}
      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {!loading && queue.length === 0 && (
        <EmptyState 
          icon="users" 
          title="Aucun patient" 
          sub="Il n'y a actuellement aucun patient dans votre file d'attente." 
        />
      )}

      {!loading && queue.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {queue.map((item, idx) => (
            <Card key={item.patientId} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'tc-slide-in 0.25s ease' }}>
              <style>{`@keyframes tc-slide-in { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }`}</style>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${TC.primary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: TC.primary, fontSize: '1.1rem' }}>
                  {item.position}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: '#111827', margin: 0 }}>Patient ID: {item.patientId}</p>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0' }}>En attente depuis {fmtTime(item.joinedAt)}</p>
                </div>
              </div>
              
              <button 
                id={`btn-admit-${item.patientId}`}
                onClick={() => handleAdmit(item.patientId)}
                disabled={admitting !== null}
                style={{ 
                  background: TC.primary, color: 'white', border: 'none', borderRadius: 10, padding: '10px 18px', 
                  cursor: admitting !== null ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.84rem', 
                  display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s' 
                }}
                onMouseEnter={e => { if (admitting === null) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {admitting === item.patientId ? (
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                ) : (
                  <TcIcon name="video" size={14} color="white" />
                )}
                Faire entrer
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export { PatientWaitingRoom, DoctorQueueManager };
