import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './apiClient';

export interface Summary {
  total: number;
  income: number;
  expenses: number;
  transaction_count: number;
}

export interface MonthlyData {
  month: string;
  total: number;
}

export interface CategoryData {
  category: string;
  total: number;
}

export const statisticsApi = {
  getSummary: async (walletId: string): Promise<Summary> => {
    const { data } = await apiClient.get<Summary>(`/statistics/${walletId}/summary`);
    return data;
  },

  getMonthly: async (walletId: string): Promise<MonthlyData[]> => {
    const { data } = await apiClient.get<{ monthly: MonthlyData[] }>(`/statistics/${walletId}/monthly`);
    return data.monthly;
  },

  getCategories: async (walletId: string): Promise<CategoryData[]> => {
    const { data } = await apiClient.get<{ categories: CategoryData[] }>(`/statistics/${walletId}/categories`);
    return data.categories;
  },

  getUserSummary: async(): Promise<Summary> => {
    const { data } = await apiClient.get<Summary>('/statistics/summary');
    return data;
  },

  getUserMonthly: async(): Promise<MonthlyData[]> => {
    const { data } = await apiClient.get<{ monthly: MonthlyData[] }>('/statistics/monthly');
    return data.monthly;
  }
};

export function useStatistics(walletId: string | null) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [userSummary, setUserSummary] = useState<Summary | null>(null);
  const [userMonthly, setUserMonthly] = useState<MonthlyData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const walletRequests = walletId ? [
        statisticsApi.getSummary(walletId),
        statisticsApi.getMonthly(walletId),
        statisticsApi.getCategories(walletId),
      ] : [null, [], []];

      const [s, m, c, us, um] = await Promise.all([
        ...walletRequests,
        statisticsApi.getUserSummary(),
        statisticsApi.getUserMonthly(),
      ]);
      setSummary(s as Summary | null);
      setMonthly(m as MonthlyData[]);
      setCategories(c as CategoryData[]);
      setUserSummary(us as Summary | null);
      setUserMonthly(um as MonthlyData[]);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [walletId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { summary, monthly, userSummary, userMonthly, categories, loading, error, refetch: fetch };
}