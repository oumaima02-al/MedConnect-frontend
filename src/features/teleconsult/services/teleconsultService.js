import axios from 'axios';

const tcApi = axios.create({
  baseURL: 'http://localhost:8080/api/teleconsult',
  headers: { 'Content-Type': 'application/json' },
});

const getAccessToken = () =>
  localStorage.getItem('MedConnect_access_token') ||
  localStorage.getItem('MedConnect_token');
const getRefreshToken = () => localStorage.getItem('MedConnect_refresh_token');
const clearStoredSession = () => {
  ['MedConnect_access_token', 'MedConnect_refresh_token', 'MedConnect_user', 'MedConnect_role', 'MedConnect_token']
    .forEach((key) => localStorage.removeItem(key));
};

let tcRefreshPromise = null;

// Attach token — skip for the refresh endpoint
tcApi.interceptors.request.use((config) => {
  const isRefresh = config.url?.includes('/auth/refresh');
  if (!isRefresh) {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 → refresh token → retry
tcApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalConfig = error.config;
    const isRefreshCall = originalConfig?.url?.includes('/auth/refresh');

    if (status === 401 && originalConfig && !originalConfig._retry && !isRefreshCall) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        originalConfig._retry = true;
        try {
          tcRefreshPromise = tcRefreshPromise || tcApi.post('/auth/refresh', { refreshToken });
          const { data } = await tcRefreshPromise;
          tcRefreshPromise = null;
          const nextToken = data.token || data.accessToken;
          if (nextToken) {
            localStorage.setItem('MedConnect_access_token', nextToken);
            if (data.refreshToken) localStorage.setItem('MedConnect_refresh_token', data.refreshToken);
            originalConfig.headers.Authorization = `Bearer ${nextToken}`;
            return tcApi(originalConfig);
          }
        } catch (refreshError) {
          tcRefreshPromise = null;
          clearStoredSession();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      clearStoredSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
