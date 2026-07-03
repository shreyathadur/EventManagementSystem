import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService, Event } from '../../services/eventService';
import {
  Container, Typography, Box, TextField, Select, MenuItem, Button,
  Grid, Card, CardContent, CardActionArea, CardMedia, Chip, Pagination,
  Paper, InputAdornment
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';

const categories = ['', 'TECH', 'MUSIC', 'SPORTS', 'ACADEMIC', 'CULTURAL', 'OTHER'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'success';
    case 'ACTIVE': return 'info';
    case 'PENDING': return 'warning';
    case 'REJECTED': return 'error';
    default: return 'default';
  }
};

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, [page, category]);

  const loadEvents = async () => {
    try {
      const params: any = { page: page - 1, size: 12 };
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
    setPage(1);
    loadEvents();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" fontWeight="bold" gutterBottom color="primary">
          Discover Campus Events
        </Typography>
        <Typography variant="h6" color="text.secondary" maxWidth={800} mx="auto">
          Find exactly what you're looking for, from academic seminars to weekend cultural festivals.
        </Typography>
      </Box>

      {/* Filters Area */}
      <Paper elevation={3} sx={{ p: 3, mb: 6, borderRadius: 2 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by title, venue, or keyword..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                displayEmpty
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value=""><em>All Categories</em></MenuItem>
                {categories.filter(c => c).map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth 
                size="large"
                sx={{ height: 56 }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Event Grid */}
      <Grid container spacing={4}>
        {events.map(event => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
              <CardActionArea onClick={() => navigate(`/events/${event.id}`)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <Box 
                  sx={{ 
                    height: 160, 
                    background: `linear-gradient(135deg, hsl(${(event.title.charCodeAt(0) * 37) % 360}, 70%, 30%), hsl(${(event.title.charCodeAt(event.title.length - 1) * 23) % 360}, 60%, 20%))`,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h1" sx={{ color: 'rgba(255,255,255,0.1)', fontWeight: 900 }}>
                    {event.category?.charAt(0) || 'E'}
                  </Typography>
                  <Chip 
                    label={event.status} 
                    color={getStatusColor(event.status) as any} 
                    size="small" 
                    sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 'bold' }} 
                  />
                </Box>
                
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box mb={2}>
                    <Chip label={event.category || 'General'} size="small" color="primary" variant="outlined" />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.title}
                  </Typography>
                  
                  <Box mt="auto">
                    <Box display="flex" alignItems="center" gap={1} mb={1} color="text.secondary">
                      <CalendarTodayIcon fontSize="small" />
                      <Typography variant="body2">{event.date}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1} color="text.secondary">
                      <LocationOnIcon fontSize="small" />
                      <Typography variant="body2" noWrap>{event.venue}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                      <PeopleIcon fontSize="small" />
                      <Typography variant="body2">{event.currentAttendees}/{event.maxAttendees} attendees</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {events.length === 0 && (
        <Paper elevation={0} sx={{ textAlign: 'center', py: 10, bgcolor: 'transparent' }}>
          <EventIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No events found matching your criteria
          </Typography>
          <Button onClick={() => {setQuery(''); setCategory('');}} color="primary" sx={{ mt: 2 }}>
            Clear filters
          </Button>
        </Paper>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={8}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(_, value) => setPage(value)} 
            color="primary" 
            size="large" 
          />
        </Box>
      )}
    </Container>
  );
};

export default EventsPage;
