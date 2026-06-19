import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, CardActions, Button, Chip, Box, TextField, MenuItem, Pagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { eventService, Event } from '../services/eventService';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';

const categories = ['', 'TECH', 'MUSIC', 'SPORTS', 'ACADEMIC', 'CULTURAL', 'OTHER'];
const statusColors: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
  APPROVED: 'success', ACTIVE: 'info', PENDING: 'warning', REJECTED: 'error', COMPLETED: 'default',
};

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, [page, category]);

  const loadEvents = async () => {
    try {
      const params: any = { page, size: 12 };
      if (category) params.category = category;
      if (query) params.query = query;
      const res = await eventService.getAllEvents(params);
      setEvents(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      console.error('Failed to load events', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadEvents();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Upcoming Events</Typography>

      {/* Filters */}
      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField size="small" placeholder="Search events..." value={query} onChange={e => setQuery(e.target.value)}
          sx={{ minWidth: 250 }} />
        <TextField size="small" select label="Category" value={category} onChange={e => setCategory(e.target.value)}
          sx={{ minWidth: 150 }}>
          <MenuItem value="">All Categories</MenuItem>
          {categories.filter(c => c).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <Button variant="contained" type="submit">Search</Button>
      </Box>

      {/* Event Grid */}
      <Grid container spacing={3}>
        {events.map(event => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer',
              transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.12)' } }}
              onClick={() => navigate(`/events/${event.id}`)}>
              <CardMedia component="div" sx={{
                height: 160, bgcolor: `hsl(${(event.title.charCodeAt(0) * 37) % 360}, 65%, 55%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography variant="h3" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>
                  {event.category?.charAt(0) || 'E'}
                </Typography>
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip label={event.category} size="small" variant="outlined" />
                  <Chip label={event.status} size="small" color={statusColors[event.status] || 'default'} />
                </Box>
                <Typography variant="h6" gutterBottom noWrap>{event.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, color: 'text.secondary' }}>
                  <CalendarTodayIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2">{event.date}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, color: 'text.secondary' }}>
                  <LocationOnIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2" noWrap>{event.venue}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <PeopleIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2">{event.currentAttendees}/{event.maxAttendees} attendees</Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" variant="contained" fullWidth>View Details</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {events.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">No events found</Typography>
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={totalPages} page={page + 1} onChange={(_, v) => setPage(v - 1)} color="primary" />
        </Box>
      )}
    </Container>
  );
};

export default EventsPage;
