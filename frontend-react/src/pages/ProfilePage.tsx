import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', department: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => { if (user?.id) fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    try {
      const [profileRes, badgesRes] = await Promise.all([
        api.get(`/profile/${user!.id}`).catch(() => ({ data: {} })),
        api.get(`/profile/badges/${user!.id}`).catch(() => ({ data: [] })),
      ]);
      setProfile(profileRes.data);
      setBadges(Array.isArray(badgesRes.data) ? badgesRes.data : []);
      setForm({
        bio: profileRes.data?.bio || '',
        department: profileRes.data?.department || '',
        phone: profileRes.data?.phone || '',
      });
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/profile', form);
      setEditing(false);
      fetchProfile();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const roleBadge: Record<string, { label: string; style: React.CSSProperties }> = {
    ROLE_ADMIN:     { label: '⚙️ Administrator',  style: { background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' } },
    ROLE_ORGANIZER: { label: '📋 Organizer',       style: { background: 'rgba(14,165,233,0.15)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.3)' } },
    ROLE_STUDENT:   { label: '🎓 Student',          style: { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' } },
  };

  const rb = roleBadge[user?.role || ''] || roleBadge.ROLE_STUDENT;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10, color: 'white', fontSize: 14,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div className="animate-fade-up max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gradient mb-10">My Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        {/* Sidebar */}
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          {/* Avatar */}
          <div className="mx-auto mb-5 flex items-center justify-center rounded-3xl text-5xl font-black"
            style={{ width: 96, height: 96, background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'white' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>

          <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={rb.style}>{rb.label}</span>

          {/* Profile Details */}
          <div className="mt-8 space-y-4 text-left">
            {[
              { icon: <EmailIcon sx={{ fontSize: 16 }} />, label: 'Email', value: user?.email },
              { icon: <BusinessIcon sx={{ fontSize: 16 }} />, label: 'Organization', value: user?.organizationName || profile?.organizationName || '—' },
              { icon: <BadgeIcon sx={{ fontSize: 16 }} />, label: 'Department', value: profile?.department || user?.department || '—' },
              { icon: <PersonIcon sx={{ fontSize: 16 }} />, label: 'Phone', value: profile?.phone || '—' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ color: '#818cf8', marginTop: 2 }}>{item.icon}</div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                  <p className="font-medium text-sm mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="mt-6 w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            style={{ background: 'rgba(79,70,229,0.15)', color: '#818cf8', border: '1px solid rgba(79,70,229,0.3)' }}
          >
            <EditIcon sx={{ fontSize: 16 }} /> {editing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { icon: <EventNoteIcon sx={{ fontSize: 32, color: '#818cf8' }} />, label: 'Events Attended', value: profile?.totalEventsAttended || 0 },
              { icon: <EmojiEventsIcon sx={{ fontSize: 32, color: '#34d399' }} />, label: 'Events Organized', value: profile?.totalEventsOrganized || 0 },
              { icon: <EmojiEventsIcon sx={{ fontSize: 32, color: '#fbbf24' }} />, label: 'Badges Earned', value: badges.length },
            ].map((s, i) => (
              <div key={i} className="glass-card text-center" style={{ padding: '1.5rem' }}>
                {s.icon}
                <h3 className="text-3xl font-black mt-2 mb-1">{s.value}</h3>
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Edit Form */}
          {editing && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 className="text-xl font-bold mb-6 border-b pb-4" style={{ borderColor: 'var(--border-glass)' }}>Edit Profile</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Department</label>
                  <input style={inputStyle} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Your department" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Phone Number</label>
                  <input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Bio</label>
                  <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 self-start px-6 py-3 rounded-xl font-semibold text-white transition-all"
                  style={{ background: 'var(--primary-color)', boxShadow: '0 4px 14px 0 rgba(79,70,229,0.39)', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
                >
                  <SaveIcon sx={{ fontSize: 18 }} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Bio Display */}
          {!editing && profile?.bio && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 className="text-xl font-bold mb-4">About Me</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{profile.bio}</p>
            </div>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 className="text-xl font-bold mb-4">🏆 Badges Earned</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {badges.map((badge, i) => (
                  <span key={i} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'rgba(79,70,229,0.15)', color: '#818cf8', border: '1px solid rgba(79,70,229,0.3)' }}>
                    🏅 {badge}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
