import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import { GitHub, LinkedIn, Email, Send } from '@mui/icons-material';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this to your backend API
    console.log('Form submitted:', formData);
    setShowSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>

    </Container>
  );
};

export default ContactPage;