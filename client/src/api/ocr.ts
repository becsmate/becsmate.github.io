/**
 * OCR (Optical Character Recognition) API services
 */
import { apiClient } from './client';

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