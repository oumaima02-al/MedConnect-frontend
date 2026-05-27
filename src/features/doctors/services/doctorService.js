import api from '../../../services/api';

export const doctorService = {

  // ─── SEARCH doctors ───────────────────────────────────────
  // GET /users/doctors/search?specialty=&language=&city=
  search: ({ specialty, language, city } = {}) => {
    const params = {};
    if (specialty) params.specialty = specialty;
    if (language)  params.language  = language;
    if (city)      params.city      = city;
    return api.get('/users/doctors/search', { params });
  },

  // ─── CREATE doctor profile ────────────────────────────────
  // POST /users/doctors
  // Backend expects: userId, rppsLicense, specialty, languages, city, clinicName
  createProfile: ({
    userId,
    professionalRegistrationNumber, // mapped → rppsLicense
    specialty,
    languages,
    city,
    clinicName,
  }) =>
    api.post('/users/doctors', {
      userId,
      rppsLicense: professionalRegistrationNumber,
      specialty,
      languages,
      city,
      clinicName,
    }),

  // ─── GET doctor profile ───────────────────────────────────
  // GET /users/doctors/{userId}
  getProfile: (userId) =>
    api.get(`/users/doctors/${userId}`),

};