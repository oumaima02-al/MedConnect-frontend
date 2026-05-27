import axios from 'axios';
import { ENV } from '../config/env';

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // for HttpOnly cookies
});

const getAccessToken = () =>
  localStorage.getItem('dawini_access_token') || localStorage.getItem('dawini_token');
const getRefreshToken = () => localStorage.getItem('dawini_refresh_token');
const clearStoredSession = () => {
  ['dawini_access_token', 'dawini_refresh_token', 'dawini_user', 'dawini_role', 'dawini_token']
    .forEach((key) => localStorage.removeItem(key));
};

let refreshPromise = null;

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalConfig = error.config;
    const isRefreshCall = originalConfig?.url?.includes('/auth/refresh');

    if (status === 401 && originalConfig && !originalConfig._retry && !isRefreshCall) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        originalConfig._retry = true;
        try {
          refreshPromise = refreshPromise || api.post('/auth/refresh', { refreshToken });
          const { data } = await refreshPromise;
          refreshPromise = null;
          const nextToken = data.token || data.accessToken;
          if (nextToken) {
            localStorage.setItem('dawini_access_token', nextToken);
            if (data.refreshToken) {
              localStorage.setItem('dawini_refresh_token', data.refreshToken);
            }
            originalConfig.headers.Authorization = `Bearer ${nextToken}`;
            return api(originalConfig);
          }
        } catch (refreshError) {
          refreshPromise = null;
          clearStoredSession();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      clearStoredSession();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
