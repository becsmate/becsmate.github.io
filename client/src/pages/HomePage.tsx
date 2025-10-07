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
import {
  GitHub,
  LinkedIn,
  Email,
} from '@mui/icons-material';

interface AboutData {
  name: string;
  description: string;
  tech_stack: string[];
}

interface HomePageProps {
  aboutData: AboutData | null;
  error: string | null;
}

const HomePage: React.FC<HomePageProps> = ({ aboutData, error }) => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box textAlign="center" mb={4}>
        <Typography variant="h2" component="h1" gutterBottom>
          Hello, I'm Becs
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Welcome to my personal website
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Explore my work, learn about my background, or get in touch!
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                About
              </Typography>
              <Typography variant="body1" paragraph>
                This is my personal website built with modern web technologies.
                It showcases frontend routing with React Router, a clean Flask API backend,
                and containerized deployment with Docker.
              </Typography>
              
              {aboutData && (
                <Box mt={2}>
                  <Typography variant="h6" gutterBottom>
                    Tech Stack
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {aboutData.tech_stack.map((tech) => (
                      <Chip
                        key={tech}
                        label={tech}
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<GitHub />}
                  href="https://github.com/becsmate"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LinkedIn />}
                  href="https://linkedin.com/in/yourprofile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  href="mailto:hello@becsmate.me"
                >
                  Email
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box textAlign="center" mt={4}>
        <Typography variant="body2" color="text.secondary">
          Built with ❤️ using Flask, React, TypeScript, and Material-UI
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;