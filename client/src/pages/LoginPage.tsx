import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box
        sx={{
          backgroundColor: 'primary.main',
          height: 4,
          mb: 4,
          borderRadius: 2,
        }}
      >
      </Box>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 2 
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Login
        </Typography>
        <LoginForm onSuccess={() => {
          window.location.href = '/';
        }} />
      </Box>
    </Container>
  );
}

export default LoginPage;