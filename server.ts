import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize AI optionally / lazily
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Path to low-db style file-based persistence
const dbPath = path.join(__dirname, 'db.json');

// Interface structures
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'conference' | 'workshop' | 'seminar' | 'networking' | 'meetup';
  capacity: number;
  registeredCount: number;
  banner: string;
  price: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizer: string;
}

interface Attendee {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  registeredAt: string;
}

interface Registration {
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

interface EventReview {
  id: string;
  eventId: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

interface SystemEmail {
  id: string;
  to: string;
  subject: string;
  bodyHtml: string;
  dispatchedAt: string;
  templateName: string;
}

interface User {
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

interface Database {
  events: Event[];
  attendees: Attendee[];
  registrations: Registration[];
  users: User[];
  reviews: EventReview[];
  emails: SystemEmail[];
}

const defaultEvents: Event[] = [
  {
    id: 'ev-1',
    title: 'Global Tech Summit 2026',
    description: 'The premier conference for developers, creators, and entrepreneurs. Covering modern artificial intelligence, global cloud architectures, modern web frameworks, and the scaling of decentralized networks.',
    date: '2026-08-15',
    time: '09:00',
    location: 'San Francisco Convention Center - Hall D',
    category: 'conference',
    capacity: 500,
    registeredCount: 342,
    banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
    price: 299,
    status: 'upcoming',
    organizer: 'TechWorld Association'
  },
  {
    id: 'ev-2',
    title: 'Advanced React 19 & Vite Workshop',
    description: 'A hands-on, high-octane engineering workshop exploring custom compiler builds, concurrency rendering primitives, server actions, and extreme client-side bundling optimization.',
    date: '2026-07-22',
    time: '13:00',
    location: 'Online Live Broadcast (HQ Stereo)',
    category: 'workshop',
    capacity: 100,
    registeredCount: 88,
    banner: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
    price: 49,
    status: 'upcoming',
    organizer: 'Frontend Excellence Guild'
  },
  {
    id: 'ev-3',
    title: 'Practical AI & Large Language Models Seminar',
    description: 'Understand the actual math, deployment workflows, context windows routing, and practical business automation with customized enterprise fine-tunes.',
    date: '2026-06-18',
    time: '10:00',
    location: 'Boston Science Innovation Hub - Auditorium B',
    category: 'seminar',
    capacity: 150,
    registeredCount: 145,
    banner: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60',
    price: 0,
    status: 'upcoming',
    organizer: 'Boston Cognitive Computing Lab'
  },
  {
    id: 'ev-4',
    title: 'Founders & VC Speed Networking',
    description: 'A premium, high-impact evening mixer connecting elite early-stage tech founders directly with top-tier partners from regional venture capital firms.',
    date: '2026-06-08',
    time: '18:30',
    location: 'The Sentinel Skyline Club - Lounge Suite',
    category: 'networking',
    capacity: 80,
    registeredCount: 54,
    banner: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60',
    price: 25,
    status: 'upcoming',
    organizer: 'Silicon Valley Founders Club'
  }
];

const defaultAttendees: Attendee[] = [
  {
    id: 'at-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    company: 'Stripe, Inc.',
    role: 'Staff software engineer',
    registeredAt: '2026-05-10T14:32:00Z'
  },
  {
    id: 'at-2',
    name: 'David Chen',
    email: 'david.chen@mit.edu',
    company: 'MIT CSAIL',
    role: 'AI Researcher',
    registeredAt: '2026-05-12T09:15:00Z'
  },
  {
    id: 'at-3',
    name: 'Elena Rostova',
    email: 'elena.rostova@yc.com',
    company: 'Ventura Labs',
    role: 'Founder & CEO',
    registeredAt: '2026-05-20T17:45:00Z'
  }
];

const defaultRegistrations: Registration[] = [
  {
    id: 'reg-1',
    eventId: 'ev-1',
    attendeeId: 'at-1',
    attendeeName: 'Sarah Jenkins',
    attendeeEmail: 'sarah.j@example.com',
    registeredAt: '2026-05-10T14:32:00Z',
    status: 'confirmed',
    ticketType: 'vip'
  },
  {
    id: 'reg-2',
    eventId: 'ev-3',
    attendeeId: 'at-2',
    attendeeName: 'David Chen',
    attendeeEmail: 'david.chen@mit.edu',
    registeredAt: '2026-05-12T09:15:00Z',
    status: 'confirmed',
    ticketType: 'standard'
  },
  {
    id: 'reg-3',
    eventId: 'ev-4',
    attendeeId: 'at-3',
    attendeeName: 'Elena Rostova',
    attendeeEmail: 'elena.rostova@yc.com',
    registeredAt: '2026-05-20T17:45:00Z',
    status: 'confirmed',
    ticketType: 'early_bird'
  }
];

// Read DB or write defaults if not exist
function loadDatabase(): Database {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      const parsed = JSON.parse(data);
      if (!parsed.users) {
        parsed.users = [];
      }
      if (!parsed.reviews) {
        parsed.reviews = [
          {
            id: 'rev-1',
            eventId: 'ev-1',
            reviewerName: 'Sarah Jenkins',
            reviewerEmail: 'sarah.j@example.com',
            rating: 5,
            comment: 'High quality tech event! The speakers gave extremely actionable, state-of-the-art insights on web architectures. Definitely going again.',
            createdAt: '2026-05-11T12:00:00Z'
          },
          {
            id: 'rev-2',
            eventId: 'ev-3',
            reviewerName: 'David Chen',
            reviewerEmail: 'david.chen@mit.edu',
            rating: 5,
            comment: 'Brilliant mathematical framing. The server workflows and enterprise fine-tuning guidelines were incredibly thorough.',
            createdAt: '2026-05-15T15:20:00Z'
          },
          {
            id: 'rev-3',
            eventId: 'ev-4',
            reviewerName: 'Elena Rostova',
            reviewerEmail: 'elena.rostova@yc.com',
            rating: 4,
            comment: 'Outstanding networking. Got connected with three amazing early-stage venture capital general partners. High caliber crowd.',
            createdAt: '2026-05-22T20:30:00Z'
          }
        ];
        fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2), 'utf8');
      }
      if (!parsed.emails) {
        parsed.emails = [
          {
            id: 'em-1',
            to: 'sarah.j@example.com',
            subject: 'Booking Seat Allocation Confirmed: Global Tech Summit 2026',
            bodyHtml: 'Welcome to GatherWise!<br/>Your VIP seat allocation has been successfully processed under transaction Id: tx-st-7f893a.<br/>Attached is your secure QR authorization code pass for entry.',
            dispatchedAt: '2026-05-10T14:32:00Z',
            templateName: 'ticket_issued'
          },
          {
            id: 'em-2',
            to: 'sarah.j@example.com',
            subject: 'Welcome to the GatherWise Executive Forum Community!',
            bodyHtml: 'Your professional member profile claims have been successfully verified.<br/>Use our digital scanner, download certificates, and explore events in real-time.',
            dispatchedAt: '2026-05-10T14:30:00Z',
            templateName: 'welcome_auth'
          }
        ];
        fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2), 'utf8');
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading database file, resetting to static defaults', err);
  }
  const initialDb: Database = {
    events: defaultEvents,
    attendees: defaultAttendees,
    registrations: defaultRegistrations,
    users: [],
    reviews: [
      {
        id: 'rev-1',
        eventId: 'ev-1',
        reviewerName: 'Sarah Jenkins',
        reviewerEmail: 'sarah.j@example.com',
        rating: 5,
        comment: 'High quality tech event! The speakers gave extremely actionable, state-of-the-art insights on web architectures. Definitely going again.',
        createdAt: '2026-05-11T12:00:00Z'
      },
      {
        id: 'rev-2',
        eventId: 'ev-3',
        reviewerName: 'David Chen',
        reviewerEmail: 'david.chen@mit.edu',
        rating: 5,
        comment: 'Brilliant mathematical framing. The server workflows and enterprise fine-tuning guidelines were incredibly thorough.',
        createdAt: '2026-05-15T15:20:00Z'
      },
      {
        id: 'rev-3',
        eventId: 'ev-4',
        reviewerName: 'Elena Rostova',
        reviewerEmail: 'elena.rostova@yc.com',
        rating: 4,
        comment: 'Outstanding networking. Got connected with three amazing early-stage venture capital general partners. High caliber crowd.',
        createdAt: '2026-05-22T20:30:00Z'
      }
    ],
    emails: [
      {
        id: 'em-1',
        to: 'sarah.j@example.com',
        subject: 'Booking Seat Allocation Confirmed: Global Tech Summit 2026',
        bodyHtml: 'Welcome to GatherWise!<br/>Your VIP seat allocation has been successfully processed under transaction Id: tx-st-7f893a.<br/>Attached is your secure QR authorization code pass for entry.',
        dispatchedAt: '2026-05-10T14:32:00Z',
        templateName: 'ticket_issued'
      },
      {
        id: 'em-2',
        to: 'sarah.j@example.com',
        subject: 'Welcome to the GatherWise Executive Forum Community!',
        bodyHtml: 'Your professional member profile claims have been successfully verified.<br/>Use our digital scanner, download certificates, and explore events in real-time.',
        dispatchedAt: '2026-05-10T14:30:00Z',
        templateName: 'welcome_auth'
      }
    ]
  };
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: Database) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database to disk', err);
  }
}

