import React, { useState } from 'react';
import {
  Container, Typography, Box, Button, Card, CardContent, CardHeader,
  Table, TableBody, TableCell, TableHead, TableRow, TextField,
  Select, MenuItem, FormControl, InputLabel, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useWallets, walletApi, useTransactions, type TransactionFilters } from '../services/walletService';
import { formatCurrency, formatDate } from '../utils';
import { useAuthContext } from '../contexts/AuthContext';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Other'];

function TransactionTable({ walletId }: { walletId: number }) {
  const [filters, setFilters] = useState<TransactionFilters>({ sort_by: 'date', order: 'desc' });
  const { transactions, loading, error } = useTransactions(walletId, filters);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Category</InputLabel>
          <Select label="Category" value={filters.category ?? ''} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value || undefined }))}>
            <MenuItem value="">All</MenuItem>
            {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField size="small" label="From" type="date" InputLabelProps={{ shrink: true }} onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value || undefined }))} />
        <TextField size="small" label="To" type="date" InputLabelProps={{ shrink: true }} onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value || undefined }))} />
        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Sort</InputLabel>
          <Select label="Sort" value={filters.sort_by ?? 'date'} onChange={(e) => setFilters((f) => ({ ...f, sort_by: e.target.value as any }))}>
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="amount">Amount</MenuItem>
            <MenuItem value="category">Category</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 90 }}>
          <InputLabel>Order</InputLabel>
          <Select label="Order" value={filters.order ?? 'desc'} onChange={(e) => setFilters((f) => ({ ...f, order: e.target.value as any }))}>
            <MenuItem value="desc">Desc</MenuItem>
            <MenuItem value="asc">Asc</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading && <CircularProgress size={24} />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Merchant</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center">No transactions yet</TableCell></TableRow>
            )}
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{formatDate(t.date)}</TableCell>
                <TableCell>{t.merchant_name ?? t.description ?? '—'}</TableCell>
                <TableCell><Chip label={t.category} size="small" /></TableCell>
                <TableCell align="right" sx={{ color: t.amount < 0 ? 'error.main' : 'success.main' }}>
                  {formatCurrency(t.amount, t.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

export default function Dashboard() {
  const { user } = useAuthContext();
  const { wallets, loading, error, refetch } = useWallets();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'personal' | 'group'>('personal');
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return setCreateError('Name is required');
    try {
      await walletApi.createWallet(newName.trim(), newType);
      setCreateOpen(false);
      setNewName('');
      setCreateError(null);
      refetch();
    } catch (e: any) {
      setCreateError(e.response?.data?.error ?? 'Failed to create wallet');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Welcome, {user?.name}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
          New Wallet
        </Button>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && wallets.length === 0 && (
        <Typography color="text.secondary">No wallets yet. Create one to get started.</Typography>
      )}

      {wallets.map((wallet) => (
        <Card key={wallet.id} sx={{ mb: 3 }}>
          <CardHeader
            title={wallet.name}
            subheader={wallet.type === 'group' ? 'Group wallet' : 'Personal wallet'}
          />
          <CardContent>
            <TransactionTable walletId={wallet.id} />
          </CardContent>
        </Card>
      ))}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New Wallet</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {createError && <Alert severity="error">{createError}</Alert>}
          <TextField label="Wallet name" value={newName} onChange={(e) => setNewName(e.target.value)} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={newType} onChange={(e) => setNewType(e.target.value as any)}>
              <MenuItem value="personal">Personal</MenuItem>
              <MenuItem value="group">Group</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}