import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
} from '@mui/material';

interface AboutData {
  name: string;
  description: string;
  tech_stack: string[];
}

interface AboutPageProps {
  aboutData: AboutData | null;
}

const AboutPage: React.FC<AboutPageProps> = ({ aboutData }) => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      
    </Container>
  );
};

export default AboutPage;