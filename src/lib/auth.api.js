import { http } from './http';

export const authApi = {
  register: (body) => http.post('/auth/register', body).then((r) => r.data),
  login: (body) => http.post('/auth/login', body).then((r) => r.data),
  refresh: (body) => http.post('/auth/refresh', body).then((r) => r.data),
  logout: () => http.post('/auth/logout').then((r) => r.data),
  me: () => http.get('/auth/me').then((r) => r.data),
  updateMe: (body) => http.patch('/auth/me', body).then((r) => r.data),
  deleteMe: () => http.delete('/auth/me').then((r) => r.data),
};
