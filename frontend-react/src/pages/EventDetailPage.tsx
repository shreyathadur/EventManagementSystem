import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box, Chip, Button, Alert, Divider, Grid } from '@mui/material';
import { eventService, Event } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { useAuth } from '../context/AuthContext';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [registering, setRegistering] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (id) loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const data = await eventService.getEventById(id!);
      setEvent(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    if (!id) return;
    setRegistering(true);
    setMessage(null);
    try {
      await registrationService.registerForEvent(id);
      setMessage({ type: 'success', text: 'Successfully registered for event!' });
      loadEvent();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed' });
    } finally {
      setRegistering(false);
    }
  };

  if (!event) return <Container sx={{ py: 8, textAlign: 'center' }}><Typography>Loading...</Typography></Container>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{
          height: 200, background: `linear-gradient(135deg, hsl(${(event.title.charCodeAt(0) * 37) % 360}, 65%, 55%), hsl(${(event.title.charCodeAt(1) * 53) % 360}, 65%, 45%))`,
          display: 'flex', alignItems: 'flex-end', p: 3,
        }}>
          <Box>
            <Chip label={event.category} sx={{ bgcolor: 'rgba(255,255,255,0.9)', mb: 1 }} />
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>{event.title}</Typography>
          </Box>
        </Box>

        <Box sx={{ p: 4 }}>
          {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Date</Typography>
                  <Typography variant="body2" fontWeight={600}>{event.date}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Time</Typography>
                  <Typography variant="body2" fontWeight={600}>{event.time}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Venue</Typography>
                  <Typography variant="body2" fontWeight={600}>{event.venue}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Capacity</Typography>
                  <Typography variant="body2" fontWeight={600}>{event.currentAttendees}/{event.maxAttendees}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>About this event</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
            {event.description}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <PersonIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              Organized by <strong>{event.organizerName}</strong>
            </Typography>
          </Box>

          {isAuthenticated && (event.status === 'APPROVED' || event.status === 'ACTIVE') && (
            <Button variant="contained" size="large" fullWidth onClick={handleRegister} disabled={registering}
              sx={{ py: 1.5, fontSize: '1.1rem' }}>
              {registering ? 'Registering...' : (event.maxAttendees && event.currentAttendees >= event.maxAttendees) ? 'Join Waitlist' : 'Register Now'}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default EventDetailPage;
