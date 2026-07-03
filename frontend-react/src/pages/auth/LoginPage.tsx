import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 animate-fade-up">
      <div className="glass-card w-full max-w-md p-10">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' }}>
            <SchoolIcon sx={{ fontSize: 32, color: 'white' }} />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to your university portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg text-sm font-medium" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>University Email</label>
            <div className="relative">
              <EmailIcon className="absolute left-4 top-3.5" sx={{ fontSize: 18, color: '#475569' }} />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                className="w-full pl-11 pr-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Password</label>
            <div className="relative">
              <LockIcon className="absolute left-4 top-3.5" sx={{ fontSize: 18, color: '#475569' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                className="w-full pl-11 pr-11 py-3 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" className="absolute right-4 top-3.5 text-slate-400 hover:text-white transition-colors" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
              </button>
            </div>
          </div>

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
            {loading ? 'Signing in...' : 'Sign In to Portal'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm" style={{ color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <RouterLink to="/register" className="font-semibold" style={{ color: '#818cf8' }}>
            Register here
          </RouterLink>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
