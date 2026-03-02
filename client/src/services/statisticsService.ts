import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './apiClient';

export interface WalletSummary {
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
  getSummary: async (walletId: number): Promise<WalletSummary> => {
    const { data } = await apiClient.get<WalletSummary>(`/statistics/${walletId}/summary`);
    return data;
  },

  getMonthly: async (walletId: number): Promise<MonthlyData[]> => {
    const { data } = await apiClient.get<{ monthly: MonthlyData[] }>(`/statistics/${walletId}/monthly`);
    return data.monthly;
  },

  getCategories: async (walletId: number): Promise<CategoryData[]> => {
    const { data } = await apiClient.get<{ categories: CategoryData[] }>(`/statistics/${walletId}/categories`);
    return data.categories;
  },
};

export function useStatistics(walletId: number | null) {
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!walletId) return;
    setLoading(true);
    setError(null);
    try {
      const [s, m, c] = await Promise.all([
        statisticsApi.getSummary(walletId),
        statisticsApi.getMonthly(walletId),
        statisticsApi.getCategories(walletId),
      ]);
      setSummary(s);
      setMonthly(m);
      setCategories(c);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [walletId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { summary, monthly, categories, loading, error, refetch: fetch };
}