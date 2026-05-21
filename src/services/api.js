import axios from 'axios';
import { ENV } from '../config/env';

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // for HttpOnly cookies
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const isAuthUrl = config.url?.includes('/auth/');
  const token = localStorage.getItem('dawini_access_token');
  if (token && !isAuthUrl) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthUrl = error.config?.url?.includes('/auth/');
    const url = error.config?.url || '';
    const isOnboardingRequest = 
      url.includes('/users/doctors') || 
      url.includes('/users/pharmacists') || 
      url.includes('/users/professional-documents');

    if (error.response?.status === 401 && !isAuthUrl && !isOnboardingRequest) {
      // Token expired — redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;