// Transactional HTML Email Dispatch Outbox helper
function dispatchEmail(to: string, subject: string, templateName: string, bodyHtml: string) {
  try {
    const db = loadDatabase();
    const newEmail: SystemEmail = {
      id: `em-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      to: to.trim().toLowerCase(),
      subject,
      bodyHtml,
      dispatchedAt: new Date().toISOString(),
      templateName
    };
    db.emails = db.emails || [];
    db.emails.unshift(newEmail); // put at top of outbox
    saveDatabase(db);
    console.log(`[EMAIL DISPATCH] Transactional log populated: To=${to} Subject="${subject}" template=${templateName}`);
  } catch (err) {
    console.error('Error dispatching transactional outbox email', err);
  }
}

// Password hashing helper
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// User Authentication APIs
app.post('/api/auth/signup', (req, res) => {
  const db = loadDatabase();
  const { name, email, password, company, role, securityQuestion, securityAnswer } = req.body;

  if (!name || !email || !password || !securityQuestion || !securityAnswer) {
    return res.status(400).json({ error: 'Missing required signup fields (name, email, password, security Question, security Answer)' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailExists = db.users.some(u => u.email.toLowerCase() === normalizedEmail);
  if (emailExists) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const newUser: User = {
    id: `us-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    company: company || '',
    role: role || '',
    securityQuestion: securityQuestion.trim(),
    securityAnswer: hashPassword(securityAnswer.trim().toLowerCase()),
    isGoogle: false,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDatabase(db);

  // Dispatch Welcome Transactional Email
  dispatchEmail(newUser.email, 'Welcome to the GatherWise Strategic Member Forum! 🚀', 'welcome_auth', `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #064e3b, #022c22); padding: 40px 30px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; text-transform: tracking-tight;">GatherWise Community</h1>
        <p style="margin: 8px 0 0 0; color: #a7f3d0; font-size: 14px; font-weight: 500;">Your professional event intelligence account is active</p>
      </div>
      <div style="padding: 35px 30px; color: #27272a; line-height: 1.6;">
        <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Greetings, ${newUser.name}!</h2>
        <p style="margin: 0 0 16px 0; font-size: 14px;">We are thrilled to welcome you to <strong>GatherWise</strong>—the executive dashboard for tech founders, researchers, and engineers to connect and collaborate.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 12px; font-weight: 850; text-transform: uppercase; color: #475569; letter-spacing: 0.05em;">Member Profile Credentials</h3>
          <div style="font-size: 13px; font-weight: 500; color: #334155;">
            <div style="margin-bottom: 6px;"><strong>Email Contact:</strong> ${newUser.email}</div>
            <div style="margin-bottom: 6px;"><strong>Role Claim:</strong> ${newUser.role || 'Attendee'}</div>
            <div><strong>Affiliation:</strong> ${newUser.company || 'Private Practice'}</div>
          </div>
        </div>

        <p style="margin: 0 0 24px 0; font-size: 14px;">You can now secure ticket passes, present verification QR codes at check-in terminals, and retrieve elegant printable Certificates of Attendance for completed forum events.</p>
        
        <div style="text-align: center;">
          <a href="https://ais-dev-6xg2y7huxyj5fr4zkfxdwh-857682344808.asia-east1.run.app" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.23); transition: all 150ms ease-on-out;">Open Ticket Console</a>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
        This email represents a simulated transactional notification designed to demonstrate recruiter-ready notification outbox logging pipelines in full-stack Node.js React frameworks.
      </div>
    </div>
  `);

  const token = `token-${newUser.id}-${Date.now()}`;
  res.status(201).json({
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      company: newUser.company,
      role: newUser.role,
      isGoogle: false
    },
    token
  });
});

