import api from './api';

export const signup = (data) => api.post('/signup', data);

export const login = (data) => api.post('/login', data);

export const getMe = () => api.get('/me');

export const sendOTP = (data) => api.post('/send-otp', data);

export const verifyOTP = (data) => api.post('/verify-otp', data);
