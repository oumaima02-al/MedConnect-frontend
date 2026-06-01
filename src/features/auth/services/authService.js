import api from '../../../services/api';

export const authService = {

  // ─── SIGNUP ───────────────────────────────────────────
  signup: ({ email, password, nom, prenom, telephone, role }) =>
    api.post('/auth/signup', { email, password, nom, prenom, telephone, role }),

  // ─── VERIFY EMAIL OTP ─────────────────────────────────
  verifyEmail: ({ email, otp, code }) =>
    api.post('/auth/verify-email', { email, code: code || otp }),

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
    localStorage.setItem('MedConnect_access_token',  token || '');
    localStorage.setItem('MedConnect_refresh_token', data.refreshToken || '');
    localStorage.setItem('MedConnect_user',          JSON.stringify(userObj));
    localStorage.setItem('MedConnect_role',          normalizedRole);
  },

  clearSession: () => {
    ['MedConnect_access_token','MedConnect_refresh_token','MedConnect_user','MedConnect_role']
      .forEach(k => localStorage.removeItem(k));
  },

  getStoredUser: () => {
    try { return JSON.parse(localStorage.getItem('MedConnect_user')); }
    catch { return null; }
  },

  getStoredRole: () => localStorage.getItem('MedConnect_role'),
  getAccessToken: () => localStorage.getItem('MedConnect_access_token'),
};
