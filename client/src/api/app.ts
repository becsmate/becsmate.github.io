/**
 * General API services for app information and health checks
 */
import { apiClient } from './client';

export interface AboutData {
  name: string;
  description: string;
  tech_stack: string[];
}

export interface HealthData {
  status: string;
  message: string;
  version: string;
  port: string;
}

export const appApi = {
  /**
   * Get application health status
   */
  health: async (): Promise<HealthData> => {
    const response = await apiClient.get<HealthData>('/health');
    return response.data;
  },

  /**
   * Get application about information
   */
};