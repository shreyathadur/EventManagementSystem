import api from './api';

export const registrationService = {
  registerForEvent: (eventId: string) =>
    api.post('/registrations/register', { eventId }).then(r => r.data),

  getUserRegistrations: () =>
    api.get('/registrations/user').then(r => r.data),

  cancelRegistration: (eventId: string) =>
    api.delete(`/registrations/cancel/${eventId}`).then(r => r.data),

  getEventRegistrations: (eventId: string) =>
    api.get(`/registrations/event/${eventId}`).then(r => r.data),

  checkInUser: (registrationId: string) =>
    api.post('/registrations/checkin', { registrationId }).then(r => r.data),
};
