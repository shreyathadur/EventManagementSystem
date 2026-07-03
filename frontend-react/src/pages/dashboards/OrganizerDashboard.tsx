import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { eventService, Event } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
  List, ListItem, ListItemText, Divider, Paper, IconButton
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try { setEvents(await eventService.getMyEvents()); }
    catch (err) { console.error(err); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'ACTIVE': return 'info';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box mb={6} display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} gap={3}>
        <Box>
          <Typography variant="h3" fontWeight="bold" gutterBottom color="primary.main">
            Organizer Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {user?.organizationName || user?.department || user?.name} — Manage your events and attendees
          </Typography>
        </Box>
        <Button 
          component={RouterLink} 
          to="/create-event" 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          size="large"
          sx={{ fontWeight: 'bold' }}
        >
          Create Event
        </Button>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={4} mb={6}>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <EventIcon sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight="bold">{events.length}</Typography>
              <Typography variant="h6">Total Events</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
            <CardContent>
              <EventIcon sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight="bold">
                {events.filter(e => e.status === 'APPROVED' || e.status === 'ACTIVE').length}
              </Typography>
              <Typography variant="h6">Active Events</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
            <CardContent>
              <EventIcon sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight="bold">
                {events.filter(e => e.status === 'PENDING').length}
              </Typography>
              <Typography variant="h6">Pending Approval</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Events List */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
          My Events
        </Typography>
        
        {events.length === 0 ? (
          <Box textAlign="center" py={8}>
            <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You haven't created any events yet.
            </Typography>
            <Button component={RouterLink} to="/create-event" variant="outlined" color="primary" sx={{ mt: 2 }}>
              Create your first event
            </Button>
          </Box>
        ) : (
          <List>
            {events.map((e, index) => (
              <React.Fragment key={e.id}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ 
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    py: 3
                  }}
                  secondaryAction={
                    <Box display="flex" alignItems="center" gap={1} mt={{ xs: 2, md: 0 }}>
                      <Chip 
                        label={e.status} 
                        color={getStatusColor(e.status) as any} 
                        size="small" 
                        sx={{ fontWeight: 'bold', mr: 2 }}
                      />
                      <IconButton component={RouterLink} to={`/events/${e.id}`} color="primary">
                        <SettingsIcon />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this event?')) {
                            try {
                              await eventService.deleteEvent(e.id);
                              loadEvents();
                            } catch (err) { console.error(err); }
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" fontWeight="bold" component={RouterLink} to={`/events/${e.id}`} sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }}>
                        {e.title}
                      </Typography>
                    }
                    secondary={
                      <Typography component="span" variant="body2" color="text.secondary" display="block" mt={1}>
                        {e.date} • {e.venue} • {e.currentAttendees}/{e.maxAttendees} attendees
                      </Typography>
                    }
                  />
                </ListItem>
                {index < events.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default OrganizerDashboard;
