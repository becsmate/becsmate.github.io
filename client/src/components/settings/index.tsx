import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Input
} from '@mui/material';
import { User } from '../../api/auth';
import { UploadProfilePicture } from '../../api/profile_picture'

interface SettingsProps {
    user: User | null;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            await UploadProfilePicture({ image: file });
            // Optionally reload the page or update user state to reflect the new profile picture
            window.location.reload();
        } catch (error) {
            console.error('Failed to upload profile picture:', error);
            // You might want to show an error message to the user here
        }
    };
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Settings
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
                <Typography variant="body1">
                    Profile Picture: 
                </Typography>
                <img 
                    src={user?.profile_image_url || '/default-profile.png'} 
                    alt="Profile" 
                    style={{ width: 40, height: 40, borderRadius: '50%', marginLeft: 16 }} 
                />
                </Box>
                <Typography variant="body1">
                    User Name: {user?.name}
                </Typography>
                <Typography variant="body1">
                    Email: {user?.email}
                </Typography>
                <Box>
                    <Input
                        type="file"
                        inputProps={{ accept: "image/*" }}
                        style={{ display: 'none' }}
                        id="profile-picture-upload"
                        onChange={handleFileUpload}
                    />
                    <label htmlFor="profile-picture-upload">
                        <Button variant="contained" color="primary" component="span">
                            Change Profile Picture
                        </Button>
                    </label>
                </Box>
            </Box>
        </Container>
    )

}

export default Settings;