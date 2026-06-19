import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, PaletteMode } from '@mui/material';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ mode: 'light', toggleTheme: () => {} });

export const useThemeMode = () => useContext(ThemeContext);

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#2563EB', light: '#60A5FA', dark: '#1D4ED8' },
          secondary: { main: '#10B981', light: '#34D399', dark: '#059669' },
          background: { default: '#F8FAFC', paper: '#FFFFFF' },
          text: { primary: '#1E293B', secondary: '#64748B' },
        }
      : {
          primary: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
          secondary: { main: '#10B981', light: '#34D399', dark: '#059669' },
          background: { default: '#0F172A', paper: '#1E293B' },
          text: { primary: '#F1F5F9', secondary: '#94A3B8' },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' as const, fontWeight: 600, borderRadius: 8, padding: '8px 20px' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light'
            ? '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)'
            : '0 1px 3px rgba(0,0,0,0.3)',
          border: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
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
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
