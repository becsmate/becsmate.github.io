/**
 * Wallet and transaction API services
 */
import { apiClient } from './client';

export interface Wallet {
  id: string;
  name: string;
  type: 'personal' | 'group';
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WalletMember {
  id: string;
  wallet_id: string;
  user_id: string;
  role: 'owner' | 'member';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  amount: number;
  description?: string;
  category?: string;
  date: string;
  created_by: string;
  original_image_url?: string;
  ocr_raw_text?: string;
  ocr_confidence?: number;
  is_auto_categorized: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWalletRequest {
  name: string;
  type?: 'personal' | 'group';
}

export interface CreateTransactionRequest {
  wallet_id: string;
  amount: number;
  description?: string;
  category?: string;
  date: string;
}

export interface UpdateTransactionRequest {
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
}

export const walletApi = {
  /**
   * Get all wallets for the current user
   */
  getWallets: async (): Promise<Wallet[]> => {
    const response = await apiClient.get<Wallet[]>('/wallets');
    return response.data;
  },

  /**
   * Get a specific wallet by ID
   */
  getWallet: async (id: string): Promise<Wallet> => {
    const response = await apiClient.get<Wallet>(`/wallets/${id}`);
    return response.data;
  },

  /**
   * Create a new wallet
   */
  createWallet: async (data: CreateWalletRequest): Promise<Wallet> => {
    const response = await apiClient.post<Wallet>('/wallets', data);
    return response.data;
  },

  /**
   * Update a wallet
   */
  updateWallet: async (id: string, data: Partial<CreateWalletRequest>): Promise<Wallet> => {
    const response = await apiClient.put<Wallet>(`/wallets/${id}`, data);
    return response.data;
  },

  /**
   * Delete a wallet
   */
  deleteWallet: async (id: string): Promise<void> => {
    await apiClient.delete(`/wallets/${id}`);
  },

  /**
   * Get transactions for a wallet
   */
  getTransactions: async (walletId: string): Promise<Transaction[]> => {
    const response = await apiClient.get<Transaction[]>(`/wallets/${walletId}/transactions`);
    return response.data;
  },

  /**
   * Create a new transaction
   */
  createTransaction: async (data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>('/transactions', data);
    return response.data;
  },

  /**
   * Update a transaction
   */
  updateTransaction: async (id: string, data: UpdateTransactionRequest): Promise<Transaction> => {
    const response = await apiClient.put<Transaction>(`/transactions/${id}`, data);
    return response.data;
  },

  /**
   * Delete a transaction
   */
  deleteTransaction: async (id: string): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`);
  },
};