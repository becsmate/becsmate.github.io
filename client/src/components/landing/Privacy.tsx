import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

interface PrivacyProps {
  open: boolean;
  onClose: () => void;
}

export default function PrivacyDialog({ open, onClose }: PrivacyProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Privacy Policy</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1">
            <strong>1. Data Collection</strong><br />
            We collect information you provide directly to us, such as your email address, name, and securely hashed passwords when creating an account. We also collect the receipt images you upload to the platform to provide our OCR features.
          </Typography>
          <Typography variant="body1">
            <strong>2. How We Use Your Data</strong><br />
            Your uploaded receipts are processed to extract financial information (such as merchant name, date, and amount) to help you track your expenses automatically. The extracted data is stored securely in our database and linked only to your account or your shared wallets.
          </Typography>
          <Typography variant="body1">
            <strong>3. Third-Party Services</strong><br />
            To provide accurate data extraction, we use external AI and OCR providers (like Azure Document Intelligence and Groq). Receipt images and text are temporarily processed by these services strictly to digitize your uploads and are not used to train generic AI models or shared with unauthorized third parties.
          </Typography>
          <Typography variant="body1">
            <strong>4. Data Security</strong><br />
            We implement industry-standard security measures to protect your personal and financial information. Our communication uses secure protocols (HTTPS), and authentication tokens (JWT) manage your access.
          </Typography>
          <Typography variant="body1">
            <strong>5. Your Rights</strong><br />
            You have the right to access, modify, or delete your personal data. You can manage your information and delete your transactions or wallets at any time through the application interface.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" sx={{ textTransform: 'none', fontWeight: 700 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}