import api from './api';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),

  register: (data: { name: string; email: string; password: string; role: string; organizationName?: string; department?: string }) =>
    api.post('/auth/register', data).then(r => r.data),
};

export const approvalService = {
  getPending: () => api.get('/approvals/pending').then(r => r.data),
  approve: (id: string, comments?: string) => api.put(`/approvals/${id}/approve`, { comments }).then(r => r.data),
  reject: (id: string, comments?: string) => api.put(`/approvals/${id}/reject`, { comments }).then(r => r.data),
  request: (eventId: string) => api.post('/approvals/request', { eventId }).then(r => r.data),
};

export const venueService = {
  getAll: () => api.get('/venues').then(r => r.data),
  create: (data: any) => api.post('/venues', data).then(r => r.data),
};

export const statsService = {
  getDashboard: () => api.get('/stats').then(r => r.data),
};
