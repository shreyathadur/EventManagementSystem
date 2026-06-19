import api from './api';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  organizerId: string;
  organizerName: string;
  maxAttendees: number;
  currentAttendees: number;
  status: string;
  registrationDeadline: string;
  imageUrl: string;
}

export const eventService = {
  getAllEvents: (params?: { status?: string; category?: string; query?: string; page?: number; size?: number }) =>
    api.get('/events', { params }).then(r => r.data),

  getEventById: (id: string) =>
    api.get(`/events/${id}`).then(r => r.data),

  createEvent: (data: Partial<Event>) =>
    api.post('/events', data).then(r => r.data),

  updateEvent: (id: string, data: Partial<Event>) =>
    api.put(`/events/${id}`, data).then(r => r.data),

  deleteEvent: (id: string) =>
    api.delete(`/events/${id}`).then(r => r.data),

  getMyEvents: () =>
    api.get('/events/my-events').then(r => r.data),
};
