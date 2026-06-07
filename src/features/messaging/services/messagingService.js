import axios from 'axios';

const MESSAGING_BASE = 'http://localhost:8080/api/messages';

const getAccessToken = () =>
  localStorage.getItem('MedConnect_access_token') ||
  localStorage.getItem('MedConnect_token');
const getRefreshToken = () => localStorage.getItem('MedConnect_refresh_token');
const clearStoredSession = () => {
  ['MedConnect_access_token', 'MedConnect_refresh_token', 'MedConnect_user', 'MedConnect_role', 'MedConnect_token']
    .forEach((key) => localStorage.removeItem(key));
};

let messagingRefreshPromise = null;

/** Axios instance scoped to the messaging microservice */
const messagingApi = axios.create({
  baseURL: MESSAGING_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token — skip for the refresh endpoint
messagingApi.interceptors.request.use((config) => {
  const isRefresh = config.url?.includes('/auth/refresh');
  if (!isRefresh) {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 → refresh token → retry
messagingApi.interceptors.response.use(
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
          messagingRefreshPromise = messagingRefreshPromise || messagingApi.post('/auth/refresh', { refreshToken });
          const { data } = await messagingRefreshPromise;
          messagingRefreshPromise = null;
          const nextToken = data.token || data.accessToken;
          if (nextToken) {
            localStorage.setItem('MedConnect_access_token', nextToken);
            if (data.refreshToken) localStorage.setItem('MedConnect_refresh_token', data.refreshToken);
            originalConfig.headers.Authorization = `Bearer ${nextToken}`;
            return messagingApi(originalConfig);
          }
        } catch (refreshError) {
          messagingRefreshPromise = null;
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────
// CONVERSATIONS
// ─────────────────────────────────────────────────

/** Create a new conversation */
export const createConversation = async (participants, type = 'ONE_TO_ONE') => {
  const { data } = await messagingApi.post('/conversations', { participants, type });
  return data;
};

/** Get all non-archived conversations for a user */
export const getUserConversations = async (userId) => {
  const { data } = await messagingApi.get('/conversations', { params: { userId } });
  return Array.isArray(data) ? data : [];
};

/** Get a single conversation by ID */
export const getConversationById = async (conversationId) => {
  const { data } = await messagingApi.get(`/conversations/${conversationId}`);
  return data;
};

/** Archive a conversation */
export const archiveConversation = async (conversationId) => {
  const { data } = await messagingApi.put(`/conversations/${conversationId}/archive`);
  return data;
};

/** Unarchive a conversation */
export const unarchiveConversation = async (conversationId) => {
  const { data } = await messagingApi.put(`/conversations/${conversationId}/unarchive`);
  return data;
};

/** Mute a conversation */
export const muteConversation = async (conversationId) => {
  const { data } = await messagingApi.put(`/conversations/${conversationId}/mute`);
  return data;
};

/** Pin a conversation */
export const pinConversation = async (conversationId) => {
  const { data } = await messagingApi.put(`/conversations/${conversationId}/pin`);
  return data;
};

// ─────────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────────

/** Send a message to a conversation */
export const sendMessage = async (conversationId, senderId, content, messageType = 'TEXT') => {
  const { data } = await messagingApi.post(`/conversations/${conversationId}/messages`, {
    conversationId,
    senderId,
    content,
    messageType,
  });
  return data;
};

/** Get paginated messages for a conversation */
export const getMessages = async (conversationId, page = 0, size = 30) => {
  const { data } = await messagingApi.get(`/conversations/${conversationId}/messages`, {
    params: { page, size },
  });
  return Array.isArray(data) ? data : [];
};

/** Edit a message (max 15 min after sending) */
export const editMessage = async (messageId, newContent) => {
  const { data } = await messagingApi.put(`/${messageId}/edit`, null, {
    params: { newContent },
  });
  return data;
};

/** Delete a message (max 1 hour after sending) */
export const deleteMessage = async (messageId) => {
  const { data } = await messagingApi.delete(`/${messageId}`);
  return data;
};

/** Search within messages */
export const searchMessages = async (conversationId, query) => {
  const { data } = await messagingApi.get('/search', {
    params: { conversationId, query },
  });
  return Array.isArray(data) ? data : [];
};

// ─────────────────────────────────────────────────
// READ RECEIPTS
// ─────────────────────────────────────────────────

/** Mark a message as read */
export const markMessageRead = async (messageId, userId) => {
  const { data } = await messagingApi.put(`/${messageId}/read`, null, {
    params: { userId },
  });
  return data;
};

/** Get read receipts for a message */
export const getMessageReceipts = async (messageId) => {
  const { data } = await messagingApi.get(`/${messageId}/receipts`);
  return Array.isArray(data) ? data : [];
};

// ─────────────────────────────────────────────────
// TYPING INDICATOR
// ─────────────────────────────────────────────────

/** Trigger typing indicator */
export const sendTypingIndicator = async (conversationId, userId) => {
  const { data } = await messagingApi.get(`/conversations/${conversationId}/typing`, {
    params: { userId },
  });
  return data;
};

// ─────────────────────────────────────────────────
// REACTIONS
// ─────────────────────────────────────────────────

/** Add a reaction to a message */
export const addReaction = async (messageId, userId, emoji) => {
  const { data } = await messagingApi.post(`/${messageId}/react`, null, {
    params: { userId, emoji },
  });
  return data;
};

/** Remove a reaction */
export const removeReaction = async (messageId, userId, emoji) => {
  const { data } = await messagingApi.delete(`/${messageId}/react`, {
    params: { userId, emoji },
  });
  return data;
};

/** Get all reactions for a message */
export const getReactions = async (messageId) => {
  const { data } = await messagingApi.get(`/${messageId}/reactions`);
  return Array.isArray(data) ? data : [];
};

// ─────────────────────────────────────────────────
// ATTACHMENTS
// ─────────────────────────────────────────────────

/** Upload a file attachment */
export const uploadAttachment = async (conversationId, { messageId, fileName, fileType, fileSize, storageUrl }) => {
  const { data } = await messagingApi.post(`/conversations/${conversationId}/attachments`, null, {
    params: { messageId, fileName, fileType, fileSize, storageUrl },
  });
  return data;
};

/** Get all attachments for a conversation */
export const getConversationAttachments = async (conversationId) => {
  const { data } = await messagingApi.get(`/conversations/${conversationId}/attachments`);
  return Array.isArray(data) ? data : [];
};

/** Delete an attachment */
export const deleteAttachment = async (attachmentId) => {
  const { data } = await messagingApi.delete(`/attachments/${attachmentId}`);
  return data;
};

/** Scan an attachment for viruses */
export const scanAttachment = async (attachmentId) => {
  const { data } = await messagingApi.put(`/attachments/${attachmentId}/scan`);
  return data;
};

// ─────────────────────────────────────────────────
// ENCRYPTION
// ─────────────────────────────────────────────────

/** Initialize encryption for a conversation */
export const initEncryption = async (conversationId, userId) => {
  const { data } = await messagingApi.post(`/conversations/${conversationId}/init-encryption`, null, {
    params: { userId },
  });
  return data;
};

/** Rotate encryption keys */
export const rotateKeys = async (conversationId, userId) => {
  const { data } = await messagingApi.put(`/conversations/${conversationId}/rotate-keys`, null, {
    params: { userId },
  });
  return data;
};

// ─────────────────────────────────────────────────
// ACCESS CONTROL
// ─────────────────────────────────────────────────

/** Check if a user has access to a conversation */
export const checkAccess = async (conversationId, userId) => {
  const { data } = await messagingApi.get(`/conversations/${conversationId}/access`, {
    params: { userId },
  });
  return data;
};

// ─────────────────────────────────────────────────
// COMPLIANCE & AUDIT
// ─────────────────────────────────────────────────

/** Get audit log for a conversation */
export const getAuditLog = async (conversationId) => {
  const { data } = await messagingApi.get(`/conversations/${conversationId}/audit`);
  return Array.isArray(data) ? data : [];
};

/** Activate legal hold on a conversation */
export const activateLegalHold = async (conversationId) => {
  const { data } = await messagingApi.post(`/conversations/${conversationId}/legal-hold`);
  return data;
};

/** Apply retention policy (delete messages > 2 years) */
export const applyRetentionPolicy = async (conversationId) => {
  const { data } = await messagingApi.delete(`/conversations/${conversationId}/retention`);
  return data;
};

export default messagingApi;