app.post('/api/auth/login', (req, res) => {
  const db = loadDatabase();
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user || user.isGoogle || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email address or password combination.' });
  }

  const token = `token-${user.id}-${Date.now()}`;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
      isGoogle: false
    },
    token
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const db = loadDatabase();
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(404).json({ error: 'No user account registered with this email.' });
  }

  if (user.isGoogle) {
    return res.status(400).json({ error: 'This email is registered with Google. Please use standard Google Login.' });
  }

  // Generate simulated 6-digit verification code
  const tempOtp = Math.floor(100000 + Math.random() * 900000).toString();
  (user as any).tempOtp = tempOtp;
  saveDatabase(db);

  res.json({
    email: user.email,
    securityQuestion: user.securityQuestion || 'What is your nickname?',
    simulatedOtp: tempOtp
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const db = loadDatabase();
  const { email, securityAnswer, otp, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Missing email or new password.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  let verified = false;

  if (securityAnswer) {
    const hashed = hashPassword(securityAnswer.trim().toLowerCase());
    if (user.securityAnswer === hashed) {
      verified = true;
    }
  }

  if (otp && (user as any).tempOtp === otp.trim()) {
    verified = true;
  }

  if (!verified) {
    return res.status(400).json({ error: 'Incorrect security answer or verification code.' });
  }

  user.passwordHash = hashPassword(newPassword);
  delete (user as any).tempOtp;
  saveDatabase(db);

  res.json({ success: true, message: 'Password has been successfully updated.' });
});

app.get('/api/auth/google/url', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL || `http://localhost:3000`}/auth/callback`;
  
  if (clientId && clientId !== 'MY_GOOGLE_CLIENT_ID') {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account'
    });
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, isReal: true });
  } else {
    res.json({ url: '', isReal: false });
  }
});

app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.APP_URL || `http://localhost:3000`}/auth/callback`;

  if (!code) {
    return res.status(400).send('Authorization code is missing.');
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      return res.status(400).send(`Token exchange failed: ${errText}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    if (!profileResponse.ok) {
      return res.status(400).send('Failed to fetch user profile from Google.');
    }

    const profile = await profileResponse.json();
    const { email, name, picture } = profile;

    if (!email || !name) {
      return res.status(400).send('Incomplete Google profile claims returned.');
    }

    const db = loadDatabase();
    const normalizedEmail = email.trim().toLowerCase();
    let user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      user = {
        id: `us-gl-${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        company: '',
        role: 'Attendee',
        isGoogle: true,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
    } else {
      user.isGoogle = true;
    }
    saveDatabase(db);

    const token = `token-${user.id}-${Date.now()}`;
    const userPayload = JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
      isGoogle: true,
      avatar: picture
    });

    res.send(`
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #fafafa;">
          <div style="text-align: center; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 320px;">
            <svg style="width: 48px; height: 48px; margin-bottom: 16px;" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <h3 style="margin: 0 0 8px 0; color: #1f1f1f; font-size: 16px; font-weight: 600;">Authenticated!</h3>
            <p style="margin: 0; color: #757575; font-size: 13px;">Returning securely to GatherWise...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                token: '${token}', 
                user: ${userPayload}
              }, '*');
              window.close();
            } else {
              localStorage.setItem('token', '${token}');
              localStorage.setItem('user', '${userPayload}');
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('Google Auth callback error:', err);
    res.status(500).send(`Authentication failed: ${err.message}`);
  }
});

app.post('/api/auth/google', (req, res) => {
  const db = loadDatabase();
  const { email, name, googleId, company, role } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Incomplete Google profile schema.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    user = {
      id: `us-gl-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      company: company || '',
      role: role || '',
      isGoogle: true,
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    saveDatabase(db);
  } else {
    // Standard user gets linked or logs in
    if (!user.isGoogle) {
      user.isGoogle = true;
      saveDatabase(db);
    }
  }

  const token = `token-${user.id}-${Date.now()}`;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
      isGoogle: true
    },
    token
  });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !token.startsWith('token-')) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const userId = token.split('-')[1];
  const db = loadDatabase();
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'Active user session not found.' });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
      isGoogle: !!user.isGoogle
    }
  });
});

app.delete('/api/auth/delete-account', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !token.startsWith('token-')) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const userId = token.split('-')[1];
  const db = loadDatabase();
  const userIdx = db.users.findIndex(u => u.id === userId);

  if (userIdx === -1) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  const userEmail = db.users[userIdx].email;
  db.users.splice(userIdx, 1);

  // Optional: remove registrations too for cleanliness
  db.attendees = db.attendees.filter(a => a.email.toLowerCase() !== userEmail.toLowerCase());
  db.registrations = db.registrations.filter(r => r.attendeeEmail.toLowerCase() !== userEmail.toLowerCase());

  saveDatabase(db);
  res.json({ success: true, message: 'Your account has been deleted successfully.' });
});

// REST Backend APIs
app.get('/api/events', (req, res) => {
  const db = loadDatabase();
  res.json(db.events);
});

