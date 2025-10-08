import { useState } from 'react';
import { OCRResult } from '../types/ocr';
import { ocrApi } from '../api/ocr';

export const useOCR = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractText = async (imageFile: File): Promise<OCRResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await ocrApi.processFile(imageFile);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { extractText, loading, error };
};