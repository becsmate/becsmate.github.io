import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
  Menu,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface NavigationProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ darkMode, toggleDarkMode }) => {

  const { isAuthenticated, logout } = useAuthContext();

  const loginLogoutButton = () => {
    return (
      isAuthenticated ? (
        <Button
          onClick={() => {
            logout();
          }}
          color="inherit"
          variant="outlined"
          sx={{ ml: 2 }}
        >
          Logout
        </Button>
      ) : (
        <Button
          component={Link}
          to="/login"
          color="inherit"
          variant="outlined"
          sx={{ ml: 2 }}
        >
          Login
        </Button>
      )
    );
  };

  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Projects', path: '/projects' },
    { label: 'Contact', path: '/contact' },
    { label: 'Upload', path: '/upload' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            flexGrow: isMobile ? 1 : 0,
            textDecoration: 'none', 
            color: 'inherit',
            mr: 4
          }}
        >
          becsmate.me
        </Typography>
        
        {!isMobile && (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                color="inherit"
                variant={isActive(item.path) ? 'outlined' : 'text'}
                sx={{
                  borderColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}
        {isMobile && (
          <>
            <Button
              id="nav-menu-button"
              aria-controls={open ? "nav-menu-button" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              variant="outlined"
              color="inherit"
              disableElevation
              onClick={handleClick}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: '50px',
                padding: 0.6,
              }}
            >
              <MenuIcon />
            </Button>
            <Menu
              open={open}
              onClose={handleClose}
              anchorEl={anchorEl}
            >
              <Box
                sx={{
                  width: 250,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  p: 2,
                }}
              >
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    color="inherit"
                    onClick={handleClose}
                  >
                    {item.label}
                  </Button>
                ))}
                {loginLogoutButton()}
              </Box>
            </Menu>
          </>
        )}

        <IconButton color="inherit" onClick={toggleDarkMode}>
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
        {!isMobile && loginLogoutButton()}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;