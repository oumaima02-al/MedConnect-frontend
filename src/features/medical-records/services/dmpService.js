import axios from 'axios';

// DMP service routed through the API Gateway at port 8080
const dmpApi = axios.create({
  baseURL: 'http://localhost:8080/api/dmp',
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

let dmpRefreshPromise = null;

// Attach JWT token — skip for the refresh endpoint
dmpApi.interceptors.request.use((config) => {
  const isRefresh = config.url?.includes('/auth/refresh');
  if (!isRefresh) {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 → refresh token → retry
dmpApi.interceptors.response.use(
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
          dmpRefreshPromise = dmpRefreshPromise || dmpApi.post('/auth/refresh', { refreshToken });
          const { data } = await dmpRefreshPromise;
          dmpRefreshPromise = null;
          const nextToken = data.token || data.accessToken;
          if (nextToken) {
            localStorage.setItem('MedConnect_access_token', nextToken);
            if (data.refreshToken) localStorage.setItem('MedConnect_refresh_token', data.refreshToken);
            originalConfig.headers.Authorization = `Bearer ${nextToken}`;
            return dmpApi(originalConfig);
          }
        } catch (refreshError) {
          dmpRefreshPromise = null;
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// ──────────────────────────────────────────────────────────────
// 1. DMP SUMMARY
// ──────────────────────────────────────────────────────────────
export const getSummary = (patientId, includes = '') =>
  dmpApi.get(`/${patientId}${includes ? `?include=${includes}` : ''}`);

// ──────────────────────────────────────────────────────────────
// 2. ALLERGIES
// ──────────────────────────────────────────────────────────────
export const getAllergies       = (patientId)            => dmpApi.get(`/${patientId}/allergies`);
export const getAllergy         = (patientId, id)        => dmpApi.get(`/${patientId}/allergies/${id}`);
export const addAllergy        = (patientId, data)      => dmpApi.post(`/${patientId}/allergies`, data);
export const updateAllergy     = (patientId, id, data)  => dmpApi.put(`/${patientId}/allergies/${id}`, data);
export const deleteAllergy     = (patientId, id)        => dmpApi.delete(`/${patientId}/allergies/${id}`);
export const checkAllergen     = (patientId, allergen)  => dmpApi.get(`/${patientId}/allergies/check`, { params: { allergen } });

// ──────────────────────────────────────────────────────────────
// 3. MEDICATIONS
// ──────────────────────────────────────────────────────────────
export const getMedications    = (patientId)            => dmpApi.get(`/${patientId}/medications`);
export const getCurrentMeds    = (patientId)            => dmpApi.get(`/${patientId}/medications/current`);
export const getMedication     = (patientId, id)        => dmpApi.get(`/${patientId}/medications/${id}`);
export const addMedication     = (patientId, data)      => dmpApi.post(`/${patientId}/medications`, data);
export const updateMedication  = (patientId, id, data)  => dmpApi.put(`/${patientId}/medications/${id}`, data);
export const stopMedication    = (patientId, id)        => dmpApi.patch(`/${patientId}/medications/${id}/stop`);

// ──────────────────────────────────────────────────────────────
// 4. CHRONIC CONDITIONS
// ──────────────────────────────────────────────────────────────
export const getConditions     = (patientId)            => dmpApi.get(`/${patientId}/conditions`);
export const getCondition      = (patientId, id)        => dmpApi.get(`/${patientId}/conditions/${id}`);
export const addCondition      = (patientId, data)      => dmpApi.post(`/${patientId}/conditions`, data);
export const updateCondition   = (patientId, id, data)  => dmpApi.put(`/${patientId}/conditions/${id}`, data);
export const deleteCondition   = (patientId, id)        => dmpApi.delete(`/${patientId}/conditions/${id}`);

// ──────────────────────────────────────────────────────────────
// 5. CONSULTATIONS
// ──────────────────────────────────────────────────────────────
export const getConsultations  = (patientId)            => dmpApi.get(`/${patientId}/consultations`);
export const getConsultation   = (patientId, id)        => dmpApi.get(`/${patientId}/consultations/${id}`);
export const addConsultation   = (patientId, data)      => dmpApi.post(`/${patientId}/consultations`, data);

// ──────────────────────────────────────────────────────────────
// 6. CONSENT
// ──────────────────────────────────────────────────────────────
export const getConsents       = (patientId)              => dmpApi.get(`/${patientId}/consent`);
export const grantConsent      = (patientId, data)        => dmpApi.put(`/${patientId}/consent`, data);
export const revokeConsent     = (patientId, doctorId, reason) =>
  dmpApi.delete(`/${patientId}/consent/${doctorId}`, { params: reason ? { reason } : {} });
export const verifyConsent     = (patientId, doctorId)    => dmpApi.get(`/${patientId}/consent/verify/${doctorId}`);

// ──────────────────────────────────────────────────────────────
// 7. LAB RESULTS
// ──────────────────────────────────────────────────────────────
export const getLabResults     = (patientId)              => dmpApi.get(`/${patientId}/lab-results`);
export const getLabResult      = (patientId, id)          => dmpApi.get(`/${patientId}/lab-results/${id}`);
export const addLabResult      = (patientId, data)        => dmpApi.post(`/${patientId}/lab-results`, data);
export const updateLabResult   = (patientId, id, data)    => dmpApi.put(`/${patientId}/lab-results/${id}`, data);
export const getLabByCategory  = (patientId, category)    =>
  dmpApi.get(`/${patientId}/lab-results/by-category`, { params: { category } });

// ──────────────────────────────────────────────────────────────
// 8. VACCINATIONS
// ──────────────────────────────────────────────────────────────
export const getVaccinations   = (patientId)              => dmpApi.get(`/${patientId}/vaccinations`);
export const getVaccination    = (patientId, id)          => dmpApi.get(`/${patientId}/vaccinations/${id}`);
export const addVaccination    = (patientId, data)        => dmpApi.post(`/${patientId}/vaccinations`, data);
export const deleteVaccination = (patientId, id)          => dmpApi.delete(`/${patientId}/vaccinations/${id}`);
export const getUpcomingVax    = (patientId)              => dmpApi.get(`/${patientId}/vaccinations/upcoming`);

// ──────────────────────────────────────────────────────────────
// 9. DOCUMENTS
// ──────────────────────────────────────────────────────────────
export const getDocuments      = (patientId)              => dmpApi.get(`/${patientId}/documents`);
export const getDocument       = (patientId, id)          => dmpApi.get(`/${patientId}/documents/${id}`);
export const uploadDocument    = (patientId, data)        => dmpApi.post(`/${patientId}/documents`, data);
export const deleteDocument    = (patientId, id)          => dmpApi.delete(`/${patientId}/documents/${id}`);
export const getDocsByType     = (patientId, documentType) =>
  dmpApi.get(`/${patientId}/documents/by-type`, { params: { documentType } });

// ──────────────────────────────────────────────────────────────
// 10. IMAGING
// ──────────────────────────────────────────────────────────────
export const getImagingResults = (patientId)              => dmpApi.get(`/${patientId}/imaging`);
export const getImagingResult  = (patientId, id)          => dmpApi.get(`/${patientId}/imaging/${id}`);
export const addImaging        = (patientId, data)        => dmpApi.post(`/${patientId}/imaging`, data);
export const updateImaging     = (patientId, id, data)    => dmpApi.put(`/${patientId}/imaging/${id}`, data);
export const getImagingByType  = (patientId, type)        =>
  dmpApi.get(`/${patientId}/imaging/by-type`, { params: { type } });
export const getImagingByDate  = (patientId, startDate, endDate) =>
  dmpApi.get(`/${patientId}/imaging/by-date-range`, { params: { startDate, endDate } });

// ──────────────────────────────────────────────────────────────
// 11. HEALTH NOTEBOOK
// ──────────────────────────────────────────────────────────────
export const getHealthNotebook = (patientId)              => dmpApi.get(`/${patientId}/health-notebook`);
export const addVitals         = (patientId, data)        => dmpApi.post(`/${patientId}/health-notebook`, data);
export const getVitalTrends    = (patientId, params)      =>
  dmpApi.get(`/${patientId}/health-notebook/trends`, { params });
export const getHealthAlerts   = (patientId)              => dmpApi.get(`/${patientId}/health-notebook/alerts`);

// ──────────────────────────────────────────────────────────────
// 12. ACCESS LOG
// ──────────────────────────────────────────────────────────────
export const getAccessLog      = (patientId)              => dmpApi.get(`/${patientId}/access-log`);
export const getUnauthorized   = (patientId)              => dmpApi.get(`/${patientId}/access-log/unauthorized`);

// ──────────────────────────────────────────────────────────────
// 13. ALERTS & EXPORT
// ──────────────────────────────────────────────────────────────
export const getAlerts         = (patientId)              => dmpApi.get(`/${patientId}/alerts`);
export const exportFHIR        = (patientId)              => dmpApi.post(`/export-fhir/${patientId}`);

export default dmpApi;
