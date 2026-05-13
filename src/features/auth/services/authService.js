import api from '../../../services/api';

export const authService = {

  // ─── SIGNUP ───────────────────────────────────────────
  signup: ({ email, password, nom, prenom, telephone, role }) =>
    api.post('/auth/signup', { email, password, nom, prenom, telephone, role }),

  // ─── VERIFY EMAIL OTP ─────────────────────────────────
  verifyEmail: ({ email, otp }) =>
    api.post('/auth/verify-email', { email, otp }),

  // ─── RESEND OTP ───────────────────────────────────────
  resendOtp: ({ email }) =>
    api.post('/auth/resend-otp', { email }),

  // ─── LOGIN ────────────────────────────────────────────
  login: ({ email, password }) =>
    api.post('/auth/login', { email, password }),

  // ─── VERIFY LOGIN MFA ─────────────────────────────────
  verifyLogin: ({ email, otp, sessionToken }) =>
    api.post('/auth/verify-login', { email, otp, sessionToken }),

  // ─── LOGOUT ───────────────────────────────────────────
  logout: () => api.post('/auth/logout'),

  // ─── REFRESH TOKEN ────────────────────────────────────
  refreshToken: ({ refreshToken }) =>
    api.post('/auth/refresh', { refreshToken }),

  // ─── FORGOT PASSWORD ──────────────────────────────────
  forgotPassword: ({ email }) =>
    api.post('/auth/forgot-password', { email }),

  // ─── RESET PASSWORD ───────────────────────────────────
  resetPassword: ({ email, otp, newPassword }) =>
    api.post('/auth/reset-password', { email, otp, newPassword }),

  // ─── GOOGLE OAUTH ─────────────────────────────────────
  googleAuth: ({ idToken }) =>
    api.post('/auth/google', { idToken }),

  // ─── SESSION HELPERS ──────────────────────────────────
  saveSession: (data) => {
    localStorage.setItem('dawini_access_token',  data.accessToken);
    localStorage.setItem('dawini_refresh_token', data.refreshToken);
    localStorage.setItem('dawini_user',          JSON.stringify(data.user));
    localStorage.setItem('dawini_role',          data.user?.role || '');
  },

  clearSession: () => {
    ['dawini_access_token','dawini_refresh_token','dawini_user','dawini_role']
      .forEach(k => localStorage.removeItem(k));
  },

  getStoredUser: () => {
    try { return JSON.parse(localStorage.getItem('dawini_user')); }
    catch { return null; }
  },

  getStoredRole: () => localStorage.getItem('dawini_role'),
  getAccessToken: () => localStorage.getItem('dawini_access_token'),
};