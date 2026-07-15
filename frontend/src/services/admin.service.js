import api from './api';

export const getStudents = (params) => api.get('/admin/students', { params });

export const getStudentById = (userId) => api.get(`/admin/students/${userId}`);

export const updateStudentProfile = (userId, data) => api.put(`/admin/students/${userId}/profile`, data);

export const updateUser = (userId, data) => api.put(`/admin/students/${userId}/user`, data);

export const deleteStudent = (userId) => api.delete(`/admin/students/${userId}`);

export const exportStudents = (params) => api.get('/admin/students/export', { params, responseType: 'blob' });

export const getFilterOptions = () => api.get('/admin/filters');

export const updatePlacementStatus = (userId, status) =>
  api.put(`/admin/students/${userId}/profile`, { placementStatus: status });
