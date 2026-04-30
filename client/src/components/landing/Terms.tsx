import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

interface TermsProps {
  open: boolean;
  onClose: () => void;
}

export default function TermsDialog({ open, onClose }: TermsProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Terms of Service</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1">
            <strong>1. Acceptance of Terms</strong><br />
            By accessing and using FinanceAI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
          </Typography>
          <Typography variant="body1">
            <strong>2. Description of Service</strong><br />
            FinanceAI provides an AI-powered expense tracking and receipt scanning service. We utilize Optical Character Recognition (OCR) and large language models to process your uploaded receipts and extract financial data.
          </Typography>
          <Typography variant="body1">
            <strong>3. User Responsibilities</strong><br />
            You are responsible for maintaining the confidentiality of your account credentials. You agree that the documents and images you upload do not violate any third-party rights or applicable laws.
          </Typography>
          <Typography variant="body1">
            <strong>4. Data and Artificial Intelligence</strong><br />
            Our OCR and data extraction processes utilize third-party AI services. By uploading a receipt, you grant us permission to process the receipt image through these services for the sole purpose of extracting data for your account.
          </Typography>
          <Typography variant="body1">
            <strong>5. Limitation of Liability</strong><br />
            FinanceAI is provided "as is". We make no warranties regarding the absolute accuracy of the AI-extracted data. Users are responsible for reviewing and verifying all extracted financial information before saving.
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