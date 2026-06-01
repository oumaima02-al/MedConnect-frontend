import axios from 'axios';

const tcApi = axios.create({
  baseURL: 'http://localhost:8086/api/teleconsult',
  headers: { 'Content-Type': 'application/json' },
});

tcApi.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('MedConnect_access_token') ||
    localStorage.getItem('MedConnect_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ──────────────────────────────────────────────────────────────
// 1. SESSION LIFECYCLE
// ──────────────────────────────────────────────────────────────
export const createSession    = (data)            => tcApi.post('/sessions', data);
export const getSession       = (id)              => tcApi.get(`/sessions/${id}`);
export const startSession     = (id)              => tcApi.post(`/sessions/${id}/start`);
export const getJoinLink      = (id, role)        => tcApi.get(`/sessions/${id}/join`, { params: { role } });
export const endSession       = (id)              => tcApi.post(`/sessions/${id}/end`);
export const getSessionStatus = (id)              => tcApi.get(`/sessions/${id}/status`);
export const getSessionSummary = (id)             => tcApi.get(`/sessions/${id}/summary`);

// ──────────────────────────────────────────────────────────────
// 2. CHAT
// ──────────────────────────────────────────────────────────────
export const getChatHistory   = (id)              => tcApi.get(`/sessions/${id}/chat`);
export const sendMessage      = (id, data)        => tcApi.post(`/sessions/${id}/chat/message`, data);

// ──────────────────────────────────────────────────────────────
// 3. RECORDING
// ──────────────────────────────────────────────────────────────
export const startRecording   = (id)              => tcApi.post(`/sessions/${id}/record-start`);
export const stopRecording    = (id)              => tcApi.post(`/sessions/${id}/record-stop`);
export const getRecording     = (id)              => tcApi.get(`/sessions/${id}/recording`);

// ──────────────────────────────────────────────────────────────
// 4. SCREEN SHARING
// ──────────────────────────────────────────────────────────────
export const startScreenShare = (id, doctorId)    => tcApi.post(`/sessions/${id}/share-screen/start`, null, { params: { doctorId } });
export const stopScreenShare  = (id)              => tcApi.post(`/sessions/${id}/share-screen/stop`);
export const shareImage       = (id, base64Image) => tcApi.post(`/sessions/${id}/share-screen/image`, base64Image, { headers: { 'Content-Type': 'text/plain' } });

// ──────────────────────────────────────────────────────────────
// 5. WAITING ROOM
// ──────────────────────────────────────────────────────────────
export const joinWaitingRoom  = (id, patientId)   => tcApi.post(`/sessions/${id}/waiting-room`, null, { params: { patientId } });
export const getQueuePosition = (id, patientId)   => tcApi.get(`/sessions/${id}/queue-position`, { params: { patientId } });
export const admitNextPatient = (id, patientId)   => tcApi.post(`/sessions/${id}/admit-next`, patientId ? { patientId } : undefined);
export const getDoctorQueue   = (doctorId)        => tcApi.get(`/wait-queue/${doctorId}`);

export default tcApi;
