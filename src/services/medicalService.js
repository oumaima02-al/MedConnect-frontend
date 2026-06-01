import api from './api';

export const dmpService = {
  // Common
  getDmp: (patientId) => api.get(`/dmp/${patientId}`),
  
  // Patient specific
  getLoggedPatientDmp: () => api.get('/dmp/me'),
  addVitals: (data) => api.post('/dmp/me/vitals', data),
  addAllergy: (patientId, allergy) => api.post(`/dmp/${patientId}/allergies`, { name: allergy }),
  
  // Consent
  updateConsent: (doctorId, status) => api.put('/consent', { doctorId, status }),
  revokeConsent: (doctorId) => api.delete(`/consent/${doctorId}`),
  getConsentedDoctors: () => api.get('/consent/doctors'),
};

export const medicalService = {
  // Doctor specific
  createConsultation: (data) => api.post('/consultations', data),
  createPrescription: (data) => api.post('/medications', data),
  addLabResult: (data) => api.post('/lab-results', data),
  addImaging: (data) => api.post('/imaging', data),
};
