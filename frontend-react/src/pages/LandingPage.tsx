import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const features = [
  { icon: <EventIcon sx={{ fontSize: 32, color: '#818cf8' }} />, title: 'Campus Event Hub', desc: 'Discover seminars, club activities, and workshops all in one place.' },
  { icon: <PeopleIcon sx={{ fontSize: 32, color: '#38bdf8' }} />, title: 'Smart Registration', desc: 'Secure your spot with one click and get instant QR code tickets.' },
  { icon: <SchoolIcon sx={{ fontSize: 32, color: '#34d399' }} />, title: 'Admin & Organizer Controls', desc: 'Streamlined approval workflows for official university organizations.' },
  { icon: <VerifiedIcon sx={{ fontSize: 32, color: '#f472b6' }} />, title: 'Verified Attendance', desc: 'Digital check-ins and participation history tracking for students.' },
];

const LandingPage: React.FC = () => {
  return (
    <div className="animate-fade-up">
      {/* Notice Banner */}
      <div className="glass-panel text-center py-3 text-sm text-blue-200">
        <NotificationsActiveIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
        <strong>Campus Notice:</strong> Fall Semester club rush week registration is now open!
      </div>

      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient" style={{ lineHeight: '1.2' }}>
          University Event<br/>Management System
        </h1>
        <p className="text-lg md:text-xl text-muted mb-10 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          The official platform for campus life. Discover events, manage student organizations, and streamline university workflows.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <RouterLink to="/events" style={{
            background: 'var(--primary-color)',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '1.1rem',
            boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Browse Events
          </RouterLink>
          <RouterLink to="/register" style={{
            background: 'transparent',
            border: '2px solid var(--border-glass)',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '50px',
            fontWeight: 600,
            fontSize: '1.1rem',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            Student Portal Login
          </RouterLink>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p style={{ color: 'var(--text-muted)' }}>A comprehensive platform designed specifically for university workflows.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', display: 'inline-block', padding: '12px', borderRadius: '12px', marginBottom: '1.5rem' }}>
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-panel py-8 text-center" style={{ marginTop: '4rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          © 2026 University Event Management System. Powered by Spring Boot & React.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
