import api from './api';

export const createStudentProfile = (data) => api.post('/student-profile', data);

export const createSemesterResult = (data) => api.post('/semester-results', data);

export const uploadDocument = (formData) =>
  api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
