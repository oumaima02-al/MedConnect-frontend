import axios from 'axios';

const apptApi = axios.create({
  baseURL: 'http://localhost:8080/api',
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

let apptRefreshPromise = null;

// Attach token — skip for the refresh endpoint
apptApi.interceptors.request.use((config) => {
  const isRefresh = config.url?.includes('/auth/refresh');
  if (!isRefresh) {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 → refresh token → retry
apptApi.interceptors.response.use(
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
          apptRefreshPromise = apptRefreshPromise || apptApi.post('/auth/refresh', { refreshToken });
          const { data } = await apptRefreshPromise;
          apptRefreshPromise = null;
          const nextToken = data.token || data.accessToken;
          if (nextToken) {
            localStorage.setItem('MedConnect_access_token', nextToken);
            if (data.refreshToken) localStorage.setItem('MedConnect_refresh_token', data.refreshToken);
            originalConfig.headers.Authorization = `Bearer ${nextToken}`;
            return apptApi(originalConfig);
          }
        } catch (refreshError) {
          apptRefreshPromise = null;
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
// 1. APPOINTMENTS
// ──────────────────────────────────────────────────────────────
export const bookAppointment      = (data)              => apptApi.post('/appointments', data);
export const getAppointment       = (id)                => apptApi.get(`/appointments/${id}`);
export const rescheduleAppointment = (id, newDateTime)  => apptApi.put(`/appointments/${id}`, { newDateTime });
export const confirmAppointment   = (id)                => apptApi.post(`/appointments/${id}/confirm`);
export const rejectAppointment    = (id, reason)        => apptApi.post(`/appointments/${id}/reject`, null, { params: reason ? { reason } : {} });
export const cancelAppointment    = (id, reason)        => apptApi.delete(`/appointments/${id}`, { params: reason ? { reason } : {} });
export const getPatientAppointments = (patientId)       => apptApi.get(`/appointments/patient/${patientId}`);
export const getDoctorAppointments  = (doctorId)        => apptApi.get(`/appointments/doctor/${doctorId}`);

// ──────────────────────────────────────────────────────────────
// 2. CHECK-IN & QUEUE
// ──────────────────────────────────────────────────────────────
export const checkIn              = (id)                => apptApi.post(`/appointments/${id}/check-in`);
export const getQueuePosition     = (id)                => apptApi.get(`/appointments/${id}/queue-position`);
export const markNoShow           = (id)                => apptApi.post(`/appointments/${id}/no-show`);

// ──────────────────────────────────────────────────────────────
// 3. FEEDBACK
// ──────────────────────────────────────────────────────────────
export const submitFeedback       = (id, data)          => apptApi.post(`/appointments/${id}/feedback`, data);

// ──────────────────────────────────────────────────────────────
// 4. AGENDA / SCHEDULE
// ──────────────────────────────────────────────────────────────
export const createSchedule       = (doctorId, data)    => apptApi.post(`/agenda/${doctorId}/schedule`, data);
export const getSchedule          = (doctorId)          => apptApi.get(`/agenda/${doctorId}/schedule`);
export const updateSchedule       = (doctorId, data)    => apptApi.put(`/agenda/${doctorId}/schedule`, data);
export const getAvailableSlots    = (doctorId, date)    => apptApi.get(`/agenda/${doctorId}/slots`, { params: { date } });
export const addVacation          = (doctorId, data)    => apptApi.post(`/agenda/${doctorId}/vacation`, data);
export const removeVacation       = (doctorId, vacId)   => apptApi.delete(`/agenda/${doctorId}/vacation/${vacId}`);

// ──────────────────────────────────────────────────────────────
// 5. WAIT LIST
// ──────────────────────────────────────────────────────────────
export const addToWaitList        = (data)              => apptApi.post('/wait-list', data);
export const getWaitListPosition  = (patientId, doctorId) => apptApi.get(`/wait-list/${patientId}`, { params: { doctorId } });
export const removeFromWaitList   = (patientId, doctorId) => apptApi.delete(`/wait-list/${patientId}`, { params: { doctorId } });

// ──────────────────────────────────────────────────────────────
// 6. DOCTORS
// ──────────────────────────────────────────────────────────────
export const searchDoctors        = (specialty)         => apptApi.get('/doctors/search', { params: specialty ? { specialty } : {} });
export const getDoctorAvailability = (doctorId)         => apptApi.get(`/doctors/${doctorId}/availability`);

export default apptApi;
