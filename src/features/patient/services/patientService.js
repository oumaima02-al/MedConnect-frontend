import api from '../../../services/api';

export const patientService = {

  // ─── CREATE patient profile ───────────────────
  // POST /users/patients
  createProfile: ({ userId, dateOfBirth, bloodType, insuranceNumber, allergies }) =>
    api.post('/users/patients', { userId, dateOfBirth, bloodType, insuranceNumber, allergies }),

  // ─── GET patient profile ──────────────────────
  // GET /users/patients/{userId}
  getProfile: (userId) =>
    api.get(`/users/patients/${userId}`),

  // ─── UPDATE patient profile ───────────────────
  // PUT /users/patients/{userId}
  updateProfile: (userId, { dateOfBirth, bloodType, insuranceNumber, allergies }) =>
    api.put(`/users/patients/${userId}`, { dateOfBirth, bloodType, insuranceNumber, allergies }),

};
