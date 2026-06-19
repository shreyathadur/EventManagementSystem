import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Avatar, TextField, Button,
  Divider, Stack, Chip, Paper, LinearProgress
} from '@mui/material';
import { Edit, Save, Cancel, EmojiEvents, EventNote, RateReview } from '@mui/icons-material';
import BadgesDisplay from '../components/BadgesDisplay';
import axios from 'axios';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', department: '', phone: '' });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileRes, badgesRes] = await Promise.all([
        axios.get(`/api/profile/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/profile/badges/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setProfile(profileRes.data);
      setBadges(badgesRes.data);
      setForm({ bio: profileRes.data.bio || '', department: profileRes.data.department || '', phone: profileRes.data.phone || '' });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put('/api/profile', form, { headers: { Authorization: `Bearer ${token}` } });
      setEditing(false);
      fetchProfile();
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  if (loading) return <LinearProgress />;

  const statItems = [
    { icon: <EventNote />, label: 'Events Attended', value: profile?.totalEventsAttended || 0, color: '#2563EB' },
    { icon: <EmojiEvents />, label: 'Events Organized', value: profile?.totalEventsOrganized || 0, color: '#10B981' },
    { icon: <RateReview />, label: 'Reviews Given', value: profile?.reviewsGiven || 0, color: '#F59E0B' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', gap: 4, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          {/* Profile sidebar */}
          <Box sx={{ width: { xs: '100%', md: '33%' }, flexShrink: 0 }}>
            <Card sx={{ borderRadius: 4, textAlign: 'center', overflow: 'visible', position: 'relative', pt: 6, mt: 6 }}>
              <Avatar
                sx={{
                  width: 100, height: 100, mx: 'auto',
                  bgcolor: 'primary.main', fontSize: 40, fontWeight: 700,
                  border: '4px solid', borderColor: 'background.paper',
                  position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                }}
              >
                {user.name?.charAt(0) || 'U'}
              </Avatar>
              <CardContent sx={{ pt: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{user.name}</Typography>
                <Typography color="text.secondary" gutterBottom>{user.email}</Typography>
                <Chip label={user.role} color="primary" size="small" sx={{ mt: 1, fontWeight: 600 }} />
                <Divider sx={{ my: 3 }} />
                <Stack spacing={2} sx={{ textAlign: 'left' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Department</Typography>
                    <Typography sx={{ fontWeight: 500 }}>{profile?.department || 'Not set'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                    <Typography sx={{ fontWeight: 500 }}>{profile?.phone || 'Not set'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Bio</Typography>
                    <Typography variant="body2">{profile?.bio || 'No bio yet'}</Typography>
                  </Box>
                </Stack>
                <Button startIcon={editing ? <Cancel /> : <Edit />} variant="outlined"
                  sx={{ mt: 3, borderRadius: 2 }} onClick={() => setEditing(!editing)} fullWidth>
                  {editing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* Main content */}
          <Box sx={{ flex: 1 }}>
            {editing ? (
              <Card sx={{ borderRadius: 4, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Edit Profile</Typography>
                <Stack spacing={3}>
                  <TextField label="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} fullWidth />
                  <TextField label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} fullWidth />
                  <TextField label="Bio" multiline rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} fullWidth />
                  <Button startIcon={<Save />} variant="contained" onClick={handleSave} sx={{ borderRadius: 2, alignSelf: 'flex-start' }}>Save Changes</Button>
                </Stack>
              </Card>
            ) : (
              <>
                {/* Stats Cards */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  {statItems.map((stat, i) => (
                    <Paper key={i} sx={{ flex: 1, p: 2.5, borderRadius: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>{stat.value}</Typography>
                      <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                    </Paper>
                  ))}
                </Box>

                {/* Badges */}
                <Card sx={{ borderRadius: 4, mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>🏆 Badges</Typography>
                    {badges.length > 0 ? (
                      <BadgesDisplay badges={badges} />
                    ) : (
                      <Typography color="text.secondary" variant="body2">
                        Start attending events and writing reviews to earn badges!
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ProfilePage;
