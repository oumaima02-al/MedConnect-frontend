import api from '../../../services/api';

export const patientService = {

  // ─── CREATE patient profile ───────────────────
  // POST /users/patients
  createProfile: ({ userId, bloodType, medicalHistory, allergies }) =>
    api.post('/users/patients', { userId, bloodType, medicalHistory, allergies }),

  // ─── GET patient profile ──────────────────────
  // GET /users/patients/{userId}
  getProfile: (userId) =>
    api.get(`/users/patients/${userId}`),

  // ─── UPDATE patient profile ───────────────────
  // PUT /users/patients/{userId}
  updateProfile: (userId, { bloodType, medicalHistory, allergies }) =>
    api.put(`/users/patients/${userId}`, { bloodType, medicalHistory, allergies }),

};