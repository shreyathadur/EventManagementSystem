import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';

const features = [
  { icon: <EventIcon sx={{ fontSize: 40, color: '#1a56db' }} />, title: 'Event Management', desc: 'Create, manage, and track campus events with a powerful workflow engine.' },
  { icon: <PeopleIcon sx={{ fontSize: 40, color: '#7c3aed' }} />, title: 'Smart Registration', desc: 'Auto seat allocation, waitlisting, and QR code check-in for attendees.' },
  { icon: <SchoolIcon sx={{ fontSize: 40, color: '#059669' }} />, title: 'Faculty Approvals', desc: 'Streamlined approval workflow for student organization events.' },
  { icon: <VerifiedIcon sx={{ fontSize: 40, color: '#dc2626' }} />, title: 'Role-Based Access', desc: 'Separate dashboards for Students, Organizations, Faculty, and Admins.' },
];

const LandingPage: React.FC = () => {
  return (
    <Box>
      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1a56db 50%, #7c3aed 100%)',
        color: 'white', py: 12, textAlign: 'center',
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" fontWeight={800} gutterBottom>
            University Event Management
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9, mb: 4, fontWeight: 400 }}>
            Discover, create, and manage campus events. Connect with your university community.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" size="large" component={RouterLink} to="/events"
              sx={{ bgcolor: 'white', color: '#1a56db', fontSize: '1.1rem', px: 4, py: 1.5,
                '&:hover': { bgcolor: '#f0f4ff' } }}>
              Browse Events
            </Button>
            <Button variant="outlined" size="large" component={RouterLink} to="/register"
              sx={{ borderColor: 'white', color: 'white', fontSize: '1.1rem', px: 4, py: 1.5,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h4" textAlign="center" gutterBottom>
          Everything You Need
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
          A comprehensive platform for managing every aspect of university events.
        </Typography>
        <Grid container spacing={4}>
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2, transition: '0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } }}>
                <CardContent>
                  {f.icon}
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1e293b', color: 'white', py: 4, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          © 2026 University Event Management System. Built with Spring Boot & React.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
