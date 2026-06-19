import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Box, List, ListItem, ListItemText, Chip, Button, Divider } from '@mui/material';
import { registrationService } from '../../services/registrationService';
import { useAuth } from '../../context/AuthContext';
import EventIcon from '@mui/icons-material/Event';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Welcome, {user?.name}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Student Dashboard</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a56db, #3b82f6)', color: 'white' }}>
            <CardContent>
              <EventIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight={700}>{registrations.length}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Registered Events</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white' }}>
            <CardContent>
              <ConfirmationNumberIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight={700}>
                {registrations.filter(r => r.status === 'CONFIRMED').length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Confirmed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: 'white' }}>
            <CardContent>
              <EventIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight={700}>
                {registrations.filter(r => r.status === 'WAITLISTED').length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Waitlisted</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>My Registrations</Typography>
          <Divider sx={{ mb: 2 }} />
          {registrations.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No registrations yet. Browse events to get started!</Typography>
          ) : (
            <List>
              {registrations.map(r => (
                <ListItem key={r.id} secondaryAction={
                  <Button size="small" color="error" variant="outlined" onClick={() => handleCancel(r.eventId)}>Cancel</Button>
                }>
                  <ListItemText
                    primary={r.eventTitle}
                    secondary={`Registered: ${new Date(r.registeredAt).toLocaleDateString()}`}
                  />
                  <Chip label={r.status} size="small" color={r.status === 'CONFIRMED' ? 'success' : 'warning'} sx={{ mr: 2 }} />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default StudentDashboard;
