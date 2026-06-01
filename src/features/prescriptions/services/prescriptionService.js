import axios from 'axios';

const rxApi = axios.create({
  baseURL: 'http://localhost:8084/api',
  headers: { 'Content-Type': 'application/json' },
});

rxApi.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('MedConnect_access_token') ||
    localStorage.getItem('MedConnect_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ──────────────────────────────────────────────────────────────
// 1. PRESCRIPTION MANAGEMENT
// ──────────────────────────────────────────────────────────────
export const createPrescription    = (data)                    => rxApi.post('/prescriptions', data);
export const getPrescription       = (id)                      => rxApi.get(`/prescriptions/${id}`);
export const updatePrescription    = (id, data)                => rxApi.put(`/prescriptions/${id}`, data);
export const cancelPrescription    = (id)                      => rxApi.delete(`/prescriptions/${id}`);
export const getPatientRx          = (patientId)               => rxApi.get(`/prescriptions/patient/${patientId}`);
export const filterPrescriptions   = (params)                  => rxApi.get('/prescriptions', { params });

// ──────────────────────────────────────────────────────────────
// 2. PRESCRIPTION ITEMS
// ──────────────────────────────────────────────────────────────
export const addItem               = (rxId, data)              => rxApi.post(`/prescriptions/${rxId}/items`, data);
export const updateItem            = (rxId, itemId, data)      => rxApi.put(`/prescriptions/${rxId}/items/${itemId}`, data);
export const deleteItem            = (rxId, itemId)            => rxApi.delete(`/prescriptions/${rxId}/items/${itemId}`);

// ──────────────────────────────────────────────────────────────
// 3. PRESCRIPTION REFILLS
// ──────────────────────────────────────────────────────────────
export const requestRefill         = (rxId, data)              => rxApi.post(`/prescriptions/${rxId}/refill`, data);
export const getRefillHistory      = (rxId)                    => rxApi.get(`/prescriptions/${rxId}/refill-history`);
export const updateRefillStatus    = (rxId, data)              => rxApi.put(`/prescriptions/${rxId}/refill-status`, data);

// ──────────────────────────────────────────────────────────────
// 4. PHARMACY MANAGEMENT
// ──────────────────────────────────────────────────────────────
export const getPharmacies         = ()                        => rxApi.get('/pharmacies');
export const assignPharmacy        = (rxId, pharmacyId)        => rxApi.post(`/prescriptions/${rxId}/assign-pharmacy`, { pharmacyId });
export const getPharmacyStatus     = (rxId)                    => rxApi.get(`/prescriptions/${rxId}/pharmacy-status`);

// ──────────────────────────────────────────────────────────────
// 5. NOTIFICATIONS
// ──────────────────────────────────────────────────────────────
export const getNotifications      = ()                        => rxApi.get('/notifications/prescription');
export const acknowledgeNotifs     = (notificationIds)         => rxApi.post('/notifications/prescription/acknowledge', { notificationIds });

// ──────────────────────────────────────────────────────────────
// 6. SEARCH
// ──────────────────────────────────────────────────────────────
export const searchPrescriptions   = (params)                  => rxApi.get('/prescriptions/search', { params });

export default rxApi;
