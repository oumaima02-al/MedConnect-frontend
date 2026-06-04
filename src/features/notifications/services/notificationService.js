import axios from 'axios';

const NOTIF_BASE = 'http://localhost:8080/api/notifications';

const getAccessToken = () =>
  localStorage.getItem('MedConnect_access_token') ||
  localStorage.getItem('MedConnect_token');
const getRefreshToken = () => localStorage.getItem('MedConnect_refresh_token');
const clearStoredSession = () => {
  ['MedConnect_access_token', 'MedConnect_refresh_token', 'MedConnect_user', 'MedConnect_role', 'MedConnect_token']
    .forEach((key) => localStorage.removeItem(key));
};

let notifRefreshPromise = null;

/** Dedicated axios instance for the Notification microservice */
const notifApi = axios.create({
  baseURL: NOTIF_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token — skip for the refresh endpoint
notifApi.interceptors.request.use((config) => {
  const isRefresh = config.url?.includes('/auth/refresh');
  if (!isRefresh) {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 → refresh token → retry
notifApi.interceptors.response.use(
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
          notifRefreshPromise = notifRefreshPromise || notifApi.post('/auth/refresh', { refreshToken });
          const { data } = await notifRefreshPromise;
          notifRefreshPromise = null;
          const nextToken = data.token || data.accessToken;
          if (nextToken) {
            localStorage.setItem('MedConnect_access_token', nextToken);
            if (data.refreshToken) localStorage.setItem('MedConnect_refresh_token', data.refreshToken);
            originalConfig.headers.Authorization = `Bearer ${nextToken}`;
            return notifApi(originalConfig);
          }
        } catch (refreshError) {
          notifRefreshPromise = null;
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

// ─────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────

/** Get all notifications for a user */
export const getAllNotifications = async (userId) => {
  const { data } = await notifApi.get(`/user/${userId}`);
  return Array.isArray(data) ? data : [];
};

/** Get only unread notifications (used for badge count) */
export const getUnreadNotifications = async (userId) => {
  const { data } = await notifApi.get(`/user/${userId}/unread`);
  return Array.isArray(data) ? data : [];
};

/** Mark a single notification as read */
export const markNotificationRead = async (notificationId) => {
  const { data } = await notifApi.put(`/${notificationId}/read`);
  return data;
};

/** Mark ALL unread notifications as read (helper — calls markNotificationRead for each) */
export const markAllNotificationsRead = async (userId) => {
  const unread = await getUnreadNotifications(userId);
  await Promise.all(unread.map((n) => markNotificationRead(n.id)));
  return unread.length;
};

/** Delete a notification */
export const deleteNotification = async (notificationId) => {
  const { data } = await notifApi.delete(`/${notificationId}`);
  return data;
};

/** Send a notification manually (admin use) */
export const sendNotification = async ({ userId, type, title, content, channels = ['IN_APP'], eventType = 'custom', resourceId }) => {
  const { data } = await notifApi.post('/send', { userId, type, title, content, channels, eventType, resourceId });
  return data;
};

// ─────────────────────────────────────────────────
// USER PREFERENCES
// ─────────────────────────────────────────────────

/** Get notification preferences for a user */
export const getPreferences = async (userId) => {
  const { data } = await notifApi.get(`/preferences/${userId}`);
  return data;
};

/** Update notification preferences */
export const updatePreferences = async (userId, prefs) => {
  const { data } = await notifApi.put(`/preferences/${userId}`, prefs);
  return data;
};

/** Opt-in to a notification type */
export const optIn = async (userId, notificationType) => {
  const { data } = await notifApi.post(`/opt-in/${notificationType}`, null, {
    params: { userId },
  });
  return data;
};

/** Opt-out of a notification type */
export const optOut = async (userId, notificationType) => {
  const { data } = await notifApi.post(`/opt-out/${notificationType}`, null, {
    params: { userId },
  });
  return data;
};

// ─────────────────────────────────────────────────
// ANALYTICS (admin)
// ─────────────────────────────────────────────────

/** Delivery stats by channel */
export const getDeliveryStats = async () => {
  const { data } = await notifApi.get('/delivery-stats');
  return data;
};

/** Engagement analytics (read rate) */
export const getEngagementStats = async () => {
  const { data } = await notifApi.get('/analytics/engagement');
  return data;
};

/** Opt-out rate analytics */
export const getOptOutStats = async () => {
  const { data } = await notifApi.get('/analytics/optout');
  return data;
};

// ─────────────────────────────────────────────────
// QUEUE MANAGEMENT (admin)
// ─────────────────────────────────────────────────

/** Queue a notification for later delivery */
export const queueNotification = async (payload) => {
  const { data } = await notifApi.post('/queue', payload);
  return data;
};

/** Manually trigger queue processing */
export const processQueue = async () => {
  const { data } = await notifApi.post('/queue/process');
  return data;
};

export default notifApi;
