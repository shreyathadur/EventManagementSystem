import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService, Event } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Container, Typography, Grid, Paper, Chip, Button, Alert,
  Divider, Stack, CircularProgress
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import LockIcon from '@mui/icons-material/Lock';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'success';
    case 'ACTIVE': return 'info';
    case 'PENDING': return 'warning';
    case 'REJECTED': return 'error';
    default: return 'default';
  }
};

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [registering, setRegistering] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (id) loadEvent();
  }, [id]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const data = await eventService.getEventById(id!);
      setEvent(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!id) return;
    setRegistering(true);
    setMessage(null);
    try {
      await registrationService.registerForEvent(id);
      setMessage({ type: 'success', text: '🎉 Successfully registered! Check your dashboard for your ticket.' });
      loadEvent();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed. Please try again.' });
    } finally { setRegistering(false); }
  };

  if (loading) return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
      <CircularProgress size={60} />
    </Box>
  );

  if (!event) return (
    <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
      <Typography variant="h5" color="text.secondary">Event not found.</Typography>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/events')} sx={{ mt: 3 }}>
        Back to events
      </Button>
    </Container>
  );

  const isFull = event.maxAttendees && event.currentAttendees >= event.maxAttendees;
  const canRegister = isAuthenticated && user?.role === 'ROLE_STUDENT' && (event.status === 'APPROVED' || event.status === 'ACTIVE');

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        color="inherit"
        sx={{ mb: 4, color: 'text.secondary' }}
      >
        Back to events
      </Button>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Banner */}
          <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 3, mb: 4 }}>
            <Box
              sx={{
                height: 240,
                background: `linear-gradient(135deg, hsl(${(event.title.charCodeAt(0) * 37) % 360}, 70%, 25%), hsl(${(event.title.charCodeAt(event.title.length - 1) * 23) % 360}, 60%, 15%))`,
                display: 'flex',
                alignItems: 'flex-end',
                p: 4
              }}
            >
              <Box>
                <Stack direction="row" spacing={1} mb={2}>
                  <Chip label={event.category} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }} />
                  <Chip label={event.status} color={getStatusColor(event.status) as any} sx={{ fontWeight: 'bold' }} />
                </Stack>
                <Typography variant="h4" fontWeight="bold" color="white">
                  {event.title}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 4 }}>
              {message && (
                <Alert severity={message.type} sx={{ mb: 4, borderRadius: 2 }}>
                  {message.text}
                </Alert>
              )}

              {/* Info Grid */}
              <Grid container spacing={2} mb={4}>
                {[
                  { icon: <CalendarTodayIcon color="primary" />, label: 'Date', value: event.date },
                  { icon: <AccessTimeIcon color="info" />, label: 'Time', value: event.time },
                  { icon: <LocationOnIcon color="success" />, label: 'Venue', value: event.venue },
                  { icon: <PeopleIcon color="error" />, label: 'Capacity', value: `${event.currentAttendees} / ${event.maxAttendees}` },
                ].map((item, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Box display="flex" alignItems="center" gap={2} p={2} bgcolor="background.default" borderRadius={2}>
                      {item.icon}
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">{item.value}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ mb: 4 }} />

              {/* Description */}
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                About This Event
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line', mb: 4 }}>
                {event.description}
              </Typography>

              {/* Organizer */}
              <Box display="flex" alignItems="center" gap={2} p={2} bgcolor="background.default" borderRadius={2}>
                <Box
                  sx={{
                    width: 44, height: 44, borderRadius: '50%',
                    bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <PersonIcon color="primary" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Organized by</Typography>
                  <Typography variant="body1" fontWeight="bold">{event.organizerName}</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar - Registration Panel */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Register for Event
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2} mb={4}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Status</Typography>
                <Chip label={event.status} color={getStatusColor(event.status) as any} size="small" />
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Spots Remaining</Typography>
                <Typography fontWeight="bold" color={isFull ? 'error.main' : 'success.main'}>
                  {isFull ? 'Full' : `${event.maxAttendees - event.currentAttendees} left`}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Total Capacity</Typography>
                <Typography fontWeight="bold">{event.maxAttendees}</Typography>
              </Box>
            </Stack>

            {canRegister && (
              <Button
                fullWidth
                variant="contained"
                size="large"
                color={isFull ? 'warning' : 'primary'}
                startIcon={registering ? <CircularProgress size={20} color="inherit" /> : isFull ? <PlaylistAddIcon /> : <ConfirmationNumberIcon />}
                onClick={handleRegister}
                disabled={registering}
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
              >
                {registering ? 'Processing...' : isFull ? 'Join Waitlist' : 'Register Now — Free'}
              </Button>
            )}

            {!isAuthenticated && (event.status === 'APPROVED' || event.status === 'ACTIVE') && (
              <Box textAlign="center" py={2}>
                <LockIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary" mb={2}>
                  You need to be logged in to register
                </Typography>
                <Button href="/login" variant="outlined" color="primary" fullWidth>
                  Sign in to register
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetailPage;
