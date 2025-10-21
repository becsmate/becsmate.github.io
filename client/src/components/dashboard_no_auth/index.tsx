import React from 'react';
import {
  Container,
  Typography,
  Box,
} from '@mui/material';

const DashboardNoAuth: React.FC = () => {

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Log in or Register to see more
          </Typography>
        </Box>
    </Container>
  );
};

export default DashboardNoAuth;