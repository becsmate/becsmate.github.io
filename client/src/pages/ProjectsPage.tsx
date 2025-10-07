import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import { GitHub, Launch } from '@mui/icons-material';

const ProjectsPage: React.FC = () => {
  const projects = [
    {
      id: 1,
      title: 'Personal Website',
      description: 'A modern personal website built with React, TypeScript, Flask, and Docker. Features responsive design, dark/light theme, and containerized deployment.',
      technologies: ['React', 'TypeScript', 'Flask', 'Docker', 'Material-UI'],
      githubUrl: 'https://github.com/becsmate/becsmate.github.io',
      liveUrl: 'https://becsmate.me',
      status: 'Live'
    },
    {
      id: 2,
      title: 'Dockerized Full-Stack App',
      description: 'A demonstration of modern development practices with Docker Compose, featuring separate frontend and backend containers with hot reload.',
      technologies: ['Docker', 'React', 'Python', 'PostgreSQL'],
      githubUrl: '#',
      liveUrl: null,
      status: 'In Development'
    },
    {
      id: 3,
      title: 'API Gateway Service',
      description: 'A microservices API gateway built with Python and Flask, featuring authentication, rate limiting, and service discovery.',
      technologies: ['Python', 'Flask', 'Redis', 'JWT'],
      githubUrl: '#',
      liveUrl: null,
      status: 'Planned'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live': return 'success';
      case 'In Development': return 'warning';
      case 'Planned': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h2" component="h1" gutterBottom>
          My Projects
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          A showcase of my development work and experiments
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" component="h2">
                    {project.title}
                  </Typography>
                  <Chip 
                    label={project.status} 
                    color={getStatusColor(project.status) as any}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {project.description}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                  {project.technologies.map((tech) => (
                    <Chip
                      key={tech}
                      label={tech}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<GitHub />}
                  href={project.githubUrl}
                  disabled={project.githubUrl === '#'}
                >
                  Code
                </Button>
                {project.liveUrl && (
                  <Button 
                    size="small" 
                    startIcon={<Launch />}
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live Demo
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" mt={6}>
        <Typography variant="h6" gutterBottom>
          More Projects Coming Soon!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          I'm constantly working on new projects and experiments. 
          Check back regularly or follow me on GitHub for updates.
        </Typography>
      </Box>
    </Container>
  );
};

export default ProjectsPage;