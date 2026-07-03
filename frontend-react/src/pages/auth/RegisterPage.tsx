import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BusinessIcon from '@mui/icons-material/Business';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const roles = [
  { value: 'ROLE_STUDENT', label: '🎓 Student' },
  { value: 'ROLE_ORGANIZER', label: '📋 Organizer / Faculty' },
];

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ROLE_STUDENT', organizationName: '', department: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full py-3 rounded-xl text-white text-sm focus:outline-none transition-colors";
  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 animate-fade-up">
      <div className="glass-card w-full max-w-md p-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' }}>
            <SchoolIcon sx={{ fontSize: 32, color: 'white' }} />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Create Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join the university event community</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg text-sm font-medium" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Full Name</label>
            <div className="relative">
              <PersonIcon className="absolute left-4 top-3.5" sx={{ fontSize: 18, color: '#475569' }} />
              <input type="text" name="name" required placeholder="Your full name"
                className={`${inputClass} pl-11 pr-4`} style={inputStyle}
                value={form.name} onChange={handleChange} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>University Email</label>
            <div className="relative">
              <EmailIcon className="absolute left-4 top-3.5" sx={{ fontSize: 18, color: '#475569' }} />
              <input type="email" name="email" required placeholder="you@university.edu"
                className={`${inputClass} pl-11 pr-4`} style={inputStyle}
                value={form.email} onChange={handleChange} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Password</label>
            <div className="relative">
              <LockIcon className="absolute left-4 top-3.5" sx={{ fontSize: 18, color: '#475569' }} />
              <input type={showPassword ? 'text' : 'password'} name="password" required placeholder="Create a password"
                className={`${inputClass} pl-11 pr-11`} style={inputStyle}
                value={form.password} onChange={handleChange} />
              <button type="button" className="absolute right-4 top-3.5 text-slate-400 hover:text-white transition-colors" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>I am a...</label>
            <select name="role" value={form.role} onChange={handleChange}
              className="w-full py-3 px-4 rounded-xl text-white text-sm focus:outline-none cursor-pointer"
              style={{ ...inputStyle, appearance: 'none' }}>
              {roles.map(r => <option key={r.value} value={r.value} style={{ background: '#1e293b' }}>{r.label}</option>)}
            </select>
          </div>

          {/* Organizer fields */}
          {form.role === 'ROLE_ORGANIZER' && (
            <div className="space-y-4 p-4 rounded-xl" style={{ background: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Organization Details</p>
              <div className="relative">
                <BusinessIcon className="absolute left-4 top-3.5" sx={{ fontSize: 18, color: '#475569' }} />
                <input type="text" name="organizationName" placeholder="Organization / Faculty Name"
                  className={`${inputClass} pl-11 pr-4`} style={inputStyle}
                  value={form.organizationName} onChange={handleChange} />
              </div>
              <input type="text" name="department" placeholder="Department (e.g. Computer Science)"
                className={`${inputClass} px-4`} style={inputStyle}
                value={form.department} onChange={handleChange} />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 mt-2"
            style={{
              background: loading ? 'rgba(79, 70, 229, 0.5)' : 'var(--primary-color)',
              boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <RouterLink to="/login" className="font-semibold" style={{ color: '#818cf8' }}>
            Sign in
          </RouterLink>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
