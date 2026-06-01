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
  createProfile: (profileData) => {
    // Backend expects exactly: userId, specialty, languages, city, clinicName, 
    // professionalRegistrationNumber, nationalIdNumber, registrationAuthority
    return api.post('/users/doctors', {
      userId: profileData.userId,
      specialty: profileData.specialty,
      languages: profileData.languages,
      city: profileData.city,
      clinicName: profileData.clinicName,
      professionalRegistrationNumber: profileData.professionalRegistrationNumber,
      nationalIdNumber: profileData.nationalIdNumber,
      registrationAuthority: profileData.registrationAuthority,
      // Keeping rppsLicense for backward compatibility if needed, but the error message asks for professionalRegistrationNumber
      rppsLicense: profileData.professionalRegistrationNumber,
    });
  },

  // ─── GET doctor profile ───────────────────────────────────
  // GET /users/doctors/{userId}
  getProfile: (userId) =>
    api.get(`/users/doctors/${userId}`),

};
