import api from '../../../services/api';

export const batchImportService = {
  startImport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/batch-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getImportStatus: (importId) =>
    api.get(`/users/batch-import/${importId}/status`),
};
