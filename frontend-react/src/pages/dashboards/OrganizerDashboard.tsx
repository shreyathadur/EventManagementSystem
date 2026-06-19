import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Box, List, ListItem, ListItemText, Chip, Button, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { eventService, Event } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';

const statusColors: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
  APPROVED: 'success', ACTIVE: 'info', PENDING: 'warning', REJECTED: 'error', COMPLETED: 'default',
};

const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try { setEvents(await eventService.getMyEvents()); }
    catch (err) { console.error(err); }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>Organizer Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.organizationName || user?.name} — Manage your events
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/create-event">
          Create Event
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a56db, #3b82f6)', color: 'white' }}>
            <CardContent>
              <EventIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight={700}>{events.length}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Events</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white' }}>
            <CardContent>
              <EventIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight={700}>{events.filter(e => e.status === 'APPROVED' || e.status === 'ACTIVE').length}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Active Events</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: 'white' }}>
            <CardContent>
              <EventIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight={700}>{events.filter(e => e.status === 'PENDING').length}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Pending Approval</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>My Events</Typography>
          <Divider sx={{ mb: 2 }} />
          {events.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No events created yet.</Typography>
          ) : (
            <List>
              {events.map(e => (
                <ListItem key={e.id} component={RouterLink} to={`/events/${e.id}`}
                  sx={{ textDecoration: 'none', color: 'inherit', borderBottom: '1px solid #f1f5f9' }}>
                  <ListItemText
                    primary={e.title}
                    secondary={`${e.date} • ${e.venue} • ${e.currentAttendees}/${e.maxAttendees} attendees`}
                  />
                  <Chip label={e.status} size="small" color={statusColors[e.status] || 'default'} />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrganizerDashboard;
