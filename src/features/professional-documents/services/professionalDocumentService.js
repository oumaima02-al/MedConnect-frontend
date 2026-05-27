import api from '../../../services/api';

export const professionalDocumentService = {
  uploadDocument: ({ userId, profileType, side, file }) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('profileType', profileType);
    formData.append('side', side);
    formData.append('file', file);
    return api.post('/users/professional-documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  listByUser: (userId) =>
    api.get(`/users/professional-documents/user/${userId}`),

  downloadDocument: (documentId, { exp, sig }) =>
    api.get(`/users/professional-documents/${documentId}/download`, {
      params: { exp, sig },
      responseType: 'blob',
    }),

  getAuditLog: (userId) =>
    api.get(`/users/professional-documents/audit/${userId}`),
};
