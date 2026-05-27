import api from '../../../services/api';

export const searchService = {
  searchUsers: ({ specialty, city } = {}) => {
    const params = {};
    if (specialty) params.specialty = specialty;
    if (city) params.city = city;
    return api.get('/users/search', { params });
  },
};
