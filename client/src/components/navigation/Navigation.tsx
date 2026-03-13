import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import Brightness2OutlinedIcon from "@mui/icons-material/Brightness2Outlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import UserProfileAvatar from "./Avatar";

interface NavigationProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  darkMode,
  toggleDarkMode,
}) => {
  const { isAuthenticated, logout, user } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo Section */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <AccountBalanceWalletOutlinedIcon
            sx={{
              bgcolor: "#353e8c",
              color: "white",
              borderRadius: "30%",
              p: 0.5,
              height: 30,
              width: 30,
            }}
          />
          <Typography
            variant="h6"
            sx={{ color: "inherit", textDecoration: "none" }}
          >
            FinanceAI
          </Typography>
          {/* add wallets here when authenticated */}
        </Box>
        {/* Navigation Links */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <LightModeOutlinedIcon /> : <Brightness2OutlinedIcon />}
          </IconButton>
          {isAuthenticated ? (
            <Box>
              {/* add scan receipt button here */}
              <IconButton
                id="account-button"
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpen}
                color="inherit"
              >
                <UserProfileAvatar
                  name={user?.name || "User"}
                  profileImageUrl={user?.profile_image_url || null}
                />
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: { minWidth: 200, bgcolor: "background.default" },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider" }}
                >
                  My Account
                </Typography>
                <MenuItem onClick={handleClose} component={Link} to="/profile">
                  <Person2OutlinedIcon sx={{ mr: 2 }} />
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleClose} component={Link} to="/settings">
                  <SettingsOutlinedIcon sx={{ mr: 2 }} />
                  <Typography textAlign="center">Settings</Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    logout();
                  }}
                  sx={{ borderTop: 1, borderColor: "divider" }}
                >
                  <LogoutOutlinedIcon sx={{ mr: 2, color: "error.main" }} />
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box>
              <Button
                component={Link}
                to="/login"
                color="inherit"
                variant="text"
                sx={{ mr: 1 }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                color="inherit"
                variant="contained"
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