app.get('/api/events/:id', (req, res) => {
  const db = loadDatabase();
  const event = db.events.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

app.post('/api/events', (req, res) => {
  const db = loadDatabase();
  const { title, description, date, time, location, category, capacity, banner, price, organizer } = req.body;

  if (!title || !date || !time || !location || !capacity) {
    return res.status(400).json({ error: 'Missing required fields (title, date, time, location, capacity)' });
  }

  const newEvent: Event = {
    id: `ev-${Date.now()}`,
    title,
    description: description || '',
    date,
    time,
    location,
    category: category || 'other',
    capacity: Number(capacity) || 100,
    registeredCount: 0,
    banner: banner || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=60',
    price: Number(price) || 0,
    status: 'upcoming',
    organizer: organizer || 'Organizing Team'
  };

  db.events.push(newEvent);
  saveDatabase(db);
  res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  const db = loadDatabase();
  const index = db.events.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const currentEvent = db.events[index];
  const updatedEvent: Event = {
    ...currentEvent,
    ...req.body,
    // Keep fixed fields stable unless targeted
    id: currentEvent.id,
    registeredCount: currentEvent.registeredCount
  };

  db.events[index] = updatedEvent;
  saveDatabase(db);
  res.json(updatedEvent);
});

app.delete('/api/events/:id', (req, res) => {
  const db = loadDatabase();
  const origLength = db.events.length;
  db.events = db.events.filter(e => e.id !== req.params.id);

  if (db.events.length === origLength) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Cascading deletes of registrations
  db.registrations = db.registrations.filter(r => r.eventId !== req.params.id);

  saveDatabase(db);
  res.json({ success: true, message: 'Event and associated registrations deleted' });
});

app.get('/api/events/:id/registrations', (req, res) => {
  const db = loadDatabase();
  const eventRegs = db.registrations.filter(r => r.eventId === req.params.id);
  res.json(eventRegs);
});

app.post('/api/events/:id/register', (req, res) => {
  const db = loadDatabase();
  const eventId = req.params.id;
  const event = db.events.find(e => e.id === eventId);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (event.registeredCount >= event.capacity) {
    return res.status(400).json({ error: 'Event is at full capacity' });
  }

  const { name, email, company, role, ticketType } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and Email are required for registration' });
  }

  // Check if already registered for this event
  const isDuplicate = db.registrations.some(r => r.eventId === eventId && r.attendeeEmail.toLowerCase() === email.toLowerCase());
  if (isDuplicate) {
    return res.status(400).json({ error: 'This email is already registered for this event' });
  }

  // Create or retrieve attendee
  let attendee = db.attendees.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (!attendee) {
    attendee = {
      id: `at-${Date.now()}`,
      name,
      email,
      company: company || '',
      role: role || '',
      registeredAt: new Date().toISOString()
    };
    db.attendees.push(attendee);
  }

  // Create registration
  const newReg: Registration = {
    id: `reg-${Date.now()}`,
    eventId,
    attendeeId: attendee.id,
    attendeeName: attendee.name,
    attendeeEmail: attendee.email,
    registeredAt: new Date().toISOString(),
    status: 'confirmed',
    ticketType: ticketType || 'standard',
    paymentMethod: 'free',
    amountPaid: 0,
    paymentStatus: 'paid',
    transactionId: `tx-free-${crypto.randomBytes(4).toString('hex')}`
  };

  db.registrations.push(newReg);

  // Update Event registered count
  event.registeredCount += 1;

  saveDatabase(db);

  // Log transactional booking pass email dispatch
  const ticketRepr = (newReg.ticketType || 'standard').toUpperCase();
  dispatchEmail(newReg.attendeeEmail, `[Ticket Confirmed] Your Pass to: ${event.title}`, 'ticket_issued', `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 20px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #18181b; padding: 40px 30px; text-align: center; color: #ffffff;">
        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #10b981; background: #064e3b; padding: 4px 12px; border-radius: 9999px;">Confirmed Registration</span>
        <h1 style="margin: 15px 0 0 0; font-size: 20px; font-weight: 800; text-transform: tracking-tight; line-height: 1.3;">${event.title}</h1>
        <p style="margin: 8px 0 0 0; color: #a1a1aa; font-size: 13px;">Curated by ${event.organizer}</p>
      </div>
      <div style="padding: 35px 30px; color: #27272a; line-height: 1.6;">
        <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 5px;">Dear ${newReg.attendeeName},</h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #52525b;">Your seat reservation subscription has been successfully processed. Below is your strategic entry ticket data credentials:</p>
        
        <div style="border: 1px dashed #e4e4e7; border-radius: 12px; padding: 22px; background-color: #fafafa; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Event Name:</span>
            <span style="color: #18181b; font-weight: 700;">${event.title}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Ticket Category:</span>
            <span style="text-transform: uppercase; color: #10b981; font-weight: 800;">${ticketRepr} PASS</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Ticket Reference:</span>
            <span style="font-family: monospace; color: #18181b; font-weight: 700;">${newReg.id}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Assigned Room/Venue:</span>
            <span style="color: #18181b; font-weight: 700;">${event.location}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span style="color: #71717a; font-weight: 500;">Scheduled Date:</span>
            <span style="color: #18181b; font-weight: 700;">${event.date} at ${event.time}</span>
          </div>
        </div>

        <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 12px; padding: 15px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0; font-size: 12.5px; font-weight: 700; color: #065f46;">🔒 Admission Scan Key Generated Successfully</p>
          <p style="margin: 4px 0 0 0; font-size: 11.5px; color: #047857;">Access your custom Ticket Console in the browser to view and present your check-in QR badge at our physical boarding tables.</p>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
        This email represents a simulated transactional notification designed to demonstrate recruiter-ready notification outbox logging pipelines in full-stack Node.js React frameworks.
      </div>
    </div>
  `);

  res.status(201).json({ registration: newReg, event });
});

app.get('/api/attendees', (req, res) => {
  const db = loadDatabase();
  res.json(db.attendees);
});

app.get('/api/registrations/me', (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }
  const db = loadDatabase();
  const userRegs = db.registrations.filter(r => r.attendeeEmail.toLowerCase() === email.toLowerCase());
  const detailedRegs = userRegs.map(reg => {
    const event = db.events.find(e => e.id === reg.eventId);
    return {
      ...reg,
      event
    };
  });
  res.json(detailedRegs);
});

