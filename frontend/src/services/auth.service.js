import api from './api';

export const signup = (data) => api.post('/signup', data);

export const login = (data) => api.post('/login', data);
