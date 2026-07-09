import api from './api';

export const createStudentProfile = (data) => api.post('/student-profile', data);

export const getStudentProfile = (userId) => api.get(`/student-profile/${userId}`);

export const getSemesterResults = (userId) => api.get(`/semester-results/${userId}`);

export const getDocument = (userId) => api.get(`/documents/${userId}`);

export const updateStudentProfile = (userId, data) => api.put(`/student-profile/${userId}`, data);

export const updateUser = (userId, data) => api.put(`/user/${userId}`, data);

export const createSemesterResult = (data) => api.post('/semester-results', data);

export const uploadDocument = (formData) =>
  api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
