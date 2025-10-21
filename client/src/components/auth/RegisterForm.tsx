import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Paper,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material';
import { useAuthContext } from '../../contexts/AuthContext';
import { isValidEmail } from '../../utils';


interface RegisterFormProps {
    onSuccess?: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    const { register, loading, error } = useAuthContext();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        // Basic validation
        if (!email || !password || !name) {
            setFormError('Please fill in all fields');
            return;
        }

        if (!isValidEmail(email)) {
            setFormError('Please enter a valid email address');
            return;
        }

        try {
            await register(email, password, name);
            onSuccess?.();
        } catch (err: any) {
            setFormError(err.response.data.error || 'An unexpected error occurred');
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
                Register
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                />

                {formError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {formError}
                    </Alert>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3 }}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Register'}
                </Button>
            </Box>
        </Paper>
    )
}

export default RegisterForm;