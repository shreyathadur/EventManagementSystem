import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { eventService, Event } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';

const statusColors: Record<string, string> = {
  APPROVED: 'bg-green-500/20 text-green-400', 
  ACTIVE: 'bg-blue-500/20 text-blue-400', 
  PENDING: 'bg-yellow-500/20 text-yellow-400', 
  REJECTED: 'bg-red-500/20 text-red-400', 
  COMPLETED: 'bg-slate-500/20 text-slate-400',
};

const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try { setEvents(await eventService.getMyEvents()); }
    catch (err) { console.error(err); }
  };

  return (
    <div className="animate-fade-up max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">Organizer Dashboard</h1>
          <p className="text-muted">
            {user?.organizationName || user?.department || user?.name} — Manage your events and attendees
          </p>
        </div>
        <RouterLink to="/create-event" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-indigo-500/30">
          <AddIcon /> Create Event
        </RouterLink>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(79, 70, 229, 0.05))' }}>
          <EventIcon sx={{ fontSize: 40, color: '#818cf8', mb: 2 }} />
          <h2 className="text-3xl font-bold mb-1">{events.length}</h2>
          <p className="text-muted">Total Events</p>
        </div>
        
        <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))' }}>
          <EventIcon sx={{ fontSize: 40, color: '#34d399', mb: 2 }} />
          <h2 className="text-3xl font-bold mb-1">{events.filter(e => e.status === 'APPROVED' || e.status === 'ACTIVE').length}</h2>
          <p className="text-muted">Active Events</p>
        </div>

        <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))' }}>
          <EventIcon sx={{ fontSize: 40, color: '#fbbf24', mb: 2 }} />
          <h2 className="text-3xl font-bold mb-1">{events.filter(e => e.status === 'PENDING').length}</h2>
          <p className="text-muted">Pending Approval</p>
        </div>
      </div>

      {/* Events List */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 className="text-xl font-bold mb-6 border-b pb-4" style={{ borderColor: 'var(--border-glass)' }}>
          My Events
        </h3>
        
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted mb-4">You haven't created any events yet.</p>
            <RouterLink to="/create-event" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">Create your first event</RouterLink>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(e => (
              <div key={e.id} className="block">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg hover:bg-white/5 transition-colors" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                  <div>
                    <h4 className="font-semibold text-lg"><RouterLink to={`/events/${e.id}`} className="hover:underline">{e.title}</RouterLink></h4>
                    <p className="text-sm text-muted mt-1">{e.date} • {e.venue} • {e.currentAttendees}/{e.maxAttendees} attendees</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center gap-4">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusColors[e.status] || statusColors.COMPLETED}`}>
                      {e.status}
                    </span>
                    <RouterLink to={`/events/${e.id}`}>
                      <SettingsIcon sx={{ color: '#94a3b8', fontSize: 20 }} className="hover:text-white transition-colors" />
                    </RouterLink>
                    <button 
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this event?')) {
                          try {
                            await eventService.deleteEvent(e.id);
                            loadEvents();
                          } catch (err) { console.error(err); }
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
