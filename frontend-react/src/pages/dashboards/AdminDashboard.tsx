import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Box, Divider } from '@mui/material';
import { statsService } from '../../services/otherServices';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PlaceIcon from '@mui/icons-material/Place';

const COLORS = ['#1a56db', '#7c3aed', '#059669', '#d97706', '#dc2626', '#6b7280'];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({});

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try { setStats(await statsService.getDashboard()); }
    catch (err) { console.error(err); }
  };

  const categoryData = stats.categoryBreakdown
    ? Object.entries(stats.categoryBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const metrics = [
    { label: 'Total Events', value: stats.totalEvents || 0, icon: <EventIcon />, gradient: 'linear-gradient(135deg, #1a56db, #3b82f6)' },
    { label: 'Active Events', value: stats.activeEvents || 0, icon: <EventIcon />, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
    { label: 'Pending Approval', value: stats.pendingEvents || 0, icon: <PendingActionsIcon />, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
    { label: 'Total Users', value: stats.totalUsers || 0, icon: <PeopleIcon />, gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
    { label: 'Registrations', value: stats.totalRegistrations || 0, icon: <PeopleIcon />, gradient: 'linear-gradient(135deg, #dc2626, #f87171)' },
    { label: 'Venues', value: stats.totalVenues || 0, icon: <PlaceIcon />, gradient: 'linear-gradient(135deg, #0891b2, #22d3ee)' },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>System overview and analytics</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((m, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
            <Card sx={{ background: m.gradient, color: 'white', height: '100%' }}>
              <CardContent>
                <Box sx={{ opacity: 0.8, mb: 1 }}>{m.icon}</Box>
                <Typography variant="h3" fontWeight={700}>{m.value}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>{m.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Events by Category</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1a56db" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Category Distribution</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