// Dashboard Stats endpoint
app.get('/api/stats', (req, res) => {
  const db = loadDatabase();
  const totalEvents = db.events.length;
  const totalAttendees = db.attendees.length;

  let totalRevenue = 0;
  db.registrations.forEach(r => {
    const event = db.events.find(e => e.id === r.eventId);
    if (event && event.price > 0 && r.status === 'confirmed') {
      let finalPrice = event.price;
      if (r.ticketType === 'vip') finalPrice *= 1.5;
      if (r.ticketType === 'early_bird') finalPrice *= 0.8;
      totalRevenue += Math.round(finalPrice);
    }
  });

  const upcomingEvents = db.events.filter(e => {
    const evDate = new Date(e.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    return evDate >= today && e.status !== 'cancelled';
  }).length;

  let registrationRate = 0;
  const totalCapacity = db.events.reduce((sum, e) => sum + e.capacity, 0);
  const totalRegistered = db.events.reduce((sum, e) => sum + e.registeredCount, 0);
  if (totalCapacity > 0) {
    registrationRate = Math.round((totalRegistered / totalCapacity) * 100);
  }

  res.json({
    totalEvents,
    totalAttendees,
    totalRevenue,
    upcomingEvents,
    registrationRate
  });
});

// AI Assisted Event Description Optimizer Route with fallback intelligence
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { title, category, location, organizer } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Event Title is required to optimize with AI' });
    }

    const genAI = getGenAI();
    if (!genAI) {
      // Elegant, professional preview content fallback so development workspace feels flawless
      const fallbackDescription = `Join us at the premium session: "${title}" organized by ${organizer || 'our leading specialists'}. Centered on the industry's latest innovations in ${category || 'our professional domain'}, this assembly offers elite, hand-picked technical tracks, bespoke workshops, and generous networking hours held in ${location || 'our designated executive conference hall'}.\n\nDesigned for forward-thinking experts and builders ready to level up their development workflow. Expected seating fits up to 100 professionals. Register today to secure your custom attendance key and guarantee priority access before capacity limits are met. All premium digital assets and materials will be sent to confirmed attendee emails prior to start.`;
      return res.json({ text: fallbackDescription, note: 'Suggested local layout.' });
    }

    const prompt = `Write a high-converting, premium, professional event description for:
    Event Name: "${title}"
    Category/Theme: "${category || 'Special Theme'}"
    Location/Venue: "${location || 'Executive Hub'}"
    Organizer: "${organizer || 'Strategic Committee'}"
    
    Structure it as exactly 2 refined, highly convincing paragraphs (180-250 words total) perfect for prospective attendees. Focus on skills, industry impact, elite panel sessions, and the networking benefits. Do not use Markdown headings or titles. Return only the description text.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });

    const optimized = response.text?.trim() || 'Could not generate customized content.';
    res.json({ text: optimized, note: 'Generated by Gemini AI' });
  } catch (err: any) {
    console.error('Error in Gemini description optimization:', err);
    res.status(500).json({ error: err.message || 'Gemini processing failed.' });
  }
});

// ==========================================
// ONLINE PAYMENTS & TICKETING GATEWAYS
// ==========================================
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key && key !== 'MY_STRIPE_SECRET_KEY') {
      stripeClient = new Stripe(key, { apiVersion: '2025-01-27.acacia' as any });
    }
  }
  return stripeClient;
}

app.get('/api/payments/config', (req, res) => {
  const stripeInstance = getStripe();
  res.json({
    isStripeConfigured: !!stripeInstance,
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
  });
});

app.post('/api/payments/create-checkout-session', async (req, res) => {
  try {
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(400).json({ error: 'Stripe API has not been initialized. Define STRIPE_SECRET_KEY to operate.' });
    }

    const { eventId, name, email, company, role, ticketType } = req.body;
    if (!eventId || !name || !email) {
      return res.status(400).json({ error: 'Delegate name, contact email, and scheduled event are required.' });
    }

    const db = loadDatabase();
    const event = db.events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ error: 'Scheduled conference/event was not found in the directory.' });
    }

    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ error: 'Event booking capacity is full.' });
    }

    const isDuplicate = db.registrations.some(r => r.eventId === eventId && r.attendeeEmail.toLowerCase() === email.toLowerCase());
    if (isDuplicate) {
      return res.status(400).json({ error: 'Delegate is already registered under this email address.' });
    }

    let finalPrice = event.price;
    if (ticketType === 'vip') finalPrice *= 1.5;
    if (ticketType === 'early_bird') finalPrice *= 0.8;
    const finalPriceUsd = Math.round(finalPrice);

    const originUrl = process.env.APP_URL || `http://localhost:3000`;

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${event.title} - [${ticketType.toUpperCase()} PASS]`,
              description: `A confirmed seat registration for GatherWise conference: ${event.title}`,
            },
            unit_amount: finalPriceUsd * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${originUrl}/?payment_status=success&event_id=${eventId}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&company=${encodeURIComponent(company || '')}&role=${encodeURIComponent(role || '')}&ticket_type=${ticketType}&price=${finalPriceUsd}`,
      cancel_url: `${originUrl}/?payment_status=cancelled`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout session setup failure:', err);
    res.status(500).json({ error: err.message || 'Stripe initialization failed.' });
  }
});

