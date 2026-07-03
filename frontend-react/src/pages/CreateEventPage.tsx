import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import TitleIcon from '@mui/icons-material/Title';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';

const categories = ['TECH', 'MUSIC', 'SPORTS', 'ACADEMIC', 'CULTURAL', 'OTHER'];

const CreateEventPage: React.FC = () => {
  const [form, setForm] = useState({
    title: '', description: '', category: 'TECH', date: '', time: '', venue: '',
    maxAttendees: 100, registrationDeadline: '', imageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'maxAttendees' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await eventService.createEvent(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full py-3 px-4 rounded-xl text-white text-sm focus:outline-none transition-colors";
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
  const labelClass = "block text-sm font-medium mb-2";

  return (
    <div className="animate-fade-up max-w-3xl mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gradient mb-2">Create New Event</h1>
        <p style={{ color: 'var(--text-muted)' }}>Submit your event for admin approval before it goes live.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-xl text-sm font-medium" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="glass-card p-8 space-y-6">
          {/* Title */}
          <div>
            <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Event Title *</label>
            <input type="text" name="title" required placeholder="e.g. Annual Tech Symposium 2026"
              className={inputClass} style={inputStyle}
              value={form.title} onChange={handleChange} />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Description *</label>
            <textarea name="description" required rows={5} placeholder="Describe your event in detail..."
              className={`${inputClass} resize-none`} style={inputStyle}
              value={form.description} onChange={handleChange} />
          </div>

          {/* Category */}
          <div>
            <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange}
              className={inputClass} style={{ ...inputStyle, appearance: 'none' }}>
              {categories.map(c => <option key={c} value={c} style={{ background: '#1e293b' }}>{c}</option>)}
            </select>
          </div>

          {/* Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Event Date *</label>
              <input type="date" name="date" required
                className={inputClass} style={inputStyle}
                value={form.date} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Start Time *</label>
              <input type="time" name="time" required
                className={inputClass} style={inputStyle}
                value={form.time} onChange={handleChange} />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Venue / Location *</label>
            <input type="text" name="venue" required placeholder="e.g. Main Auditorium, Block A"
              className={inputClass} style={inputStyle}
              value={form.venue} onChange={handleChange} />
          </div>

          {/* Attendees & Deadline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Max Attendees</label>
              <input type="number" name="maxAttendees" min={1}
                className={inputClass} style={inputStyle}
                value={form.maxAttendees} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Registration Deadline</label>
              <input type="date" name="registrationDeadline"
                className={inputClass} style={inputStyle}
                value={form.registrationDeadline} onChange={handleChange} />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className={labelClass} style={{ color: 'var(--text-muted)' }}>Event Banner URL (optional)</label>
            <input type="url" name="imageUrl" placeholder="https://..."
              className={inputClass} style={inputStyle}
              value={form.imageUrl} onChange={handleChange} />
          </div>

          {/* Notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <span className="text-yellow-400 text-lg">⏳</span>
            <p className="text-sm" style={{ color: '#fbbf24' }}>
              Your event will be submitted for <strong>Admin review</strong>. You'll see it as <em>PENDING</em> in your dashboard until approved.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white text-base transition-all duration-200"
            style={{
              background: loading ? 'rgba(79, 70, 229, 0.5)' : 'var(--primary-color)',
              boxShadow: '0 4px 20px 0 rgba(79, 70, 229, 0.4)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Submitting event...' : '🚀 Submit Event for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;
