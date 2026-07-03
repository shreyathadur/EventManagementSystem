import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService, Event } from '../services/eventService';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';

const categories = ['', 'TECH', 'MUSIC', 'SPORTS', 'ACADEMIC', 'CULTURAL', 'OTHER'];
const statusColors: Record<string, string> = {
  APPROVED: 'bg-green-500/20 text-green-400 border border-green-500/30', 
  ACTIVE: 'bg-blue-500/20 text-blue-400 border border-blue-500/30', 
  PENDING: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', 
  REJECTED: 'bg-red-500/20 text-red-400 border border-red-500/30', 
  COMPLETED: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
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
    <div className="animate-fade-up max-w-7xl mx-auto px-6 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gradient">Discover Campus Events</h1>
        <p className="text-muted max-w-2xl mx-auto">
          Find exactly what you're looking for, from academic seminars to weekend cultural festivals.
        </p>
      </header>

      {/* Filters Area */}
      <div className="glass-panel rounded-2xl p-4 mb-10 shadow-lg flex flex-col md:flex-row gap-4 justify-center items-center">
        <form onSubmit={handleSearch} className="flex w-full max-w-4xl gap-4 flex-col md:flex-row">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title, venue, or keyword..." 
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              value={query} 
              onChange={e => setQuery(e.target.value)} 
            />
          </div>
          <select 
            className="bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors md:w-48 appearance-none"
            value={category} 
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.filter(c => c).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 whitespace-nowrap">
            Search
          </button>
        </form>
      </div>

      {/* Event Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {events.map(event => (
          <div 
            key={event.id} 
            className="glass-card flex flex-col cursor-pointer group overflow-hidden relative"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            {/* Banner Area */}
            <div 
              style={{ 
                height: 160, 
                background: `linear-gradient(135deg, hsl(${(event.title.charCodeAt(0) * 37) % 360}, 70%, 30%), hsl(${(event.title.charCodeAt(event.title.length - 1) * 23) % 360}, 60%, 20%))`,
                position: 'relative'
              }}
              className="flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              <h3 className="text-6xl font-black text-white/10 select-none group-hover:scale-110 transition-transform duration-500">
                {event.category?.charAt(0) || 'E'}
              </h3>
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${statusColors[event.status] || statusColors.COMPLETED}`}>
                  {event.status}
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-grow flex flex-col">
              <div className="mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                  {event.category || 'General'}
                </span>
              </div>
              <h4 className="text-lg font-bold mb-3 line-clamp-2 text-white group-hover:text-indigo-300 transition-colors">{event.title}</h4>
              
              <div className="space-y-2 mt-auto">
                <div className="flex items-center text-sm text-slate-300">
                  <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: '#94a3b8' }} />
                  {event.date}
                </div>
                <div className="flex items-center text-sm text-slate-300">
                  <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: '#94a3b8' }} />
                  <span className="truncate">{event.venue}</span>
                </div>
                <div className="flex items-center text-sm text-slate-300">
                  <PeopleIcon sx={{ fontSize: 16, mr: 1, color: '#94a3b8' }} />
                  {event.currentAttendees}/{event.maxAttendees} attendees
                </div>
              </div>
            </div>
            
            {/* Hover Action */}
            <div className="bg-white/5 p-3 text-center border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-sm font-semibold text-indigo-300">View Details &rarr;</span>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-20 glass-panel rounded-2xl border border-white/5 mt-10">
          <EventIcon sx={{ fontSize: 64, color: '#334155', mb: 2 }} />
          <h3 className="text-xl font-medium text-muted">No events found matching your criteria</h3>
          <button onClick={() => {setQuery(''); setCategory('');}} className="mt-4 text-indigo-400 hover:text-indigo-300 underline">Clear filters</button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                page === i 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
