import React, { useState } from 'react';
import {
  Container, Typography, Box, FormControl, InputLabel, Select, MenuItem,
  Grid, Paper, CircularProgress, Alert, Divider
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Summary, useStatistics } from '../services/statisticsService';
import { useWallets } from '../services/walletService';
import { formatCurrency } from '../utils';

const PIE_COLORS = ['#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0', '#0288d1', '#757575'];

interface StatCardProps {
  label: string;
  value: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="h6" fontWeight={700} color={value < 0 ? 'error.main' : 'success.main'}>
      {formatCurrency(value)}
    </Typography>
  </Paper>
);

const SummarySection: React.FC<{ title: string; summary: Summary | null; monthlyData: any[] }> = ({ title, summary, monthlyData }) => {
  if (!summary) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 2 }}>{title}</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Balance', value: summary.total },
          { label: 'Total Income', value: summary.income },
          { label: 'Total Expenses', value: summary.expenses },
        ].map((item) => (
          <Grid item xs={12} sm={4} key={item.label}>
            <StatCard {...item} />
          </Grid>
        ))}
      </Grid>
      
      {monthlyData.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Monthly Trend ({title})</Typography>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => formatCurrency(v)} width={80} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="total" fill="#1976d2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}
    </Box>
  );
};

export default function StatisticsPage() {
  const { wallets } = useWallets();
  const [walletId, setWalletId] = useState<string>('');
  const { summary, monthly, userSummary, userMonthly, categories, loading, error } = useStatistics(walletId || null);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Statistics Dashboard</Typography>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Filter by Wallet</InputLabel>
          <Select
            label="Filter by Wallet"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
          >
            <MenuItem value=""><em>All Wallets (Global User Stats)</em></MenuItem>
            {wallets.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!loading && !error && (
        <Grid container spacing={4}>
          {/* Global User Statistics */}
          <Grid item xs={12} lg={walletId ? 6 : 12}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <SummarySection 
                title={walletId ? "Global User Stats (All Wallets)" : "Global Overview"} 
                summary={userSummary} 
                monthlyData={userMonthly} 
              />
            </Paper>
          </Grid>

          {/* Specific Wallet Statistics (Only visible if wallet selected) */}
          {walletId && summary && (
            <Grid item xs={12} lg={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%', border: '1px solid #1976d2' }}>
                 <SummarySection 
                  title={`Wallet: ${wallets.find(w => w.id === walletId)?.name || 'Selected'}`} 
                  summary={summary} 
                  monthlyData={monthly} 
                />
                
                {categories.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>Spending by Category</Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={categories}
                          dataKey="total"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ category }) => category}
                        >
                          {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {!loading && !userSummary && (
        <Alert severity="info" sx={{ mt: 2 }}>No transaction data available yet.</Alert>
      )}
    </Container>
  );
}