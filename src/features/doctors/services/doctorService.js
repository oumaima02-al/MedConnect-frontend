import api from '../../../services/api';

export const doctorService = {

  // ─── CREATE doctor profile ────────────────────
  // POST /users/doctors
  createProfile: (payload) =>
    api.post('/users/doctors', payload),

  // ─── SEARCH doctors ───────────────────────────
  // GET /users/doctors/search
  // Query: ?specialty=Cardiology&language=...&city=...
  search: ({ specialty, language, city } = {}) => {
    const params = {};
    if (specialty) params.specialty = specialty;
    if (language)  params.language  = language;
    if (city)      params.city      = city;
    return api.get('/users/doctors/search', { params });
  },

  // ─── GET doctor profile ───────────────────────
  // GET /users/doctors/{userId}
  getProfile: (userId) =>
    api.get(`/users/doctors/${userId}`),

  // ─── VERIFY doctor profile ────────────────────
  // PUT /users/doctors/{userId}/verification
  verifyProfile: (userId, { status, note }) =>
    api.put(`/users/doctors/${userId}/verification`, { status, note }),

};
