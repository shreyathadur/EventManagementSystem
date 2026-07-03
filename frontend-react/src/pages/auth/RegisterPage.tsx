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
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ROLE_STUDENT',
    organizationName: '',
    department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message === 'Network Error' || !err.response) {
        setError('Unable to connect to the server. Please ensure the backend database is running.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            bgcolor: 'secondary.main', 
            color: 'secondary.contrastText',
            p: 2, 
            borderRadius: 2, 
            mb: 3 
          }}
        >
          <SchoolIcon fontSize="large" />
        </Box>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Create Account
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Join the university event portal
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
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="University Email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
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
            value={formData.password}
            onChange={handleChange}
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
            sx={{ mb: 3 }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="role-label">I am a...</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formData.role}
              label="I am a..."
              onChange={handleChange}
            >
              <MenuItem value="ROLE_STUDENT">Student</MenuItem>
              <MenuItem value="ROLE_ORGANIZER">Event Organizer / Faculty</MenuItem>
            </Select>
          </FormControl>

          {formData.role === 'ROLE_ORGANIZER' && (
            <Box sx={{ mb: 3 }}>
              <TextField
                margin="normal"
                required={formData.role === 'ROLE_ORGANIZER'}
                fullWidth
                id="organizationName"
                label="Organization / Club Name"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                fullWidth
                id="department"
                label="Department (Optional)"
                name="department"
                value={formData.department}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            size="large"
            disabled={loading}
            sx={{ py: 1.5, fontSize: '1.1rem', mt: 2 }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" mt={4}>
          Already have an account?{' '}
          <RouterLink to="/login" style={{ color: 'inherit', fontWeight: 'bold' }}>
            Sign in here
          </RouterLink>
        </Typography>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
