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
      
    </Container>
  );
};

export default ProjectsPage;