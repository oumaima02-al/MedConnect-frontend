import api from '../../../services/api';

export const clinicService = {
  createClinic: (userId, { name, siretNumber }) =>
    api.post(`/users/${userId}/clinics`, { name, siretNumber }),
  inviteMember: (clinicId, { userEmail }) =>
    api.post(`/users/clinics/${clinicId}/invite`, { userEmail }),
  listClinics: (userId) =>
    api.get(`/users/${userId}/clinics`),
};
