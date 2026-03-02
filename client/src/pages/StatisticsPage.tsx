import React, { useState } from 'react';
import {
  Container, Typography, Box, FormControl, InputLabel, Select, MenuItem,
  Grid, Paper, CircularProgress, Alert,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useWallets } from '../services/walletService';
import { useStatistics } from '../services/statisticsService';
import { formatCurrency } from '../utils';

const PIE_COLORS = ['#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0', '#0288d1', '#757575'];

export default function StatisticsPage() {
  const { wallets } = useWallets();
  const [walletId, setWalletId] = useState<string | ''>('');
  const { summary, monthly, categories, loading, error } = useStatistics(walletId || (''));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>Statistics</Typography>

      <FormControl sx={{ mb: 4, minWidth: 220 }}>
        <InputLabel>Select wallet</InputLabel>
        <Select label="Select wallet" value={walletId} onChange={(e) => setWalletId(e.target.value)}>
          {wallets.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
        </Select>
      </FormControl>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Balance', value: summary.total },
            { label: 'Income', value: summary.income },
            { label: 'Expenses', value: summary.expenses },
          ].map(({ label, value }) => (
            <Grid item xs={12} sm={4} key={label}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">{label}</Typography>
                <Typography variant="h5" fontWeight={700} color={value < 0 ? 'error.main' : 'success.main'}>
                  {formatCurrency(value)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {monthly.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Monthly Totals</Typography>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="total" fill="#1976d2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {categories.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Spending by Category</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categories} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={110} label={({ category }) => category}>
                {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {walletId && !loading && !summary && (
        <Typography color="text.secondary">No data yet for this wallet.</Typography>
      )}
    </Container>
  );
}