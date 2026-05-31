import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('ps_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export function setAuthToken(token) {
  if (token) localStorage.setItem('ps_token', token);
  else localStorage.removeItem('ps_token');
}

export function getAuthToken() {
  return localStorage.getItem('ps_token');
}

export function absoluteAvatarUrl(rel) {
  if (!rel) return null;
  if (rel.startsWith('http')) return rel;
  return `${BACKEND_URL}${rel}`;
}
