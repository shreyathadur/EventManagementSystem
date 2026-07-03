import React, { useState, useEffect } from 'react';
import { statsService, approvalService, adminService } from '../../services/otherServices';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
  Box, Container, Typography, Grid, Card, CardContent, Tabs, Tab, Paper, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, Alert
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PlaceIcon from '@mui/icons-material/Place';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DeleteIcon from '@mui/icons-material/Delete';

const COLORS = ['#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [actionFeedback, setActionFeedback] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [statsData, approvalsData] = await Promise.all([
        statsService.getDashboard(),
        approvalService.getPending().catch(() => []),
      ]);
      setStats(statsData);
      setPendingApprovals(Array.isArray(approvalsData) ? approvalsData : []);
    } catch (err) { console.error(err); }
  };

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data.content || []);
    } catch (err) { console.error(err); }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 2 && users.length === 0) loadUsers();
  };

  const handleApprove = async (id: string) => {
    try {
      await approvalService.approve(id, 'Approved by admin');
      setActionFeedback({ id, msg: 'Event successfully approved', type: 'success' });
      setPendingApprovals(prev => prev.filter(a => a.id !== id));
      setStats((prev: any) => ({ ...prev, pendingEvents: Math.max(0, (prev.pendingEvents || 1) - 1) }));
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id: string) => {
    try {
      await approvalService.reject(id, 'Rejected by admin');
      setActionFeedback({ id, msg: 'Event successfully rejected', type: 'error' });
      setPendingApprovals(prev => prev.filter(a => a.id !== id));
      setStats((prev: any) => ({ ...prev, pendingEvents: Math.max(0, (prev.pendingEvents || 1) - 1) }));
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err) { console.error(err); }
  };

  const categoryData = stats.categoryBreakdown
    ? Object.entries(stats.categoryBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const metrics = [
    { label: 'Total Events', value: stats.totalEvents || 0, icon: <EventIcon />, color: '#3b82f6' },
    { label: 'Active Events', value: stats.activeEvents || 0, icon: <EventIcon />, color: '#10b981' },
    { label: 'Pending Approval', value: stats.pendingEvents || pendingApprovals.length || 0, icon: <PendingActionsIcon />, color: '#f59e0b' },
    { label: 'Total Users', value: stats.totalUsers || 0, icon: <PeopleIcon />, color: '#8b5cf6' },
    { label: 'Registrations', value: stats.totalRegistrations || 0, icon: <VerifiedUserIcon />, color: '#ec4899' },
    { label: 'Venues', value: stats.totalVenues || 0, icon: <PlaceIcon />, color: '#0ea5e9' },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h3" fontWeight="bold" gutterBottom color="primary.main">
            Admin Control Panel
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage the entire platform from here.
          </Typography>
        </Box>
        <Chip 
          icon={<AssessmentIcon />} 
          label="Global Administrator" 
          color="warning" 
          variant="outlined" 
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={3} mb={6}>
        {metrics.map((m, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
            <Card elevation={2} sx={{ height: '100%', borderTop: `4px solid ${m.color}` }}>
              <CardContent>
                <Box sx={{ color: m.color, mb: 1 }}>{m.icon}</Box>
                <Typography variant="h4" fontWeight="bold" mb={1}>{m.value}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                  {m.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="admin dashboard tabs" textColor="primary" indicatorColor="primary">
          <Tab label="📊 Overview" />
          <Tab label={
            <Box display="flex" alignItems="center" gap={1}>
              ⏳ Pending Approvals
              {pendingApprovals.length > 0 && (
                <Chip size="small" label={pendingApprovals.length} color="warning" />
              )}
            </Box>
          } />
          <Tab label="👥 Users" />
        </Tabs>
      </Box>

      {/* TAB: Overview */}
      {activeTab === 0 && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                Events by Category
              </Typography>
              <Box height={300} width="100%" mt={3}>
                <ResponsiveContainer>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                Category Distribution
              </Typography>
              <Box height={300} width="100%" mt={3}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB: Pending Approvals */}
      {activeTab === 1 && (
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
            Event Approval Queue
          </Typography>

          {actionFeedback && (
            <Alert severity={actionFeedback.type} sx={{ mb: 3 }}>
              {actionFeedback.msg}
            </Alert>
          )}

          {pendingApprovals.length === 0 ? (
            <Box textAlign="center" py={8}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2, opacity: 0.5 }} />
              <Typography variant="h5" gutterBottom>All clear!</Typography>
              <Typography color="text.secondary">No events are pending approval right now.</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {pendingApprovals.map((approval: any) => (
                <Grid item xs={12} key={approval.id}>
                  <Card variant="outlined" sx={{ borderLeft: '4px solid', borderLeftColor: 'warning.main' }}>
                    <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <PendingActionsIcon color="warning" />
                          <Typography variant="h6" fontWeight="bold">
                            {approval.eventTitle || `Event #${approval.eventId}`}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Submitted by <strong>{approval.organizerName || 'Organizer'}</strong> • {approval.requestedAt ? new Date(approval.requestedAt).toLocaleDateString() : 'Recently'}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={2}>
                        <Button 
                          variant="contained" 
                          color="success" 
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleApprove(approval.id)}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          startIcon={<CancelIcon />}
                          onClick={() => handleReject(approval.id)}
                        >
                          Reject
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {/* TAB: Users */}
      {activeTab === 2 && (
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
            Registered Users
          </Typography>
          
          {users.length === 0 ? (
            <Typography align="center" color="text.secondary" py={4}>Loading users...</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Organization</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u: any) => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.name}</TableCell>
                      <TableCell color="text.secondary">{u.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={u.role?.replace('ROLE_', '')} 
                          size="small"
                          color={u.role === 'ROLE_ADMIN' ? 'secondary' : u.role === 'ROLE_ORGANIZER' ? 'primary' : 'success'}
                        />
                      </TableCell>
                      <TableCell>{u.organizationName || u.department || '—'}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="error" 
                          onClick={() => adminService.deleteUser(u.id).then(loadUsers)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default AdminDashboard;
