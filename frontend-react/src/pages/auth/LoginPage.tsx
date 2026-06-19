import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" textAlign="center" gutterBottom>Welcome Back</Typography>
        <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to your account
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" type="email" margin="normal" required
            value={email} onChange={e => setEmail(e.target.value)} />
          <TextField fullWidth label="Password" type="password" margin="normal" required
            value={password} onChange={e => setPassword(e.target.value)} />
          <Button fullWidth variant="contained" type="submit" size="large" sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Box>
        <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
          Don't have an account? <Link component={RouterLink} to="/register">Sign Up</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default LoginPage;
