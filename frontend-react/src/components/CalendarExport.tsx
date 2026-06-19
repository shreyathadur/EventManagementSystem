import React from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { CalendarMonth, Google, Download } from '@mui/icons-material';
import axios from 'axios';

interface CalendarExportProps {
  eventId: string;
}

const CalendarExport: React.FC<CalendarExportProps> = ({ eventId }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleGoogleCalendar = async () => {
    try {
      const res = await axios.get(`/api/calendar/google/${eventId}`);
      window.open(res.data.url, '_blank');
    } catch (err) {
      console.error('Failed to get Google Calendar link', err);
    }
    setAnchorEl(null);
  };

  const handleICal = async () => {
    try {
      const res = await axios.get(`/api/calendar/ical/${eventId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `event_${eventId}.ics`;
      link.click();
    } catch (err) {
      console.error('Failed to download iCal', err);
    }
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        startIcon={<CalendarMonth />}
        variant="outlined"
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ borderRadius: 2 }}
      >
        Add to Calendar
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: 2 } }}>
        <MenuItem onClick={handleGoogleCalendar}>
          <ListItemIcon><Google fontSize="small" /></ListItemIcon>
          <ListItemText>Google Calendar</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleICal}>
          <ListItemIcon><Download fontSize="small" /></ListItemIcon>
          <ListItemText>Download iCal (.ics)</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default CalendarExport;
