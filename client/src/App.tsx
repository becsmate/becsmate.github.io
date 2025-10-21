import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
} from "@mui/material";

// Hooks
// import { useAboutData } from "./hooks/useApi";
import { useAuthContext } from "./contexts/AuthContext";

// Components
import Navigation from "./components/Navigation";
import Dashboard from "./components/dashboard";
import DashboardNoAuth from "./components/dashboard_no_auth";
import Login from "./components/auth";
import ReceiptUpload from "./components/ocr";
import Settings from "./components/settings";

function App() {
  const { isAuthenticated, user } = useAuthContext();

  const [darkMode, setDarkMode] = useState(false);

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
            {isAuthenticated ? (
            <>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/upload" element={<ReceiptUpload />} />
              <Route path="/settings" element={<Settings user={user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
            ) : (
            <>
              <Route path="/" element={<DashboardNoAuth />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
            )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