app.post('/api/payments/process-custom-card', (req, res) => {
  const db = loadDatabase();
  const { eventId, name, email, company, role, ticketType, cardNumber, cardExpiry, cardCvc } = req.body;

  if (!eventId || !name || !email || !cardNumber) {
    return res.status(400).json({ error: 'Card billing credentials or delegate names are incomplete.' });
  }

  const event = db.events.find(e => e.id === eventId);
  if (!event) {
    return res.status(404).json({ error: 'Scheduled conference was not found in the database.' });
  }

  if (event.registeredCount >= event.capacity) {
    return res.status(400).json({ error: 'This event has reached limit capacity.' });
  }

  const isDuplicate = db.registrations.some(r => r.eventId === eventId && r.attendeeEmail.toLowerCase() === email.toLowerCase());
  if (isDuplicate) {
    return res.status(400).json({ error: 'The email address is already allocated a seat for this event.' });
  }

  const cleanCard = cardNumber.replace(/\s+/g, '');
  if (cleanCard.length < 13 || cleanCard.length > 19) {
    return res.status(400).json({ error: 'Credit card sequence format is invalid. Please double check.' });
  }

  let attendee = db.attendees.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (!attendee) {
    attendee = {
      id: `at-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      company: company || '',
      role: role || '',
      registeredAt: new Date().toISOString()
    };
    db.attendees.push(attendee);
  }

  let finalPrice = event.price;
  if (ticketType === 'vip') finalPrice *= 1.5;
  if (ticketType === 'early_bird') finalPrice *= 0.8;
  const finalPriceUsd = Math.round(finalPrice);

  const customTxId = `tx-gw-${crypto.randomBytes(4).toString('hex')}`;

  const newReg = {
    id: `reg-${Date.now()}`,
    eventId,
    attendeeId: attendee.id,
    attendeeName: attendee.name,
    attendeeEmail: attendee.email,
    registeredAt: new Date().toISOString(),
    status: 'confirmed' as const,
    ticketType: ticketType || 'standard',
    amountPaid: finalPriceUsd,
    paymentMethod: 'card' as const,
    transactionId: customTxId,
    paymentStatus: 'paid' as const
  };

  db.registrations.push(newReg);
  event.registeredCount += 1;

  saveDatabase(db);

  // Dispatch secure ticket booking pass transactional email (simulation credit-card bank capture)
  const ticketRepr = (newReg.ticketType || 'standard').toUpperCase();
  dispatchEmail(newReg.attendeeEmail, `[Payment Secure] Ticket Pass Issued for ${event.title}`, 'ticket_issued', `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 20px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #064e3b; padding: 40px 30px; text-align: center; color: #ffffff;">
        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #a7f3d0; background: #022c22; padding: 4px 12px; border-radius: 9999px;">Payment Capture Successful</span>
        <h1 style="margin: 15px 0 0 0; font-size: 20px; font-weight: 800; text-transform: tracking-tight; line-height: 1.3;">${event.title}</h1>
        <p style="margin: 8px 0 0 0; color: #a7f3d0; font-size: 13px;">Transaction: ${newReg.transactionId}</p>
      </div>
      <div style="padding: 35px 30px; color: #27272a; line-height: 1.6;">
        <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 5px;">Dear ${newReg.attendeeName},</h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #52525b;">Your sandbox credit-card payment of <strong>$${finalPriceUsd} USD (₹${(finalPriceUsd * 83).toLocaleString('en-IN')})</strong> was captured and authorized. Below is your strategic ticket pass credentials:</p>
        
        <div style="border: 1px dashed #e4e4e7; border-radius: 12px; padding: 22px; background-color: #fafafa; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Delegate Attendee:</span>
            <span style="color: #18181b; font-weight: 700;">${newReg.attendeeName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Ticket Category:</span>
            <span style="text-transform: uppercase; color: #10b981; font-weight: 800;">${ticketRepr} VIP PASS</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Secure Reference Key:</span>
            <span style="font-family: monospace; color: #18181b; font-weight: 700;">${newReg.id}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Assigned Venue:</span>
            <span style="color: #18181b; font-weight: 700;">${event.location}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span style="color: #71717a; font-weight: 500;">Event Schedule:</span>
            <span style="color: #18181b; font-weight: 700;">${event.date} at ${event.time}</span>
          </div>
        </div>

        <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 12px; padding: 15px; text-align: center;">
          <p style="margin: 0; font-size: 12.5px; font-weight: 700; color: #065f46;">🔒 Admission Scan Key Generated Successfully</p>
          <p style="margin: 4px 0 0 0; font-size: 11.5px; color: #047857;">Access your custom Ticket Console in the browser to view and present your checked-in QR badge at our physical boarding tables.</p>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
        This email represents a simulated transactional notification designed to demonstrate recruiter-ready notification outbox logging pipelines in full-stack Node.js React frameworks.
      </div>
    </div>
  `);

  res.status(201).json({ success: true, registration: newReg, event });
});

app.post('/api/payments/complete-stripe-registration', (req, res) => {
  const db = loadDatabase();
  const { eventId, name, email, company, role, ticketType, price } = req.body;

  if (!eventId || !name || !email) {
    return res.status(400).json({ error: 'Delegate registration parameters are missing.' });
  }

  const event = db.events.find(e => e.id === eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event was not found.' });
  }

  const existingReg = db.registrations.find(r => r.eventId === eventId && r.attendeeEmail.toLowerCase() === email.toLowerCase());
  if (existingReg) {
    return res.json({ success: true, registration: existingReg, event, alreadyDone: true });
  }

  if (event.registeredCount >= event.capacity) {
    return res.status(400).json({ error: 'Event is fully booked.' });
  }

  let attendee = db.attendees.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (!attendee) {
    attendee = {
      id: `at-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      company: company || '',
      role: role || '',
      registeredAt: new Date().toISOString()
    };
    db.attendees.push(attendee);
  }

  const finalPriceUsd = price ? parseInt(price) : event.price;
  const stripeTxId = `tx-st-${crypto.randomBytes(4).toString('hex')}`;

  const newReg = {
    id: `reg-${Date.now()}`,
    eventId,
    attendeeId: attendee.id,
    attendeeName: attendee.name,
    attendeeEmail: attendee.email,
    registeredAt: new Date().toISOString(),
    status: 'confirmed' as const,
    ticketType: ticketType || 'standard',
    amountPaid: finalPriceUsd,
    paymentMethod: 'stripe' as const,
    transactionId: stripeTxId,
    paymentStatus: 'paid' as const
  };

  db.registrations.push(newReg);
  event.registeredCount += 1;

  saveDatabase(db);

  // Dispatch secure ticket booking pass transactional email (Stripe checkout callback capture)
  const ticketRepr = (newReg.ticketType || 'standard').toUpperCase();
  dispatchEmail(newReg.attendeeEmail, `[Stripe Confirmed] Pass Issued for: ${event.title}`, 'ticket_issued', `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 20px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #635bff; padding: 40px 30px; text-align: center; color: #ffffff;">
        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #ffffff; background: #4f46e5; padding: 4px 12px; border-radius: 9999px;">Stripe Gate Verified</span>
        <h1 style="margin: 15px 0 0 0; font-size: 20px; font-weight: 800; text-transform: tracking-tight; line-height: 1.3;">${event.title}</h1>
        <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 13px;">Transaction: ${newReg.transactionId}</p>
      </div>
      <div style="padding: 35px 30px; color: #27272a; line-height: 1.6;">
        <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 5px;">Dear ${newReg.attendeeName},</h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #52525b;">Your Stripe subscription checkout of <strong>$${finalPriceUsd} USD</strong> has been validated. Below is your secure conference pass details:</p>
        
        <div style="border: 1px dashed #e4e4e7; border-radius: 12px; padding: 22px; background-color: #fafafa; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Attendee Registrant:</span>
            <span style="color: #18181b; font-weight: 700;">${newReg.attendeeName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Ticket Category:</span>
            <span style="text-transform: uppercase; color: #635bff; font-weight: 800;">${ticketRepr} STRIPE VIP PASS</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Stripe Session ID:</span>
            <span style="font-family: monospace; color: #18181b; font-weight: 700;">${newReg.transactionId}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Location Place:</span>
            <span style="color: #18181b; font-weight: 700;">${event.location}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span style="color: #71717a; font-weight: 500;">Form Schedule:</span>
            <span style="color: #18181b; font-weight: 700;">${event.date} at ${event.time}</span>
          </div>
        </div>

        <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 12px; padding: 15px; text-align: center;">
          <p style="margin: 0; font-size: 12.5px; font-weight: 700; color: #065f46;">🔒 Admission Scan Key Generated Successfully</p>
          <p style="margin: 4px 0 0 0; font-size: 11.5px; color: #047857;">Access your custom Ticket Console in the browser to view and present your checked-in QR badge at our physical boarding tables.</p>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
        This email represents a simulated transactional notification designed to demonstrate recruiter-ready notification outbox logging pipelines in full-stack Node.js React frameworks.
      </div>
    </div>
  `);

  res.status(201).json({ success: true, registration: newReg, event });
});

// RAZORPAY PAYMENT GATEWAY SIMULATORS
app.post('/api/payments/complete-razorpay-registration', (req, res) => {
  const db = loadDatabase();
  const { eventId, name, email, company, role, ticketType, razorpayOrderId } = req.body;

  if (!eventId || !name || !email) {
    return res.status(400).json({ error: 'Delegate registration parameters are missing.' });
  }

  const event = db.events.find(e => e.id === eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event was not found.' });
  }

  const existingReg = db.registrations.find(r => r.eventId === eventId && r.attendeeEmail.toLowerCase() === email.toLowerCase());
  if (existingReg) {
     return res.json({ success: true, registration: existingReg, event, alreadyDone: true });
  }

  if (event.registeredCount >= event.capacity) {
    return res.status(400).json({ error: 'Event is fully booked.' });
  }

  let attendee = db.attendees.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (!attendee) {
    attendee = {
      id: `at-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      company: company || '',
      role: role || '',
      registeredAt: new Date().toISOString()
    };
    db.attendees.push(attendee);
  }

  let finalPrice = event.price;
  if (ticketType === 'vip') finalPrice *= 1.5;
  if (ticketType === 'early_bird') finalPrice *= 0.8;
  const finalPriceInr = Math.round(finalPrice * 83); // standard INR conversion

  const razorTxId = `pay_rzp_${crypto.randomBytes(6).toString('hex')}`;

  const newReg = {
    id: `reg-${Date.now()}`,
    eventId,
    attendeeId: attendee.id,
    attendeeName: attendee.name,
    attendeeEmail: attendee.email,
    registeredAt: new Date().toISOString(),
    status: 'confirmed' as const,
    ticketType: ticketType || 'standard',
    amountPaid: Math.round(finalPrice),
    paymentMethod: 'razorpay' as const,
    transactionId: razorTxId,
    paymentStatus: 'paid' as const
  };

  db.registrations.push(newReg);
  event.registeredCount += 1;

  saveDatabase(db);

  // Dispatch secure ticket booking pass transactional email (Razorpay checkout callback capture)
  const ticketRepr = (newReg.ticketType || 'standard').toUpperCase();
  dispatchEmail(newReg.attendeeEmail, `[Razorpay Confirmed] Pass Issued for: ${event.title}`, 'ticket_issued', `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 20px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #3399cc; padding: 40px 30px; text-align: center; color: #ffffff;">
        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #ffffff; background: #0c7bb3; padding: 4px 12px; border-radius: 9999px;">Razorpay Checkout Verified</span>
        <h1 style="margin: 15px 0 0 0; font-size: 20px; font-weight: 800; text-transform: tracking-tight; line-height: 1.3;">${event.title}</h1>
        <p style="margin: 8px 0 0 0; color: #e0f2fe; font-size: 13px;">Payment ID: ${newReg.transactionId}</p>
      </div>
      <div style="padding: 35px 30px; color: #27272a; line-height: 1.6;">
        <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 5px;">Dear ${newReg.attendeeName},</h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #52525b;">Your Razorpay sandbox merchant transaction of <strong>₹${finalPriceInr.toLocaleString('en-IN')} INR</strong> has been successfully captured. Below is your official entry credentials:</p>
        
        <div style="border: 1px dashed #e4e4e7; border-radius: 12px; padding: 22px; background-color: #fafafa; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Attendee Registrant:</span>
            <span style="color: #18181b; font-weight: 700;">${newReg.attendeeName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Ticket Category:</span>
            <span style="text-transform: uppercase; color: #1e3a8a; font-weight: 800;">${ticketRepr} RAZORPAY PASS</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Razorpay Reference ID:</span>
            <span style="font-family: monospace; color: #18181b; font-weight: 700;">${newReg.transactionId}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Location Place:</span>
            <span style="color: #18181b; font-weight: 700;">${event.location}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span style="color: #71717a; font-weight: 500;">Form Schedule:</span>
            <span style="color: #18181b; font-weight: 700;">${event.date} at ${event.time}</span>
          </div>
        </div>

        <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 12px; padding: 15px; text-align: center;">
          <p style="margin: 0; font-size: 12.5px; font-weight: 700; color: #065f46;">🔒 Admission Scan Key Generated Successfully</p>
          <p style="margin: 4px 0 0 0; font-size: 11.5px; color: #047857;">Access your custom Ticket Console in the browser to view and present your checked-in QR badge at our physical boarding tables.</p>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
        This email represents a simulated transactional notification designed to demonstrate recruiter-ready notification outbox logging pipelines in full-stack Node.js React frameworks.
      </div>
    </div>
  `);

  res.status(201).json({ success: true, registration: newReg, event });
});

// AWS S3 / CLOUDINARY FILE UPLOAD SIMULATION
app.post('/api/ai/upload-cloudinary-s3', (req, res) => {
  const { fileName } = req.body;
  const hash = crypto.randomBytes(8).toString('hex');
  const fileExt = fileName ? path.extname(fileName) || '.jpg' : '.jpg';
  const simulatedSecureUrl = `https://gatherwise-bucket.s3.amazonaws.com/uploads/event-banner-${hash}${fileExt}`;
  
  res.json({
    success: true,
    url: simulatedSecureUrl,
    uploadedAt: new Date().toISOString(),
    cdnProvider: 'Cloudinary CDN / S3 Multi-Region Edge Server'
  });
});

// WEB INTERFACE ATTENDEE REVIEWS/RATINGS ENGINE
app.get('/api/events/:id/reviews', (req, res) => {
  const db = loadDatabase();
  const eventReviews = (db.reviews || []).filter(r => r.eventId === req.params.id);
  res.json(eventReviews);
});

app.post('/api/events/:id/reviews', (req, res) => {
  const db = loadDatabase();
  const eventId = req.params.id;
  const { reviewerName, reviewerEmail, rating, comment } = req.body;

  if (!reviewerName || !reviewerEmail || !rating || !comment) {
    return res.status(400).json({ error: 'Comments, rating value, delegate email, and reviewer name are required.' });
  }

  const newReview = {
    id: `rev-${Date.now()}-${Math.floor(Math.random() * 100)}`,
    eventId,
    reviewerName,
    reviewerEmail,
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString()
  };

  db.reviews = db.reviews || [];
  db.reviews.push(newReview);
  saveDatabase(db);

  // Trigger feedback registered transactional notification outbox post!
  dispatchEmail(reviewerEmail, `[Feedback Verified] Thank you for grading: ${db.events.find(e => e.id === eventId)?.title || 'GatherWise Forum'}`, 'feedback_received', `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 40px 30px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800; tracking-tight;">Attendee Review Received</h1>
        <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px;">Your insights serve to optimize future panels</p>
      </div>
      <div style="padding: 35px 30px; color: #27272a; line-height: 1.6;">
        <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Greetings ${reviewerName},</h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #52525b;">Thank you for writing an attendee review rating of <strong>${rating} out of 5 stars</strong>. Your comments have been indexed under verification ledger reference hash.</p>
        
        <blockquote style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 15px 20px; margin: 0 0 24px 0; font-style: italic; font-size: 13.5px; color: #334155; border-radius: 0 10px 10px 0;">
          "${comment}"
        </blockquote>
        
        <p style="margin: 0; font-size: 11px; color: #64748b;">Feedback rating submission timeline recorded at: ${new Date(newReview.createdAt).toLocaleString()}</p>
      </div>
      <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
        This email represents a simulated transactional notification designed to demonstrate recruiter-ready notification outbox logging pipelines in full-stack Node.js React frameworks.
      </div>
    </div>
  `);

  res.status(201).json(newReview);
});

// ATTENDEE QR SCAN CHECK-IN APPROVAL ROUTE (ATTENDANCE TRACKING LEDGER)
app.post('/api/registrations/:id/checkin', (req, res) => {
  const db = loadDatabase();
  const regId = req.params.id;
  const regIndex = db.registrations.findIndex(r => r.id === regId);

  if (regIndex === -1) {
    return res.status(404).json({ error: 'Secure admission ticket pass record not found.' });
  }

  const reg = db.registrations[regIndex];
  reg.checkedIn = true;
  reg.checkedInAt = new Date().toISOString();
  saveDatabase(db);

  const event = db.events.find(e => e.id === reg.eventId);

  // Dispatch Check-In Complete Transactional Confirmation Email!
  dispatchEmail(reg.attendeeEmail, `[Attendance Confirmed] Welcome to ${event?.title || 'GatherWise Forum'}! 🤝`, 'checkin_completed', `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #065f46; padding: 40px 30px; text-align: center; color: #ffffff;">
        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #34d399; background: #064e3b; padding: 4px 12px; border-radius: 9999px;">Boarding Gate Approved Scan</span>
        <h1 style="margin: 15px 0 0 0; font-size: 20px; font-weight: 800; text-transform: tracking-tight; line-height: 1.3;">${event?.title}</h1>
        <p style="margin: 8px 0 0 0; color: #a7f3d0; font-size: 13px;">QR Scan Verified Successfully</p>
      </div>
      <div style="padding: 35px 30px; color: #27272a; line-height: 1.6;">
        <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 5px;">Dear ${reg.attendeeName},</h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #52525b;">Your digital QR ticket credentials have been validated at the door. Your checked-in boarding attendance metric has been securely logged:</p>
        
        <div style="border: 1px dashed #e4e4e7; border-radius: 12px; padding: 22px; background-color: #fafafa; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Attendee Delegate:</span>
            <span style="color: #18181b; font-weight: 700;">${reg.attendeeName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Badge Class Tier:</span>
            <span style="text-transform: uppercase; color: #047857; font-weight: 800;">${reg.ticketType.toUpperCase()} PASS</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Admission Scan Time:</span>
            <span style="color: #18181b; font-weight: 700;">${new Date(reg.checkedInAt).toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span style="color: #71717a; font-weight: 500;">Security Ticket Ref:</span>
            <span style="font-family: monospace; color: #18181b; font-weight: 700;">${reg.id}</span>
          </div>
        </div>

        <p style="margin: 0; font-size: 13px; text-align: center; color: #71717a;">Please take your physical boarding materials and badge at Table 1. Have a wonderful time at the forum sessions!</p>
      </div>
      <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
        This email represents a simulated transactional notification designed to demonstrate recruiter-ready notification outbox logging pipelines in full-stack Node.js React frameworks.
      </div>
    </div>
  `);

  res.json({ success: true, registration: reg });
});

// RETRIEVE TRANSACTIONAL SYSTEM OUTBOX EMAILS
app.get('/api/emails', (req, res) => {
  const db = loadDatabase();
  res.json(db.emails || []);
});

// CERTIFICATE ISSUANCE SYSTEM LOGGING (COMPLETED EVENT ATTACHMENT ACTION)
app.post('/api/registrations/:id/certificate-email', (req, res) => {
  const db = loadDatabase();
  const regId = req.params.id;
  const reg = db.registrations.find(r => r.id === regId);

  if (!reg) {
    return res.status(404).json({ error: 'Registration record not found.' });
  }

  const event = db.events.find(e => e.id === reg.eventId);
  const certId = `CERT-GW-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  // Dispatch Certificate Claim Transactional Email
  dispatchEmail(reg.attendeeEmail, `[Certificate Accomplishment] ${event?.title || 'Forum'} Certificate Issued! 🎓`, 'certificate_granted', `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 20px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #b45309, #78350f); padding: 40px 30px; text-align: center; color: #ffffff;">
        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #fef3c7; background: #92400e; padding: 4px 12px; border-radius: 9999px;">Credential Credited</span>
        <h1 style="margin: 15px 0 0 0; font-size: 20px; font-weight: 800; tracking-tight; line-height: 1.3;">Certificate of Attendance</h1>
        <p style="margin: 8px 0 0 0; color: #fde68a; font-size: 13px;">ID: ${certId}</p>
      </div>
      <div style="padding: 35px 30px; color: #27272a; line-height: 1.6;">
        <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 5px;">Congratulations ${reg.attendeeName}!</h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #52525b;">Your certified credentials representing full curriculum participation at <strong>${event?.title}</strong> have been published and registered. Below is your accredited credential details:</p>
        
        <div style="border: 1px dashed #e4e4e7; border-radius: 12px; padding: 22px; background-color: #fafafa; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Accredited Graduate:</span>
            <span style="color: #18181b; font-weight: 700;">${reg.attendeeName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Syllabus Course:</span>
            <span style="color: #18181b; font-weight: 700;">${event?.title}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span style="color: #71717a; font-weight: 500;">Credential Serial:</span>
            <span style="font-family: monospace; color: #b45309; font-weight: 800;">${certId}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span style="color: #71717a; font-weight: 500;">Attainment Date:</span>
            <span style="color: #18181b; font-weight: 700;">${new Date().toISOString().substring(0, 10)}</span>
          </div>
        </div>

        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 15px; text-align: center;">
          <p style="margin: 0; font-size: 12.5px; font-weight: 700; color: #b45309;">🏆 Printable Hardcopy Frame Available</p>
          <p style="margin: 4px 0 0 0; font-size: 11.5px; color: #b45309;">Retrieve, print, or download your gold-seal customized visual PDF certificate frame from your finished tickets dashboard inside the browser.</p>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
        This email represents a simulated transactional notification designed to demonstrate recruiter-ready notification outbox logging pipelines in full-stack Node.js React frameworks.
      </div>
    </div>
  `);

  res.json({ success: true });
});

// Serve frontend via Vite middleware (dev) or statically (prod)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Event Management dev server online on http://0.0.0.0:${PORT}`);
  });
}

startServer();
