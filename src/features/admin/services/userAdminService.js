import api from '../../../services/api';

export const userAdminService = {
  createUser: (payload) => api.post('/users', payload),
  listUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, payload) => api.put(`/users/${id}`, payload),
  deleteUser: (id) => api.delete(`/users/${id}`),
  suspendUser: (id) => api.put(`/users/${id}/suspend`),
};
