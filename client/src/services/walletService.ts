import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './apiClient';

export interface Wallet {
  id: string;
  name: string;
  type: 'personal' | 'group';
  owner_id: string;
  is_owner?: boolean;
  balance?: number;
  member_count?: number;
  created_at: string;
  updated_at: string;
}

export interface WalletMember {
  id: string;
  email: string;
  name: string;
  profile_image_url: string | null;
  created_at: string;
  role: 'owner' | 'member';
}

export interface WalletInvitation {
  id: string;
  wallet_id: string;
  invited_user_id: string;
  invited_by_user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  wallet?: {
    id: string;
    name: string;
    type: 'personal' | 'group';
  } | null;
  invited_by?: {
    id: string;
    name: string;
    email: string;
  } | null;
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

  getWalletMembers: async (walletId: string): Promise<WalletMember[]> => {
    const { data } = await apiClient.get<{ members: WalletMember[] }>(`/wallets/${walletId}/members`);
    return data.members;
  },

  inviteMember: async (walletId: string, email: string): Promise<void> => {
    await apiClient.post(`/wallets/${walletId}/members`, { email });
  },

  removeMember: async (walletId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/wallets/${walletId}/members/${memberId}`);
  },

  getInvitations: async (
    status: 'pending' | 'accepted' | 'declined' | 'all' = 'pending'
  ): Promise<WalletInvitation[]> => {
    const { data } = await apiClient.get<{ invitations: WalletInvitation[] }>(
      '/wallets/invitations',
      { params: { status } }
    );
    return data.invitations;
  },

  acceptInvitation: async (invitationId: string): Promise<void> => {
    await apiClient.post(`/wallets/invitations/${invitationId}/accept`);
  },

  declineInvitation: async (invitationId: string): Promise<void> => {
    await apiClient.post(`/wallets/invitations/${invitationId}/decline`);
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

export function useWalletInvitations(
  status: 'pending' | 'accepted' | 'declined' | 'all' = 'pending',
  enabled = true
) {
  const [invitations, setInvitations] = useState<WalletInvitation[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setInvitations(await walletApi.getInvitations(status));
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  }, [status, enabled]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { invitations, loading, error, refetch: fetch };
}

export function useWalletMembers(walletId: string, enabled = true) {
  const [members, setMembers] = useState<WalletMember[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setMembers(await walletApi.getWalletMembers(walletId));
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Failed to load wallet members');
    } finally {
      setLoading(false);
    }
  }, [walletId, enabled]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { members, loading, error, refetch: fetch };
}