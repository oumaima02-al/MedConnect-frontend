import api from '../../../services/api';

export const pharmacistService = {

  // ─── CREATE pharmacist profile ────────────────────────────
  // POST /users/pharmacists
  // Backend expects: userId, finessNumber, pharmacyName, city, openingHours, deliveryAvailable
  createProfile: ({
    userId,
    professionalRegistrationNumber, // mapped → finessNumber
    pharmacyName,
    city,
    openingHours,
    deliveryAvailable,
  }) =>
    api.post('/users/pharmacists', {
      userId,
      finessNumber: professionalRegistrationNumber,
      pharmacyName,
      city,
      openingHours,
      deliveryAvailable,
    }),

  // ─── GET pharmacist profile ───────────────────────────────
  // GET /users/pharmacists/{userId}
  getProfile: (userId) =>
    api.get(`/users/pharmacists/${userId}`),

};
