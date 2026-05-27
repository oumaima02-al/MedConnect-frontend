import api from '../../../services/api';

export const authService = {

  // ─── SIGNUP ───────────────────────────────────────────
  signup: ({ email, password, nom, prenom, telephone, role }) =>
    api.post('/auth/signup', { email, password, nom, prenom, telephone, role }),

  // ─── VERIFY EMAIL OTP ─────────────────────────────────
  verifyEmail: ({ email, otp }) =>
    api.post('/auth/verify-email', { email, code: otp }),

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

  // ─── REFRESH TOKEN ────────────────────────────────────
  refreshToken: ({ refreshToken }) =>
    api.post('/auth/refresh', { refreshToken }),

  // ─── FORGOT PASSWORD ──────────────────────────────────
  forgotPassword: ({ email }) =>
    api.post('/auth/forgot-password', { email }),

  // ─── RESET PASSWORD ───────────────────────────────────
  resetPassword: ({ email, otp, newPassword }) =>
    api.post('/auth/reset-password', { email, code: otp, newPassword }),

  // ─── GOOGLE OAUTH ─────────────────────────────────────
  googleAuth: ({ idToken }) =>
    api.post('/auth/google', { idToken }),

  // ─── MFA SETUP ────────────────────────────────────────
  // POST /auth/mfa/setup → returns { secret, qrCode, backupCodes }
  setupMfa: ({ mfaMethod, phoneNumber } = {}) =>
    api.post('/auth/mfa/setup', { mfaMethod, ...(phoneNumber ? { phoneNumber } : {}) }),

  // ─── MFA VERIFY (during login flow) ───────────────────
  // POST /auth/mfa/verify → final step when mfaRequired=true at login
  verifyMfaLogin: ({ code, sessionToken }) =>
    api.post('/auth/mfa/verify', { code, sessionToken }),

  // ─── SESSION HELPERS ──────────────────────────────────
  saveSession: (data) => {
    const token = data.token || data.accessToken;
    const rawRole = data.user?.role || data.roles?.[0] || '';
    const normalizedRole = rawRole.replace('ROLE_', '');
    const userObj = data.user || {
      id: data.id || data.userId,
      email: data.email,
      role: normalizedRole,
    };
    localStorage.setItem('dawini_access_token',  token || '');
    localStorage.setItem('dawini_refresh_token', data.refreshToken || '');
    localStorage.setItem('dawini_user',          JSON.stringify(userObj));
    localStorage.setItem('dawini_role',          normalizedRole);
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