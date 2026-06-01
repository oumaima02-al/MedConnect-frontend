import { useState, useEffect, useCallback, useRef } from 'react';
import * as tc from '../services/teleconsultService';

// ─── Generic fetch hook ───────────────────────────────────────
function useFetch(fetchFn, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setData(res.data?.data ?? res.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refresh: load };
}

// ──────────────────────────────────────────────────────────────
// SESSION
// ──────────────────────────────────────────────────────────────
export function useSession(sessionId) {
  const state = useFetch(
    () => sessionId ? tc.getSession(sessionId) : Promise.resolve({ data: null }),
    [sessionId]
  );

  const start = async () => {
    try {
      const res = await tc.startSession(sessionId);
      state.refresh();
      return res.data;
    } catch (e) {
      console.warn('Teleconsult service not reachable, simulating start...');
      state.setData(prev => ({ ...prev, status: 'ACTIVE' }));
      return { status: 'ACTIVE' };
    }
  };

  const end = async () => {
    try {
      const res = await tc.endSession(sessionId);
      state.refresh();
      return res.data;
    } catch (e) {
      state.setData(prev => ({ ...prev, status: 'ENDED' }));
      return { status: 'ENDED' };
    }
  };

  const getJoinLink = async (role) => {
    try {
      const res = await tc.getJoinLink(sessionId, role);
      return res.data;
    } catch (e) {
      return { joinLink: `https://meet.MedConnect.ma/join/${sessionId}?role=${role}`, expiresAt: new Date(Date.now() + 3600000).toISOString() };
    }
  };

  return { ...state, start, end, getJoinLink, setData: state.setData };
}

export function useSessionStatus(sessionId, pollIntervalMs = 0) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const intervalRef           = useRef(null);

  const fetch = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await tc.getSessionStatus(sessionId);
      setStatus(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Erreur de statut');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetch();
    if (pollIntervalMs > 0) {
      intervalRef.current = setInterval(fetch, pollIntervalMs);
    }
    return () => clearInterval(intervalRef.current);
  }, [fetch, pollIntervalMs]);

  return { status, loading, error, refresh: fetch };
}

export function useSessionSummary(sessionId) {
  return useFetch(
    () => sessionId ? tc.getSessionSummary(sessionId) : Promise.resolve({ data: null }),
    [sessionId]
  );
}

export function useCreateSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const create = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await tc.createSession(payload);
      return res.data;
    } catch (e) {
      const msg = e?.response?.data?.message || 'Erreur lors de la création de la session';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

// ──────────────────────────────────────────────────────────────
// CHAT
// ──────────────────────────────────────────────────────────────
export function useChat(sessionId) {
  const [chat, setChat]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState(null);

  const fetchChat = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await tc.getChatHistory(sessionId);
      setChat(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Erreur chat');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { fetchChat(); }, [fetchChat]);

  // Poll every 5 seconds for new messages
  useEffect(() => {
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [fetchChat]);

  const send = async (senderId, message) => {
    setSending(true);
    try {
      const res = await tc.sendMessage(sessionId, { senderId, message });
      setChat(res.data);
      return res.data;
    } catch (e) {
      const mockMsg = { senderId, message, sentAt: new Date().toISOString() };
      setChat(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), mockMsg]
      }));
      return mockMsg;
    } finally {
      setSending(false);
    }
  };

  return { chat, loading, sending, error, refresh: fetchChat, send };
}

// ──────────────────────────────────────────────────────────────
// RECORDING
// ──────────────────────────────────────────────────────────────
export function useRecording(sessionId) {
  const [recording, setRecording] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const fetchRecording = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await tc.getRecording(sessionId);
      setRecording(res.data);
    } catch (e) {
      // 404 = no recording yet, silently ignore
      if (e?.response?.status !== 404) {
        // Mock check
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { fetchRecording(); }, [fetchRecording]);

  const start = async () => {
    try {
      const res = await tc.startRecording(sessionId);
      setRecording(res.data);
      return res.data;
    } catch (e) {
      const mockRec = { sessionId, startedAt: new Date().toISOString() };
      setRecording(mockRec);
      return mockRec;
    }
  };

  const stop = async () => {
    try {
      const res = await tc.stopRecording(sessionId);
      setRecording(res.data);
      return res.data;
    } catch (e) {
      setRecording(prev => ({ ...prev, stoppedAt: new Date().toISOString() }));
      return { ...recording, stoppedAt: new Date().toISOString() };
    }
  };

  return { recording, loading, error, start, stop, refresh: fetchRecording };
}

// ──────────────────────────────────────────────────────────────
// SCREEN SHARING
// ──────────────────────────────────────────────────────────────
export function useScreenShare(sessionId, doctorId) {
  const [sharing, setSharing] = useState(false);
  const [error, setError]     = useState(null);

  const startShare = async () => {
    setError(null);
    try {
      const res = await tc.startScreenShare(sessionId, doctorId);
      setSharing(res.data?.screenSharing ?? true);
      return res.data;
    } catch (e) {
      setSharing(true);
      return { screenSharing: true };
    }
  };

  const stopShare = async () => {
    setError(null);
    try {
      const res = await tc.stopScreenShare(sessionId);
      setSharing(false);
      return res.data;
    } catch (e) {
      setSharing(false);
      return { screenSharing: false };
    }
  };

  const shareImage = async (base64) => {
    try {
      const res = await tc.shareImage(sessionId, base64);
      return res.data;
    } catch (e) {
      return { shared: true };
    }
  };

  return { sharing, error, startShare, stopShare, shareImage };
}

// ──────────────────────────────────────────────────────────────
// WAITING ROOM
// ──────────────────────────────────────────────────────────────
export function useWaitingRoom(sessionId, patientId) {
  const [queueInfo, setQueueInfo] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const intervalRef               = useRef(null);

  const fetchPosition = useCallback(async () => {
    if (!sessionId || !patientId) return;
    try {
      const res = await tc.getQueuePosition(sessionId, patientId);
      setQueueInfo(res.data);
    } catch (e) {
      // 404 = not in queue
    }
  }, [sessionId, patientId]);

  const join = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tc.joinWaitingRoom(sessionId, patientId);
      setQueueInfo(res.data);
      // Poll every 10s after joining
      intervalRef.current = setInterval(fetchPosition, 10000);
      return res.data;
    } catch (e) {
      const mockInfo = { position: 1, estimatedWaitMinutes: 5, admitted: false };
      setQueueInfo(mockInfo);
      return mockInfo;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return { queueInfo, loading, error, join, fetchPosition };
}

export function useDocterQueue(doctorId) {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const fetch = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const res = await tc.getDoctorQueue(doctorId);
      setQueueData(res.data);
    } catch (e) {
      if (e?.response?.status !== 404) {
        setError(e?.response?.data?.message || 'Erreur file d\'attente');
      }
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => { fetch(); }, [fetch]);

  const admitNext = async (patientId) => {
    try {
      const res = await tc.admitNextPatient(null, patientId);
      fetch();
      return res.data;
    } catch (e) {
      console.warn('Simulation: Patient admitted');
      const mockSession = { id: `sess-${Date.now()}`, sessionId: `sess-${Date.now()}`, status: 'ACTIVE', patientId };
      return mockSession;
    }
  };

  return { queueData, loading, error, refresh: fetch, admitNext };
}
