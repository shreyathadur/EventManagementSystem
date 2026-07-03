import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { registrationService } from '../../services/registrationService';
import EventIcon from '@mui/icons-material/Event';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { Link } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);

  useEffect(() => { loadRegistrations(); }, []);

  const loadRegistrations = async () => {
    try {
      const data = await registrationService.getUserRegistrations();
      setRegistrations(data);
    } catch (err) { console.error(err); }
  };

  const handleCancel = async (eventId: string) => {
    try {
      await registrationService.cancelRegistration(eventId);
      loadRegistrations();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="animate-fade-up max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}</h1>
        <p className="text-muted">Student Portal Dashboard</p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(79, 70, 229, 0.05))' }}>
          <EventIcon sx={{ fontSize: 40, color: '#818cf8', mb: 2 }} />
          <h2 className="text-3xl font-bold mb-1">{registrations.length}</h2>
          <p className="text-muted">Registered Events</p>
        </div>
        
        <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))' }}>
          <ConfirmationNumberIcon sx={{ fontSize: 40, color: '#34d399', mb: 2 }} />
          <h2 className="text-3xl font-bold mb-1">{registrations.filter(r => r.status === 'CONFIRMED').length}</h2>
          <p className="text-muted">Confirmed Tickets</p>
        </div>

        <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))' }}>
          <EventIcon sx={{ fontSize: 40, color: '#fbbf24', mb: 2 }} />
          <h2 className="text-3xl font-bold mb-1">{registrations.filter(r => r.status === 'WAITLISTED').length}</h2>
          <p className="text-muted">Waitlisted</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Registrations List */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 className="text-xl font-bold mb-6 border-b pb-4" style={{ borderColor: 'var(--border-glass)' }}>
            My Upcoming Registrations
          </h3>
          
          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted mb-4">You haven't registered for any events yet.</p>
              <Link to="/events" className="text-blue-400 hover:text-blue-300 font-semibold underline">Browse Events</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map(r => (
                <div key={r.id} className="flex justify-between items-center p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}>
                  <div>
                    <h4 className="font-semibold text-lg">{r.eventTitle}</h4>
                    <p className="text-sm text-muted mt-1">Registered on {new Date(r.registeredAt).toLocaleDateString()}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${r.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {r.status}
                      </span>
                      {r.status === 'CONFIRMED' && (
                        <span className="flex items-center text-xs text-blue-400 cursor-pointer hover:text-blue-300">
                          <QrCodeIcon sx={{ fontSize: 14, mr: 0.5 }} /> View Ticket QR
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCancel(r.eventId)}
                    className="px-4 py-2 text-sm font-semibold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    Cancel RSVP
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
