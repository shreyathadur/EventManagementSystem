import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert, Link, MenuItem } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roles = [
  { value: 'ROLE_STUDENT', label: 'Student' },
  { value: 'ROLE_ORGANIZATION', label: 'Student Organization' },
  { value: 'ROLE_FACULTY', label: 'Faculty' },
];

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ROLE_STUDENT', organizationName: '', department: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" textAlign="center" gutterBottom>Create Account</Typography>
        <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
          Join the university event community
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="Full Name" name="name" margin="normal" required value={form.name} onChange={handleChange} />
          <TextField fullWidth label="Email" name="email" type="email" margin="normal" required value={form.email} onChange={handleChange} />
          <TextField fullWidth label="Password" name="password" type="password" margin="normal" required value={form.password} onChange={handleChange} />
          <TextField fullWidth select label="Role" name="role" margin="normal" value={form.role} onChange={handleChange}>
            {roles.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
          </TextField>
          {form.role === 'ROLE_ORGANIZATION' && (
            <TextField fullWidth label="Organization Name" name="organizationName" margin="normal" value={form.organizationName} onChange={handleChange} />
          )}
          {form.role === 'ROLE_FACULTY' && (
            <TextField fullWidth label="Department" name="department" margin="normal" value={form.department} onChange={handleChange} />
          )}
          <Button fullWidth variant="contained" type="submit" size="large" sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
        </Box>
        <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
          Already have an account? <Link component={RouterLink} to="/login">Sign In</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
