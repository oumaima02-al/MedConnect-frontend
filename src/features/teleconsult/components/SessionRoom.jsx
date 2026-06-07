import { useState, useEffect, useRef } from 'react';
import {
  TcIcon, TC, SessionBadge, Card, ControlBtn, Modal, Field, Input,
  SubmitBtn, ErrorBanner, SuccessBanner, fmtDuration, fmtDateTime,
} from './TcShared';
import { useSession, useSessionStatus, useChat, useRecording, useScreenShare } from '../hooks/useTeleconsult';

// â”€â”€â”€ Chat Pane â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ChatPane({ sessionId, userId }) {
  const { chat, sending, send } = useChat(sessionId);
  const [msg, setMsg] = useState('');
  const bottomRef = useRef(null);

  const messages = chat?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    const text = msg.trim();
    setMsg('');
    await send(userId, text);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem', marginTop: 40 }}>
            <TcIcon name="message" size={28} color="#d1d5db" />
            <p style={{ marginTop: 8 }}>Aucun message pour l'instant</p>
          </div>
        )}
        {messages.map((m, i) => {
          const isMe = m.senderId === userId;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: isMe ? `${TC.primary}20` : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TcIcon name="user" size={14} color={isMe ? TC.primary : '#9ca3af'} />
              </div>
              <div style={{ maxWidth: '72%' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMe ? TC.primary : '#f1f5f9',
                  color: isMe ? 'white' : '#111827',
                  fontSize: '0.85rem', lineHeight: 1.5,
                }}>
                  {m.message}
                </div>
                <p style={{ fontSize: '0.68rem', color: '#9ca3af', margin: '3px 6px 0', textAlign: isMe ? 'right' : 'left' }}>
                  {m.sentAt ? new Date(m.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ padding: '12px 14px', borderTop: `1px solid ${TC.border}`, display: 'flex', gap: 8 }}>
        <input
          value={msg} onChange={e => setMsg(e.target.value)}
          placeholder="Votre message..."
          disabled={sending}
          style={{ flex: 1, padding: '10px 14px', border: `1.5px solid ${TC.border}`, borderRadius: 12, fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', background: '#fafbfc' }}
          onFocus={e => e.target.style.borderColor = TC.primary}
          onBlur={e => e.target.style.borderColor = TC.border}
        />
        <button type="submit" disabled={sending || !msg.trim()}
          style={{ padding: '10px 14px', border: 'none', borderRadius: 12, background: TC.primary, cursor: sending || !msg.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: !msg.trim() ? 0.5 : 1 }}>
          <TcIcon name="send" size={17} color="white" />
        </button>
      </form>
    </div>
  );
}

// â”€â”€â”€ Join Link Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function JoinLinkModal({ open, onClose, sessionId, getJoinLink }) {
  const [role, setRole] = useState('PATIENT');
  const [linkData, setLink] = useState(null);
  const [loading, setLoad] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetch = async () => {
    setLoad(true);
    try {
      const data = await getJoinLink(role);
      setLink(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoad(false);
    }
  };

  const copy = () => {
    if (linkData?.joinLink) {
      navigator.clipboard.writeText(linkData.joinLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Obtenir un lien de rejoindre" icon="link" width={480}>
      <Field label="Role du participant" required>
        <div style={{ display: 'flex', gap: 8 }}>
          {['DOCTOR', 'PATIENT'].map(r => (
            <button key={r} type="button" onClick={() => { setRole(r); setLink(null); }}
              style={{ flex: 1, padding: '9px', borderRadius: 10, border: `2px solid ${role === r ? TC.primary : TC.border}`, background: role === r ? `${TC.primary}10` : 'white', color: role === r ? TC.primary : '#374151', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.85rem', transition: 'all 0.15s' }}>
              {r === 'DOCTOR' ? 'Medecin' : 'Patient'}
            </button>
          ))}
        </div>
      </Field>

      <SubmitBtn label="Generer le lien" loading={loading} icon="link" type="button" onClick={fetch} />

      {linkData && (
        <div style={{ marginTop: 18, background: '#f8fafc', borderRadius: 14, padding: '16px', border: `1px solid ${TC.border}` }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 8px' }}>Lien genere</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, background: 'white', border: `1px solid ${TC.border}`, borderRadius: 10, padding: '10px 12px', fontSize: '0.78rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {linkData.joinLink}
            </div>
            <button onClick={copy} style={{ padding: '10px', borderRadius: 10, background: copied ? '#f0fdf4' : '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 600, color: copied ? '#16a34a' : '#374151', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              <TcIcon name={copied ? 'check' : 'copy'} size={15} color={copied ? '#16a34a' : '#374151'} />
              {copied ? 'Copie !' : 'Copier'}
            </button>
          </div>
          {linkData.expiresAt && (
            <p style={{ fontSize: '0.73rem', color: '#9ca3af', marginTop: 8 }}>
              Expire le : {fmtDateTime(linkData.expiresAt)}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

// â”€â”€â”€ Image Share Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ImageShareModal({ open, onClose, sessionId, shareImage }) {
  const [b64, setB64] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setB64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleShare = async () => {
    if (!b64) { setErr('Veuillez selectionner une image.'); return; }
    setLoading(true);
    setErr('');
    try {
      await shareImage(b64);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setB64(''); onClose(); }, 2000);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Erreur lors du partage.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Partager une image medicale" icon="image" width={460}>
      {success ? <SuccessBanner message="Image partagee avec succes !" /> : (
        <>
          <ErrorBanner message={err} />
          <div
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${b64 ? TC.primary : TC.border}`, borderRadius: 14, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: b64 ? `${TC.primary}06` : '#fafbfc', transition: 'all 0.15s', marginBottom: 16 }}
          >
            {b64 ? (
              <img src={b64} alt="preview" style={{ maxHeight: 200, borderRadius: 10, maxWidth: '100%', objectFit: 'contain' }} />
            ) : (
              <>
                <TcIcon name="image" size={36} color="#d1d5db" />
                <p style={{ color: '#9ca3af', fontSize: '0.84rem', marginTop: 10 }}>Cliquez pour selectionner une image</p>
                <p style={{ color: '#d1d5db', fontSize: '0.75rem' }}>PNG, JPG, JPEG</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          </div>
          <div style={{ background: '#fffbeb', borderRadius: 10, padding: '10px 14px', marginBottom: 16, border: '1px solid #fde68a', display: 'flex', gap: 8 }}>
            <TcIcon name="shield" size={15} color="#d97706" />
            <p style={{ fontSize: '0.77rem', color: '#92400e', margin: 0 }}>L'image sera chiffree AES-256 et partagee uniquement avec les participants de la session.</p>
          </div>
          <SubmitBtn label="Partager l'image" loading={loading} icon="image" type="button" onClick={handleShare} disabled={!b64} />
        </>
      )}
    </Modal>
  );
}

// â”€â”€â”€ Recording Controls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function RecordingControls({ sessionId, isDoctor, mediaStream }) {
  const { recording, start, stop } = useRecording(sessionId);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [localRecording, setLocalRecording] = useState(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const isRecording = localRecording || (recording && recording.startedAt && !recording.stoppedAt);

  const downloadRecording = (chunks) => {
    if (!chunks.length) return;
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teleconsultation-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.webm';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const toggle = async () => {
    setBusy(true);
    setErr('');
    try {
      if (isRecording) {
        recorderRef.current?.stop?.();
        recorderRef.current = null;
        setLocalRecording(null);
        await stop();
        return;
      }

      if (!mediaStream || !window.MediaRecorder) {
        setErr('Enregistrement non disponible pour le moment.');
        return;
      }

      chunksRef.current = [];
      const options = MediaRecorder.isTypeSupported('video/webm') ? { mimeType: 'video/webm' } : undefined;
      const recorder = new MediaRecorder(mediaStream, options);
      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => downloadRecording(chunksRef.current);
      recorder.start();
      recorderRef.current = recorder;
      setLocalRecording({ startedAt: new Date().toISOString() });
      await start();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Erreur enregistrement');
    } finally {
      setBusy(false);
    }
  };

  if (!isDoctor) {
    return isRecording ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 20, background: '#fef2f2', border: '1px solid #fecaca' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'tc-pulse 1.2s infinite', display: 'inline-block' }} />
        <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>Enregistrement en cours</span>
      </div>
    ) : null;
  }

  return (
    <div>
      {err && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginBottom: 6 }}>{err}</p>}
      <ControlBtn
        icon={isRecording ? 'record-stop' : 'record'}
        label={isRecording ? 'Arreter REC' : 'Enregistrer'}
        onClick={toggle}
        active={isRecording}
        danger={isRecording}
        disabled={busy}
      />
    </div>
  );
}

// â”€â”€â”€ Session Room (main component) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function SessionRoom({ session, onEnd, currentUserId, currentUser, isDoctor }) {
  const { start, end, getJoinLink, data: sessionData, refresh } = useSession(session?.sessionId || session?.id);
  const { status: liveStatus } = useSessionStatus(session?.sessionId || session?.id, 5000);
  const { sharing, startShare, stopShare, shareImage } = useScreenShare(session?.sessionId || session?.id, currentUserId);

  const [chatOpen, setChatOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);
  const [ending, setEnding] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startErr, setStartErr] = useState('');
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [mediaError, setMediaError] = useState('');
  const videoRef = useRef(null);
  const screenVideoRef = useRef(null);

  const sid = session?.sessionId || session?.id;
  const status = liveStatus?.status || sessionData?.status || session?.status;
  const rawDoctorName = currentUser?.fullName || currentUser?.name || [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ');
  const doctorDisplayName = rawDoctorName && !rawDoctorName.includes('@') ? rawDoctorName : 'Medecin';
  const isActive = status === 'ACTIVE';
  const isEnded = status === 'ENDED' || status === 'FORCE_ENDED';
  const unread = 0; // Would track real unread msgs

  useEffect(() => {
    let cancelled = false;
    const startMedia = async () => {
      if (!isActive || isEnded) return;
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaError('Camera non disponible sur ce navigateur.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true });
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        setLocalStream(stream);
        setMediaError('');
      } catch (e) {
        setMediaError(e?.name === 'NotAllowedError' ? 'Autorisez la camera et le micro dans le navigateur.' : 'Impossible d ouvrir la camera ou le micro.');
      }
    };
    startMedia();
    return () => {
      cancelled = true;
      setLocalStream((stream) => {
        stream?.getTracks?.().forEach(track => track.stop());
        return null;
      });
    };
  }, [isActive, isEnded, sid]);

  useEffect(() => {
    if (videoRef.current && localStream) videoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) screenVideoRef.current.srcObject = screenStream;
  }, [screenStream]);

  useEffect(() => {
    localStream?.getAudioTracks?.().forEach(track => { track.enabled = !muted; });
  }, [localStream, muted]);

  useEffect(() => {
    localStream?.getVideoTracks?.().forEach(track => { track.enabled = !camOff; });
  }, [localStream, camOff]);
  const handleStart = async () => {
    setStarting(true);
    setStartErr('');
    try {
      await start();
    } catch (e) {
      setStartErr(e?.response?.data?.message || 'Erreur au demarrage');
    } finally {
      setStarting(false);
    }
  };

  const handleEnd = async () => {
    setEnding(true);
    try {
      await end();
      onEnd && onEnd();
    } finally {
      setEnding(false);
    }
  };

  const toggleShare = async () => {
    try {
      if (sharing || screenStream) {
        screenStream?.getTracks?.().forEach(track => track.stop());
        setScreenStream(null);
        await stopShare();
        return;
      }

      if (!navigator.mediaDevices?.getDisplayMedia) {
        setMediaError('Le partage ecran n est pas disponible dans ce navigateur.');
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      stream.getVideoTracks?.()[0]?.addEventListener('ended', async () => {
        setScreenStream(null);
        await stopShare();
      });
      setScreenStream(stream);
      await startShare();
    } catch (e) {
      if (e?.name !== 'NotAllowedError') setMediaError('Impossible de demarrer le partage ecran.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: '#0f172a', borderBottom: '1px solid #1e293b', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${TC.primary}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TcIcon name="video" size={20} color={TC.primary} />
          </div>
          <div>
            <p style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: 'white', margin: 0 }}>
              Teleconsultation
            </p>

          </div>
          <SessionBadge status={status} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {liveStatus?.participantCount != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: '#1e293b', color: '#94a3b8', fontSize: '0.78rem' }}>
              <TcIcon name="users" size={13} color="#94a3b8" />
              {liveStatus.participantCount} participant{liveStatus.participantCount !== 1 ? 's' : ''}
            </div>
          )}
          {isActive && liveStatus?.durationSeconds != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: '#1e293b', color: '#94a3b8', fontSize: '0.78rem' }}>
              <TcIcon name="clock" size={13} color="#94a3b8" />
              {fmtDuration(liveStatus.durationSeconds)}
            </div>
          )}
          <button id="btn-get-join-link" onClick={() => setLinkOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit' }}>
            <TcIcon name="link" size={13} color="#94a3b8" />Lien
          </button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', background: '#0f172a', overflow: 'hidden' }}>

        {/* Video area */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Simulated video area */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', position: 'relative', overflow: 'hidden' }}>
            {isEnded ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <TcIcon name="video-off" size={36} color="#64748b" />
                </div>
                <p style={{ color: '#64748b', fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1rem' }}>Session terminee</p>
              </div>
            ) : !isActive ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 90, height: 90, borderRadius: '50%', background: `${TC.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 0 40px ${TC.primary}30` }}>
                  <TcIcon name="video" size={40} color={TC.primary} />
                </div>
                <p style={{ color: 'white', fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>
                  {status === 'WAITING' ? 'En salle d\'attente...' : 'Session non demarree'}
                </p>
                {isDoctor && status !== 'ACTIVE' && !isEnded && (
                  <>
                    {startErr && <p style={{ color: '#f87171', fontSize: '0.84rem', marginBottom: 12 }}>{startErr}</p>}
                    <button id="btn-start-session" onClick={handleStart} disabled={starting}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14, background: TC.success, color: 'white', border: 'none', cursor: starting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.95rem', boxShadow: `0 4px 20px ${TC.success}50`, transition: 'opacity 0.15s' }}
                      onMouseEnter={e => { if (!starting) e.currentTarget.style.opacity = '0.85'; }}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <TcIcon name="video" size={18} color="white" />
                      {starting ? 'Demarrage...' : 'Demarrer la session'}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {screenStream ? (
                  <video
                    ref={(node) => {
                      if (node && node.srcObject !== screenStream) node.srcObject = screenStream;
                      screenVideoRef.current = node;
                    }}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#020617' }}
                  />
                ) : localStream && !camOff ? (
                  <video
                    ref={(node) => {
                      if (node && node.srcObject !== localStream) node.srcObject = localStream;
                      videoRef.current = node;
                    }}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#020617' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <TcIcon name={camOff ? 'video-off' : 'user'} size={40} color={camOff ? '#64748b' : TC.primary} />
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.84rem' }}>
                      {mediaError || (camOff ? 'Camera desactivee' : 'Ouverture de la camera...')}
                    </p>
                  </div>
                )}
                {(localStream || screenStream) && (
                  <div style={{ position: 'absolute', left: 18, bottom: 18, padding: '6px 12px', borderRadius: 999, background: 'rgba(15,23,42,.72)', color: 'white', fontWeight: 700, fontSize: '0.78rem' }}>
                    {screenStream ? 'Partage ecran' : (isDoctor ? `Dr. ${doctorDisplayName}` : 'Vous')} {muted && !screenStream ? '- micro coupe' : ''}
                  </div>
                )}
              </div>
            )}

            {/* Screen sharing indicator */}
            {sharing && (
              <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: 'rgba(99,102,241,0.9)', backdropFilter: 'blur(4px)' }}>
                <TcIcon name="monitor" size={13} color="white" />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'white' }}>Partage d'ecran actif</span>
              </div>
            )}
          </div>

          {/* Control bar */}
          {!isEnded && (
            <div style={{ background: '#0f172a', padding: '12px 18px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderTop: '1px solid #1e293b', flexWrap: 'wrap' }}>
              <ControlBtn icon={muted ? 'mic-off' : 'mic'} label={muted ? 'Activer micro' : 'Couper micro'} onClick={() => setMuted(m => !m)} active={!muted} />
              <ControlBtn icon={camOff ? 'video-off' : 'video'} label={camOff ? 'Activer cam' : 'Couper cam'} onClick={() => setCamOff(c => !c)} active={!camOff} />

              {isDoctor && (
                <>
                  <ControlBtn icon={sharing ? 'monitor-off' : 'monitor'} label={sharing ? 'Arreter partage' : 'Partager ecran'} onClick={toggleShare} active={sharing} disabled={!isActive} />
                  <ControlBtn icon="image" label="Image medicale" onClick={() => setImgOpen(true)} disabled={!isActive} />
                  <RecordingControls sessionId={sid} isDoctor={isDoctor} mediaStream={screenStream || localStream} />
                </>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                <ControlBtn icon="message" label="Chat" onClick={() => setChatOpen(c => !c)} active={chatOpen} />
                {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
              </div>

              {isDoctor && isActive && (
                <ControlBtn icon="phone-off" label="Terminer" onClick={handleEnd} danger active disabled={ending} />
              )}
            </div>
          )}
        </div>

        {/* Chat sidebar */}
        {chatOpen && (
          <div style={{ width: 300, borderLeft: '1px solid #1e293b', background: 'white', display: 'flex', flexDirection: 'column', animation: 'tc-slide 0.2s ease' }}>
            <style>{`@keyframes tc-slide { from{transform:translateX(100%);opacity:0} to{transform:none;opacity:1} }`}</style>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${TC.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <TcIcon name="message" size={16} color={TC.primary} />
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: '0.88rem', color: '#111827' }}>Chat</span>
              </div>
              <button onClick={() => setChatOpen(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, padding: '4px 7px', cursor: 'pointer' }}>
                <TcIcon name="x" size={14} color="#6b7280" />
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ChatPane sessionId={sid} userId={currentUserId} />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <JoinLinkModal open={linkOpen} onClose={() => setLinkOpen(false)} sessionId={sid} getJoinLink={getJoinLink} />
      <ImageShareModal open={imgOpen} onClose={() => setImgOpen(false)} sessionId={sid} shareImage={shareImage} />
    </div>
  );
}






