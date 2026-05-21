import api from './api';

export const documentService = {
  /**
   * Upload a professional document (FRONT or BACK side of professional card).
   * @param {string} userId
   * @param {'DOCTOR'|'PHARMACIST'} profileType
   * @param {'FRONT'|'BACK'} side
   * @param {File} file
   * @returns {Promise<{data: {url: string}}>}
   */
  upload: (userId, profileType, side, file) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('profileType', profileType);
    formData.append('side', side);
    formData.append('file', file);

    return api.post('/users/professional-documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get all professional documents uploaded by a user.
   */
  getDocumentsByUser: (userId) =>
    api.get(`/users/professional-documents/user/${userId}`),
};
