import api from '../../../services/api';

export const pharmacistService = {
  createProfile: (payload) => api.post('/users/pharmacists', payload),
  getProfile: (userId) => api.get(`/users/pharmacists/${userId}`),
  verifyProfile: (userId, { status, note }) =>
    api.put(`/users/pharmacists/${userId}/verification`, { status, note }),
};
