import api from './api';

export const documentService = {
  /**
   * Upload a professional document (FRONT or BACK side of professional card).
   * @param {string} userId
   * @param {'DOCTOR'|'PHARMACIST'} profileType
   * @param {'FRONT'|'BACK'} side
   * @param {File} file
   */
  upload: async (userId, profileType, side, file) => {
    console.log(`[documentService] Uploading ${side} document for ${profileType} (User: ${userId})...`);
    console.log(`[documentService] File info: ${file.name} / ${file.size} bytes / ${file.type}`);

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('profileType', profileType);
    formData.append('side', side);
    formData.append('file', file);

    try {
      const response = await api.post('/users/professional-documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(`[documentService] Upload OK for ${side}:`, response.status, response.data);
      return response;
    } catch (error) {
      console.error(`[documentService] Upload FAILED for ${side}:`, error?.response?.status, error?.response?.data);
      throw error;
    }
  },

  /**
   * Get all professional documents uploaded by a user.
   * GET /api/users/professional-documents/user/{userId}
   */
  getDocumentsByUser: async (userId) => {
    console.log(`[documentService] Fetching documents for user: ${userId}`);
    const res = await api.get(`/users/professional-documents/user/${userId}`);
    console.log(`[documentService] Found ${(res.data?.data || res.data || []).length} document(s)`);
    return res;
  },

  /**
   * Get audit trail for a user's documents.
   * GET /api/users/professional-documents/audit/{userId}
   */
  getAuditByUser: (userId) =>
    api.get(`/users/professional-documents/audit/${userId}`),

  /**
   * Download a document by its ID.
   * GET /api/users/professional-documents/{documentId}/download
   */
  downloadDocument: (documentId, { exp, sig } = {}) => {
    const params = {};
    if (exp) params.exp = exp;
    if (sig) params.sig = sig;
    return api.get(`/users/professional-documents/${documentId}/download`, {
      params,
      responseType: 'blob',
    });
  },
};
