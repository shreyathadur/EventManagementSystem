export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  category: 'conference' | 'workshop' | 'seminar' | 'networking' | 'meetup';
  capacity: number;
  registeredCount: number;
  banner: string;
  price: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizer: string;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  registeredAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
  registeredAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  ticketType: 'standard' | 'vip' | 'early_bird';
  amountPaid?: number;
  paymentMethod?: 'stripe' | 'card' | 'free' | 'razorpay';
  transactionId?: string;
  paymentStatus?: 'paid' | 'unpaid';
  checkedIn?: boolean;
  checkedInAt?: string;
}

export interface EventReview {
  id: string;
  eventId: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface SystemEmail {
  id: string;
  to: string;
  subject: string;
  bodyHtml: string;
  dispatchedAt: string;
  templateName: string;
}


export interface DashboardStats {
  totalEvents: number;
  totalAttendees: number;
  totalRevenue: number;
  upcomingEvents: number;
  registrationRate: number; // percentage
}

export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  passwordHash?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  isGoogle?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    company?: string;
    role?: string;
    isGoogle?: boolean;
  };
  token: string;
}

