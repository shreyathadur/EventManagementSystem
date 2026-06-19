import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Tooltip, Menu, MenuItem, Avatar, Divider, ListItemIcon, ListItemText } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import EventIcon from '@mui/icons-material/Event';
import { DarkMode, LightMode, Language, Person, Dashboard, Logout, Add } from '@mui/icons-material';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    setUserAnchor(null);
    navigate('/');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setLangAnchor(null);
  };

  return (
    <AppBar position="sticky" sx={{
      background: mode === 'light'
        ? 'linear-gradient(135deg, #1a56db 0%, #7c3aed 100%)'
        : 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
      backdropFilter: 'blur(10px)',
    }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <EventIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component={RouterLink} to="/"
            sx={{ flexGrow: 0, mr: 4, textDecoration: 'none', color: 'white', fontWeight: 700 }}>
            UniEvents
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <Button color="inherit" component={RouterLink} to="/events">{t('nav.events')}</Button>
            {isAuthenticated && (
              <Button color="inherit" component={RouterLink} to="/dashboard" startIcon={<Dashboard />}>
                {t('nav.dashboard')}
              </Button>
            )}
            {isAuthenticated && ['ROLE_ORGANIZATION', 'ROLE_FACULTY', 'ROLE_ADMIN'].includes(user?.role || '') && (
              <Button color="inherit" component={RouterLink} to="/create-event" startIcon={<Add />}>
                {t('nav.createEvent')}
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Dark mode toggle */}
            <Tooltip title={mode === 'light' ? 'Dark Mode' : 'Light Mode'}>
              <IconButton color="inherit" onClick={toggleTheme} size="small">
                {mode === 'light' ? <DarkMode /> : <LightMode />}
              </IconButton>
            </Tooltip>

            {/* Language selector */}
            <Tooltip title={t('nav.language')}>
              <IconButton color="inherit" onClick={(e) => setLangAnchor(e.currentTarget)} size="small">
                <Language />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={langAnchor} open={Boolean(langAnchor)} onClose={() => setLangAnchor(null)}
              PaperProps={{ sx: { borderRadius: 2, mt: 1 } }}>
              <MenuItem onClick={() => changeLanguage('en')} selected={i18n.language === 'en'}>
                <ListItemText>🇺🇸 English</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => changeLanguage('hi')} selected={i18n.language === 'hi'}>
                <ListItemText>🇮🇳 हिन्दी</ListItemText>
              </MenuItem>
            </Menu>

            {isAuthenticated ? (
              <>
                <Tooltip title={user?.name || 'Profile'}>
                  <IconButton onClick={(e) => setUserAnchor(e.currentTarget)} size="small">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: 700 }}>
                      {user?.name?.charAt(0) || 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)}
                  PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 200 } }}>
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography fontWeight={600}>{user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                  </Box>
                  <Divider />
                  <MenuItem component={RouterLink} to="/profile" onClick={() => setUserAnchor(null)}>
                    <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                    <ListItemText>{t('profile.title')}</ListItemText>
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/dashboard" onClick={() => setUserAnchor(null)}>
                    <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
                    <ListItemText>{t('nav.dashboard')}</ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                    <ListItemText>{t('nav.logout')}</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/login">{t('nav.login')}</Button>
                <Button variant="contained" component={RouterLink} to="/register"
                  sx={{ bgcolor: 'white', color: '#1a56db', '&:hover': { bgcolor: '#f0f0f0' } }}>
                  {t('nav.signup')}
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
