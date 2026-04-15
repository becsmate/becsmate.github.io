import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Alert, Divider } from '@mui/material';
import { useAuthContext } from '../contexts/AuthContext';
import { isValidEmail } from '../utils';

const Login: React.FC = () => {
  const { login, register } = useAuthContext();
  const navigate = useNavigate();
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

    setLoading(true);
    try {
      await login(email, password);
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
        Sign in to your account
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? 'Please wait…' : 'Sign in'}
        </Button>
      </Box>
      <Divider sx={{ my: 3 }} />
      <Button fullWidth onClick={() => { navigate('/register'); setError(null); }}>
        Don't have an account? Register
      </Button>
    </Container>
  );
}

export default Login;