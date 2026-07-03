import api from './api';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),

  register: (data: { name: string; email: string; password: string; role: string; organizationName?: string; department?: string }) =>
    api.post('/auth/register', data).then(r => r.data),
};

export const approvalService = {
  // Admin-only endpoints
  getPending: () => api.get('/admin/approvals/pending').then(r => r.data),
  approve: (id: string, comments?: string) => api.put(`/admin/approvals/${id}/approve`, { comments }).then(r => r.data),
  reject: (id: string, comments?: string) => api.put(`/admin/approvals/${id}/reject`, { comments }).then(r => r.data),
  // Organizer endpoint
  request: (eventId: string) => api.post('/approvals/request', { eventId }).then(r => r.data),
};

export const adminService = {
  getUsers: (page = 0) => api.get(`/admin/users?page=${page}`).then(r => r.data),
  getOrganizers: () => api.get('/admin/users/organizers').then(r => r.data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`).then(r => r.data),
  getAnalytics: () => api.get('/admin/analytics').then(r => r.data),
  getAuditLogs: (page = 0) => api.get(`/admin/audit-logs?page=${page}`).then(r => r.data),
};

export const venueService = {
  getAll: () => api.get('/venues').then(r => r.data),
  create: (data: any) => api.post('/venues', data).then(r => r.data),
};

export const statsService = {
  getDashboard: () => api.get('/stats').then(r => r.data),
};

