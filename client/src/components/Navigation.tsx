import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Box, useMediaQuery, useTheme, Menu, MenuItem,
} from '@mui/material';
import { Brightness4, Brightness7, Menu as MenuIcon } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

interface NavigationProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', auth: true },
  { label: 'Upload', path: '/upload', auth: true },
  { label: 'Statistics', path: '/statistics', auth: true },
  { label: 'Login', path: '/login', auth: false },
  { label: 'Register', path: '/register', auth: false }
];

const Navigation: React.FC<NavigationProps> = ({ darkMode, toggleDarkMode }) => {
  const { isAuthenticated, logout } = useAuthContext();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isActive = (path: string) => location.pathname === path;
  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar position="static" elevation={0} color="transparent" sx={{ bgcolor: 'background.default', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2, textDecoration: 'none', color: 'inherit' }}>
            <AccountBalanceWalletOutlinedIcon sx={{ mr: 1, bgcolor: "#353e8c", color: 'white', borderRadius: '30%', p: 0.5, height: 30, width: 30 }} />
            <Typography variant="h6" component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none' }}>
              FinanceAI
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                {NAV_ITEMS.map((item) =>
                  (isAuthenticated && item.auth) ? (
                    <Button key={item.path} component={Link} to={item.path} color="inherit"
                      variant={isActive(item.path) ? 'outlined' : 'text'}
                      sx={{ borderColor: isActive(item.path) ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
                      {item.label}
                    </Button>
                  ) :
                  (
                    !isAuthenticated && !item.auth && (
                      <Button key={item.path} component={Link} to={item.path} color="inherit"
                        variant={isActive(item.path) ? 'outlined' : 'text'}
                        sx={{ borderColor: isActive(item.path) ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
                        {item.label}
                      </Button>
                    )
                  )
                )}
                {isAuthenticated && (
                    <Button onClick={logout} color="inherit" variant="text">
                      Logout
                    </Button>
                )}
              </Box>
            )}

            {isMobile && (
              <>
                <IconButton size="large" aria-label="account of current user" aria-controls="menu-appbar" aria-haspopup="true" onClick={handleOpen} color="inherit" sx={{ display: { xs: 'flex', md: 'none' } }} >
                  <MenuIcon />
                </IconButton>

                <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                  <AccountBalanceWalletOutlinedIcon sx={{ mr: 1, bgcolor: "#353e8c", color: 'white', borderRadius: '30%', p: 0.5, height: 30, width: 30 }} />
                  <Typography variant="h6" component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none' }}>
                    FinanceAI
                  </Typography>
                </Box>

                <Menu id="menu-appbar" anchorEl={anchorEl} anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }} keepMounted transformOrigin={{ vertical: 'top', horizontal: 'left', }} open={Boolean(anchorEl)} onClose={handleClose} sx={{ display: { xs: 'block', md: 'none' }, }} >
                  {NAV_ITEMS.map((item) => {
                    if (isAuthenticated && !item.auth) return null;
                    if (!isAuthenticated && item.auth) return null;

                    return (
                      <MenuItem key={item.label} onClick={handleClose} component={Link} to={item.path}>
                        <Typography textAlign="center">{item.label}</Typography>
                      </MenuItem>
                    )
                  })}
                  {isAuthenticated && (
                    <MenuItem onClick={() => { handleClose(); logout(); }}>
                        <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;