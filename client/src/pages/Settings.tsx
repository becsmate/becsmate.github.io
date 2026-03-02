import React, { useState } from 'react';
import {
  Container, Typography, Box, Button, Avatar, Alert, CircularProgress, Paper, Divider,
} from '@mui/material';
import { useAuthContext } from '../contexts/AuthContext';
import { ocrApi } from '../services/ocrService';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function Settings() {
  const { user, updateUser } = useAuthContext();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadSuccess(false);

    if (file.size > MAX_FILE_SIZE) return setUploadError('Image must be under 5 MB');
    if (!['image/jpeg', 'image/png'].includes(file.type)) return setUploadError('Only jpg and png allowed');

    setUploading(true);
    try {
      const url = await ocrApi.uploadProfilePicture(file);
      updateUser({ profile_image_url: url });
      setUploadSuccess(true);
    } catch (e: any) {
      setUploadError(e.response?.data?.error ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>Settings</Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Profile</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            src={user?.profile_image_url ?? undefined}
            alt={user?.name}
            sx={{ width: 64, height: 64 }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography fontWeight={600}>{user?.name}</Typography>
            <Typography color="text.secondary">{user?.email}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>Profile Picture</Typography>
        {uploadError && <Alert severity="error" sx={{ mb: 1 }}>{uploadError}</Alert>}
        {uploadSuccess && <Alert severity="success" sx={{ mb: 1 }}>Profile picture updated</Alert>}

        <Button component="label" variant="outlined" disabled={uploading} startIcon={uploading ? <CircularProgress size={16} /> : undefined}>
          {uploading ? 'Uploading…' : 'Upload new photo'}
          <input type="file" hidden accept="image/jpeg,image/png" onChange={handleAvatarUpload} />
        </Button>
      </Paper>
    </Container>
  );
}