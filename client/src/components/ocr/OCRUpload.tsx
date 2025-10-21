import React, { useCallback, useState } from 'react';
import { Box, Input } from '@mui/material';
import { useOCR } from '../../hooks/useOCR';
import { OCRResult } from '../../types/ocr';

interface OCRUploadProps {
  onResult: (result: OCRResult, file: File) => void;
}

const OCRUpload: React.FC<OCRUploadProps> = ({ onResult }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const { extractText, loading, error } = useOCR();

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    const result = await extractText(file);
    if (result && (result as OCRResult).success) {
      onResult(result as OCRResult, file);
    }
  }, [extractText, onResult]);

  return (
    <Box className="ocr-upload" sx={{ textAlign: 'center', my: 2 }}>
      <Input
        type="file"
        inputProps={{ accept: 'image/*,.pdf' }}
        onChange={handleFileSelect}
        disabled={loading}
      />
      {preview && (
        <Box className="preview" sx={{ mt: 2 }}>
          <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 300 }} />
        </Box>
      )}
      {loading && <Box sx={{ mt: 2 }}>Processing image with OCR...</Box>}
      {error && <Box sx={{ mt: 2, color: 'error.main' }}>Error: {error}</Box>}
    </Box>
  );
};

export default OCRUpload;