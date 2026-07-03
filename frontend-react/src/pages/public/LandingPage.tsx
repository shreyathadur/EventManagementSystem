import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Alert
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const features = [
  { icon: <EventIcon sx={{ fontSize: 40, color: 'primary.main' }} />, title: 'Campus Event Hub', desc: 'Discover seminars, club activities, and workshops all in one place.' },
  { icon: <PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />, title: 'Smart Registration', desc: 'Secure your spot with one click and get instant QR code tickets.' },
  { icon: <SchoolIcon sx={{ fontSize: 40, color: 'success.main' }} />, title: 'Admin & Organizer Controls', desc: 'Streamlined approval workflows for official university organizations.' },
  { icon: <VerifiedIcon sx={{ fontSize: 40, color: 'secondary.main' }} />, title: 'Verified Attendance', desc: 'Digital check-ins and participation history tracking for students.' },
];

const LandingPage: React.FC = () => {
  return (
    <Box>
      {/* Notice Banner */}
      <Alert 
        severity="info" 
        icon={<NotificationsActiveIcon />}
        sx={{ justifyContent: 'center', borderRadius: 0 }}
      >
        <strong>Campus Notice:</strong> Fall Semester club rush week registration is now open!
      </Alert>

      {/* Hero Section */}
      <Box 
        sx={{ 
          pt: { xs: 8, md: 16 }, 
          pb: { xs: 8, md: 12 },
          textAlign: 'center',
          background: 'linear-gradient(to bottom, rgba(37, 99, 235, 0.05), transparent)'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            component="h1" 
            fontWeight="900" 
            gutterBottom
            sx={{
              background: 'linear-gradient(45deg, #2563EB 30%, #10B981 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            University Event<br/>Management System
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 6, mt: 3 }}>
            The official platform for campus life. Discover events, manage student organizations, and streamline university workflows.
          </Typography>
          
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button 
              component={RouterLink} 
              to="/events" 
              variant="contained" 
              size="large"
              sx={{ px: 4, py: 1.5, borderRadius: 8, fontSize: '1.1rem' }}
            >
              Browse Events
            </Button>
            <Button 
              component={RouterLink} 
              to="/login" 
              variant="outlined" 
              size="large"
              sx={{ px: 4, py: 1.5, borderRadius: 8, fontSize: '1.1rem', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
            >
              Student Portal Login
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Grid */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box textAlign="center" mb={8}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Everything You Need
          </Typography>
          <Typography variant="h6" color="text.secondary">
            A comprehensive platform designed specifically for university workflows.
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card elevation={0} sx={{ height: '100%', bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box mb={2}>
                    {f.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {f.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ py: 4, textAlign: 'center', borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper', mt: 8 }}>
        <Typography variant="body2" color="text.secondary">
          © 2026 University Event Management System. Powered by Spring Boot & React.
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
