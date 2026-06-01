import axios from 'axios';

const apptApi = axios.create({
  baseURL: 'http://localhost:8085/api',
  headers: { 'Content-Type': 'application/json' },
});

apptApi.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('MedConnect_access_token') ||
    localStorage.getItem('MedConnect_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ──────────────────────────────────────────────────────────────
// 1. APPOINTMENTS
// ──────────────────────────────────────────────────────────────
export const bookAppointment      = (data)              => apptApi.post('/appointments', data);
export const getAppointment       = (id)                => apptApi.get(`/appointments/${id}`);
export const rescheduleAppointment = (id, newDateTime)  => apptApi.put(`/appointments/${id}`, { newDateTime });
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
