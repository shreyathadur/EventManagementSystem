import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { registrationService } from '../../services/registrationService';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SearchOffIcon from '@mui/icons-material/SearchOff';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);

  useEffect(() => { loadRegistrations(); }, []);

  const loadRegistrations = async () => {
    try {
      const data = await registrationService.getUserRegistrations();
      setRegistrations(data);
    } catch (err) { console.error(err); }
  };

  const handleCancel = async (eventId: string) => {
    try {
      await registrationService.cancelRegistration(eventId);
      loadRegistrations();
    } catch (err) { console.error(err); }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box mb={6}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Welcome back, {user?.name}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Student Portal Dashboard
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={4} mb={6}>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <EventIcon sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight="bold">{registrations.length}</Typography>
              <Typography variant="h6">Registered Events</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
            <CardContent>
              <ConfirmationNumberIcon sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight="bold">
                {registrations.filter(r => r.status === 'CONFIRMED').length}
              </Typography>
              <Typography variant="h6">Confirmed Tickets</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
            <CardContent>
              <EventIcon sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight="bold">
                {registrations.filter(r => r.status === 'WAITLISTED').length}
              </Typography>
              <Typography variant="h6">Waitlisted</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Registrations List */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
          My Upcoming Registrations
        </Typography>
        
        {registrations.length === 0 ? (
          <Box textAlign="center" py={8}>
            <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You haven't registered for any events yet.
            </Typography>
            <Button component={Link} to="/events" variant="contained" color="primary" sx={{ mt: 2 }}>
              Browse Events
            </Button>
          </Box>
        ) : (
          <List>
            {registrations.map((r, index) => (
              <React.Fragment key={r.id}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ 
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    py: 3
                  }}
                  secondaryAction={
                    <Button 
                      variant="outlined" 
                      color="error" 
                      onClick={() => handleCancel(r.eventId)}
                      sx={{ mt: { xs: 2, md: 0 } }}
                    >
                      Cancel RSVP
                    </Button>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" fontWeight="bold">
                        {r.eventTitle}
                      </Typography>
                    }
                    secondary={
                      <Box mt={1}>
                        <Typography component="span" variant="body2" color="text.primary" display="block">
                          Registered on {new Date(r.registeredAt).toLocaleDateString()}
                        </Typography>
                        <Box mt={2} display="flex" alignItems="center" gap={2}>
                          <Chip 
                            label={r.status} 
                            color={r.status === 'CONFIRMED' ? 'success' : 'warning'} 
                            size="small" 
                            sx={{ fontWeight: 'bold' }}
                          />
                          {r.status === 'CONFIRMED' && (
                            <Typography variant="body2" color="primary" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                              <QrCodeIcon sx={{ fontSize: 16, mr: 0.5 }} /> View Ticket QR
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < registrations.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default StudentDashboard;
