import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import { AccountBalanceWallet, BarChart, CameraAlt } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: <AccountBalanceWallet fontSize="large" />, title: 'Wallet Management', desc: 'Create personal or group wallets and track every forint.' },
  { icon: <CameraAlt fontSize="large" />, title: 'OCR Receipt Scanning', desc: 'Photograph a receipt and let AI extract the data automatically.' },
  { icon: <BarChart fontSize="large" />, title: 'Statistics', desc: 'Monthly trends and category breakdowns visualised as charts.' },
];

export default function LandingPage() {
  return (
    <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>Finance Tracker</Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Take control of your finances — track spending, scan receipts and visualise your habits.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 8 }}>
        <Button component={Link} to="/login" variant="contained" size="large">Get Started</Button>
        <Button component={Link} to="/login" variant="outlined" size="large">Sign In</Button>
      </Box>
      <Grid container spacing={3}>
        {FEATURES.map((f) => (
          <Grid item xs={12} md={4} key={f.title}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ color: 'primary.main', mb: 1 }}>{f.icon}</Box>
              <Typography variant="h6" gutterBottom>{f.title}</Typography>
              <Typography color="text.secondary">{f.desc}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}