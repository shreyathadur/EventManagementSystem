import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton, 
  Alert, 
  Container 
} from '@mui/material';
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
      if (err.message === 'Network Error' || !err.response) {
        setError('Unable to connect to the server. Please ensure the backend database is running.');
      } else {
        setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 4, md: 6 }, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            p: 2, 
            borderRadius: 2, 
            mb: 3 
          }}
        >
          <SchoolIcon fontSize="large" />
        </Box>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Sign in to your university portal
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="University Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 4 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, fontSize: '1.1rem' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" mt={4}>
          Don't have an account?{' '}
          <RouterLink to="/register" style={{ color: 'inherit', fontWeight: 'bold' }}>
            Register here
          </RouterLink>
        </Typography>
      </Paper>
    </Container>
  );
};

export default LoginPage;
