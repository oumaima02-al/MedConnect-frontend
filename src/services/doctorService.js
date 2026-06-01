import api from './api';

/**
 * doctorService – handles all Doctor-profile API calls.
 */
export const doctorService = {
  /**
   * Submit a "become a doctor" request.
   * POST /api/users/doctors
   * @param {Object} payload
   */
  createDoctorProfile: (payload) => api.post('/users/doctors', payload),

  /**
   * Fetch the doctor profile for a given userId (to check status).
   * GET /api/users/doctors/user/:userId
   * @param {string} userId
   */
  getDoctorProfileByUser: (userId) => api.get(`/users/doctors/user/${userId}`),
};
