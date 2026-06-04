import { useState, useEffect, useRef, FormEvent } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Grid, 
  Plus, 
  Sparkles, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Briefcase, 
  ChevronRight, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  X, 
  Clock, 
  BarChart3, 
  Layers, 
  Edit3, 
  Eye, 
  TrendingUp, 
  Building2,
  Tag,
  Sun,
  Moon,
  CreditCard,
  Lock,
  ArrowLeft,
  Printer,
  QrCode,
  AlertTriangle,
  Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Event, Attendee, Registration, DashboardStats } from './types';
import RegistrationQRCode from './components/RegistrationQRCode';

export default function App() {
  // Navigation / Tabs state
  const [activeTab, setActiveTab] = useState<'events' | 'attendees' | 'stats' | 'emails'>('events');

  // Core Data States
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalAttendees: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
    registrationRate: 0
  });

  // UI / Interactive States
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'price' | 'capacity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Theme & Profile Menu States
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  // Date Range Filter States
  const [datePreset, setDatePreset] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showGoogleChooser, setShowGoogleChooser] = useState<boolean>(false);

  // Modal / Form States
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [registrationEvent, setRegistrationEvent] = useState<Event | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [detailEvent, setDetailEvent] = useState<Event | null>(null);
  const [detailRegistrations, setDetailRegistrations] = useState<Registration[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<any[]>([]);
  const [attendeeSubTab, setAttendeeSubTab] = useState<'directory' | 'my-tickets'>('my-tickets');
  const [selectedQRRegistration, setSelectedQRRegistration] = useState<any | null>(null);

  // Command Palette & Global Search States
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [commandPaletteQuery, setCommandPaletteQuery] = useState<string>('');
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof window !== 'undefined' ? window.navigator.onLine : true);

  // Recruiter Advanced Hub & Placement State Variables
  const [systemEmails, setSystemEmails] = useState<any[]>([]);
  const [selectedInboxEmail, setSelectedInboxEmail] = useState<any | null>(null);
  const [activeEventReviews, setActiveEventReviews] = useState<any[]>([]);
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [scannedRegistrationId, setScannedRegistrationId] = useState<string>('');
  const [isScannerBeepActive, setIsScannerBeepActive] = useState<boolean>(false);
  const [isCurrentlyScanning, setIsCurrentlyScanning] = useState<boolean>(false);
  
  // S3 Image Upload Simulator State
  const [isS3Uploading, setIsS3Uploading] = useState<boolean>(false);
  const [s3Progress, setS3Progress] = useState<number>(0);
  const [s3UploadStep, setS3UploadStep] = useState<string>('');

  // Payment Integration States
  const [isStripeConfigured, setIsStripeConfigured] = useState<boolean>(false);
  const [registerStep, setRegisterStep] = useState<'details' | 'payment'>('details');
  const [paymentMethodSelected, setPaymentMethodSelected] = useState<'stripe' | 'card' | 'razorpay'>('card');
  const [paying, setPaying] = useState<boolean>(false);
  const [cardForm, setCardForm] = useState({ cardNumber: '', cardExpiry: '', cardCvc: '' });
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<any | null>(null);
  
  // Razorpay Simulation Popup Overlay System states
  const [showRazorpayMockOverlay, setShowRazorpayMockOverlay] = useState<boolean>(false);
  const [razorpayMockStep, setRazorpayMockStep] = useState<'methods' | 'processing' | 'success'>('methods');

  // Completion Certificate credentials states
  const [showCertificateOverlay, setShowCertificateOverlay] = useState<boolean>(false);
  const [certificateReg, setCertificateReg] = useState<any | null>(null);

  // Custom Confirms (Safe for Sandboxed iFrame, blocks window.confirm)
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState<boolean>(false);
  const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState<Event | null>(null);

  // AI Loading & Error Feedback
  const [aiOptimizing, setAiOptimizing] = useState<boolean>(false);
  const [aiNote, setAiNote] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Form Fields State - New / Edit Event
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'conference' as Event['category'],
    capacity: 100,
    banner: '',
    price: 0,
    organizer: ''
  });

  // Auth States
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password' | 'reset-password'>('login');
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  // Auth Form Fields
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    role: '',
    securityQuestion: 'What is your favorite developer framework?',
    securityAnswer: '',
    otp: '',
    newPassword: ''
  });

  // Recovery States
  const [recoveryQuestion, setRecoveryQuestion] = useState<string>('');
  const [recoveryEmail, setRecoveryEmail] = useState<string>('');
  const [simulatedOtpCode, setSimulatedOtpCode] = useState<string>('');

  // Form Fields State - Register
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    ticketType: 'standard' as 'standard' | 'vip' | 'early_bird'
  });

  const regEmailDirty = registerForm.email.length > 0;
  const regEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(registerForm.email);
  const canSubmitRegister = registerForm.name.trim().length > 0 && regEmailValid;

  const getTierPrice = (tier: 'standard' | 'vip' | 'early_bird') => {
    if (!registrationEvent) return 0;
    let multiplier = 1;
    if (tier === 'vip') multiplier = 1.5;
    if (tier === 'early_bird') multiplier = 0.8;
    return Math.round(registrationEvent.price * multiplier);
  };

  // Trigger temporary notification
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Pre-populate registration form on login status change
  useEffect(() => {
    if (currentUser) {
      setRegisterForm(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || '',
        company: currentUser.company || '',
        role: currentUser.role || ''
      }));
    } else {
      setRegisterForm({
        name: '',
        email: '',
        company: '',
        role: '',
        ticketType: 'standard'
      });
    }
  }, [currentUser]);

  // Dark Mode Sync Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Keyboard Shortcut Listener for Global Search Command Palette (Ctrl+K/Cmd+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement).isContentEditable
      );
      
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteQuery('');
        setCommandPaletteOpen(prev => !prev);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        setCommandPaletteQuery('');
        setCommandPaletteOpen(true);
      } else if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Monitor Window Navigator Online/Offline state transitions
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Your network connection has been successfully restored. You are online.', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Your internet connection appears to be offline. You are in offline mode.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // OAuth Popup message listener for Google SSO success triggers
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('0.0.0.0')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { token, user } = event.data;
        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          setAuthToken(token);
          setCurrentUser(user);
          setShowAuthModal(false);
          setShowGoogleChooser(false);
          showToast(`Signed in with Google as ${user.email}!`, 'success');
          refreshAllData();
        }
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  // Check Stripe Configuration & handle Stripe success callbacks
  useEffect(() => {
    // 1. Check stripe config
    const checkStripeConfig = async () => {
      try {
        const res = await fetch('/api/payments/config');
        if (res.ok) {
          const data = await res.json();
          setIsStripeConfigured(data.isStripeConfigured);
        }
      } catch (err) {
        console.error('Failed to query Stripe configurations:', err);
      }
    };
    checkStripeConfig();

    // 2. Handle Stripe success callbacks from query params
    const params = new URLSearchParams(window.location.search);
    const payStatus = params.get('payment_status');
    const eventId = params.get('event_id');
    const payName = params.get('name');
    const payEmail = params.get('email');
    const payCompany = params.get('company');
    const payRole = params.get('role');
    const payTicketType = params.get('ticket_type');
    const payPrice = params.get('price');

    if (payStatus === 'success' && eventId && payName && payEmail) {
      const settleStripePayment = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/payments/complete-stripe-registration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId,
              name: payName,
              email: payEmail,
              company: payCompany,
              role: payRole,
              ticketType: payTicketType,
              price: payPrice
            })
          });

          if (res.ok) {
            const data = await res.json();
            setPaymentSuccessReceipt({
              registration: data.registration,
              event: data.event,
              fromStripe: true
            });
            showToast('Secure Ticket Booked via Stripe Checkout!', 'success');
            refreshAllData();
          } else {
            const errData = await res.json();
            showToast(errData.error || 'Failed to settle Stripe ticket booking.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Failed to contact database to register Stripe ticket.', 'error');
        } finally {
          setLoading(false);
          // Scrub URL parameters cleanly
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      settleStripePayment();
    } else if (payStatus === 'cancelled') {
      showToast('Stripe ticket transaction was cancelled.', 'info');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Auth Operations Handlers
  const handleSignUpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authForm.name || !authForm.email || !authForm.password || !authForm.securityAnswer) {
      showToast('Please fill in all required registration fields.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
          company: authForm.company,
          role: authForm.role,
          securityQuestion: authForm.securityQuestion,
          securityAnswer: authForm.securityAnswer
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuthToken(data.token);
        setCurrentUser(data.user);
        setShowAuthModal(false);
        showToast(`Welcome to GatherWise, ${data.user.name}!`, 'success');
        refreshAllData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Signup failed.', 'error');
      }
    } catch {
      showToast('Backend connection network failure.', 'error');
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authForm.email || !authForm.password) {
      showToast('Email and password fields are required.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setAuthToken(data.token);
        setCurrentUser(data.user);
        setShowAuthModal(false);
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        refreshAllData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Invalid credentials.', 'error');
      }
    } catch {
      showToast('Backend connection network failure.', 'error');
    }
  };

  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authForm.email) {
      showToast('Please enter your email to proceed.', 'info');
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email })
      });

      if (res.ok) {
        const data = await res.json();
        setRecoveryEmail(data.email);
        setRecoveryQuestion(data.securityQuestion);
        if (data.simulatedOtp) {
          setSimulatedOtpCode(data.simulatedOtp);
          showToast(`Recovery Code generated! Code: ${data.simulatedOtp}`, 'info');
        }
        setAuthMode('reset-password');
      } else {
        const err = await res.json();
        showToast(err.error || 'Password recovery initialization failed.', 'error');
      }
    } catch {
      showToast('Backend offline.', 'error');
    }
  };

  const handleResetPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authForm.newPassword || (!authForm.securityAnswer && !authForm.otp)) {
      showToast('Please provide your answer or verification code and your new password.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail,
          securityAnswer: authForm.securityAnswer,
          otp: authForm.otp,
          newPassword: authForm.newPassword
        })
      });

      if (res.ok) {
        showToast('Password updated! You can now log in.', 'success');
        setAuthForm(prev => ({ ...prev, password: '', securityAnswer: '', otp: '' }));
        setAuthMode('login');
      } else {
        const err = await res.json();
        showToast(err.error || 'Reset failed.', 'error');
      }
    } catch {
      showToast('Reset request failed.', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Fetch Google sign-in configuration from our API
      const urlRes = await fetch('/api/auth/google/url');
      if (urlRes.ok) {
        const { url, isReal } = await urlRes.json();
        
        if (isReal && url) {
          // Open real Google accounts selector popup
          const width = 520;
          const height = 650;
          const left = window.screen.width / 2 - width / 2;
          const top = window.screen.height / 2 - height / 2;
          
          const authWindow = window.open(
            url,
            'Google Sign-In',
            `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
          );
          
          if (!authWindow) {
            showToast('Popup blocked! Please allow popups for Google Authenticator.', 'error');
          }
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to check Google OAuth client setup, falling back to simulator", err);
    }

    // FALLBACK: OPEN THE GORGEOUS MOCK GOOGLE SELECTOR DIALOG
    // This provides a perfect, simulated Google Accounts selector where organizers or delegates can choose an account of their own.
    setShowGoogleChooser(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    setCurrentUser(null);
    showToast('Signed out of GatherWise.', 'info');
    setActiveTab('events');
    refreshAllData();
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthToken(null);
        setCurrentUser(null);
        setShowDeleteAccountConfirm(false);
        showToast('Account permanently deleted.', 'success');
        setActiveTab('events');
        refreshAllData();
      } else {
        showToast('Failed to delete user profile.', 'error');
      }
    } catch {
      showToast('Network error during account deletion.', 'error');
    }
  };

  // Fetch API Helpers
  const refreshAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const [eventsRes, attendeesRes, statsRes, emailsRes] = await Promise.all([
        fetch('/api/events', { headers }),
        fetch('/api/attendees', { headers }),
        fetch('/api/stats', { headers }),
        fetch('/api/emails', { headers })
      ]);

      if (eventsRes.ok && attendeesRes.ok && statsRes.ok && emailsRes.ok) {
        const eventsData = await eventsRes.json();
        const attendeesData = await attendeesRes.json();
        const statsData = await statsRes.json();
        const emailsData = await emailsRes.json();

        setEvents(eventsData);
        setAttendees(attendeesData);
        setStats(statsData);
        setSystemEmails(emailsData);

        // Fetch current user registrations if logged in
        const savedUser = localStorage.getItem('user');
        const userObj = savedUser ? JSON.parse(savedUser) : null;
        if (userObj && userObj.email) {
          try {
            const regsRes = await fetch(`/api/registrations/me?email=${encodeURIComponent(userObj.email)}`, { headers });
            if (regsRes.ok) {
              const regsData = await regsRes.json();
              setUserRegistrations(regsData);
            }
          } catch (regErr) {
            console.error('Error fetching user registrations inside refresh:', regErr);
          }
        } else {
          setUserRegistrations([]);
        }
      } else {
        showToast('Error syncing data with backend platform', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Backend offline. Using simulated system memory.', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [currentUser]);

  // Fetch single event's registrants list
  const fetchEventDetails = async (event: Event) => {
    setDetailEvent(event);
    setShowDetailModal(true);
    try {
      const [regsRes, reviewsRes] = await Promise.all([
        fetch(`/api/events/${event.id}/registrations`),
        fetch(`/api/events/${event.id}/reviews`)
      ]);

      if (regsRes.ok) {
        const data = await regsRes.json();
        setDetailRegistrations(data);
      }
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setActiveEventReviews(reviewsData);
      }
    } catch (err) {
      console.error('Error fetching event telemetry details/reviews', err);
    }
  };

  // Submit rating review feedback
  const submitReviewFeedback = async () => {
    if (!newReviewComment.trim()) {
      showToast('Please enter a feedback comment first.', 'error');
      return;
    }
    if (!detailEvent) return;

    try {
      const res = await fetch(`/api/events/${detailEvent.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : ''
        },
        body: JSON.stringify({
          rating: newReviewRating,
          comment: newReviewComment,
          attendeeName: currentUser?.name || 'Recruiter Reviewer',
          attendeeEmail: currentUser?.email || 'recruiter@placement.org'
        })
      });

      if (res.ok) {
        showToast('Review submitted successfully! Notification logged in outbox.', 'success');
        setNewReviewComment('');
        setNewReviewRating(5);
        
        // Reload reviews list
        const refreshedRes = await fetch(`/api/events/${detailEvent.id}/reviews`);
        if (refreshedRes.ok) {
          const data = await refreshedRes.json();
          setActiveEventReviews(data);
        }
        refreshAllData();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to submit review.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while processing rating.', 'error');
    }
  };

  // Submit Handler: Create or Edit Event
  const handleEventFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date || !eventForm.time || !eventForm.location || !eventForm.organizer) {
      showToast('Please fill out all mandatory fields.', 'error');
      return;
    }

    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm)
      });

      if (res.ok) {
        showToast(
          editingEvent 
            ? 'Event successfully updated and synchronized.'
            : 'New event successfully created and published.',
          'success'
        );
        setShowEventModal(false);
        setEditingEvent(null);
        refreshAllData();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Failed to submit event.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not save event details due to a network issue.', 'error');
    }
  };

  // Submit Handler: Register Attendee
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!registrationEvent) return;
    if (!registerForm.name || !registerForm.email) {
      showToast('Name and Email are mandatory fields.', 'error');
      return;
    }

    if (!regEmailValid) {
      showToast('Please enter a valid corporate email address.', 'error');
      return;
    }

    const price = getTierPrice(registerForm.ticketType);

    // If it's a paid ticket and we're still collecting participant details, transition to checkout step
    if (price > 0 && registerStep === 'details') {
      setRegisterStep('payment');
      return;
    }

    // Process payment / subscription
    if (price > 0) {
      setPaying(true);
      try {
        if (paymentMethodSelected === 'stripe') {
          // Live Stripe Checkout Routing
          const res = await fetch('/api/payments/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId: registrationEvent.id,
              ...registerForm
            })
          });

          if (res.ok) {
            const data = await res.json();
            // Redirect the top context to secure checkout pages
            window.location.href = data.url;
            return;
          } else {
            const data = await res.json();
            showToast(data.error || 'Failed to start Stripe checkout session.', 'error');
          }
        } else if (paymentMethodSelected === 'razorpay') {
          setPaying(false);
          setRazorpayMockStep('methods');
          setShowRazorpayMockOverlay(true);
          return;
        } else {
          // Adaptive Custom Card processing
          if (!cardForm.cardNumber || !cardForm.cardExpiry || !cardForm.cardCvc) {
            showToast('All credit card credential fields are required.', 'error');
            setPaying(false);
            return;
          }

          const res = await fetch('/api/payments/process-custom-card', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId: registrationEvent.id,
              ...registerForm,
              ...cardForm
            })
          });

          if (res.ok) {
            const data = await res.json();
            setPaymentSuccessReceipt({
              registration: data.registration,
              event: data.event,
              fromStripe: false
            });
            showToast(`Payment of $${price} successful! Seat assigned!`, 'success');
            setShowRegisterModal(false);
            setRegisterForm({ name: '', email: '', company: '', role: '', ticketType: 'standard' });
            setCardForm({ cardNumber: '', cardExpiry: '', cardCvc: '' });
            setRegisterStep('details');
            refreshAllData();
          } else {
            const data = await res.json();
            showToast(data.error || 'Payment gateway declined the transaction.', 'error');
          }
        }
      } catch (err) {
        console.error(err);
        showToast('Online checkout communication error.', 'error');
      } finally {
        setPaying(false);
      }
    } else {
      // Free ticket registration directly
      try {
        const res = await fetch(`/api/events/${registrationEvent.id}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerForm)
        });

        if (res.ok) {
          const data = await res.json();
          setPaymentSuccessReceipt({
            registration: data.registration,
            event: data.event,
            fromStripe: false,
            isFree: true
          });
          showToast(`Free ticket seat booking confirmed!`, 'success');
          setShowRegisterModal(false);
          setRegisterForm({ name: '', email: '', company: '', role: '', ticketType: 'standard' });
          setRegisterStep('details');
          refreshAllData();
        } else {
          const errorData = await res.json();
          showToast(errorData.error || 'Failed to book registration.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('An unexpected backend error occurred during seat booking.', 'error');
      }
    }
  };

  // Mock Razorpay gateway transaction submission handler
  const handleMockRazorpayPaymentSubmit = async (methodUsed: string) => {
    setRazorpayMockStep('processing');
    
    // Simulate real-time secure network confirmation 
    setTimeout(async () => {
      try {
        const price = getTierPrice(registerForm.ticketType);
        const res = await fetch('/api/payments/complete-razorpay-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: registrationEvent?.id,
            name: registerForm.name,
            email: registerForm.email,
            company: registerForm.company,
            role: registerForm.role,
            ticketType: registerForm.ticketType,
            amountPaidUsd: price,
            methodDetails: `Razorpay (${methodUsed})`
          })
        });

        if (res.ok) {
          const data = await res.json();
          setRazorpayMockStep('success');
          
          setTimeout(() => {
            setPaymentSuccessReceipt({
              registration: data.registration,
              event: data.event,
              fromStripe: false,
              isRazorpay: true
            });
            showToast(`Razorpay payment of ₹${(price * 83).toLocaleString()} verified!`, 'success');
            setShowRazorpayMockOverlay(false);
            setShowRegisterModal(false);
            setRegisterForm({ name: '', email: '', company: '', role: '', ticketType: 'standard' });
            setRegisterStep('details');
            refreshAllData();
          }, 1200);
        } else {
          const data = await res.json();
          showToast(data.error || 'Razorpay simulation response transaction failed.', 'error');
          setRazorpayMockStep('methods');
        }
      } catch (err) {
        console.error(err);
        showToast('Online checkout communication error.', 'error');
        setRazorpayMockStep('methods');
      }
    }, 1800);
  };

  // Delete Action triggered securely from the customized confirmation dialogue
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Event and registrations securely removed.', 'success');
        if (detailEvent?.id === eventId) {
          setShowDetailModal(false);
        }
        setShowDeleteEventConfirm(null);
        refreshAllData();
      } else {
        showToast('Failed to delete event.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while completing event removal.', 'error');
    }
  };

  // Gemini API Event Optimizer Call
  const handleAiOptimizeDescription = async () => {
    if (!eventForm.title) {
      showToast('Enter an Event Name/Title first so the AI can craft a custom description.', 'info');
      return;
    }

    setAiOptimizing(true);
    setAiNote('');
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventForm.title,
          category: eventForm.category,
          location: eventForm.location,
          organizer: eventForm.organizer
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEventForm(prev => ({ ...prev, description: data.text }));
        setAiNote(data.note || 'Suggested by offline workspace system');
        showToast('Event copy successfully generated & optimized!', 'success');
      } else {
        showToast('AI was unable to construct the copy. Using custom default context.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('AI connection timed out.', 'error');
    } finally {
      setAiOptimizing(false);
    }
  };

  // Prepare states for editing an event
  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      capacity: event.capacity,
      banner: event.banner,
      price: event.price,
      organizer: event.organizer
    });
    setAiNote('');
    setShowEventModal(true);
  };

  const openNewEventModal = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: 'conference',
      capacity: 100,
      banner: '',
      price: 0,
      organizer: ''
    });
    setAiNote('');
    setShowEventModal(true);
  };

  // Filter & Sort Logic
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || e.status === selectedStatus;
    
    // Evaluate Date ranges
    let matchesDate = true;
    if (datePreset !== 'all') {
      const eventTime = new Date(e.date + 'T00:00:00').getTime();
      const today = new Date();
      today.setHours(0,0,0,0);
      const todayTime = today.getTime();

      if (datePreset === 'today') {
        matchesDate = e.date === new Date().toISOString().split('T')[0];
      } else if (datePreset === 'this-week') {
        const firstDayOfWeek = new Date(today);
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday is start of week
        firstDayOfWeek.setDate(diff);
        firstDayOfWeek.setHours(0,0,0,0);

        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        lastDayOfWeek.setHours(23,59,59,999);

        matchesDate = eventTime >= firstDayOfWeek.getTime() && eventTime <= lastDayOfWeek.getTime();
      } else if (datePreset === 'this-month') {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        matchesDate = eventTime >= firstDayOfMonth.getTime() && eventTime <= lastDayOfMonth.getTime();
      } else if (datePreset === 'next-30-days') {
        const thirtyDaysLater = new Date(today);
        thirtyDaysLater.setDate(today.getDate() + 30);
        thirtyDaysLater.setHours(23, 59, 59, 999);
        matchesDate = eventTime >= todayTime && eventTime <= thirtyDaysLater.getTime();
      } else if (datePreset === 'custom') {
        if (startDate) {
          const startTime = new Date(startDate + 'T00:00:00').getTime();
          matchesDate = matchesDate && eventTime >= startTime;
        }
        if (endDate) {
          const endTime = new Date(endDate + 'T23:59:59').getTime();
          matchesDate = matchesDate && eventTime <= endTime;
        }
      }
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  }).sort((a, b) => {
    let orderMultiplier = sortOrder === 'asc' ? 1 : -1;
    if (sortField === 'date') {
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * orderMultiplier;
    }
    if (sortField === 'price') {
      return (a.price - b.price) * orderMultiplier;
    }
    if (sortField === 'capacity') {
      return (a.capacity - b.capacity) * orderMultiplier;
    }
    return 0;
  });

  // Reference for focusing Command Palette Input
  const commandInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (commandPaletteOpen) {
      const t = setTimeout(() => {
        commandInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [commandPaletteOpen]);

  // Detector mapping for State, Country, and Regions for high-fidelity location matching
  const getCountryStateMatchDetails = (locationStr: string, queryStr: string) => {
    const loc = (locationStr || '').toLowerCase();
    const q = (queryStr || '').toLowerCase().trim();
    if (!q) return null;

    const mapping = [
      { name: 'United States', type: 'country', icon: '🇺🇸', matchers: ['usa', 'united states', 'u.s.a', 'us', 'america'] },
      { name: 'India', type: 'country', icon: '🇮🇳', matchers: ['india', 'ind', 'bharat'] },
      { name: 'United Kingdom', type: 'country', icon: '🇬🇧', matchers: ['uk', 'united kingdom', 'u.k', 'britain', 'england', 'london'] },
      { name: 'Canada', type: 'country', icon: '🇨🇦', matchers: ['canada', 'ca'] },
      { name: 'Germany', type: 'country', icon: '🇩🇪', matchers: ['germany', 'deutschland', 'berlin', 'munich'] },
      { name: 'Singapore', type: 'country', icon: '🇸🇬', matchers: ['singapore', 'sg'] },
      { name: 'Japan', type: 'country', icon: '🇯🇵', matchers: ['japan', 'jp', 'tokyo'] },
      
      { name: 'California', type: 'state', icon: '🌴', matchers: ['california', 'ca', 'san francisco', 'los angeles', 'silicon valley'] },
      { name: 'New York', type: 'state', icon: '🏙️', matchers: ['new york', 'ny', 'nyc', 'manhattan', 'brooklyn'] },
      { name: 'Texas', type: 'state', icon: '🤠', matchers: ['texas', 'tx', 'austin', 'houston', 'dallas'] },
      { name: 'Washington', type: 'state', icon: '🌲', matchers: ['washington', 'wa', 'seattle'] },
      { name: 'Massachusetts', type: 'state', icon: '🏛️', matchers: ['massachusetts', 'ma', 'boston'] },
      
      { name: 'Maharashtra', type: 'state', icon: '🦁', matchers: ['maharashtra', 'mumbai', 'mh', 'pune'] },
      { name: 'Karnataka', type: 'state', icon: '🌸', matchers: ['karnataka', 'bangalore', 'bengaluru', 'ka'] },
      { name: 'Delhi', type: 'state', icon: '🕌', matchers: ['delhi', 'dl', 'new delhi'] },
      { name: 'Telangana', type: 'state', icon: '💎', matchers: ['telangana', 'hyderabad', 'ts'] },
      { name: 'Tamil Nadu', type: 'state', icon: '🛕', matchers: ['tamil nadu', 'chennai', 'tn'] }
    ];

    for (const region of mapping) {
      const queryMatchesRegion = region.matchers.some(m => m === q || m.includes(q) || q.includes(m));
      const locationContainsRegion = region.matchers.some(m => loc.includes(m));
      
      if (queryMatchesRegion && locationContainsRegion) {
        return {
          regionName: region.name,
          icon: region.icon,
          type: region.type,
          message: `In ${region.name} ${region.icon}`
        };
      }
    }

    if (loc.includes(q)) {
      return {
        regionName: 'Location match',
        icon: '📍',
        type: 'location',
        message: 'Matches location query'
      };
    }

    return null;
  };

  // Quick command shortcuts for dashboard operations
  const quickActionsList = [
    {
      id: 'act-host-event',
      title: 'Host a New Event',
      subtitle: 'Create a draft or live scheduling',
      icon: Plus,
      color: 'bg-emerald-500/10 text-emerald-600',
      action: () => {
        setCommandPaletteOpen(false);
        if (!currentUser) {
          showToast('Please sign in to host your event.', 'info');
          setAuthMode('login');
          setShowAuthModal(true);
        } else {
          openNewEventModal();
        }
      }
    },
    {
      id: 'act-switch-events',
      title: 'Events Workspace Console',
      subtitle: 'Explore schedules and forums',
      icon: Calendar,
      color: 'bg-indigo-500/10 text-indigo-600',
      action: () => {
        setCommandPaletteOpen(false);
        setActiveTab('events');
      }
    },
    {
      id: 'act-switch-attendees',
      title: 'Attendee Directory Registry',
      subtitle: 'Verify delegate enrollments',
      icon: Users,
      color: 'bg-sky-500/10 text-sky-600',
      action: () => {
        setCommandPaletteOpen(false);
        if (!currentUser) {
          showToast('Please sign in to access registries.', 'info');
          setAuthMode('login');
          setShowAuthModal(true);
        } else {
          setActiveTab('attendees');
          setAttendeeSubTab('directory');
        }
      }
    },
    {
      id: 'act-switch-portal',
      title: 'Digital Passes Portal',
      subtitle: 'Download your ticket check-in passes',
      icon: QrCode,
      color: 'bg-amber-500/10 text-amber-600',
      action: () => {
        setCommandPaletteOpen(false);
        setActiveTab('attendees');
        setAttendeeSubTab('my-tickets');
      }
    },
    {
      id: 'act-switch-stats',
      title: 'Performance & Statistics Hub',
      subtitle: 'View dynamic metrics and sales factors',
      icon: BarChart3,
      color: 'bg-rose-500/10 text-rose-600',
      action: () => {
        setCommandPaletteOpen(false);
        if (!currentUser) {
          showToast('Please sign in to access metric dashboard.', 'info');
          setAuthMode('login');
          setShowAuthModal(true);
        } else {
          setActiveTab('stats');
        }
      }
    },
    {
      id: 'act-toggle-theme',
      title: 'Toggle Dark / Light Theme Mode',
      subtitle: `Switch current theme to ${darkMode ? 'Light' : 'Dark'} mode`,
      icon: Sparkles,
      color: 'bg-violet-500/10 text-violet-600',
      action: () => {
        setCommandPaletteOpen(false);
        setDarkMode(!darkMode);
      }
    }
  ];

  // Filter lists based on global input query
  const matchedActions = commandPaletteQuery.trim() === '' 
    ? quickActionsList 
    : quickActionsList.filter(act => 
        act.title.toLowerCase().includes(commandPaletteQuery.toLowerCase()) || 
        act.subtitle.toLowerCase().includes(commandPaletteQuery.toLowerCase())
      );

  const matchedEvents = commandPaletteQuery.trim() === '' 
    ? [] 
    : events.filter(e => {
        const q = commandPaletteQuery.toLowerCase();
        const locMatch = getCountryStateMatchDetails(e.location, commandPaletteQuery);
        return e.title.toLowerCase().includes(q) ||
               (e.description || '').toLowerCase().includes(q) ||
               e.category.toLowerCase().includes(q) ||
               e.location.toLowerCase().includes(q) ||
               (e.organizer || '').toLowerCase().includes(q) ||
               locMatch !== null;
      });

  const matchedAttendees = commandPaletteQuery.trim() === '' 
    ? [] 
    : attendees.filter(att => {
        const q = commandPaletteQuery.toLowerCase();
        return att.name.toLowerCase().includes(q) ||
               att.email.toLowerCase().includes(q) ||
               (att.company || '').toLowerCase().includes(q) ||
               (att.role || '').toLowerCase().includes(q);
      });

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans tracking-tight transition-colors duration-200" id="main-root-container">
      
      {/* Dynamic System Message Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            id="global-toast-message"
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm max-w-md ${
              toastMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : toastMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-100'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            )}
            <span className="font-medium">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aesthetic Navigation bar */}
      <nav id="top-branding-navbar" className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 border-b border-zinc-100 dark:border-zinc-800/80 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-3.5" id="navbar-brand-sec">
            <span className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/10" id="brand-logo-badge">
              <Calendar className="w-5.5 h-5.5" />
            </span>
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-zinc-900 via-zinc-800 to-emerald-800 dark:from-white dark:via-zinc-200 dark:to-emerald-400 bg-clip-text text-transparent leading-tight">
                GatherWise
              </h1>
              <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase block">
                Systems &bull; Platform
              </span>
            </div>
          </div>

          {/* Navigation Workspace Switches */}
          <div className="flex items-center bg-zinc-100/80 dark:bg-zinc-800/80 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50" id="navbar-tab-controls">
            {(['events', 'attendees', 'stats', 'emails'] as const).map((tab) => (
              <button
                key={tab}
                id={`tab-btn-${tab}`}
                onClick={() => {
                  if (tab !== 'events' && !currentUser) {
                    showToast('Please sign in to access registries and performance metrics.', 'info');
                    setAuthMode('login');
                    setShowAuthModal(true);
                  } else {
                    setActiveTab(tab);
                  }
                }}
                className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 uppercase tracking-wider cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm font-bold' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab === 'events' && 'Events Workspace'}
                {tab === 'attendees' && 'Attendee Registry'}
                {tab === 'stats' && 'Performance Hub'}
                {tab === 'emails' && 'Recruiter Hub 🎓'}
              </button>
            ))}
          </div>

          {/* Core Action Buttons / User Status */}
          <div className="flex items-center gap-3" id="right-side-branding-action">
            {/* Real-time Connectivity Status Indicator */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border text-[10px] md:text-[11px] font-bold select-none transition-all shadow-sm ${
                isOnline 
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200/60 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-rose-50/60 dark:bg-rose-950/15 border-rose-200/60 dark:border-rose-900/30 text-rose-700 dark:text-rose-450'
              }`}
              title={`Network connection: ${isOnline ? 'Active (Online)' : 'No Internet (Offline)'}`}
              id="network-connectivity-indicator"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {isOnline ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </>
                )}
              </span>
              <span className="hidden sm:inline leading-none uppercase tracking-wide">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Real-time Global Search System Trigger */}
            <button
              onClick={() => {
                setCommandPaletteQuery('');
                setCommandPaletteOpen(true);
              }}
              className="p-2.5 lg:px-3.5 lg:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 shrink-0 group hover:border-zinc-300 dark:hover:border-zinc-750"
              title="Global Intelligent Search Command (⌘K)"
              id="global-search-nav-trigger"
            >
              <Search className="w-4 h-4 text-zinc-500 group-hover:text-zinc-850 dark:group-hover:text-zinc-200 shrink-0" />
              <span className="hidden lg:inline text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                Search <kbd className="ml-1.5 px-1.5 py-0.5 bg-zinc-50 dark:bg-zinc-855 border border-zinc-200 dark:border-zinc-750 text-[10px] font-mono rounded text-zinc-450 select-none">⌘K</kbd>
              </span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 text-zinc-650 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              id="theme-toggle-btn"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-500 animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-650" />
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3" id="user-profile-menu">
                <div className="flex flex-col items-end text-right hidden md:flex">
                  <span className="text-[12px] font-bold text-zinc-900 dark:text-zinc-100">{currentUser.name}</span>
                  <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 font-bold block">{currentUser.email}</span>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-9 h-9 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 font-black text-xs uppercase flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="User profile menu"
                    id="profile-dropdown-trigger"
                  >
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </button>

                  {/* Absolute backdrop to close when clicked outside */}
                  {showProfileMenu && (
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setShowProfileMenu(false)}
                      id="profile-menu-clickaway"
                    />
                  )}

                  {/* Dropdown Menu */}
                  <div 
                    id="profile-dropdown-menu"
                    className={`absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-2 z-50 transform origin-top-right transition-all duration-150 ${
                      showProfileMenu ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-widest leading-none mb-1">Account Profile</span>
                      <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate leading-tight">{currentUser.company || 'Private Strategist'}</p>
                      <p className="text-[9.5px] text-zinc-500 truncate leading-none mt-0.5">{currentUser.role || 'Attendee'}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowDeleteAccountConfirm(true);
                      }}
                      className="w-full text-left px-3 py-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50/60 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors cursor-pointer border-none outline-none"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      Delete Account
                    </button>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleSignOut();
                      }}
                      className="w-full text-left px-3 py-2 text-[11px] font-semibold text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 flex items-center gap-2 transition-colors cursor-pointer border-t border-zinc-100 dark:border-zinc-800 mt-1 outline-none"
                    >
                      <X className="w-3.5 h-3.5 shrink-0" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                id="header-signin-action"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-zinc-400" />
                Sign In
              </button>
            )}

            <button
              id="header-create-event-action"
              onClick={() => {
                if (!currentUser) {
                  showToast('Please sign in to host your event.', 'info');
                  setAuthMode('login');
                  setShowAuthModal(true);
                } else {
                  openNewEventModal();
                }
              }}
              className="flex items-center gap-2 px-4.5 py-2.5 bg-zinc-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-lg shadow-zinc-900/10 hover:shadow-emerald-600/20 group cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
              Host Event
            </button>
          </div>

        </div>
      </nav>

      {/* Main Content Area */}
      <main id="main-content-layout" className="max-w-7xl mx-auto px-6 py-8">

        {/* Dynamic Metric Ribbon */}
        <section id="metric-summary-strip" className="grid grid-cols-2 lg:grid-cols-5 gap-4.5 mb-8">
          
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] transition-all hover:border-zinc-300" id="kpi-card-total-events">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Total Gatherings</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-zinc-900">{stats.totalEvents}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-md">Live Repo</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] transition-all hover:border-zinc-300" id="kpi-card-total-registered">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Attendee Seats</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-zinc-900">{stats.totalAttendees}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-md">Confirmed</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] transition-all hover:border-zinc-300" id="kpi-card-total-revenue">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Ecosystem Value</span>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-1 bg-gradient-to-r from-emerald-800 to-zinc-900 bg-clip-text text-transparent">
                <DollarSign className="w-5 h-5 self-center text-emerald-600" />
                <span className="text-2xl font-extrabold">{stats.totalRevenue.toLocaleString()}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 block tracking-wider mt-0.5 leading-none">
                ₹{(stats.totalRevenue * 83).toLocaleString('en-IN')} INR
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] transition-all hover:border-zinc-300" id="kpi-card-upcoming-count">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Upcoming Drafts</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-zinc-900">{stats.upcomingEvents}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-md">Active</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] col-span-2 lg:col-span-1 transition-all hover:border-zinc-300" id="kpi-card-utilization-rate">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Global Fill Factor</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-zinc-900">{stats.registrationRate}%</span>
              <div className="flex-1 bg-zinc-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(stats.registrationRate, 100)}%` }}
                />
              </div>
            </div>
          </div>

        </section>

        {/* Conditional Tab Rendering */}

        {/* 1. EVENTS TAB */}
        {activeTab === 'events' && (
          <section id="events-workspace-view" className="space-y-6">
            
            {/* Control Bar: Search, Category, Status, Sorters */}
            <div className="bg-white p-4.5 rounded-2xl border border-zinc-200/60 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-4 items-center justify-between" id="events-control-bar">
              
              {/* Left Search input */}
              <div className="relative w-full md:w-80" id="search-input-wrapper">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  id="event-search-input"
                  placeholder="Search events, organizers, halls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Central Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto" id="filter-options-wrapper">
                
                {/* Category filters */}
                <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 p-1 rounded-xl" id="filter-category-select">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase px-2">Category:</span>
                  <select
                    id="category-dropdown"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent text-xs font-bold text-zinc-700 py-1 px-1 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Fields</option>
                    <option value="conference">Conferences</option>
                    <option value="workshop">Workshops</option>
                    <option value="seminar">Seminars</option>
                    <option value="networking">Networking Mixers</option>
                    <option value="meetup">Developer Meetups</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 p-1 rounded-xl" id="filter-status-select">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase px-2">Status:</span>
                  <select
                    id="status-dropdown"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-transparent text-xs font-bold text-zinc-700 py-1 px-1 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Any Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Date range filter picker */}
                <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 p-1 rounded-xl" id="filter-date-select">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase px-2 flex items-center gap-1 select-none">
                    <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>Timeframe:</span>
                  </span>
                  <select
                    id="date-preset-dropdown"
                    value={datePreset}
                    onChange={(e) => {
                      setDatePreset(e.target.value);
                      if (e.target.value !== 'custom') {
                        setStartDate('');
                        setEndDate('');
                      }
                    }}
                    className="bg-transparent text-xs font-bold text-zinc-700 py-1 px-1 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Any Date</option>
                    <option value="today">Today</option>
                    <option value="this-week">This Week</option>
                    <option value="this-month">This Month</option>
                    <option value="next-30-days">Next 30 Days</option>
                    <option value="custom">Custom Range...</option>
                  </select>

                  {datePreset === 'custom' && (
                    <div className="flex items-center gap-1 px-1.5 bg-white border border-zinc-200 rounded-lg ml-1" id="custom-date-range-inputs">
                      <input
                        type="date"
                        id="custom-start-date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent text-[11.5px] font-semibold text-zinc-650 focus:outline-none cursor-pointer outline-none border-none py-0.5 text-center min-w-[95px]"
                        title="Start Date"
                      />
                      <span className="text-[9.5px] text-zinc-400 font-bold uppercase select-none">to</span>
                      <input
                        type="date"
                        id="custom-end-date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent text-[11.5px] font-semibold text-zinc-650 focus:outline-none cursor-pointer outline-none border-none py-0.5 text-center min-w-[95px]"
                        title="End Date"
                      />
                      {(startDate || endDate) && (
                        <button
                          onClick={() => {
                            setStartDate('');
                            setEndDate('');
                          }}
                          className="text-zinc-400 hover:text-zinc-600 p-0.5 transition-colors cursor-pointer"
                          title="Clear Range"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Sorter Selection */}
                <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 p-1 rounded-xl" id="sort-order-selector">
                  <button
                    id="sort-toggle-btn"
                    onClick={() => setSortOrder(p => p === 'asc' ? 'desc' : 'asc')}
                    className="p-1 text-zinc-500 hover:text-zinc-900 transition-colors rounded-md"
                    title="Toggle Direction"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                  <select
                    id="sort-field-dropdown"
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as any)}
                    className="bg-transparent text-xs font-bold text-zinc-700 py-1 pr-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="date">Date</option>
                    <option value="price">Cost / Fee</option>
                    <option value="capacity">Capacity Limit</option>
                  </select>
                </div>

              </div>

            </div>

            {/* Grid List of Events */}
            {loading ? (
              <div id="events-grid-loading" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white border border-zinc-200/50 rounded-2xl h-80 animate-pulse flex flex-col justify-between p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-zinc-100 rounded-lg w-2/3" />
                      <div className="h-4 bg-zinc-100 rounded-lg w-1/3" />
                    </div>
                    <div className="h-10 bg-zinc-50 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div id="events-grid-empty" className="bg-white border border-zinc-200/60 rounded-2xl p-16 text-center max-w-xl mx-auto shadow-sm">
                <Layers className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-zinc-800 mb-1">No Gatherings Found</h3>
                <p className="text-xs text-zinc-500 mb-6">Modify your active search keywords or filters to locate specific events.</p>
                <button
                  id="empty-action-create-event"
                  onClick={openNewEventModal}
                  className="px-4 py-2 bg-zinc-900 text-white font-semibold rounded-xl text-xs hover:bg-emerald-700 transition-colors"
                >
                  Publish New Event
                </button>
              </div>
            ) : (
              <div id="events-grid-display" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
                {filteredEvents.map((event) => {
                  const percentReg = Math.min(Math.round((event.registeredCount / event.capacity) * 100), 100);
                  const isFull = event.registeredCount >= event.capacity;
                  
                  return (
                    <div 
                      key={event.id}
                      id={`event-card-${event.id}`}
                      className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-[0_2px_12px_-5px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between group"
                    >
                      {/* Banner and Tags overlay */}
                      <div className="relative h-44 overflow-hidden bg-zinc-100" id={`event-banner-wrap-${event.id}`}>
                        <img 
                          src={event.banner} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                        
                        {/* Event Category Tag */}
                        <span className="absolute top-3.5 left-3.5 text-[9px] font-bold uppercase tracking-wider bg-white/95 text-zinc-800 px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-sm">
                          {event.category}
                        </span>

                        {/* Cost Tag */}
                        <span className="absolute top-3.5 right-3.5 text-xs font-black bg-zinc-900/95 text-emerald-400 px-2.5 py-1 rounded-lg shadow-sm flex flex-col items-end leading-none">
                          {event.price === 0 ? (
                            <span>FREE</span>
                          ) : (
                            <>
                              <span>${event.price}</span>
                              <span className="text-[8.5px] text-zinc-300 font-bold mt-0.5">₹{Math.round(event.price * 83).toLocaleString('en-IN')}</span>
                            </>
                          )}
                        </span>

                        {/* Details bottom strip */}
                        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white text-[11px] font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-zinc-300" />
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1 max-w-[150px] truncate">
                            <MapPin className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                            {event.location}
                          </span>
                        </div>
                      </div>

                      {/* Info Details Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4" id={`event-card-body-${event.id}`}>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700">
                            <span>{event.organizer}</span>
                            <span className={`inline-block w-2 h-2 rounded-full ${
                              event.status === 'upcoming' ? 'bg-emerald-500' :
                              event.status === 'ongoing' ? 'bg-amber-500' : 'bg-zinc-400'
                            }`} />
                          </div>
                          <h3 className="text-sm font-bold text-zinc-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                            {event.description || 'No custom description generated yet.'}
                          </p>
                        </div>

                        {/* Seat occupancy bar */}
                        <div className="space-y-1.5 pt-2" id={`event-occupancy-${event.id}`}>
                          <div className="flex justify-between items-center text-[10px] font-semibold">
                            <span className="text-zinc-400">Occupancy Limits</span>
                            <span className={`font-bold ${isFull ? 'text-rose-600' : 'text-zinc-700'}`}>
                              {event.registeredCount} / {event.capacity} seats ({percentReg}%)
                            </span>
                          </div>
                          <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFull ? 'bg-rose-500' : percentReg > 85 ? 'bg-amber-500' : 'bg-emerald-600'
                              }`} 
                              style={{ width: `${percentReg}%` }}
                            />
                          </div>
                        </div>

                      </div>

                      {/* Structured Command bar */}
                      <div className="px-5 py-3.5 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between gap-2" id={`event-actions-${event.id}`}>
                        
                        {/* Manager Tools */}
                        <div className="flex items-center gap-1.5">
                          <button
                            id={`btn-edit-${event.id}`}
                            onClick={() => openEditModal(event)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 border border-zinc-200/80 bg-white hover:bg-zinc-100 rounded-lg transition-colors"
                            title="Edit Event configuration"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-${event.id}`}
                            onClick={() => setShowDeleteEventConfirm(event)}
                            className="p-1.5 text-zinc-400 hover:text-rose-700 border border-zinc-200/80 bg-white hover:bg-rose-50 rounded-lg transition-colors"
                            title="Cancel and Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Dynamic booking triggers */}
                        <div className="flex items-center gap-2">
                          <button
                            id={`btn-details-${event.id}`}
                            onClick={() => fetchEventDetails(event)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-zinc-700 hover:text-zinc-900 border border-zinc-200 bg-white hover:bg-zinc-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Overview
                          </button>
                          
                          <button
                            id={`btn-[ACTION_SUBSCRIBE]-${event.id}`}
                            disabled={isFull}
                            onClick={() => {
                              setRegistrationEvent(event);
                              setShowRegisterModal(true);
                            }}
                            className={`px-3 py-1.5 font-bold rounded-lg text-xs transition-colors ${
                              isFull 
                                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            }`}
                          >
                            {isFull ? 'Sold Out' : 'Register'}
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </section>
        )}

        {/* 2. ATTENDEES DIRECTORY TAB */}
        {activeTab === 'attendees' && (
          <section id="attendees-registry-section" className="bg-white border border-zinc-200/60 rounded-2xl shadow-sm overflow-hidden">
            
            {/* Header info */}
            <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Elite Attendees Repository & Portal</h2>
                <p className="text-xs text-zinc-500">Comprehensive log of verified delegates, registration schedules, and downloadable digital check-in passes.</p>
              </div>
              <div className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 border border-emerald-100/60 shrink-0">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{attendees.length} Unique Delegates verified</span>
              </div>
            </div>

            {/* Secure Sub-tab Switcher Bar */}
            <div className="flex border-b border-zinc-100 px-6 py-3.5 bg-zinc-50/50 gap-2.5">
              <button
                onClick={() => setAttendeeSubTab('directory')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  attendeeSubTab === 'directory'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-white border border-zinc-200/40 text-zinc-650 hover:bg-zinc-100/60 hover:text-zinc-905'
                }`}
                id="sub-tab-delegate-directory"
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                Delegate Directory
              </button>
              <button
                onClick={() => setAttendeeSubTab('my-tickets')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 relative ${
                  attendeeSubTab === 'my-tickets'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-white border border-zinc-200/40 text-zinc-650 hover:bg-zinc-100/60 hover:text-zinc-905'
                }`}
                id="sub-tab-attendee-portal"
              >
                <QrCode className="w-3.5 h-3.5 shrink-0" />
                <span>Attendee Portal (My Passes)</span>
                {currentUser && userRegistrations.length > 0 && (
                  <span className="bg-emerald-600 text-white rounded-full text-[10px] px-1.5 py-0.5 font-black leading-none shrink-0" id="user-tickets-badge-count">
                    {userRegistrations.length}
                  </span>
                )}
              </button>
            </div>

            {attendeeSubTab === 'directory' ? (
              loading ? (
                <div className="p-10 space-y-4 animate-pulse">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="h-10 bg-zinc-50 rounded-lg w-full" />
                  ))}
                </div>
              ) : attendees.length === 0 ? (
                <div className="py-20 text-center">
                  <Users className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-zinc-800 mb-1">No delegates currently recorded.</h4>
                  <p className="text-xs text-zinc-500">Attendees will display once they register for published schedules.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50/50 text-zinc-400 font-bold border-b border-zinc-100 uppercase tracking-wider text-[10px]">
                        <th className="p-4.5 font-bold">Delegate ID</th>
                        <th className="p-4.5 font-bold">Full Name</th>
                        <th className="p-4.5 font-bold">Mailing Address</th>
                        <th className="p-4.5 font-bold">Association/Company</th>
                        <th className="p-4.5 font-bold">Role Title</th>
                        <th className="p-4.5 font-bold">Enrollment timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {attendees.map((attendee) => {
                        const isSelected = selectedAttendeeId === attendee.id;
                        return (
                          <tr 
                            key={attendee.id} 
                            className={`transition-colors duration-505 ${isSelected ? 'bg-amber-50 dark:bg-amber-955/20 font-bold border-l-4 border-l-amber-550' : 'hover:bg-zinc-50/30'}`} 
                            id={`attendee-row-${attendee.id}`}
                          >
                          <td className="p-4.5 font-mono text-zinc-400 text-[10px]">{attendee.id}</td>
                          <td className="p-4.5 font-bold text-zinc-800 flex items-center gap-2">
                            <span className="w-7 h-7 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 text-[10px] font-bold">
                              {attendee.name.split(' ').map(n=>n[0]).join('')}
                            </span>
                            {attendee.name}
                          </td>
                          <td className="p-4.5 text-zinc-600 font-semibold">{attendee.email}</td>
                          <td className="p-4.5">
                            {attendee.company ? (
                              <span className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-700 font-semibold px-2.5 py-1 rounded-lg">
                                <Building2 className="w-3 h-3 text-zinc-400" />
                                {attendee.company}
                              </span>
                            ) : (
                              <span className="text-zinc-300 font-medium italic">Unspecified</span>
                            )}
                          </td>
                          <td className="p-4.5 font-medium text-zinc-500">
                            {attendee.role ? attendee.role : <span className="text-zinc-300">Independent</span>}
                          </td>
                          <td className="p-4.5 text-zinc-400 p-4.5">
                            {new Date(attendee.registeredAt).toLocaleString()}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* Attendee Portal Active Tab */
              <div className="p-6 bg-zinc-50/20">
                {!currentUser ? (
                  <div className="max-w-md mx-auto text-center py-12 px-6 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4" id="portal-logged-out-state">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center text-emerald-600 mx-auto border border-emerald-100 dark:border-emerald-950">
                      <QrCode className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Secure Ticket Pass Retrieval</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-450 max-w-xs mx-auto leading-relaxed">
                        Please authenticate or sign into your profile account to verify reservations and download unique onsite check-in badge QR codes.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                      }}
                      className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Sign In to Secure Portal
                    </button>
                  </div>
                ) : userRegistrations.length === 0 ? (
                  <div className="max-w-md mx-auto text-center py-16 px-6 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-805 rounded-3xl shadow-sm space-y-4" id="portal-empty-registrations">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-zinc-950/40 rounded-full flex items-center justify-center text-zinc-400 mx-auto border border-zinc-100 dark:border-zinc-850">
                      <Ticket className="w-6 h-6 shrink-0" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-150 leading-tight">No Reservational Passes Found</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-450 max-w-xs mx-auto leading-relaxed">
                        We did not detect any active ticket registrations associated with your profile email <span className="font-extrabold text-zinc-700 dark:text-zinc-300">{currentUser.email}</span>.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('events');
                      }}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Search className="w-4 h-4" />
                      Explore Active Forums
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5" id="portal-tickets-list-area">
                    <div className="flex items-center justify-between border-b border-zinc-150/60 dark:border-zinc-800/80 pb-3" id="portal-summary-header">
                      <div>
                        <h4 className="font-extrabold text-zinc-850 dark:text-zinc-250 text-xs uppercase tracking-wider">Your Digital Tickets ({userRegistrations.length})</h4>
                        <p className="text-[10.5px] text-zinc-400">Generates real-time, high-fidelity secure check-in QR credentials.</p>
                      </div>
                      <span className="text-[10.5px] text-zinc-500 dark:text-zinc-450 font-bold bg-zinc-100 dark:bg-zinc-850 px-3 py-1 rounded-lg">
                        Authenticated: {currentUser.email}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
                      {userRegistrations.map((reg) => (
                        <RegistrationQRCode key={reg.id} registration={reg} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </section>
        )}

        {/* 3. PERFORMANCE HUB TAB */}
        {activeTab === 'stats' && (
          <section id="performance-dashboard" className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6.5">
              
              {/* Category distribution visual SVG card */}
              <div className="bg-white border border-zinc-200/60 p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-800">Event Distributions</h3>
                    <p className="text-xs text-zinc-500">Breakdown of gather workspace categories.</p>
                  </div>
                  <Tag className="w-4 h-4 text-emerald-600" />
                </div>

                {/* Simulated bespoke SVG diagram representing actual state categories */}
                <div className="flex flex-col gap-3.5">
                  {(['conference', 'workshop', 'seminar', 'networking', 'meetup'] as const).map((cat, idx) => {
                    const matchedEvents = events.filter(e => e.category === cat);
                    const count = matchedEvents.length;
                    const maxVal = Math.max(...events.map(e => events.filter(ev => ev.category === e.category).length), 1);
                    const safePercent = (count / maxVal) * 100;
                    
                    return (
                      <div key={cat} className="space-y-1.5" id={`stats-category-${cat}`}>
                        <div className="flex justify-between items-center text-[11px] font-bold">
                          <span className="uppercase text-zinc-500 tracking-wider font-extrabold">{cat}</span>
                          <span className="text-zinc-700">{count} Events</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500`}
                            style={{ 
                              width: `${safePercent}%`,
                              backgroundColor: idx === 0 ? '#10b981' : idx === 1 ? '#0284c7' : idx === 2 ? '#f59e0b' : idx === 3 ? '#ec4899' : '#8b5cf6' 
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Dynamic Capacity load overview */}
              <div className="bg-white border border-zinc-200/60 p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-800">Capacity Occupancy Ranks</h3>
                    <p className="text-xs text-zinc-500">Individual reservation rates per published schedules.</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-600 animate-bounce" />
                </div>

                <div className="space-y-4" id="stats-capacity-ranks-list">
                  {events.slice(0, 5).map((e) => {
                    const percent = Math.min(Math.round((e.registeredCount / e.capacity) * 100), 100);
                    return (
                      <div key={e.id} className="flex items-center justify-between gap-4 text-xs border-b border-zinc-100/50 pb-2.5 last:border-0 last:pb-0">
                        <div className="truncate max-w-[170px]">
                          <span className="font-bold text-zinc-800 block truncate">{e.title}</span>
                          <span className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">{e.category}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-zinc-900 block">{e.registeredCount} booking seats</span>
                          <span className={`text-[10px] font-bold ${percent > 90 ? 'text-amber-600' : 'text-emerald-700'}`}>{percent}% volume filled</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

            {/* Platform summary card */}
            <div className="bg-zinc-900 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden" id="performance-banner">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_60%)]" />
              <div className="space-y-2 relative z-10">
                <h3 className="text-lg font-black text-white">Scale and Host Immersive Gatherings Effortlessly</h3>
                <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                  Leverage GatherWise robust Postgres integrations, containerized scale-out configurations, and built-in Gemini artificial capabilities to curate elite digital platforms instantly.
                </p>
              </div>
              <button
                id="banner-create-host-btn"
                onClick={openNewEventModal}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-xl shadow-emerald-600/20 z-10 shrink-0"
              >
                Assemble Event Now
              </button>
            </div>

          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer id="footer-branding-info" className="border-t border-zinc-200/50 bg-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="p-1 px-2 border border-zinc-200 rounded-lg font-bold text-zinc-500">Enterprise Edition v1.0.0</span>
            <span>&bull;</span>
            <span>Spring Boot 3 + React Architecture</span>
          </div>
          <div>
            &copy; 2026 GatherWise Ltd. All digital rights reserved. Confidential asset.
          </div>
        </div>
      </footer>

      {/* MODAL: CREATE / EDIT EVENT */}
      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm" id="event-editor-modal">
            <motion.div 
              initial={{ y: 24, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', duration: 0.42, bounce: 0.1 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {editingEvent ? 'Synchronize Gathering Metadata' : 'Initiate New Event Record'}
                  </h3>
                  <p className="text-xs text-zinc-500">Publish standard specs for registration, catalog indexing, and slot allocation.</p>
                </div>
                <button 
                  onClick={() => { setShowEventModal(false); setEditingEvent(null); }}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleEventFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                
                {/* Event Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Event Name/Title *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    placeholder="e.g. AI-First Product Launch & Hackathon"
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Category & Capacity Block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Category</label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({...eventForm, category: e.target.value as any})}
                      className="w-full bg-zinc-50 border border-zinc-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-700 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                    >
                      <option value="conference">Conference</option>
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="networking">Networking Mixer</option>
                      <option value="meetup">Developer Meetup</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Seat Capacity *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({...eventForm, capacity: Number(e.target.value)})}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Ticket Price (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="number"
                        min={0}
                        value={eventForm.price}
                        onChange={(e) => setEventForm({...eventForm, price: Number(e.target.value)})}
                        className="w-full bg-zinc-50 border border-zinc-200 pl-9 pr-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    {eventForm.price > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 block mt-1">
                        Approx. ₹{Math.round(eventForm.price * 83).toLocaleString('en-IN')} INR
                      </span>
                    )}
                  </div>

                </div>

                {/* Banner & Organizer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Banner Image URL</label>
                    <input
                      type="url"
                      value={eventForm.banner}
                      onChange={(e) => setEventForm({...eventForm, banner: e.target.value})}
                      placeholder="https://images.unsplash.com/... or keep blank"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Organizer / Guild Name *</label>
                    <input
                      type="text"
                      required
                      value={eventForm.organizer}
                      onChange={(e) => setEventForm({...eventForm, organizer: e.target.value})}
                      placeholder="e.g. Google AI Studio Specialists"
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                </div>

                {/* Date & Time Room */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Event Date *</label>
                    <input
                      type="date"
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Starting Time *</label>
                    <input
                      type="time"
                      required
                      value={eventForm.time}
                      onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-500 transition-colors animate-fade"
                    />
                  </div>

                </div>

                {/* Location Venue */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Venue / Broadcast Stream Location *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.location}
                    onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                    placeholder="e.g. San Francisco Tech Hub Suite 404 or Virtual Livestream"
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Description and AI Optimise Tool */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Description Content *</label>
                    
                    <button
                      type="button"
                      id="meta-btn-ai-suggest"
                      onClick={handleAiOptimizeDescription}
                      disabled={aiOptimizing}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1.5 border border-emerald-200/50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" style={{ animationDuration: aiOptimizing ? '2s' : '0s' }} />
                      {aiOptimizing ? 'Generating Optimized Copy...' : 'Generate with Gemini AI'}
                    </button>

                  </div>
                  
                  <textarea
                    rows={4}
                    required
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    placeholder="Brief outline of event structure, core speaker highlights, and criteria for seat assignment..."
                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors resize-y leading-relaxed"
                  />
                  {aiNote && (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md block w-fit border border-emerald-100">
                      &bull; {aiNote}
                    </span>
                  )}
                </div>

                {/* Submit Controls footer */}
                <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => { setShowEventModal(false); setEditingEvent(null); }}
                    className="px-4.5 py-2.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-event-builder-btn"
                    className="px-5 py-2.5 bg-zinc-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-zinc-900/10"
                  >
                    {editingEvent ? 'Synchronize Record' : 'Publish Gathering'}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REGISTER FOR EVENT */}
      <AnimatePresence>
        {showRegisterModal && registrationEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm" id="subscribe-seat-modal">
            <motion.div 
              initial={{ y: 24, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', duration: 0.42, bounce: 0.1 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-150 dark:border-zinc-850"
            >
              
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {registerStep === 'details' ? 'Book Seat Subscription' : 'Secure Online Payment'}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {registerStep === 'details' 
                      ? 'Secure entry key to current executive forum logs.' 
                      : 'Complete ticket transaction of your seat assignment.'}
                  </p>
                </div>
                <button 
                  onClick={() => { 
                    setShowRegisterModal(false); 
                    setRegistrationEvent(null); 
                    setRegisterStep('details');
                  }}
                  className="p-1 px-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Event Header Card */}
              <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150/55 dark:border-zinc-850 text-xs flex items-center gap-3">
                <img src={registrationEvent.banner} className="w-12 h-12 object-cover rounded-lg shrink-0 border border-zinc-200/50 dark:border-zinc-800" />
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{registrationEvent.category}</span>
                  <h4 className="font-extrabold text-zinc-800 dark:text-zinc-200 line-clamp-1 text-[13px] leading-tight">{registrationEvent.title}</h4>
                  <span className="text-zinc-500 dark:text-zinc-400 text-[10.5px] block truncate text-left">Organized by {registrationEvent.organizer}</span>
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
                
                {registerStep === 'details' ? (
                  <>
                    {/* Step 1: Attendee Information */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block text-left">Delegate Name *</label>
                      <input
                        type="text"
                        required
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                        placeholder="e.g. Alex Rivera"
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-805 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-150 text-left focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block text-left">Corporate Email *</label>
                      <input
                        type="email"
                        required
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                        placeholder="alex@domain.com"
                        className={`w-full bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-150 focus:outline-none transition-all duration-200 border ${
                          regEmailDirty
                            ? regEmailValid
                              ? 'border-emerald-500 focus:border-emerald-600 dark:border-emerald-600/80 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-500/10'
                              : 'border-rose-400 focus:border-rose-500 dark:border-rose-550 focus:ring-2 focus:ring-rose-500/15 bg-rose-50/10'
                            : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500'
                        }`}
                      />
                      {regEmailDirty && !regEmailValid && (
                        <p className="text-[9.5px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 mt-1 transition-all text-left">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Please enter a valid format (e.g., alex@domain.com)
                        </p>
                      )}
                      {regEmailDirty && regEmailValid && (
                        <p className="text-[9.5px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1 transition-all text-left">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Email address format is valid
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block text-left">Affiliation / Org</label>
                        <input
                          type="text"
                          value={registerForm.company}
                          onChange={(e) => setRegisterForm({...registerForm, company: e.target.value})}
                          placeholder="Stripe, MIT"
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block text-left">Professional Role</label>
                        <input
                          type="text"
                          value={registerForm.role}
                          onChange={(e) => setRegisterForm({...registerForm, role: e.target.value})}
                          placeholder="Engineer, Researcher"
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1 text-left">Ticket Preference Tier</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['standard', 'vip', 'early_bird'] as const).map((tier) => {
                          const priceUsd = getTierPrice(tier);
                          const priceInr = Math.round(priceUsd * 83);
                          return (
                            <button
                              key={tier}
                              type="button"
                              onClick={() => setRegisterForm({...registerForm, ticketType: tier})}
                              className={`py-2 px-1 text-[10px] font-extrabold border rounded-xl uppercase transition-all flex flex-col items-center justify-center leading-tight cursor-pointer ${
                                registerForm.ticketType === tier
                                  ? 'border-emerald-600 bg-emerald-50 dark:bg-zinc-850 text-emerald-800 dark:text-emerald-400 font-black'
                                  : 'border-zinc-205 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500 bg-white dark:bg-zinc-900'
                              }`}
                            >
                              <span className="font-bold">{tier.replace('_', ' ')}</span>
                              <span className="text-[8.5px] font-medium text-zinc-400 mt-0.5 lowercase normal-case leading-none">
                                {priceUsd === 0 ? 'free' : `$${priceUsd} / ₹${priceInr.toLocaleString('en-IN')}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Step 2: Payment Details */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-955 rounded-2xl border border-zinc-150/50 dark:border-zinc-850 space-y-2">
                      <div className="flex items-center justify-between text-xs text-zinc-550 dark:text-zinc-400">
                        <span>Delegate Name:</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">{registerForm.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-550 dark:text-zinc-400">
                        <span>Seat Tier Selected:</span>
                        <span className="font-bold uppercase text-zinc-800 dark:text-zinc-200">{registerForm.ticketType.replace('_', ' ')}</span>
                      </div>
                      <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 my-2 pt-2 flex items-center justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400 font-bold">Total Amount to Pay:</span>
                        <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                          ${getTierPrice(registerForm.ticketType)} USD / ₹{(getTierPrice(registerForm.ticketType) * 83).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Integrated Payment Gateways Toggles */}
                    <div className="flex bg-zinc-100 dark:bg-zinc-950 rounded-xl p-1 gap-1 border border-zinc-200/50 dark:border-zinc-850">
                      <button
                        type="button"
                        onClick={() => setPaymentMethodSelected('card')}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          paymentMethodSelected === 'card'
                            ? 'bg-white dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Simulation Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethodSelected('stripe')}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          paymentMethodSelected === 'stripe'
                            ? 'bg-white dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                        }`}
                      >
                        <Lock className="w-3 h-3 text-emerald-600" />
                        Stripe Checkout
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethodSelected('razorpay')}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          paymentMethodSelected === 'razorpay'
                            ? 'bg-white dark:bg-zinc-850 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-zinc-500 hover:text-indigo-800 dark:hover:text-indigo-200'
                        }`}
                      >
                        <Zap className="w-3 h-3 text-indigo-600 shrink-0" />
                        Razorpay India
                      </button>
                    </div>

                    {paymentMethodSelected === 'razorpay' && (
                      <div className="space-y-3 pt-3 text-left">
                        <div className="bg-indigo-50/50 dark:bg-indigo-950/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 text-xs">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-bounce" />
                            <h4 className="font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">Razorpay Instant India Checkout</h4>
                          </div>
                          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">
                            Book instantly using our direct sandbox merchant portal. Selecting this will launch a realistic Razorpay modal overlay configured for ₹ (Indian Rupees) card and UPI channels.
                          </p>
                          <div className="mt-3 flex items-center justify-between text-[11px] bg-white dark:bg-zinc-900/40 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-950">
                            <span className="font-bold text-zinc-500">Sandbox Merchant Account:</span>
                            <span className="font-extrabold text-indigo-700 dark:text-indigo-400">GATHER_WISE_MERCHANT</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethodSelected === 'card' ? (
                      <div className="space-y-3 pt-1 text-left">
                        {/* Interactive Credit Card Mockup */}
                        <div className="relative h-40 bg-gradient-to-tr from-emerald-805 to-zinc-900 dark:from-emerald-950 dark:to-zinc-950 rounded-2xl p-5 text-white shadow-lg overflow-hidden border border-emerald-500/10">
                          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl" />
                          <div className="flex justify-between items-start relative z-10">
                            <div>
                              <p className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest leading-none">GatherWise Pass SECURE</p>
                              <div className="w-8 h-6 bg-amber-500/80 rounded-md mt-2 flex items-center justify-center border border-amber-600/30">
                                <div className="grid grid-cols-3 gap-0.5 w-6 h-4">
                                  <div className="border border-zinc-100/50 rounded-xs"></div>
                                  <div className="border border-zinc-100/50 rounded-xs"></div>
                                  <div className="border border-zinc-100/50 rounded-xs"></div>
                                </div>
                              </div>
                            </div>
                            <span className="text-[11px] font-extrabold tracking-widest italic text-emerald-400">
                              {cardForm.cardNumber.startsWith('4') ? 'VISA' : cardForm.cardNumber.startsWith('5') ? 'Mastercard' : 'CREDIT'}
                            </span>
                          </div>

                          <div className="mt-4 relative z-10">
                            <p className="text-[13px] font-mono tracking-[0.2em] font-bold text-zinc-100">
                              {cardForm.cardNumber ? cardForm.cardNumber : '•••• •••• •••• ••••'}
                            </p>
                          </div>

                          <div className="mt-3.5 flex justify-between items-end relative z-10">
                            <div>
                              <p className="text-[7px] text-zinc-400 uppercase leading-none font-bold">Holder Name</p>
                              <p className="text-[10px] font-bold tracking-wide truncate max-w-[150px] uppercase mt-0.5 text-zinc-250">
                                {registerForm.name || 'DELEGATE NAME'}
                              </p>
                            </div>
                            <div className="flex gap-4">
                              <div>
                                <p className="text-[7px] text-zinc-400 uppercase leading-none font-bold">EXP</p>
                                <p className="text-[10px] font-mono font-bold mt-0.5 text-zinc-250">{cardForm.cardExpiry || 'MM/YY'}</p>
                              </div>
                              <div>
                                <p className="text-[7px] text-zinc-400 uppercase leading-none font-bold">CVC</p>
                                <p className="text-[10px] font-mono font-bold mt-0.5 text-zinc-250">{cardForm.cardCvc || '•••'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Credit Card Inputs Area */}
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCardForm({
                                cardNumber: '4242 4242 4242 4242',
                                cardExpiry: '12/29',
                                cardCvc: '123'
                              });
                            }}
                            className="w-full text-center py-1.5 border border-dashed border-emerald-305 dark:border-emerald-805 hover:border-emerald-500 text-[10px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-all cursor-pointer block leading-none"
                          >
                            ⚡ Auto-Fill Safe Sandbox Card Details (4242 Demo)
                          </button>

                          <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-zinc-405 dark:text-zinc-505 uppercase tracking-wider block">Card Number</label>
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={19}
                                required
                                value={cardForm.cardNumber}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/\D/g, '');
                                  let parts = [];
                                  for (let i = 0; i < val.length; i += 4) {
                                    parts.push(val.substring(i, i + 4));
                                  }
                                  setCardForm({ ...cardForm, cardNumber: parts.join(' ').substring(0, 19) });
                                }}
                                placeholder="4242 4242 4242 4242"
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 pl-9 pr-4 py-2 rounded-xl text-xs font-mono font-bold focus:outline-none transition-colors"
                              />
                              <CreditCard className="w-4 h-4 text-zinc-402 absolute left-3 top-2.5" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-0.5">
                              <label className="text-[10px] font-bold text-zinc-405 dark:text-zinc-505 uppercase tracking-wider block text-center">Expiry date</label>
                              <input
                                type="text"
                                maxLength={5}
                                required
                                placeholder="MM/YY"
                                value={cardForm.cardExpiry}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/\D/g, '');
                                  if (val.length > 2) {
                                    val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                  }
                                  setCardForm({ ...cardForm, cardExpiry: val.slice(0, 5) });
                                }}
                                className="w-full bg-zinc-55 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 px-4 py-2 rounded-xl text-xs font-mono font-bold focus:outline-none transition-colors text-center"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[10px] font-bold text-zinc-405 dark:text-zinc-505 uppercase tracking-wider block text-center">CVC Code</label>
                              <input
                                type="password"
                                maxLength={4}
                                required
                                placeholder="•••"
                                value={cardForm.cardCvc}
                                onChange={(e) => setCardForm({ ...cardForm, cardCvc: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                                className="w-full bg-zinc-55 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 px-4 py-2 rounded-xl text-xs font-mono font-bold focus:outline-none transition-colors text-center"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-1 text-center">
                        {isStripeConfigured ? (
                          <div className="p-4 bg-zinc-50 dark:bg-zinc-955 rounded-2xl border border-zinc-150/50 dark:border-zinc-850 space-y-3 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                              <Lock className="w-6 h-6 animate-pulse" />
                            </div>
                            <h5 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 leading-tight">Redirect to Secure Stripe Portal</h5>
                            <p className="text-[10.5px] text-zinc-450 dark:text-zinc-400 leading-relaxed">
                              You are about to be redirected safely to Stripe Checkout where payments can be finalized securely using Apple Pay, Credit Card, Google Pay, or localized bank transfers.
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-900/50 space-y-3 text-center">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-955 text-amber-600 dark:text-amber-400">
                              <AlertTriangle className="w-5 h-5 animate-bounce" />
                            </div>
                            <h5 className="text-xs font-extrabold text-amber-800 dark:text-amber-300 leading-tight">Stripe Key Unconfigured</h5>
                            <p className="text-[10.5px] text-amber-700/90 dark:text-amber-400 leading-relaxed text-left">
                              The live Stripe backend hasn't been configured with API keys. To execute real-world charges, declare <code className="bg-amber-100/60 dark:bg-amber-900/40 px-1 py-0.5 rounded text-[9.5px] font-mono leading-none">STRIPE_SECRET_KEY</code> in settings.
                            </p>
                            <p className="text-[10.5px] text-amber-700/90 dark:text-amber-400 leading-relaxed text-left font-bold">
                              Please use the "Simulation Card" option above to instantly experience the seamless checkout sandbox flow!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Footer buttons adaptive */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                  {registerStep === 'payment' ? (
                    <button
                      type="button"
                      onClick={() => setRegisterStep('details')}
                      className="px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-1.5 hover:text-zinc-800 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setShowRegisterModal(false); setRegistrationEvent(null); }}
                      className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-800 cursor-pointer"
                    >
                      Abort
                    </button>
                  )}

                  {registerStep === 'details' ? (
                    <button
                      type="submit"
                      disabled={!canSubmitRegister}
                      id="proceed-booking-or-checkout-btn"
                      className={`px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-200 flex items-center gap-1.5 ${
                        canSubmitRegister
                          ? 'bg-zinc-900 hover:bg-emerald-700 text-white shadow-zinc-900/10 active:scale-95 cursor-pointer'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      {getTierPrice(registerForm.ticketType) > 0 ? 'Proceed to Pay' : 'Confirm Seat (Free)'}
                      {getTierPrice(registerForm.ticketType) > 0 && <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={paying || (paymentMethodSelected === 'stripe' && !isStripeConfigured)}
                      id="submit-payment-charge-btn"
                      className={`px-6 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 min-w-[130px] ${
                        (paying || (paymentMethodSelected === 'stripe' && !isStripeConfigured))
                          ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-405 cursor-not-allowed'
                          : 'bg-zinc-900 hover:bg-emerald-700 text-white shadow-zinc-900/10 active:scale-95 cursor-pointer'
                      }`}
                    >
                      {paying ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-zinc-900 animate-spin rounded-full"></div>
                          Processing...
                        </>
                      ) : paymentMethodSelected === 'stripe' ? (
                        <>
                          Launch Checkout
                          <Lock className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        `Pay $${getTierPrice(registerForm.ticketType)} USD`
                      )}
                    </button>
                  )}
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: RAZORPAY GATEWAY SIMULATION */}
      <AnimatePresence>
        {showRazorpayMockOverlay && registrationEvent && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md" id="razorpay-simulation-popup">
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.38 }}
              className="bg-[#1a1f36] text-white rounded-3xl w-full max-w-[390px] overflow-hidden shadow-2xl border border-zinc-700/30 flex flex-col font-sans"
            >
              {/* Brand Top Header Bar */}
              <div className="p-5 bg-[#111625] flex justify-between items-center border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white font-black text-xs shadow-inner uppercase tracking-wider">
                    RP
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-wide text-zinc-100 uppercase">GatherWise Platform</h4>
                    <p className="text-[9.5px] text-zinc-400 font-mono">billing.sandbox@gatherwise.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Amount Payable</p>
                  <p className="text-sm font-black text-emerald-400">₹{(getTierPrice(registerForm.ticketType) * 83).toLocaleString()}</p>
                </div>
              </div>

              {/* Sandbox indicator alert banner */}
              <div className="bg-indigo-950/40 px-5 py-2 border-b border-indigo-900/30 flex items-center justify-between text-[10px] text-indigo-300">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" />
                  <span>Razorpay Safe Sandbox Environment Mode</span>
                </div>
                <span className="font-mono text-zinc-400 opacity-60">v4.2-SECURE</span>
              </div>

              {/* Main Dialog body conditional */}
              <div className="p-6 flex-1 min-h-[290px] flex flex-col justify-center">
                {razorpayMockStep === 'methods' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-3">SELECT INSTRUMENT TO AUTHORIZE:</span>
                      
                      <div className="space-y-2.5">
                        {/* Option 1: Instant VIP UPI */}
                        <button
                          type="button"
                          onClick={() => handleMockRazorpayPaymentSubmit('UPI - One-Click Sandbox')}
                          className="w-full bg-zinc-900 hover:bg-indigo-600/10 border border-zinc-800 hover:border-indigo-500/50 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer group text-left transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-tr from-purple-500/20 to-indigo-500/10 rounded-xl group-hover:scale-105 transition-all text-purple-400 shrink-0">
                              <Zap className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-[11.5px] font-black text-zinc-200">Instant UPI Express Approval</p>
                              <p className="text-[9.5px] text-zinc-400 font-semibold">Google Pay, PhonePe, Paytm, BHIM</p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                        </button>

                        {/* Option 2: Indian Banks NetBanking */}
                        <button
                          type="button"
                          onClick={() => handleMockRazorpayPaymentSubmit('NetBanking - Sandbox Bank Transfer')}
                          className="w-full bg-zinc-900 hover:bg-emerald-600/10 border border-zinc-800 hover:border-emerald-500/50 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer group text-left transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-tr from-emerald-500/20 to-zinc-500/10 rounded-xl group-hover:scale-105 transition-all text-emerald-400 shrink-0">
                              <CreditCard className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-[11.5px] font-black text-zinc-200">Net Banking Sandbox Channels</p>
                              <p className="text-[9.5px] text-zinc-405 font-semibold">SBI, ICICI, HDFC, Axis, Kotak Bank</p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                        </button>

                        {/* Option 3: Card simulation */}
                        <button
                          type="button"
                          onClick={() => handleMockRazorpayPaymentSubmit('Card - Razorpay Sandbox Scheme')}
                          className="w-full bg-zinc-900 hover:bg-amber-600/10 border border-zinc-800 hover:border-amber-500/50 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer group text-left transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-tr from-amber-500/20 to-zinc-500/10 rounded-xl group-hover:scale-105 transition-all text-amber-400 shrink-0">
                              <Lock className="w-4 h-4 text-amber-400" />
                            </div>
                            <div>
                              <p className="text-[11.5px] font-black text-zinc-200">Razorpay Simulation Card</p>
                              <p className="text-[9.5px] text-zinc-400 font-semibold">Pre-authorized VISA / Mastercard</p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {razorpayMockStep === 'processing' && (
                  <div className="text-center space-y-5 py-6">
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-zinc-850 rounded-full" />
                      <div className="absolute inset-0 border-4 border-transparent border-t-indigo-550 rounded-full animate-spin" />
                      <Zap className="w-6 h-6 text-indigo-450 animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <h5 className="text-sm font-extrabold text-zinc-100">Contacting Razorpay Gateway...</h5>
                      <p className="text-[10.5px] text-zinc-400 max-w-[280px] mx-auto select-none leading-relaxed">
                        Establishing a high fidelity TLS pipe connection with merchant bank endpoints. Do not refresh or close modal.
                      </p>
                    </div>
                    <span className="inline-block text-[9.5px] font-mono text-indigo-400/80 bg-indigo-950/60 border border-indigo-900/40 px-3 py-1 rounded-full uppercase tracking-wider">
                      Authorizing Amount INR
                    </span>
                  </div>
                )}

                {razorpayMockStep === 'success' && (
                  <div className="text-center space-y-4 py-8">
                    <div className="w-14 h-14 bg-emerald-555/15 border border-emerald-500/45 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 className="w-8 h-8 animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-sm font-extrabold text-white">Payment Authorized!</h5>
                      <p className="text-[11px] text-zinc-400">Razorpay Token: <code className="bg-zinc-950 text-emerald-450 px-1 py-0.5 rounded text-[10px]">pay_GWTxX{(Date.now() % 10000)}</code></p>
                    </div>
                    <p className="text-[10.5px] text-emerald-400 font-bold">Assigning ticket seat in database ledger...</p>
                  </div>
                )}
              </div>

              {/* Bottom Cancel bar */}
              {razorpayMockStep === 'methods' && (
                <div className="p-4 bg-[#111625] border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider">SECURE TRANSACTION</span>
                  <button
                    type="button"
                    onClick={() => setShowRazorpayMockOverlay(false)}
                    className="px-4 py-1.5 hover:bg-zinc-800 rounded-xl font-bold text-zinc-350 transition-colors cursor-pointer"
                  >
                    Cancel Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EVENT DETAILS OVERVIEW */}
      <AnimatePresence>
        {showDetailModal && detailEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm" id="event-detail-drilldown-modal">
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', duration: 0.42, bounce: 0.1 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              
              {/* Cover Banner */}
              <div className="relative h-56 bg-zinc-100 shrink-0">
                <img src={detailEvent.banner} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <button
                  onClick={() => { setShowDetailModal(false); setDetailEvent(null); }}
                  className="absolute top-4 right-4 p-1.5 bg-black/60 text-white text-zinc-200 hover:text-white rounded-full hover:bg-black/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-5 left-6 right-6 text-white text-xs">
                  <span className="font-extrabold uppercase bg-emerald-600 text-[9px] tracking-widest px-2.5 py-1 rounded-lg block w-fit mb-2">
                    {detailEvent.category} &bull; {detailEvent.price === 0 ? 'FREE / ₹0' : `$${detailEvent.price} / ₹${Math.round(detailEvent.price * 83).toLocaleString('en-IN')}`} ENTRY
                  </span>
                  <h3 className="text-base font-extrabold line-clamp-1">{detailEvent.title}</h3>
                  <span className="text-zinc-300 font-bold">Curated by {detailEvent.organizer}</span>
                </div>
              </div>

              {/* Dynamic split body scrolling */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  
                  {/* Left Specs */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-zinc-900 border-b border-zinc-100 pb-1 uppercase tracking-wider text-[11px]">Event Description</h4>
                    <p className="text-zinc-600 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-line">
                      {detailEvent.description || 'No detailed optimized brief has been provided.'}
                    </p>
                    <div className="flex items-center gap-4.5 pt-2">
                      <div className="flex items-center gap-1.5 text-zinc-500 font-semibold">
                        <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                        {detailEvent.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-500 font-semibold">
                        <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                        {detailEvent.time}
                      </div>
                    </div>
                  </div>

                  {/* Right specs */}
                  <div className="space-y-4 bg-zinc-50 p-5 rounded-2xl border border-zinc-200/50">
                    <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">Seat Reservations Rate</h4>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-500">Occupancy status:</span>
                      <span className="font-black text-zinc-900">{detailEvent.registeredCount} / {detailEvent.capacity} booked</span>
                    </div>

                    <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((detailEvent.registeredCount / detailEvent.capacity) * 100, 100)}%` }}
                      />
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-zinc-400 block uppercase">Broadcast Location/Venue:</span>
                      <p className="font-semibold text-zinc-700 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        {detailEvent.location}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Registrants Directory section */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">Confirmed Registrants List ({detailRegistrations.length})</h4>
                  {detailRegistrations.length === 0 ? (
                    <div className="border border-dashed border-zinc-200 rounded-2xl py-8 text-center text-zinc-400">
                      <span>No delegates currently assigned seats on this schedule.</span>
                    </div>
                  ) : (
                    <div className="border border-zinc-200/60 rounded-2xl overflow-hidden text-xs max-h-52 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-zinc-50 text-zinc-400 font-bold text-[10px] uppercase tracking-wider border-b border-zinc-100">
                            <th className="p-3">Attendee Name</th>
                            <th className="p-3">Email Address</th>
                            <th className="p-3">Ticket Tier</th>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3 text-center">Check-In Pass</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {detailRegistrations.map((sub) => (
                            <tr key={sub.id} className="hover:bg-zinc-50/50">
                              <td className="p-3 font-bold text-zinc-800">{sub.attendeeName}</td>
                              <td className="p-3 text-zinc-500 font-semibold">{sub.attendeeEmail}</td>
                              <td className="p-3">
                                <span className="inline-block px-2.5 py-0.5 bg-zinc-100 text-zinc-700 font-semibold rounded text-[9px] uppercase">
                                  {sub.ticketType}
                                </span>
                              </td>
                              <td className="p-3 text-zinc-400 font-medium">
                                {new Date(sub.registeredAt).toLocaleString()}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedQRRegistration({
                                      ...sub,
                                      event: detailEvent
                                    });
                                  }}
                                  className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 rounded-lg transition-colors cursor-pointer flex items-center justify-center mx-auto"
                                  title="Display unique security check-in pass QR"
                                >
                                  <QrCode className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ADVANCED RECRUITER METRICS: CREDENTIAL CERTIFICATE & FEEDBACK SYSTEM */}
                <div className="space-y-5 pt-4 border-t border-zinc-100">
                  
                  {/* Part A: Credentials Certificate section if registered */}
                  {currentUser && userRegistrations.some(r => r.eventId === detailEvent.id) && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 p-4.5 rounded-2xl border border-amber-200/60 dark:border-amber-805/30 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-700 shrink-0">
                          <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                        </div>
                        <div className="space-y-1.5 flex-1 text-left">
                          <h5 className="font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[10px]">Verified Scholar Credential Eligibility</h5>
                          <p className="text-zinc-650 dark:text-zinc-300 leading-relaxed font-semibold">
                            Congratulations! Your seat reservation hash <code className="bg-amber-100/60 dark:bg-amber-900/60 px-1 py-0.5 rounded text-[10px] font-mono font-bold">#{userRegistrations.find(r => r.eventId === detailEvent.id)?.id.slice(-6).toUpperCase()}</code> certifies you as an attendee. You can generate an official signed Certificate of Attendance.
                          </p>
                          <div className="flex items-center gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const reg = userRegistrations.find(r => r.eventId === detailEvent.id);
                                if (reg) {
                                  setCertificateReg({ ...reg, event: detailEvent });
                                  setShowCertificateOverlay(true);
                                }
                              }}
                              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer leading-none"
                            >
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                              View Certificate 🎓
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                const reg = userRegistrations.find(r => r.eventId === detailEvent.id);
                                if (reg) {
                                  try {
                                    const res = await fetch(`/api/registrations/${reg.id}/certificate-email`, { method: 'POST' });
                                    if (res.ok) {
                                      showToast("Certificate generated & dispatched securely to inbox logs!", "success");
                                      refreshAllData();
                                    } else {
                                      showToast("Failed to dispatch digital certificate stamp.", "error");
                                    }
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              }}
                              className="px-3.5 py-1.5 text-[10.5px] font-bold text-amber-700 dark:text-amber-450 hover:text-amber-900 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 rounded-xl border border-amber-200/50 cursor-pointer transition-colors leading-none"
                            >
                              Dispatch PDF Email
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Part B: Feedback Reviews & Ratings list */}
                  <div className="space-y-3.5 text-xs text-left" id="event-reviews-shelf">
                    <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-1.5">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">Attendee Reviews ({activeEventReviews.length})</h4>
                      <div className="flex items-center gap-1 text-[10.5px] text-amber-500 font-bold">
                        <span>Avg Rating:</span>
                        <span className="bg-amber-50 dark:bg-zinc-900 px-2 py-0.5 rounded-lg border border-amber-100/50 dark:border-zinc-800">
                          {activeEventReviews.length === 0 
                            ? '5.0' 
                            : (activeEventReviews.reduce((sum, r) => sum + r.rating, 0) / activeEventReviews.length).toFixed(1)} ★
                        </span>
                      </div>
                    </div>

                    {activeEventReviews.length === 0 ? (
                      <p className="text-zinc-400 dark:text-zinc-550 text-center py-4 italic font-semibold">No verified ratings submitted yet. Be the first to review!</p>
                    ) : (
                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {activeEventReviews.map((rev: any, index: number) => (
                          <div key={index} className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 p-3 rounded-2xl flex gap-3">
                            <span className="w-7 h-7 rounded-xl bg-emerald-650/10 border border-emerald-600/20 text-emerald-705 dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 uppercase">
                              {rev.attendeeName.slice(0, 2)}
                            </span>
                            <div className="space-y-1 flex-1 text-left">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-zinc-850 dark:text-zinc-200">{rev.attendeeName}</span>
                                <div className="flex text-amber-500 gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className="text-[11px] select-none">
                                      {i < rev.rating ? '★' : '☆'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">{rev.comment}</p>
                              <span className="text-[9px] text-zinc-400 block font-semibold">{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Review Form - only show if logged in */}
                    {currentUser ? (
                      <div className="mt-3.5 bg-zinc-50 dark:bg-zinc-955 border border-zinc-150 dark:border-zinc-850 p-4 rounded-2xl space-y-3">
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 block uppercase tracking-wide">Write an Attendee Feedback Review</span>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 font-bold">Your rating:</span>
                          <div className="flex text-amber-500 gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setNewReviewRating(i + 1)}
                                className="text-sm hover:scale-115 transition-transform cursor-pointer"
                              >
                                {i < newReviewRating ? '★' : '☆'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <textarea
                            rows={2}
                            placeholder="Type verified comments or placement feedback for recruiters to see!"
                            value={newReviewComment}
                            onChange={(e) => setNewReviewComment(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none transition-colors dark:text-white"
                          />
                        </div>

                        <div className="text-right">
                          <button
                            type="button"
                            onClick={submitReviewFeedback}
                            className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-755 text-zinc-100 hover:bg-emerald-700 hover:text-white dark:hover:bg-emerald-700 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                          >
                            Post Active Review ⭐
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-center text-zinc-400 dark:text-zinc-500 select-none uppercase">Please login to write reviews.</p>
                    )}
                  </div>

                </div>

              </div>

              {/* Action bar bottom */}
              <div className="p-5.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                <button
                  id="detail-cancel-btn"
                  onClick={() => { setShowDetailModal(false); setDetailEvent(null); }}
                  className="px-4 py-2 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 rounded-xl text-xs font-bold transition-colors"
                >
                  Close Showcase
                </button>
                <div className="flex items-center gap-2">
                  <button
                    id="detail-edit-shortcut"
                    onClick={() => { setShowDetailModal(false); openEditModal(detailEvent); }}
                    className="flex items-center gap-1.5 px-4.5 py-2 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 bg-white rounded-xl text-xs font-bold transition-all"
                  >
                    <Edit3 className="w-4 h-4 text-zinc-500" />
                    Modify Specs
                  </button>
                  <button
                    id="detail-register-shortcut"
                    disabled={detailEvent.registeredCount >= detailEvent.capacity}
                    onClick={() => {
                      setShowDetailModal(false);
                      setRegistrationEvent(detailEvent);
                      setShowRegisterModal(true);
                    }}
                    className={`px-5 py-2 font-black rounded-xl text-xs uppercase tracking-wider transition-colors ${
                      detailEvent.registeredCount >= detailEvent.capacity
                        ? 'bg-zinc-150 text-zinc-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {detailEvent.registeredCount >= detailEvent.capacity ? 'No Seats Remaining' : 'Secure Ticket'}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CREDENTIALS GOLD CERTIFICATE OVERLAY */}
      <AnimatePresence>
        {showCertificateOverlay && certificateReg && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md" id="certificate-viewer-modal">
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.38 }}
              className="bg-white text-zinc-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-amber-200 flex flex-col font-serif"
            >
              {/* Printable Area - framed in elegant gold cream */}
              <div id="printable-diploma-certificate" className="p-8 md:p-12 bg-[#fdfbf7] border-8 border-double border-amber-600/30 m-4 rounded-2xl flex flex-col items-center justify-self-center text-center space-y-6 relative overflow-hidden">
                {/* Background watermarks */}
                <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-600/20" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-600/20" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-600/20" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-600/20" />

                {/* University style header */}
                <div className="space-y-1">
                  <span className="p-2.5 bg-amber-500/10 rounded-full inline-block text-amber-600 mb-2">
                    <Calendar className="w-5 h-5 shrink-0" />
                  </span>
                  <h3 className="text-xs uppercase tracking-widest font-sans font-bold text-amber-700">GatherWise Scholastic Credential</h3>
                  <div className="h-[1px] w-12 bg-amber-600/40 mx-auto" />
                </div>

                <div className="space-y-3">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-800 tracking-wide italic">Certificate of Attendance</h1>
                  <p className="text-xs font-sans text-zinc-500 italic max-w-md mx-auto">
                    This official certificate serves as a secure record verifying the active participation and seat attendance of the credential holder below:
                  </p>
                </div>

                {/* Attendee Name block */}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-sans font-black tracking-widest text-zinc-400">Awarded Proudly To</p>
                  <h2 className="text-xl md:text-2xl font-black text-amber-900 underline decoration-amber-600/30 decoration-double underline-offset-8">
                    {certificateReg.attendeeName}
                  </h2>
                  <p className="text-[10.5px] font-mono text-zinc-500 font-bold">{certificateReg.attendeeEmail}</p>
                </div>

                {/* Event particulars */}
                <div className="space-y-2 max-w-lg">
                  <p className="text-xs font-sans text-zinc-600 leading-relaxed">
                    For successfully completing and participating at the verified forum session:
                  </p>
                  <h4 className="text-sm md:text-base font-extrabold font-sans text-zinc-900 bg-amber-100/30 px-3 py-1.5 border border-amber-200/30 rounded-xl inline-block">
                    {certificateReg.event?.title || 'GatherWise Scholar Convene'}
                  </h4>
                  <div className="flex items-center justify-center gap-6 text-[10.5px] font-sans font-semibold text-zinc-500 pt-1">
                    <span>Date: {certificateReg.event?.date || 'Upcoming schedule'}</span>
                    <span>&bull;</span>
                    <span>Venue: {certificateReg.event?.location || 'Digital Platform'}</span>
                  </div>
                </div>

                {/* Credentials & stamp seals */}
                <div className="w-full flex items-center justify-between pt-6 border-t border-dashed border-zinc-200 font-sans text-[10px]">
                  {/* Left Signature */}
                  <div className="flex flex-col items-center space-y-1 w-1/3">
                    <span className="font-serif italic text-xs text-zinc-650">GatherWise Auth Team</span>
                    <div className="w-16 h-[1px] bg-zinc-300" />
                    <span className="font-bold text-zinc-400 uppercase tracking-wider">Executive Registrar</span>
                  </div>

                  {/* Center Golden Seal */}
                  <div className="flex flex-col items-center justify-center relative w-12 h-12 shrink-0 z-10 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-full border-4 border-double border-white shadow-lg text-white">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <div className="absolute inset-0 border border-amber-300/30 rounded-full scale-90" />
                  </div>

                  {/* Right Signature */}
                  <div className="flex flex-col items-center space-y-1 w-1/3">
                    <span className="font-serif italic text-xs text-zinc-650">{certificateReg.event?.organizer || 'Manager Organizer'}</span>
                    <div className="w-16 h-[1px] bg-zinc-300" />
                    <span className="font-bold text-zinc-400 uppercase tracking-wider">Head Sponsor / Organizer</span>
                  </div>
                </div>

                {/* Certificate metadata hash */}
                <div className="text-[8.5px] font-mono text-zinc-400 flex items-center gap-1.5 pt-2">
                  <span>UUID-CERT: {certificateReg.id.slice(0, 16).toUpperCase()}</span>
                  <span>&bull;</span>
                  <span>VERIFIED HASH STATUS: CONFIRMED_ON_LEDGER</span>
                </div>

              </div>

              {/* Diploma controls footer */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-150 flex items-center justify-between font-sans text-xs">
                <button
                  type="button"
                  onClick={() => setShowCertificateOverlay(false)}
                  className="px-4 py-2 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Close Certificate Mode
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-[#059669] text-zinc-100 hover:bg-emerald-700 font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-[#059669]"
                  >
                    <Printer className="w-4 h-4 shrink-0" />
                    Print / Save PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: AUTHENTICATION GATEWAY */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm" id="auth-gateway-modal">
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', duration: 0.42, bounce: 0.1 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700">
                    <Calendar className="w-4.5 h-4.5" />
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Security Gateway</span>
                </div>
                <h3 className="text-lg font-black text-zinc-900 leading-tight">
                  {authMode === 'login' && 'Sign in to GatherWise'}
                  {authMode === 'signup' && 'Create Your ID Space'}
                  {authMode === 'forgot-password' && 'Recover Credential'}
                  {authMode === 'reset-password' && 'Update Password'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {authMode === 'login' && 'Unlock dashboard metrics and event coordinator actions.'}
                  {authMode === 'signup' && 'Join the executive registry and secure ticket assignments.'}
                  {authMode === 'forgot-password' && 'Initialize recovery via security answers or simulated verification.'}
                  {authMode === 'reset-password' && 'Assign a secure new password for your GatherWise ID.'}
                </p>
              </div>

              {/* Tab Switches (Only for login and signup) */}
              {(authMode === 'login' || authMode === 'signup') && (
                <div className="px-6 pt-4 flex gap-4 border-b border-zinc-100">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`pb-2.5 text-xs font-bold transition-all relative cursor-pointer ${
                      authMode === 'login' ? 'text-zinc-900 border-b-2 border-emerald-600' : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    User Sign In
                  </button>
                  <button
                    onClick={() => setAuthMode('signup')}
                    className={`pb-2.5 text-xs font-bold transition-all relative cursor-pointer ${
                      authMode === 'signup' ? 'text-zinc-900 border-b-2 border-emerald-600' : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    Register Account
                  </button>
                </div>
              )}

              {/* Login form */}
              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Corporate Email</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@domain.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Password</label>
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot-password')}
                        className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Enter account password"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-zinc-900 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md shadow-zinc-900/10 cursor-pointer"
                  >
                    Authenticate Account
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-zinc-100"></div>
                    <span className="flex-shrink mx-4 text-[9.5px] text-zinc-400 font-bold uppercase tracking-wider">or continue with google</span>
                    <div className="flex-grow border-t border-zinc-100"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 py-2.5 px-4 rounded-xl text-xs font-bold text-zinc-700 shadow-sm transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign In with Google Accounts
                  </button>
                </form>
              )}

              {/* Signup form */}
              {authMode === 'signup' && (
                <form onSubmit={handleSignUpSubmit} className="p-6 space-y-3.5 max-h-[64vh] overflow-y-auto">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Delegate Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Corporate Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@domain.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Assign Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters recommended"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Affiliation / Org</label>
                      <input
                        type="text"
                        placeholder="e.g. Y Combinator"
                        value={authForm.company}
                        onChange={(e) => setAuthForm({ ...authForm, company: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Profession Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Lead Technologist"
                        value={authForm.role}
                        onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 pt-3 mt-1.5 space-y-3">
                    <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider leading-none">Security Question Recovery Setup</span>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-zinc-500">Recovery Question *</label>
                      <select
                        value={authForm.securityQuestion}
                        onChange={(e) => setAuthForm({ ...authForm, securityQuestion: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
                      >
                        <option value="What is your favorite developer framework?">What is your favorite developer framework?</option>
                        <option value="What was the name of your first workspace team?">What was the name of your first workspace team?</option>
                        <option value="What city did you attend your first tech summit?">What city did you attend your first tech summit?</option>
                        <option value="What is your favorite programming language?">What is your favorite programming language?</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold text-zinc-500">Security Answer *</label>
                      <input
                        type="text"
                        required
                        placeholder="Required to reset forgot password"
                        value={authForm.securityAnswer}
                        onChange={(e) => setAuthForm({ ...authForm, securityAnswer: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-zinc-900 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-zinc-900/10 cursor-pointer mt-2"
                  >
                    Register Account ID
                  </button>
                </form>
              )}

              {/* Forgot password recovery initialization form */}
              {authMode === 'forgot-password' && (
                <form onSubmit={handleForgotPasswordSubmit} className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Registry Email</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@domain.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2.5">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-800 flex items-center gap-1 cursor-pointer"
                    >
                      &larr; Back to Sign In
                    </button>
                    <button
                      type="submit"
                      className="bg-zinc-900 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                    >
                      Retrieve Recovery Question
                    </button>
                  </div>
                </form>
              )}

              {/* Reset Password form (after retrieved recovery details) */}
              {authMode === 'reset-password' && (
                <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200/50 rounded-xl p-3.5 space-y-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-emerald-800 font-bold block">Developer Help Mode (Self-Service Reset)</span>
                    <p className="text-[10.5px] text-emerald-700 leading-tight">
                      You can reset via your security question answer OR use simulated OTP passcode sent instantly below:
                    </p>
                    {simulatedOtpCode && (
                      <div className="bg-white border border-emerald-300 font-mono text-[11px] font-extrabold px-3 py-1.5 rounded-lg text-emerald-900 text-center select-all mt-2 flex items-center justify-center gap-2">
                        <span>OTP:</span>
                        <span className="text-emerald-700 tracking-wider text-sm">{simulatedOtpCode}</span>
                      </div>
                    )}
                  </div>

                  {/* Security Question Section */}
                  <div className="space-y-3 mt-2 border-b border-zinc-100 pb-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Option A: Security Answer</span>
                      <p className="text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-100 p-2.5 rounded-lg">
                        {recoveryQuestion || 'What is your security question?'}
                      </p>
                    </div>
                    <input
                      type="text"
                      placeholder="Type security question answer"
                      value={authForm.securityAnswer}
                      onChange={(e) => setAuthForm({ ...authForm, securityAnswer: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  {/* Simulated OTP Section */}
                  <div className="space-y-1.5 border-b border-zinc-100 pb-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Option B: Verification OTP Code</label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP code"
                      value={authForm.otp}
                      onChange={(e) => setAuthForm({ ...authForm, otp: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>

                  {/* New Password input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">New Security Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Assign new secure key"
                      value={authForm.newPassword}
                      onChange={(e) => setAuthForm({ ...authForm, newPassword: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot-password')}
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-800 cursor-pointer"
                    >
                      &larr; Try Request Again
                    </button>
                    <button
                      type="submit"
                      className="bg-zinc-900 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                    >
                      Validate and Reset Password
                    </button>
                  </div>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: GOOGLE ACCOUNT CHOOSER (SIMULATED DYNAMIC CONTROL) */}
      <AnimatePresence>
        {showGoogleChooser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#757575]/60 backdrop-blur-[2px]" id="google-chooser-modal">
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', duration: 0.42, bounce: 0.1 }}
              className="bg-white rounded-[24px] w-full max-w-sm overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-100 p-8 flex flex-col relative font-sans"
            >
              <button
                onClick={() => setShowGoogleChooser(false)}
                className="absolute top-5 right-5 p-1 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                title="Cancel Sign In"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Google Logo SVG */}
                <svg className="w-16 h-6 mb-4 select-none" viewBox="0 0 74 24" fill="none">
                  <path d="M10.23 4.34c-1.61 0-3.08.34-4.38 1.01L7 8c.88-.41 1.83-.65 2.87-.65 1.94 0 3.51 1.13 3.51 3.54v.11c-.72-.05-1.57-.1-2.45-.1-2.73 0-5.33 1.25-5.33 3.82 0 2.25 1.95 3.5 3.99 3.5 1.95 0 2.94-.96 3.54-1.89h.09v1.54h3.11v-8.4c0-3.37-2.45-4.63-6.13-4.63zm3.17 7.78V13.8c0 1.98-1.55 3.12-3.11 3.12-1.28 0-2.22-.65-2.22-1.86 0-1.28 1.17-1.92 2.76-1.92.93 0 1.85.03 2.57.1v.08z" fill="#4285F4"/>
                  <path d="M22 6.5h-5.5V18H22V6.5zm-2.75 3.25h-2.5V11h2.5V9.75z" fill="#34A853"/>
                  <path d="M29.5 4.34c-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5 7.5-3.36 7.5-7.5-3.36-7.5-7.5-7.5zm0 11.75c-2.35 0-4.25-1.9-4.25-4.25s1.9-4.25 4.25-4.25 4.25 1.9 4.25 4.25-1.9 4.25-4.25 4.25z" fill="#FBBC05"/>
                  <path d="M44.5 4.34c-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5 7.5-3.36 7.5-7.5-3.36-7.5-7.5-7.5zm0 11.75c-2.35 0-4.25-1.9-4.25-4.25s1.9-4.25 4.25-4.25 4.25 1.9 4.25 4.25-1.9 4.25-4.25 4.25z" fill="#EA4335"/>
                  <path d="M54.5 4.34c-1.85 0-3.56.54-4.8 1.48l-.08-.08V4.5h-3.12v17.5h3.12v-6.32c1.24.94 2.95 1.48 4.8 1.48 3.51 0 6.5-2.99 6.5-6.5s-2.99-6.5-6.5-6.5zm-1 9.75c-2.07 0-3.75-1.68-3.75-3.75s1.68-3.75 3.75-3.75 3.75 1.68 3.75 3.75-1.68 3.75-3.75 3.75z" fill="#4285F4"/>
                  <path d="M64 4.5h-3.12v13.5H64V4.5z" fill="#34A853"/>
                  <path d="M72.5 12.34c.1 0-3.15-.34-4.8 1.48h4.5c.2-.5 1-2.5 1-4.5h-8.5v10H74v-2c0-3.3-1.5-5-2-5zm-3 1.74v-.08l2.5-.1c-.13.78-.96 1.42-2.5 1.42-1.34 0-2.3-1-2.5-1.91l2.5-.08z" fill="#EA4335"/>
                </svg>

                <h2 className="text-[20px] font-normal text-zinc-800 tracking-tight leading-tight select-none">
                  Choose an account
                </h2>
                <p className="text-xs text-zinc-500 mt-1 select-none">
                  to continue to <span className="font-semibold text-zinc-700">GatherWise</span>
                </p>
              </div>

              {/* Account list */}
              <div className="mt-6 space-y-2 max-h-[290px] overflow-y-auto pr-1" id="google-accounts-list">
                
                {/* 1. Primary User email from metadata or input check */}
                <button
                  onClick={async () => {
                    const chosenEmail = 'shreyareddythadur@gmail.com';
                    const name = 'Shreya Reddy';
                    try {
                      const res = await fetch('/api/auth/google', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: chosenEmail, name, googleId: `sim-sso-${Date.now()}` })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        setAuthToken(data.token);
                        setCurrentUser(data.user);
                        setShowAuthModal(false);
                        setShowGoogleChooser(false);
                        showToast(`Signed in with Google as ${data.user.email}!`, 'success');
                        refreshAllData();
                      }
                    } catch {
                      showToast('Unstable connection.', 'error');
                    }
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-zinc-50 border border-zinc-100 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center uppercase shadow-sm shrink-0">
                    S
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-800 leading-tight">Shreya Reddy</p>
                    <p className="text-[10.5px] text-zinc-500 truncate leading-tight">shreyareddythadur@gmail.com</p>
                  </div>
                </button>

                {/* 2. Standard Developer Account option */}
                <button
                  onClick={async () => {
                    const chosenEmail = 'developer@google.com';
                    const name = 'Developer Admin';
                    try {
                      const res = await fetch('/api/auth/google', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: chosenEmail, name, googleId: `sim-sso-${Date.now()}` })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        setAuthToken(data.token);
                        setCurrentUser(data.user);
                        setShowAuthModal(false);
                        setShowGoogleChooser(false);
                        showToast(`Signed in with Google as ${data.user.email}!`, 'success');
                        refreshAllData();
                      }
                    } catch {
                      showToast('Unstable connection.', 'error');
                    }
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-zinc-50 border border-zinc-100 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center uppercase shadow-sm shrink-0">
                    D
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-800 leading-tight">Developer Admin</p>
                    <p className="text-[10.5px] text-zinc-500 truncate leading-tight">developer@google.com</p>
                  </div>
                </button>

                {/* 3. Custom account option (prompt or inline input) */}
                <button
                  onClick={async () => {
                    const customEmail = prompt('Enter your personalized Google account email:');
                    if (!customEmail) return;
                    if (!customEmail.includes('@')) {
                      showToast('Invalid Gmail/Google account email.', 'error');
                      return;
                    }
                    const customName = prompt('Enter your name for this Google account:', 'Taylor Google');
                    if (!customName) return;

                    try {
                      const res = await fetch('/api/auth/google', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: customEmail, name: customName, googleId: `sim-sso-${Date.now()}` })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        setAuthToken(data.token);
                        setCurrentUser(data.user);
                        setShowAuthModal(false);
                        setShowGoogleChooser(false);
                        showToast(`Signed in with Google as ${data.user.email}!`, 'success');
                        refreshAllData();
                      }
                    } catch {
                      showToast('Network error during Google authentication.', 'error');
                    }
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-zinc-50 border border-zinc-100 flex items-center gap-3 transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-zinc-100 group-hover:bg-zinc-200 text-zinc-650 group-hover:text-zinc-800 text-sm flex items-center justify-center shadow-sm shrink-0 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-700 leading-tight group-hover:text-zinc-900 transition-colors">Use another account</p>
                    <p className="text-[10.5px] text-zinc-500 truncate leading-tight mt-0.5">Choose any account of your own...</p>
                  </div>
                </button>
              </div>

              {/* Google Security Disclaimer */}
              <div className="mt-8 border-t border-zinc-100 pt-4 text-[10px] text-zinc-400 select-none text-left leading-relaxed">
                To continue, Google will share your name, email address, language preference, and profile picture with GatherWise. Before using this app, you can review GatherWise’s <span className="text-blue-500 hover:underline cursor-pointer">privacy policy</span> and <span className="text-blue-500 hover:underline cursor-pointer">terms of service</span>.
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PAYMENT SUCCESS RECEIPT / DIGITAL PASS */}
      <AnimatePresence>
        {paymentSuccessReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/70 backdrop-blur-md" id="booking-receipt-modal">
            <motion.div 
              initial={{ y: 24, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', duration: 0.42, bounce: 0.1 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 relative text-center"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-emerald-500" />
              
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">Ticket Reservation Approved</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Your digital attendee pass keys have been initialized.</p>
                </div>

                {/* Simulated Visual Ticket Coupon */}
                <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 overflow-hidden text-left relative shadow-sm">
                  <div className="p-4 border-b border-dashed border-zinc-200 dark:border-zinc-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-extrabold uppercase bg-emerald-105 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-md leading-none">
                        {paymentSuccessReceipt.registration.ticketType} Pass
                      </span>
                      <span className="text-[9.5px] font-mono text-zinc-400">
                        TXN: #{paymentSuccessReceipt.registration.transactionId?.slice(-6) || 'SECURE'}
                      </span>
                    </div>
                    <h4 className="font-black text-zinc-800 dark:text-zinc-200 text-xs truncate leading-tight mt-1">{paymentSuccessReceipt.event.title}</h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 select-none flex items-center gap-1">
                      <Calendar className="w-3 h-3 shrink-0 text-emerald-500" />
                      {paymentSuccessReceipt.event.date} at {paymentSuccessReceipt.event.time}
                    </p>
                    <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 select-none truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0 text-emerald-500" />
                      {paymentSuccessReceipt.event.location}
                    </p>
                  </div>

                  {/* Cutout notches to look like a real ticket */}
                  <div className="absolute left-0 bottom-16 -ml-2 w-4 h-4 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800" />
                  <div className="absolute right-0 bottom-16 -mr-2 w-4 h-4 bg-white dark:bg-zinc-900 rounded-full border border-zinc-205 dark:border-zinc-800" />

                  <div className="p-4 flex items-center justify-between gap-3 bg-zinc-100/50 dark:bg-zinc-950/50">
                    <div className="min-w-0">
                      <p className="text-[8.5px] text-zinc-400 font-extrabold uppercase block leading-none">Registered Delegate</p>
                      <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate mt-0.5 leading-tight">{paymentSuccessReceipt.registration.attendeeName}</p>
                      <p className="text-[9.5px] text-zinc-500 truncate leading-none mt-0.5">{paymentSuccessReceipt.registration.attendeeEmail}</p>
                    </div>
                    {/* Simulated QR Code */}
                    <div className="w-11 h-11 bg-white dark:bg-zinc-905 border border-zinc-200/60 dark:border-zinc-800 rounded-lg p-1 shrink-0 flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-zinc-800 dark:text-zinc-200" />
                    </div>
                  </div>
                </div>

                {/* Receipt Details Table */}
                <div className="bg-zinc-50 dark:bg-zinc-955 rounded-2xl p-4 border border-zinc-150/50 dark:border-zinc-850 space-y-1.5 text-xs text-left">
                  <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                    <span>Payment Channel:</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {paymentSuccessReceipt.fromStripe ? 'Stripe Checkout (API)' : paymentSuccessReceipt.isFree ? 'Free Pass Direct' : 'Verified Sandbox Card'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                    <span>Amount Paid:</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                      {paymentSuccessReceipt.isFree ? 'Free' : `$${paymentSuccessReceipt.registration.amountPaid} USD / ₹${Math.round(paymentSuccessReceipt.registration.amountPaid * 83).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                    <span>Booking Status:</span>
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400">SECURE & CONFIRMED</span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      showToast('Receipt PDF exported and formatted for printer!', 'success');
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold border border-zinc-155 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Ticket
                  </button>
                  <button
                    onClick={() => {
                      setPaymentSuccessReceipt(null);
                      setRegistrationEvent(null);
                      setRegisterStep('details');
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white shadow-md shadow-zinc-900/10 transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CUSTOM ACCORDING DELETE CONFIRMATION (Blocks iframe windows confirm bug) */}
      <AnimatePresence>
        {showDeleteAccountConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-905/70 backdrop-blur-sm" id="custom-delete-account-confirm-modal">
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', duration: 0.42, bounce: 0.1 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-rose-100 dark:border-rose-950"
            >
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-rose-50 dark:bg-rose-950/40 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-150 leading-tight">Irrevocable Profile Purge</h3>
                  <p className="text-[11.5px] text-zinc-500 dark:text-zinc-450 mt-1 leading-relaxed">
                    Are you absolutely sure you want to permanently delete your GatherWise account? All account credentials, workspace event bookings, and digital seat subscriptions will be deleted. This cannot be undone.
                  </p>
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setShowDeleteAccountConfirm(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-all"
                  >
                    Abort
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-900/10 cursor-pointer transition-all"
                  >
                    Purge Account
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CUSTOM EVENT DELETE CONFIRMATION (Blocks iframe windows confirm bug) */}
      <AnimatePresence>
        {showDeleteEventConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-905/70 backdrop-blur-sm" id="custom-delete-event-confirm-modal">
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', duration: 0.42, bounce: 0.1 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-rose-100 dark:border-rose-950"
            >
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-rose-50 dark:bg-rose-950/40 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-150 leading-tight">Dismount Event Schedule</h3>
                  <p className="text-[11.5px] text-zinc-500 dark:text-zinc-450 mt-1 leading-relaxed">
                    Are you sure you want to delete <span className="font-extrabold text-zinc-700 dark:text-zinc-300">"{showDeleteEventConfirm.title}"</span>? This will cascade-delete all registrations and attendee records linked with this venue. This is irreversible.
                  </p>
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setShowDeleteEventConfirm(null)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-all"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(showDeleteEventConfirm.id)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-900/10 cursor-pointer transition-all"
                  >
                    Purge Event
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REGISTRATION PASS OVERLAY SCREEN */}
      <AnimatePresence>
        {selectedQRRegistration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md" id="registration-qr-overlay">
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => setSelectedQRRegistration(null)} 
            />
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', duration: 0.42, bounce: 0.1 }}
              className="relative z-10 max-w-sm w-full shadow-2xl"
            >
              {/* Absolute close button */}
              <button 
                onClick={() => setSelectedQRRegistration(null)}
                className="absolute top-2.5 right-2 px-2.5 py-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full z-20 cursor-pointer border border-zinc-700/30"
                title="Dismiss ticket overlay"
              >
                <X className="w-4 h-4" />
              </button>
              <RegistrationQRCode registration={selectedQRRegistration} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COGNITIVE REVOLUTION: THE COMMAND PALETTE SEARCH ENGINE */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-28 bg-zinc-950/70 backdrop-blur-md" id="system-command-palette-backdrop">
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => setCommandPaletteOpen(false)} 
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: -10 }}
              className="relative z-10 max-w-2xl w-full bg-white dark:bg-zinc-900 border border-zinc-250/70 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[75vh] overflow-hidden"
              id="system-command-palette-panel"
            >
              {/* Keyboard friendly search header input */}
              <div className="flex items-center gap-3 px-5 py-4.5 border-b border-zinc-150/80 dark:border-zinc-800 shrink-0">
                <Search className="w-5 h-5 text-zinc-450 dark:text-zinc-500 shrink-0" />
                <input
                  ref={commandInputRef}
                  type="text"
                  value={commandPaletteQuery}
                  onChange={(e) => setCommandPaletteQuery(e.target.value)}
                  placeholder="Type an event, attendee, country (USA, India), state abbreviation (CA, NY, MH)..."
                  className="flex-1 bg-transparent border-0 focus:outline-none text-zinc-850 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm font-medium pr-10"
                  id="command-palette-query-input"
                />
                <button
                  onClick={() => setCommandPaletteOpen(false)}
                  className="text-[10px] font-mono font-extrabold bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-200/60 dark:border-zinc-750 px-2 py-1 rounded-lg leading-none shadow-sm flex items-center select-none"
                  title="Close console search"
                >
                  ESC
                </button>
              </div>

              {/* Scrollable multi category list container */}
              <div className="overflow-y-auto p-5 space-y-6 flex-1 max-h-[50vh] dark:scrollbar-zinc" id="command-palette-scrollable-body">
                
                {/* 1. MATCHED ACTIONS */}
                {matchedActions.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest uppercase flex items-center gap-1.5 px-1.5 leading-none mb-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      Quick Commands
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2" id="palette-actions-grid animate-flow">
                      {matchedActions.map((act) => {
                        const Icon = act.icon;
                        return (
                          <button
                            key={act.id}
                            onClick={act.action}
                            className="w-full text-left p-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-805 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200/80 dark:hover:border-zinc-750 rounded-2xl flex items-center gap-3 transition-all cursor-pointer group group"
                            id={`palette-action-${act.id}`}
                          >
                            <span className={`p-2.5 rounded-xl shrink-0 ${act.color} group-hover:scale-105 transition-transform`}>
                              <Icon className="w-4 h-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-black text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white truncate">{act.title}</span>
                              <span className="block text-[10.5px] text-zinc-450 dark:text-zinc-550 truncate leading-none mt-0.5">{act.subtitle}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. MATCHED EVENTS & COUNTRY / STATES HIGHLIGHTS */}
                {matchedEvents.length > 0 && (
                  <div className="space-y-2.5 border-t border-zinc-100 dark:border-zinc-800 pt-5">
                    <h5 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest uppercase flex items-center gap-1.5 px-1.5 leading-none mb-2.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      Matching Events Workspace ({matchedEvents.length})
                    </h5>
                    <div className="space-y-1.5" id="palette-events-list">
                      {matchedEvents.map((evt) => {
                        const locHighlight = getCountryStateMatchDetails(evt.location, commandPaletteQuery);
                        return (
                          <button
                            key={evt.id}
                            onClick={() => {
                              fetchEventDetails(evt);
                              setCommandPaletteOpen(false);
                            }}
                            className="w-full text-left p-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-805/60 border border-zinc-100/50 dark:border-zinc-850 hover:border-zinc-200/70 dark:hover:border-zinc-750/80 rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer group"
                            id={`palette-event-${evt.id}`}
                          >
                            <img 
                              src={evt.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100'} 
                              alt="" 
                              className="w-10 h-10 rounded-xl object-cover shrink-0 select-none shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate flex-1 leading-tight">{evt.title}</span>
                                {evt.status === 'upcoming' && (
                                  <span className="text-[8.5px] uppercase font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md leading-none border border-emerald-100 shrink-0">Draft</span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-zinc-450 dark:text-zinc-500 font-medium">
                                <span className="flex items-center gap-0.5">
                                  <Clock className="w-3 h-3 shrink-0" />
                                  {evt.date}
                                </span>
                                <span>&bull;</span>
                                <span className="flex items-center gap-0.5 truncate max-w-sm">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  {evt.location}
                                </span>
                                {locHighlight && (
                                  <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-450 font-black px-1.5 py-0.5 rounded text-[8.5px] tracking-wide border border-amber-100 dark:border-amber-950 ring-1 ring-amber-400/20 shrink-0 animate-pulse">
                                    {locHighlight.icon} {locHighlight.regionName} Match
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. MATCHED ATTENDEES */}
                {matchedAttendees.length > 0 && (
                  <div className="space-y-2.5 border-t border-zinc-100 dark:border-zinc-800 pt-5">
                    <h5 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest uppercase flex items-center gap-1.5 px-1.5 leading-none mb-2.5">
                      <Users className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      Matching Verified Attendees ({matchedAttendees.length})
                    </h5>
                    <div className="space-y-1.5" id="palette-attendees-list">
                      {matchedAttendees.map((att) => (
                        <button
                          key={att.id}
                          onClick={() => {
                            setSelectedAttendeeId(att.id);
                            setActiveTab('attendees');
                            setAttendeeSubTab('directory');
                            setCommandPaletteOpen(false);
                            // Highlight stays for 4 seconds beautifully
                            setTimeout(() => {
                              setSelectedAttendeeId(null);
                            }, 4000);
                          }}
                          className="w-full text-left p-3 hover:bg-zinc-50/60 dark:hover:bg-zinc-805/60 border border-zinc-100/50 dark:border-zinc-850 hover:border-zinc-200/70 dark:hover:border-zinc-750/80 rounded-2xl flex items-center gap-3 transition-all cursor-pointer group"
                          id={`palette-attendee-${att.id}`}
                        >
                          <span className="w-8.5 h-8.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-450 border border-zinc-200 dark:border-zinc-750 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 uppercase">
                            {att.name.split(' ').map(n=>n[0]).join('')}
                          </span>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <span className="block text-xs font-extrabold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-455 leading-tight">{att.name}</span>
                            <div className="flex items-center gap-2 text-[10.5px] text-zinc-450 dark:text-zinc-500">
                              <span className="truncate">{att.email}</span>
                              {att.company && (
                                <>
                                  <span>&bull;</span>
                                  <span className="inline-flex items-center gap-0.5 font-bold truncate text-zinc-500 max-w-xs">
                                    <Building2 className="w-3 h-3 text-zinc-400" />
                                    {att.company}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className="text-[9.5px] text-zinc-400 bg-zinc-50 dark:bg-zinc-850 px-2 py-1 rounded-md shrink-0 block leading-none font-bold">
                            {att.role || 'Independent'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. ABSOLUTE EMPTY STATE MATCH LIMIT */}
                {commandPaletteQuery.trim() !== '' && matchedActions.length === 0 && matchedEvents.length === 0 && matchedAttendees.length === 0 && (
                  <div className="py-14 text-center space-y-3.5" id="palette-no-matches-found">
                    <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-850 rounded-full flex items-center justify-center text-zinc-450 mx-auto border border-zinc-150/40 dark:border-zinc-800">
                      <Search className="w-5 h-5 shrink-0" />
                    </div>
                    <div className="max-w-xs mx-auto space-y-1">
                      <h4 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-250 leading-tight">No Search Matches Identified</h4>
                      <p className="text-[11.5px] text-zinc-500 dark:text-zinc-500 leading-relaxed">
                        We couldn't locate actions, events, state parameters, or attendee profiles for <span className="font-extrabold text-zinc-800 dark:text-zinc-200">"{commandPaletteQuery}"</span>.
                      </p>
                    </div>
                    <span className="text-[9.5px] font-mono text-zinc-400 block max-w-sm mx-auto leading-relaxed">
                      💡 Try searching by region (e.g. USA, Canada, California, NY, Maharashtra) or roles (e.g. Developer, Independent).
                    </span>
                  </div>
                )}

              </div>

              {/* Console visual utility help bar */}
              <div className="flex items-center justify-between px-5 py-3 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-850/80 text-[10px] text-zinc-450 dark:text-zinc-550 scroll-none shrink-0" id="palette-footer-guideline">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="px-1.5 py-0.5 bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 rounded font-bold shadow-xs">Esc</span>
                  to close
                </span>
                <span className="font-bold flex items-center gap-1">
                  🌐 Deeply indexed regional country & state databases configured
                </span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
