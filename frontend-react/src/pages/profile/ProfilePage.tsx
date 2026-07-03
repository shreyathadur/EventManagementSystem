import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CancelIcon from '@mui/icons-material/Cancel';
import { 
  Box, Container, Typography, Grid, Card, CardContent, Button, Chip,
  TextField, Avatar, Paper, Divider, Stack
} from '@mui/material';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', department: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => { if (user?.id) fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    try {
      const [profileRes, badgesRes] = await Promise.all([
        api.get(`/profile/${user!.id}`).catch(() => ({ data: {} })),
        api.get(`/profile/badges/${user!.id}`).catch(() => ({ data: [] })),
      ]);
      setProfile(profileRes.data);
      setBadges(Array.isArray(badgesRes.data) ? badgesRes.data : []);
      setForm({
        bio: profileRes.data?.bio || '',
        department: profileRes.data?.department || '',
        phone: profileRes.data?.phone || '',
      });
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/profile', form);
      setEditing(false);
      fetchProfile();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const roleConfig: Record<string, { label: string; color: any }> = {
    ROLE_ADMIN:     { label: 'Administrator',  color: 'secondary' },
    ROLE_ORGANIZER: { label: 'Organizer',      color: 'info' },
    ROLE_STUDENT:   { label: 'Student',        color: 'success' },
  };

  const rb = roleConfig[user?.role || ''] || roleConfig.ROLE_STUDENT;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom mb={6}>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3, height: '100%' }}>
            <Avatar 
              sx={{ 
                width: 120, height: 120, mx: 'auto', mb: 3, 
                bgcolor: 'primary.main', fontSize: '3rem', fontWeight: 'bold',
                background: 'linear-gradient(135deg, #2563EB, #10B981)'
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="h5" fontWeight="bold">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>{user?.email}</Typography>
            <Chip label={rb.label} color={rb.color} variant="outlined" sx={{ fontWeight: 'bold' }} />

            <Box mt={4} textAlign="left">
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={2} p={1.5} bgcolor="background.default" borderRadius={2}>
                  <EmailIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>Email</Typography>
                    <Typography variant="body2" fontWeight="medium">{user?.email}</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2} p={1.5} bgcolor="background.default" borderRadius={2}>
                  <BusinessIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>Organization</Typography>
                    <Typography variant="body2" fontWeight="medium">{user?.organizationName || profile?.organizationName || '—'}</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2} p={1.5} bgcolor="background.default" borderRadius={2}>
                  <BadgeIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>Department</Typography>
                    <Typography variant="body2" fontWeight="medium">{profile?.department || user?.department || '—'}</Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2} p={1.5} bgcolor="background.default" borderRadius={2}>
                  <PersonIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>Phone</Typography>
                    <Typography variant="body2" fontWeight="medium">{profile?.phone || '—'}</Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Button
              variant={editing ? "outlined" : "contained"}
              color="primary"
              fullWidth
              startIcon={editing ? <CancelIcon /> : <EditIcon />}
              onClick={() => setEditing(!editing)}
              sx={{ mt: 4 }}
            >
              {editing ? 'Cancel Editing' : 'Edit Profile'}
            </Button>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Box display="flex" flexDirection="column" gap={4}>
            {/* Stats */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card elevation={2} sx={{ textAlign: 'center', py: 3, height: '100%' }}>
                  <EventNoteIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h3" fontWeight="900" mt={1}>{profile?.totalEventsAttended || 0}</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>Events Attended</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card elevation={2} sx={{ textAlign: 'center', py: 3, height: '100%' }}>
                  <EmojiEventsIcon color="success" sx={{ fontSize: 40 }} />
                  <Typography variant="h3" fontWeight="900" mt={1}>{profile?.totalEventsOrganized || 0}</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>Events Organized</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card elevation={2} sx={{ textAlign: 'center', py: 3, height: '100%' }}>
                  <EmojiEventsIcon color="warning" sx={{ fontSize: 40 }} />
                  <Typography variant="h3" fontWeight="900" mt={1}>{badges.length}</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>Badges Earned</Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Edit Form */}
            {editing && (
              <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ borderBottom: 1, borderColor: 'divider', pb: 2, mb: 3 }}>
                  Edit Profile
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Bio" multiline rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} size="large">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Bio Display */}
            {!editing && profile?.bio && (
              <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  About Me
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {profile.bio}
                </Typography>
              </Paper>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  🏆 Badges Earned
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                  {badges.map((badge, i) => (
                    <Chip key={i} icon={<EmojiEventsIcon />} label={badge} color="primary" variant="outlined" sx={{ fontWeight: 'bold', px: 1, py: 2.5 }} />
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
