import { useState } from 'react';
import { apiClient } from './apiClient';

export interface ParsedReceiptData {
  merchant: string | null;
  total_amount: number | null;
  date: string | null;
  currency: string | null;
  tax_amount: number | null;
  items: Array<{ name: string; price: number | null }>;
}

export interface OCRResult {
  success: boolean;
  ocr_text?: string;
  parsed_data?: ParsedReceiptData;
  provider?: string;
  error?: string;
}

export interface OCRJob {
  id: number;
  user_id: number;
  image_path: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  raw_text: string | null;
  extracted_data: ParsedReceiptData | null;
  created_at: string;
  completed_at: string | null;
}

export interface ConfirmReceiptRequest {
  wallet_id: number;
  amount: number;
  currency?: string;
  category: string;
  date: string;
  merchant_name?: string;
  description?: string;
  original_image_url?: string;
  ocr_raw_text?: string;
  job_id?: number;
}

export const ocrApi = {
  process: async (file: File): Promise<{ job: OCRJob }> => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await apiClient.post<{ job: OCRJob }>('/ocr/process', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  getJobs: async (): Promise<OCRJob[]> => {
    const { data } = await apiClient.get<{ jobs: OCRJob[] }>('/ocr/jobs');
    return data.jobs;
  },

  getJob: async (id: number): Promise<OCRJob> => {
    const { data } = await apiClient.get<{ job: OCRJob }>(`/ocr/jobs/${id}`);
    return data.job;
  },

  deleteJob: async (id: number): Promise<void> => {
    await apiClient.delete(`/ocr/jobs/${id}`);
  },

  confirm: async (payload: ConfirmReceiptRequest) => {
    const { data } = await apiClient.post('/ocr/confirm', payload);
    return data;
  },

  uploadProfilePicture: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await apiClient.post<{ image_url: string }>(
      '/users/profile-picture',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data.image_url;
  },
};

export function useOCR() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<OCRJob | null>(null);

  const processFile = async (file: File): Promise<OCRJob | null> => {
    setError(null);
    setLoading(true);
    try {
      const result = await ocrApi.process(file);
      setJob(result.job);
      return result.job;
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'OCR processing failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { processFile, job, loading, error };
}