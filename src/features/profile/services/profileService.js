import api from '../../../services/api';

export const profileService = {

  // ─── GET current user profile ─────────────────
  getMe: () =>
    api.get('/users/me'),

  // ─── UPDATE current user profile ──────────────
  updateMe: ({ nom, prenom, telephone }) =>
    api.put('/users/me', { nom, prenom, telephone }),

};