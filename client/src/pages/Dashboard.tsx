import React, { useState } from 'react';
import {
  Box, Container, Typography
} from '@mui/material';
import { useWallets, walletApi, useTransactions, type TransactionFilters } from '../services/walletService';
import { formatCurrency, formatDate } from '../utils';
import { useAuthContext } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, py: 4 }}>
      {/* fix for mobile later on */}
      {/* upper containers */}
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box sx={{ display: 'flex', gap: 2, py: 4, maxWidth: '75%', minWidth: '75%' }}>
          <Container sx={{ border: 1, borderColor: 'divider', borderRadius: 5, p: 3, bgcolor: 'background.paper'}}>
            <Typography sx={{ color: 'text.secondary' }}>Total Balance</Typography>
            <Typography variant="h5" color="text.primary">{formatCurrency(12345.67)}</Typography>
            <Typography sx={{ color: 'text.secondary' }}>Income minus expenses</Typography>
          </Container>
          <Container sx={{ border: 1, borderColor: 'divider', borderRadius: 5, p: 3, bgcolor: 'background.paper'}}>
            <Typography sx={{ color: 'text.secondary' }}>Monthly Income</Typography>
            <Typography variant="h5" color="text.primary">{formatCurrency(12345.67)}</Typography>
            <Typography sx={{ color: 'text.secondary' }}>Total income this month</Typography>
          </Container>
          <Container sx={{ border: 1, borderColor: 'divider', borderRadius: 5, p: 3, bgcolor: 'background.paper'}}>
            <Typography sx={{ color: 'text.secondary' }}>Monthly Spending</Typography>
            <Typography variant="h5" color="text.primary">{formatCurrency(12345.67)}</Typography>
            <Typography sx={{ color: 'text.secondary' }}>Total expenses this month</Typography>
          </Container>
          <Container sx={{ border: 1, borderColor: 'divider', borderRadius: 5, p: 3, bgcolor: 'background.paper'}}>
            <Typography sx={{ color: 'text.secondary' }}>Pending AI Scans</Typography>
            <Typography variant="h5" color="text.primary">2</Typography>
            <Typography sx={{ color: 'text.secondary' }}>Receipts processing</Typography>
          </Container>
        </Box>
      </Box>
      {/* charts */}
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
        <Box sx={{}}>
          <Container sx={{ border: 1, borderColor: 'divider', borderRadius: 5, p: 3, bgcolor: 'background.paper', mb: 4}}>
            <Typography sx={{ color: 'text.secondary' }}>Income vs Expenses</Typography>
            {/* add chart here later */}
          </Container>
          <Container sx={{ border: 1, borderColor: 'divider', borderRadius: 5, p: 3, bgcolor: 'background.paper'}}>
            <Typography sx={{ color: 'text.primary' }}>Spending by Category</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{new Date().toLocaleDateString('en-US', { month: 'long' })} breakdown</Typography>
            {/* add chart here later */}
          </Container>
        </Box>
      </Box>
      {/* Recent transactions, quic upload */}
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box>

        </Box>
      </Box>
    </Box>
)};

export default Dashboard;