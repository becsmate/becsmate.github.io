import React, { useState } from 'react';
import {
  Container, Typography, Box, Button, Paper, TextField, Alert,
  CircularProgress, Select, MenuItem, FormControl, InputLabel, Divider,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useOCR, ocrApi, type OCRJob } from '../services/ocrService';
import { useWallets } from '../services/walletService';
import { formatDate } from '../utils';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Other'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function OCRPage() {
  const { processFile, loading, error } = useOCR();
  const { wallets } = useWallets();

  const [job, setJob] = useState<OCRJob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Other');
  const [walletId, setWalletId] = useState<string | ''>('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    setJob(null);
    setConfirmed(false);

    if (file.size > MAX_FILE_SIZE) return setFileError('File must be under 5 MB');
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type))
      return setFileError('Allowed types: jpg, png, pdf');

    setPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);

    const result = await processFile(file);
    if (result?.extracted_data) {
      const d = result.extracted_data;
      setMerchant(d.merchant ?? '');
      setAmount(d.total_amount != null ? String(d.total_amount) : '');
      setDate(d.date ?? '');
    }
    setJob(result);
  };

  const handleConfirm = async () => {
    if (!walletId) return setConfirmError('Select a wallet');
    if (!amount || isNaN(Number(amount))) return setConfirmError('Enter a valid amount');
    if (!date) return setConfirmError('Date is required');
    setConfirmError(null);

    try {
      await ocrApi.confirm({
        wallet_id: walletId,
        amount: Number(amount),
        category,
        date,
        merchant_name: merchant || undefined,
        ocr_raw_text: job?.raw_text ?? undefined,
        job_id: job?.id,
      });
      setConfirmed(true);
    } catch (e: any) {
      setConfirmError(e.response?.data?.error ?? 'Failed to save transaction');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>Scan Receipt</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Button component="label" variant="outlined" startIcon={<CloudUpload />} fullWidth>
          Choose file (jpg, png, pdf — max 5 MB)
          <input type="file" hidden accept="image/jpeg,image/png,application/pdf" onChange={handleFile} />
        </Button>
        {fileError && <Alert severity="error" sx={{ mt: 1 }}>{fileError}</Alert>}
        {preview && <Box component="img" src={preview} alt="preview" sx={{ mt: 2, maxWidth: '100%', maxHeight: 300, display: 'block', mx: 'auto' }} />}
        {loading && <Box sx={{ mt: 2, textAlign: 'center' }}><CircularProgress size={28} /><Typography variant="body2" sx={{ mt: 1 }}>Processing…</Typography></Box>}
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      </Paper>

      {job && !confirmed && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Review & Confirm</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} fullWidth />
            <TextField label="Amount (HUF)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} fullWidth required />
            <TextField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth required />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Wallet</InputLabel>
              <Select label="Wallet" value={walletId} onChange={(e) => setWalletId(e.target.value)}>
                {wallets.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
              </Select>
            </FormControl>

            {job.raw_text && (
              <>
                <Divider />
                <Typography variant="caption" color="text.secondary">Raw OCR text</Typography>
                <Box component="pre" sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1, fontSize: 12, maxHeight: 150, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                  {job.raw_text}
                </Box>
              </>
            )}

            {confirmError && <Alert severity="error">{confirmError}</Alert>}
            <Button variant="contained" size="large" onClick={handleConfirm}>Save Transaction</Button>
          </Box>
        </Paper>
      )}

      {confirmed && <Alert severity="success" sx={{ mt: 2 }}>Transaction saved successfully!</Alert>}
    </Container>
  );
}