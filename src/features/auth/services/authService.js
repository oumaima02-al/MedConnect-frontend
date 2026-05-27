import api from '../../../services/api';

export const authService = {

  // ─── SIGNUP ───────────────────────────────────────────
  signup: ({ email, password, nom, prenom, telephone }) =>
    api.post('/auth/signup', { email, password, nom, prenom, telephone }),
  register: ({ email, password, nom, prenom, telephone }) =>
    api.post('/auth/register', { email, password, nom, prenom, telephone }),

  // ─── VERIFY EMAIL OTP ─────────────────────────────────
  verifyEmail: ({ email, code }) =>
    api.post('/auth/verify-email', { email, code }),

  // ─── RESEND OTP ───────────────────────────────────────
  resendOtp: ({ email }) =>
    api.post('/auth/resend-otp', { email }),

  // ─── LOGIN ────────────────────────────────────────────
  login: ({ email, password }) =>
    api.post('/auth/login', { email, password }),

  // ─── VERIFY LOGIN MFA ─────────────────────────────────
  verifyLogin: ({ email, code }) =>
    api.post('/auth/verify-login', { email, code }),

  // ─── LOGOUT ───────────────────────────────────────────
  logout: () => api.post('/auth/logout'),

  // ─── SESSIONS ─────────────────────────────────────────
  getSessions: () => api.get('/auth/sessions'),
  revokeSession: (sessionId) => api.delete(`/auth/sessions/${sessionId}`),
  logoutAllDevices: () => api.post('/auth/logout-all-devices'),

  // ─── MFA SETUP/VERIFY ─────────────────────────────────
  setupMfa: ({ method, phoneNumber }) =>
    api.post('/auth/mfa/setup', { method, phoneNumber }),
  verifyMfa: ({ method, code }) =>
    api.post('/auth/mfa/verify', { method, code }),

  // ─── REFRESH TOKEN ────────────────────────────────────
  refreshToken: ({ refreshToken }) =>
    api.post('/auth/refresh', { refreshToken }),

  // ─── FORGOT PASSWORD ──────────────────────────────────
  forgotPassword: ({ email }) =>
    api.post('/auth/forgot-password', { email }),

  // ─── RESET PASSWORD ───────────────────────────────────
  resetPassword: ({ email, code, newPassword }) =>
    api.post('/auth/reset-password', { email, code, newPassword }),

  // ─── GOOGLE OAUTH ─────────────────────────────────────
  googleAuth: ({ idToken }) =>
    api.post('/auth/google', { idToken }),

  // ─── SESSION HELPERS ──────────────────────────────────
  saveSession: (data) => {
    const session = normalizeJwtResponse(data);
    if (session.accessToken) {
      localStorage.setItem('dawini_access_token', session.accessToken);
    }
    if (session.refreshToken) {
      localStorage.setItem('dawini_refresh_token', session.refreshToken);
    }
    if (session.user) {
      localStorage.setItem('dawini_user', JSON.stringify(session.user));
      if (session.user.role) {
        localStorage.setItem('dawini_role', session.user.role);
      }
    }
    return session;
  },

  clearSession: () => {
    ['dawini_access_token','dawini_refresh_token','dawini_user','dawini_role','dawini_token']
      .forEach(k => localStorage.removeItem(k));
  },

  getStoredUser: () => {
    try { return JSON.parse(localStorage.getItem('dawini_user')); }
    catch { return null; }
  },

  getStoredRole: () => localStorage.getItem('dawini_role'),
  getAccessToken: () =>
    localStorage.getItem('dawini_access_token') || localStorage.getItem('dawini_token'),
};

const normalizeJwtResponse = (data = {}) => {
  const accessToken = data.token || data.accessToken;
  const refreshToken = data.refreshToken;
  const roles = data.roles || data.user?.roles || [];
  const roleFromRoles = roles?.[0]?.replace(/^ROLE_/, '') || '';
  const baseUser = data.user || {
    id: data.id || data.userId,
    email: data.email,
  };

  const user = {
    ...baseUser,
    roles: baseUser.roles || roles,
    role: baseUser.role || roleFromRoles,
  };

  return { accessToken, refreshToken, user };
};
