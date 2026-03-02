import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './apiClient';

export interface Wallet {
  id: number;
  name: string;
  type: 'personal' | 'group';
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  wallet_id: number;
  amount: number;
  currency: string;
  category: string;
  date: string;
  description: string | null;
  merchant_name: string | null;
  original_image_url: string | null;
  ocr_raw_text: string | null;
  created_by: number;
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

  getWallet: async (id: number): Promise<Wallet> => {
    const { data } = await apiClient.get<{ wallet: Wallet }>(`/wallets/${id}`);
    return data.wallet;
  },

  createWallet: async (name: string, type: 'personal' | 'group' = 'personal'): Promise<Wallet> => {
    const { data } = await apiClient.post<{ wallet: Wallet }>('/wallets', { name, type });
    return data.wallet;
  },

  updateWallet: async (id: number, payload: { name?: string; type?: 'personal' | 'group' }): Promise<Wallet> => {
    const { data } = await apiClient.patch<{ wallet: Wallet }>(`/wallets/${id}`, payload);
    return data.wallet;
  },

  deleteWallet: async (id: number): Promise<void> => {
    await apiClient.delete(`/wallets/${id}`);
  },

  getTransactions: async (walletId: number, filters?: TransactionFilters): Promise<Transaction[]> => {
    const { data } = await apiClient.get<{ transactions: Transaction[] }>(
      `/wallets/${walletId}/transactions`,
      { params: filters }
    );
    return data.transactions;
  },

  createTransaction: async (walletId: number, payload: CreateTransactionRequest): Promise<Transaction> => {
    const { data } = await apiClient.post<{ transaction: Transaction }>(
      `/wallets/${walletId}/transactions`,
      payload
    );
    return data.transaction;
  },

  updateTransaction: async (
    walletId: number,
    transactionId: number,
    payload: Partial<CreateTransactionRequest>
  ): Promise<Transaction> => {
    const { data } = await apiClient.patch<{ transaction: Transaction }>(
      `/wallets/${walletId}/transactions/${transactionId}`,
      payload
    );
    return data.transaction;
  },

  deleteTransaction: async (walletId: number, transactionId: number): Promise<void> => {
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

export function useTransactions(walletId: number, filters?: TransactionFilters) {
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