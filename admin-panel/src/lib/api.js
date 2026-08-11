import axios from 'axios';

const BASE_URL = 'https://easyservice.tech';

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

export const adminApi = axios.create({
  baseURL: `${BASE_URL}/api/admin`,
  headers: { 'Content-Type': 'application/json' },
});

export const getToken = () => localStorage.getItem('authToken');
export const setToken = (token) => localStorage.setItem('authToken', token);
export const clearToken = () => localStorage.removeItem('authToken');

const attachToken = (config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

const handleUnauthorized = (err) => {
  if (err.response?.status === 401) {
    clearToken();
    if (!window.location.pathname.startsWith('/auth')) {
      window.location.href = '/auth/login';
    }
  }
  return Promise.reject(err);
};

api.interceptors.request.use(attachToken);
api.interceptors.response.use((res) => res, handleUnauthorized);
adminApi.interceptors.request.use(attachToken);
adminApi.interceptors.response.use((res) => res, handleUnauthorized);

export default api;
