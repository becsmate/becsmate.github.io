import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
} from '@mui/material';

// Hooks
import { useAboutData } from './hooks/useApi';

// Components
import Navigation from './components/Navigation';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  const { data: aboutData, error } = useAboutData();

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        <Routes>
          <Route 
            path="/" 
            element={<HomePage aboutData={aboutData} error={error} />} 
          />
          <Route 
            path="/about" 
            element={<AboutPage aboutData={aboutData} />} 
          />
          <Route 
            path="/projects" 
            element={<ProjectsPage />} 
          />
          <Route 
            path="/contact" 
            element={<ContactPage />} 
          />
          <Route 
            path="/login" 
            element={<LoginPage />} 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
