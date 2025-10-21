import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const Login: React.FC = () => {

  const [register, setRegister] = React.useState(false);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 2 
        }}
      >
        {register ? 
          <RegisterForm onSuccess={() => {
            window.location.href = '/';
          }} /> : 
          <LoginForm onSuccess={() => {
            window.location.href = '/';
          }} />
        }
        <Typography
          variant="body2"
          sx={{ cursor: 'pointer', color: 'primary.main' }}
          onClick={() => setRegister(!register)}
        >
          {register ? 'Already have an account? Login' : "Don't have an account? Register"}
        </Typography>
      </Box>
    </Container>
  );
}

export default Login;