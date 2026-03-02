import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material';
import { useAuthContext } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import OCRPage from './pages/OCRPage';
import StatisticsPage from './pages/StatisticsPage';
import Settings from './pages/Settings';
import Login from './pages/Login';

const DARK_MODE_KEY = 'darkMode';

function App() {
  const { isAuthenticated, user } = useAuthContext();
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(DARK_MODE_KEY);
    return saved !== null ? saved === 'true' : prefersDark;
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem(DARK_MODE_KEY, String(!prev));
      return !prev;
    });
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Routes>
          {isAuthenticated ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<OCRPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;