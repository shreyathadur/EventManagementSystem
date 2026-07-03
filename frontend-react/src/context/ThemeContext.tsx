import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, PaletteMode, CssBaseline } from '@mui/material';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ mode: 'light', toggleTheme: () => {} });

export const useThemeMode = () => useContext(ThemeContext);

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      main: '#2563EB', // Blue 600
      light: '#60A5FA', // Blue 400
      dark: '#1D4ED8', // Blue 700
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#10B981', // Emerald 500
      light: '#34D399', // Emerald 400
      dark: '#059669', // Emerald 600
      contrastText: '#FFFFFF',
    },
    background: {
      default: mode === 'light' ? '#F8FAFC' : '#0F172A',
      paper: mode === 'light' ? '#FFFFFF' : '#1E293B',
    },
    text: {
      primary: mode === 'light' ? '#0F172A' : '#F8FAFC',
      secondary: mode === 'light' ? '#64748B' : '#94A3B8',
    },
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
    info: { main: '#3B82F6' },
    success: { main: '#10B981' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none' as const, fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' 
            ? '0px 2px 4px rgba(0,0,0,0.05), 0px 1px 2px rgba(0,0,0,0.1)' 
            : '0px 4px 6px rgba(0,0,0,0.3)',
          border: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export const ThemeContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(
    () => (localStorage.getItem('themeMode') as PaletteMode) || 'light'
  );

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
