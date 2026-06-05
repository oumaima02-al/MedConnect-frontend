import api from './api';

// ─── DMP Service (routed through gateway to port 8083) ────────────────────
export const dmpService = {
  // Get complete DMP summary for a patient
  getDmp: (patientId) => api.get(`/dmp/${patientId}`),

  // Allergies
  getAllergies: (patientId) => api.get(`/dmp/${patientId}/allergies`),
  addAllergy: (patientId, data) => api.post(`/dmp/${patientId}/allergies`, data),
  updateAllergy: (patientId, allergyId, data) => api.put(`/dmp/${patientId}/allergies/${allergyId}`, data),
  deleteAllergy: (patientId, allergyId) => api.delete(`/dmp/${patientId}/allergies/${allergyId}`),

  // Medications (DMP history — different from Prescription service)
  getMedications: (patientId) => api.get(`/dmp/${patientId}/medications`),
  getCurrentMedications: (patientId) => api.get(`/dmp/${patientId}/medications/current`),

  // Health notebook (vitals)
  getHealthNotebook: (patientId) => api.get(`/dmp/${patientId}/health-notebook`),
  addVitals: (patientId, data) => api.post(`/dmp/${patientId}/health-notebook`, data),
  getHealthTrends: (patientId, params) => api.get(`/dmp/${patientId}/health-notebook/trends`, { params }),
  getHealthAlerts: (patientId) => api.get(`/dmp/${patientId}/health-notebook/alerts`),

  // Conditions
  getConditions: (patientId) => api.get(`/dmp/${patientId}/conditions`),
  addCondition: (patientId, data) => api.post(`/dmp/${patientId}/conditions`, data),

  // Consultations (DMP record)
  getConsultations: (patientId) => api.get(`/dmp/${patientId}/consultations`),

  // Lab results
  getLabResults: (patientId) => api.get(`/dmp/${patientId}/lab-results`),
  addLabResult: (patientId, data) => api.post(`/dmp/${patientId}/lab-results`, data),

  // Vaccinations
  getVaccinations: (patientId) => api.get(`/dmp/${patientId}/vaccinations`),

  // Documents
  getDocuments: (patientId) => api.get(`/dmp/${patientId}/documents`),

  // Imaging
  getImaging: (patientId) => api.get(`/dmp/${patientId}/imaging`),
  addImaging: (patientId, data) => api.post(`/dmp/${patientId}/imaging`, data),

  // Consent
  getConsents: (patientId) => api.get(`/dmp/${patientId}/consent`),
  grantConsent: (patientId, data) => api.put(`/dmp/${patientId}/consent`, data),
  revokeConsent: (patientId, doctorId, reason) =>
    api.delete(`/dmp/${patientId}/consent/${doctorId}`, { params: { reason } }),
  verifyConsent: (patientId, doctorId) => api.get(`/dmp/${patientId}/consent/verify/${doctorId}`),

  // Access log
  getAccessLog: (patientId) => api.get(`/dmp/${patientId}/access-log`),

  // Export FHIR
  exportFhir: (patientId) => api.post(`/dmp/export-fhir/${patientId}`),
};

// ─── Medical actions (Doctor-specific, posted to DMP service) ────────────
export const medicalService = {
  // Create a consultation note (Doctor → DMP)
  createConsultation: (patientId, data) =>
    api.post(`/dmp/${patientId}/consultations`, data),

  // Add lab result for a patient (Doctor → DMP)
  addLabResult: (patientId, data) =>
    api.post(`/dmp/${patientId}/lab-results`, data),

  // Add imaging for a patient (Doctor → DMP)
  addImaging: (patientId, data) =>
    api.post(`/dmp/${patientId}/imaging`, data),
};
