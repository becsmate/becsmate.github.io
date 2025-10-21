import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
} from "@mui/material";

// Hooks
import { useAboutData } from "./hooks/useApi";
import { useAuthContext } from "./contexts/AuthContext";

// Components
import Navigation from "./components/Navigation";
import Dashboard from "./components/dashboard";
import Login from "./components/auth";
import ReceiptUpload from "./components/ocr";

function App() {
  const { isAuthenticated } = useAuthContext();

  const [darkMode, setDarkMode] = useState(false);

  const { data: aboutData, error } = useAboutData();

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#dc004e",
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
            element={<Dashboard aboutData={aboutData} error={error} />}
          />
            {isAuthenticated ? (
              <Route path="/upload" element={<ReceiptUpload />} />
            ) : (
              <Route path="/*" element={<Navigate to="/login" replace />} />
            )}
          {!isAuthenticated && <Route path="/login" element={<Login />} />}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
