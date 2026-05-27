import api from '../../../services/api';

export const adminService = {

  // ─── LIST users (paginated) ───────────────────────────────
  // GET /users?page=0&size=20
  getUsers: ({ page = 0, size = 20, query = '', role = '', enabled = '' } = {}) => {
    const params = { page, size };
    if (query)   params.query   = query;
    if (role)    params.role    = role;
    if (enabled !== '') params.enabled = enabled;
    return api.get('/users', { params });
  },

  // ─── GET user by ID ───────────────────────────────────────
  getUserById: (id) => api.get(`/users/${id}`),

  // ─── CREATE user (admin) ──────────────────────────────────
  // POST /users
  createUser: ({ email, password, nom, prenom, telephone, role }) =>
    api.post('/users', {
      email,
      motDePasse: password,
      nom,
      prenom,
      telephone,
      roles: role ? [`ROLE_${role.toUpperCase()}`] : [],
    }),

  // ─── UPDATE user ──────────────────────────────────────────
  // PUT /users/{id}
  updateUser: (id, { nom, prenom, telephone, email }) =>
    api.put(`/users/${id}`, { nom, prenom, telephone, email }),

  // ─── DELETE user ──────────────────────────────────────────
  deleteUser: (id) => api.delete(`/users/${id}`),

  // ─── SUSPEND user ─────────────────────────────────────────
  // PUT /users/{id}/suspend
  suspendUser: (id) => api.put(`/users/${id}/suspend`),

  // ─── SEARCH users ─────────────────────────────────────────
  // GET /users/search?query=&role=&enabled=
  searchUsers: ({ query = '', role = '', enabled = '' } = {}) => {
    const params = {};
    if (query)   params.query   = query;
    if (role)    params.role    = role;
    if (enabled !== '') params.enabled = enabled;
    return api.get('/users/search', { params });
  },

  // ─── VERIFY doctor profile ────────────────────────────────
  // PUT /users/doctors/{userId}/verification
  verifyDoctor: (userId, status) =>
    api.put(`/users/doctors/${userId}/verification`, { status, verified: status === 'VERIFIED' }),

  // ─── VERIFY pharmacist profile ────────────────────────────
  // PUT /users/pharmacists/{userId}/verification
  verifyPharmacist: (userId, status) =>
    api.put(`/users/pharmacists/${userId}/verification`, { status, verified: status === 'VERIFIED' }),

};

