import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Alert, Divider } from '@mui/material';
import { useAuthContext } from '../contexts/AuthContext';
import { isValidEmail } from '../utils';

export default function Login() {
  const { login, register } = useAuthContext();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) return setError('Enter a valid email address');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (mode === 'register' && !name.trim()) return setError('Name is required');

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mode === 'register' && (
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
        )}
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Register'}
        </Button>
      </Box>
      <Divider sx={{ my: 3 }} />
      <Button fullWidth onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}>
        {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign in'}
      </Button>
    </Container>
  );
}