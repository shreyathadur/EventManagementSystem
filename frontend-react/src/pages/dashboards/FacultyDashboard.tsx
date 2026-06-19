import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, List, ListItem, ListItemText, Button, Box, Chip, Divider, TextField, Grid } from '@mui/material';
import { approvalService } from '../../services/otherServices';
import { useAuth } from '../../context/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});

  useEffect(() => { loadApprovals(); }, []);

  const loadApprovals = async () => {
    try { setApprovals(await approvalService.getPending()); }
    catch (err) { console.error(err); }
  };

  const handleApprove = async (id: string) => {
    try {
      await approvalService.approve(id, comments[id] || '');
      loadApprovals();
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id: string) => {
    try {
      await approvalService.reject(id, comments[id] || '');
      loadApprovals();
    } catch (err) { console.error(err); }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Faculty Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome, {user?.name} — Review and manage event approval requests.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: 'white' }}>
            <CardContent>
              <Typography variant="h3" fontWeight={700}>{approvals.length}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Pending Approvals</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Pending Event Approvals</Typography>
          <Divider sx={{ mb: 2 }} />
          {approvals.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No pending approvals</Typography>
          ) : (
            <List>
              {approvals.map(a => (
                <ListItem key={a.id} sx={{ flexDirection: 'column', alignItems: 'stretch', border: '1px solid #e2e8f0', borderRadius: 2, mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <ListItemText primary={a.event?.title || 'Event'} secondary={`Requested: ${new Date(a.requestedAt).toLocaleDateString()}`} />
                    <Chip label="PENDING" color="warning" size="small" />
                  </Box>
                  <TextField size="small" fullWidth placeholder="Add comments..." sx={{ mb: 1 }}
                    value={comments[a.id] || ''} onChange={e => setComments({ ...comments, [a.id]: e.target.value })} />
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleApprove(a.id)}>
                      Approve
                    </Button>
                    <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => handleReject(a.id)}>
                      Reject
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default FacultyDashboard;
