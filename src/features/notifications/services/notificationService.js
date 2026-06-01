import axios from 'axios';

const NOTIF_BASE = 'http://localhost:8088/api/notifications';

const getToken = () =>
  localStorage.getItem('MedConnect_access_token') ||
  localStorage.getItem('MedConnect_token');

/** Dedicated axios instance for the Notification microservice */
const notifApi = axios.create({
  baseURL: NOTIF_BASE,
  headers: { 'Content-Type': 'application/json' },
});

notifApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

notifApi.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const msg = err.response?.data?.message || err.response?.data || err.message;
    if (status === 401) window.location.href = '/login';
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)));
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
