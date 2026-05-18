import api from '../../../services/api';

export const doctorService = {

  // ─── SEARCH doctors ───────────────────────────
  // GET /users/doctors/search
  // Query: ?specialization=Cardiology&hospital=...
  search: ({ specialization, hospital, query } = {}) => {
    const params = {};
    if (specialization) params.specialization = specialization;
    if (hospital)       params.hospital       = hospital;
    if (query)          params.query          = query;
    return api.get('/users/doctors/search', { params });
  },

};