import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import {
  Box, Container, Typography, TextField, Button, Alert, Grid, Paper,
  MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const categories = ['TECH', 'MUSIC', 'SPORTS', 'ACADEMIC', 'CULTURAL', 'OTHER'];

const CreateEventPage: React.FC = () => {
  const [form, setForm] = useState({
    title: '', description: '', category: 'TECH', date: '', time: '', venue: '',
    maxAttendees: 100, registrationDeadline: '', imageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'maxAttendees' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await eventService.createEvent(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box mb={6}>
        <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom>
          Create New Event
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Submit your event for admin approval before it goes live.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                id="title"
                name="title"
                label="Event Title"
                placeholder="e.g. Annual Tech Symposium 2026"
                value={form.title}
                onChange={handleChange}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                id="description"
                name="description"
                label="Description"
                placeholder="Describe your event in detail..."
                multiline
                rows={5}
                value={form.description}
                onChange={handleChange}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={form.category}
                  label="Category"
                  onChange={handleChange}
                >
                  {categories.map(c => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Max Attendees */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="maxAttendees"
                name="maxAttendees"
                label="Max Attendees"
                type="number"
                inputProps={{ min: 1 }}
                value={form.maxAttendees}
                onChange={handleChange}
              />
            </Grid>

            {/* Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                id="date"
                name="date"
                label="Event Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.date}
                onChange={handleChange}
              />
            </Grid>

            {/* Time */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                id="time"
                name="time"
                label="Start Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={form.time}
                onChange={handleChange}
              />
            </Grid>

            {/* Venue */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                id="venue"
                name="venue"
                label="Venue / Location"
                placeholder="e.g. Main Auditorium, Block A"
                value={form.venue}
                onChange={handleChange}
              />
            </Grid>

            {/* Registration Deadline */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="registrationDeadline"
                name="registrationDeadline"
                label="Registration Deadline"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.registrationDeadline}
                onChange={handleChange}
              />
            </Grid>

            {/* Image URL */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="imageUrl"
                name="imageUrl"
                label="Event Banner URL (optional)"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={handleChange}
              />
            </Grid>

            {/* Notice Alert */}
            <Grid item xs={12}>
              <Alert severity="warning" icon={<InfoOutlinedIcon />} sx={{ borderRadius: 2 }}>
                Your event will be submitted for <strong>Admin review</strong>. It will appear as <em>PENDING</em> in your dashboard until approved.
              </Alert>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<RocketLaunchIcon />}
                sx={{ py: 2, fontSize: '1.1rem', fontWeight: 'bold', mt: 2 }}
              >
                {loading ? 'Submitting Event...' : 'Submit Event for Approval'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateEventPage;
