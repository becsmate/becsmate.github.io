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
      <Box textAlign="center" mb={4}>
        <Typography variant="h2" component="h1" gutterBottom>
          About Me
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Learn more about my background and skills
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Background
              </Typography>
              <Typography variant="body1" paragraph>
                Hi, I'm Becs! I'm a passionate developer who loves creating modern web applications
                and exploring new technologies. This personal website showcases my journey in 
                software development and serves as a playground for experimenting with new ideas.
              </Typography>
              <Typography variant="body1" paragraph>
                I enjoy working with both frontend and backend technologies, with a particular 
                interest in React, Python, and cloud deployment. When I'm not coding, you can 
                find me exploring new tech stacks and contributing to open source projects.
              </Typography>
              
              {aboutData && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Current Tech Stack
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
                Skills & Interests
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Frontend
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    React, TypeScript, Material-UI, Responsive Design
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Backend
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Python, Flask, REST APIs, Database Design
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    DevOps
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Docker, Heroku, Git, CI/CD
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AboutPage;