import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './apiClient';

export interface Wallet {
  id: string;
  name: string;
  type: 'personal' | 'group';
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  description: string | null;
  merchant_name: string | null;
  original_image_url: string | null;
  ocr_raw_text: string | null;
  created_by: string;
  created_at: string;
}

export interface TransactionFilters {
  category?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  sort_by?: 'date' | 'amount' | 'category';
  order?: 'asc' | 'desc';
}

export interface CreateTransactionRequest {
  amount: number;
  currency?: string;
  category: string;
  date: string;
  description?: string;
  merchant_name?: string;
  original_image_url?: string;
  ocr_raw_text?: string;
}

export const walletApi = {
  getWallets: async (): Promise<Wallet[]> => {
    const { data } = await apiClient.get<{ wallets: Wallet[] }>('/wallets');
    return data.wallets;
  },

  getWallet: async (id: string): Promise<Wallet> => {
    const { data } = await apiClient.get<{ wallet: Wallet }>(`/wallets/${id}`);
    return data.wallet;
  },

  createWallet: async (name: string, type: 'personal' | 'group' = 'personal'): Promise<Wallet> => {
    const { data } = await apiClient.post<{ wallet: Wallet }>('/wallets', { name, type });
    return data.wallet;
  },

  updateWallet: async (id: string, payload: { name?: string; type?: 'personal' | 'group' }): Promise<Wallet> => {
    const { data } = await apiClient.patch<{ wallet: Wallet }>(`/wallets/${id}`, payload);
    return data.wallet;
  },

  deleteWallet: async (id: string): Promise<void> => {
    await apiClient.delete(`/wallets/${id}`);
  },

  getTransactions: async (walletId: string, filters?: TransactionFilters): Promise<Transaction[]> => {
    const { data } = await apiClient.get<{ transactions: Transaction[] }>(
      `/wallets/${walletId}/transactions`,
      { params: filters }
    );
    return data.transactions;
  },

  createTransaction: async (walletId: string, payload: CreateTransactionRequest): Promise<Transaction> => {
    const { data } = await apiClient.post<{ transaction: Transaction }>(
      `/wallets/${walletId}/transactions`,
      payload
    );
    return data.transaction;
  },

  updateTransaction: async (
    walletId: string,
    transactionId: string,
    payload: Partial<CreateTransactionRequest>
  ): Promise<Transaction> => {
    const { data } = await apiClient.patch<{ transaction: Transaction }>(
      `/wallets/${walletId}/transactions/${transactionId}`,
      payload
    );
    return data.transaction;
  },

  deleteTransaction: async (walletId: string, transactionId: string): Promise<void> => {
    await apiClient.delete(`/wallets/${walletId}/transactions/${transactionId}`);
  },
};

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setWallets(await walletApi.getWallets());
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { wallets, loading, error, refetch: fetch };
}

export function useTransactions(walletId: string, filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setTransactions(await walletApi.getTransactions(walletId, filters));
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [walletId, JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { transactions, loading, error, refetch: fetch };
}