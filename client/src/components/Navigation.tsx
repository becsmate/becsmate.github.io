import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Box, useMediaQuery, useTheme, Menu, MenuItem,
} from '@mui/material';
import { Brightness4, Brightness7, Menu as MenuIcon } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface NavigationProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', auth: true },
  { label: 'Upload', path: '/upload', auth: true },
  { label: 'Statistics', path: '/statistics', auth: true },
];

const Navigation: React.FC<NavigationProps> = ({ darkMode, toggleDarkMode }) => {
  const { isAuthenticated, logout, user } = useAuthContext();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isActive = (path: string) => location.pathname === path;
  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const authButton = isAuthenticated ? (
    <Button onClick={logout} color="inherit" variant="outlined" sx={{ ml: 2 }}>
      Logout
    </Button>
  ) : (
    <Button component={Link} to="/login" color="inherit" variant="outlined" sx={{ ml: 2 }}>
      Login
    </Button>
  );

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Box component={Link} to={isAuthenticated ? '/' : '/'} sx={{ display: 'flex', alignItems: 'center', mr: 2, textDecoration: 'none', color: 'inherit' }}>
          {isAuthenticated && user ? (
            <>
              <img
                src={user.profile_image_url ?? undefined}
                alt={user.name}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                style={{ borderRadius: '50%', width: 30, height: 30, marginRight: 8 }}
              />
              <Typography component={Link} to="/settings" variant="h6" sx={{ color: 'inherit', textDecoration: 'none', mr: 4, flexGrow: isMobile ? 1 : 0 }}>
                {user.name}
              </Typography>
            </>
          ) : (
            <Typography variant="h6" sx={{ flexGrow: isMobile ? 1 : 0, mr: 4 }}>
              Finance Tracker
            </Typography>
          )}
        </Box>

        {!isMobile && (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {NAV_ITEMS.map((item) =>
              (isAuthenticated || !item.auth) && (
                <Button key={item.path} component={Link} to={item.path} color="inherit"
                  variant={isActive(item.path) ? 'outlined' : 'text'}
                  sx={{ borderColor: isActive(item.path) ? 'rgba(255,255,255,0.5)' : 'transparent' }}>
                  {item.label}
                </Button>
              )
            )}
          </Box>
        )}

        {isMobile && (
          <>
            <Button id="nav-menu-button" aria-controls={anchorEl ? 'nav-menu' : undefined}
              aria-haspopup="true" aria-expanded={!!anchorEl}
              variant="outlined" color="inherit" onClick={handleOpen}
              sx={{ minWidth: 50, p: 0.6 }}>
              <MenuIcon />
            </Button>
            <Menu id="nav-menu" anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
              {NAV_ITEMS.map((item) =>
                (isAuthenticated || !item.auth) && (
                  <MenuItem key={item.path} component={Link} to={item.path} onClick={handleClose}>
                    {item.label}
                  </MenuItem>
                )
              )}
              <Box sx={{ px: 1 }}>{authButton}</Box>
            </Menu>
          </>
        )}

        <IconButton color="inherit" onClick={toggleDarkMode}>
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
        {!isMobile && authButton}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;