import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';

const categories = ['TECH', 'MUSIC', 'SPORTS', 'ACADEMIC', 'CULTURAL', 'OTHER'];

const CreateEventPage: React.FC = () => {
  const [form, setForm] = useState({
    title: '', description: '', category: 'TECH', date: '', time: '', venue: '',
    maxAttendees: 100, registrationDeadline: '', imageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Create New Event</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="Event Title" name="title" margin="normal" required value={form.title} onChange={handleChange} />
          <TextField fullWidth label="Description" name="description" margin="normal" required multiline rows={4} value={form.description} onChange={handleChange} />
          <TextField fullWidth select label="Category" name="category" margin="normal" value={form.category} onChange={handleChange}>
            {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth label="Date" name="date" type="date" margin="normal" required InputLabelProps={{ shrink: true }} value={form.date} onChange={handleChange} />
            <TextField fullWidth label="Time" name="time" type="time" margin="normal" required InputLabelProps={{ shrink: true }} value={form.time} onChange={handleChange} />
          </Box>
          <TextField fullWidth label="Venue" name="venue" margin="normal" required value={form.venue} onChange={handleChange} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField fullWidth label="Max Attendees" name="maxAttendees" type="number" margin="normal" value={form.maxAttendees} onChange={handleChange} />
            <TextField fullWidth label="Registration Deadline" name="registrationDeadline" type="date" margin="normal" InputLabelProps={{ shrink: true }} value={form.registrationDeadline} onChange={handleChange} />
          </Box>
          <TextField fullWidth label="Image URL (optional)" name="imageUrl" margin="normal" value={form.imageUrl} onChange={handleChange} />
          <Button fullWidth variant="contained" type="submit" size="large" sx={{ mt: 3 }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateEventPage;
