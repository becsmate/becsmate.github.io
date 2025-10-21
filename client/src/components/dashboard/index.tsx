import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Alert,
} from '@mui/material';

import { useAuthContext } from '../../contexts/AuthContext';

interface AboutData {
  name: string;
  description: string;
  tech_stack: string[];
}

interface DashboardProps {
  aboutData: AboutData | null;
  error: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ aboutData, error }) => {

  const { isAuthenticated, user } = useAuthContext();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {!isAuthenticated ? (
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
      ) : (
        <Box
          sx={{
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.name}!
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;