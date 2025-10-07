import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
} from '@mui/material';
import axios from 'axios';

// Components
import Navigation from './components/Navigation';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';

interface AboutData {
  name: string;
  description: string;
  tech_stack: string[];
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await axios.get('/api/about');
        setAboutData(response.data);
      } catch (err) {
        setError('Failed to load site information');
        console.error('Error fetching about data:', err);
      }
    };

    fetchAboutData();
  }, []);

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
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
