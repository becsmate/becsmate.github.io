import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import { OCRResult } from '../../types/ocr';

interface ReceiptDisplayProps {
  result: OCRResult;
}

const ReceiptDisplay: React.FC<ReceiptDisplayProps> = ({ result }) => {
  const { parsed_data, ocr_text } = result;
  const data = parsed_data?.data;

  const items: { name: string; price: number }[] = (
    data && Array.isArray((data as any).items)
      ? (data as any).items
      : []
  );
  const merchant = data?.merchant ?? '—';
  const amount = data?.total_amount;
  const date = data?.date ?? '—';
  const currency = data?.currency ?? '';

  return (
    <Box sx={{ textAlign: 'center', my: 2 }}>
      <Typography variant="h3" gutterBottom>📊 Parsed Receipt Data</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 2 }}>
        <Box>
          <Typography variant="h6">Merchant:</Typography>
          <Typography>{merchant}</Typography>
        </Box>
        <Box>
          <Typography variant="h6">Amount:</Typography>
          <Typography className="amount">
            {amount != null ? `${amount.toFixed(2)} ${currency}` : 'Not found'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6">Date:</Typography>
          <Typography>{date}</Typography>
        </Box>
      </Box>

      {items && items.length > 0 && (
        <Box sx={{ maxWidth: 400, mx: 'auto', textAlign: 'left', mb: 2 }}>
          <Typography variant="h6" gutterBottom>Items:</Typography>
          <List>
            {items.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemText primary={`${item.name} - ${item.price.toFixed(2)} ${currency}`} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>Raw OCR Text:</Typography>
        <Box
          component="pre"
          sx={{
            backgroundColor: '#9f9f9f',
            padding: 2,
            borderRadius: 1,
            maxHeight: 300,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        >
          {ocr_text}
        </Box>
      </Box>
    </Box>
  );
};

export default ReceiptDisplay;