/**
 * OCR (Optical Character Recognition) API services
 */
import { apiClient } from './client';
import { OCRResult } from '../types/ocr';

export interface OCRJob {
  id: string;
  user_id: string;
  image_path: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  raw_text?: string;
  extracted_data?: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOCRJobRequest {
  image: File;
}

export const ocrApi = {
  /**
   * Direct one-off OCR processing for a single uploaded file.
   * Matches backend POST /api/process-file expecting 'file' form field.
   */
  processFile: async (file: File): Promise<OCRResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<OCRResult>('/process-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  /**
   * Upload an image for OCR processing
   */
  createJob: async (data: CreateOCRJobRequest): Promise<OCRJob> => {
    const formData = new FormData();
    formData.append('image', data.image);

    const response = await apiClient.post<OCRJob>('/ocr/jobs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Get OCR job status and results
   */
  getJob: async (id: string): Promise<OCRJob> => {
    const response = await apiClient.get<OCRJob>(`/ocr/jobs/${id}`);
    return response.data;
  },

  /**
   * Get all OCR jobs for the current user
   */
  getJobs: async (): Promise<OCRJob[]> => {
    const response = await apiClient.get<OCRJob[]>('/ocr/jobs');
    return response.data;
  },

  /**
   * Delete an OCR job
   */
  deleteJob: async (id: string): Promise<void> => {
    await apiClient.delete(`/ocr/jobs/${id}`);
  },
};