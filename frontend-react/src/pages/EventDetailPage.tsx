import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService, Event } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { useAuth } from '../context/AuthContext';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const statusColors: Record<string, string> = {
  APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  ACTIVE:   'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PENDING:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
  COMPLETED:'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [registering, setRegistering] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (id) loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const data = await eventService.getEventById(id!);
      setEvent(data);
    } catch (err) { console.error(err); }
  };

  const handleRegister = async () => {
    if (!id) return;
    setRegistering(true);
    setMessage(null);
    try {
      await registrationService.registerForEvent(id);
      setMessage({ type: 'success', text: '🎉 Successfully registered! Check your dashboard for your ticket.' });
      loadEvent();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed' });
    } finally { setRegistering(false); }
  };

  if (!event) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="glass-card p-8 text-center">
        <div className="animate-pulse text-muted">Loading event details...</div>
      </div>
    </div>
  );

  const isFull = event.maxAttendees && event.currentAttendees >= event.maxAttendees;
  const canRegister = isAuthenticated && user?.role === 'ROLE_STUDENT' && (event.status === 'APPROVED' || event.status === 'ACTIVE');

  return (
    <div className="animate-fade-up max-w-4xl mx-auto px-6 py-12">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-8 text-sm font-medium hover:text-white transition-colors" style={{ color: 'var(--text-muted)' }}>
        <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to events
      </button>

      {/* Banner */}
      <div className="glass-card overflow-hidden mb-8">
        <div style={{
          height: 240,
          background: `linear-gradient(135deg, hsl(${(event.title.charCodeAt(0) * 37) % 360}, 70%, 25%), hsl(${(event.title.charCodeAt(event.title.length - 1) * 23) % 360}, 60%, 15%))`,
          display: 'flex', alignItems: 'flex-end', padding: '2rem'
        }}>
          <div>
            <div className="flex gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white">
                {event.category}
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${statusColors[event.status] || statusColors.COMPLETED}`}>
                {event.status}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{event.title}</h1>
          </div>
        </div>

        <div className="p-8">
          {/* Alert messages */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
              {message.text}
            </div>
          )}

          {/* Quick Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {[
              { icon: <CalendarTodayIcon sx={{ fontSize: 20, color: '#818cf8' }} />, label: 'Date', value: event.date },
              { icon: <AccessTimeIcon sx={{ fontSize: 20, color: '#38bdf8' }} />, label: 'Time', value: event.time },
              { icon: <LocationOnIcon sx={{ fontSize: 20, color: '#34d399' }} />, label: 'Venue', value: event.venue },
              { icon: <PeopleIcon sx={{ fontSize: 20, color: '#f472b6' }} />, label: 'Capacity', value: `${event.currentAttendees} / ${event.maxAttendees}` },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                  <p className="font-semibold text-sm mt-1">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">About This Event</h2>
            <div className="leading-relaxed" style={{ color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
              {event.description}
            </div>
          </div>

          {/* Organizer */}
          <div className="flex items-center gap-3 p-4 rounded-xl mb-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ background: 'var(--primary-light)' }}>
              <PersonIcon sx={{ fontSize: 20, color: '#818cf8' }} />
            </div>
            <div>
              <p className="text-xs text-muted">Organized by</p>
              <p className="font-semibold">{event.organizerName}</p>
            </div>
          </div>

          {/* Registration CTA */}
          {canRegister && (
            <button
              onClick={handleRegister}
              disabled={registering}
              className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-200"
              style={{
                background: registering ? 'rgba(79,70,229,0.5)' : isFull ? 'rgba(245,158,11,0.8)' : 'var(--primary-color)',
                boxShadow: '0 4px 20px 0 rgba(79, 70, 229, 0.4)',
                cursor: registering ? 'not-allowed' : 'pointer',
              }}
            >
              {registering ? 'Processing...' : isFull ? '📋 Join Waitlist' : '🎫 Register Now — It\'s Free'}
            </button>
          )}
          {!isAuthenticated && (event.status === 'APPROVED' || event.status === 'ACTIVE') && (
            <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
              <p className="text-sm text-muted mb-2">You need to be logged in to register</p>
              <a href="/login" className="font-semibold" style={{ color: '#818cf8' }}>Sign in to register →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
