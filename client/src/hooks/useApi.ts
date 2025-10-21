import { useState, useEffect } from 'react';
import { appApi, authApi, walletApi, ocrApi, type User, type Wallet, type Transaction, type OCRJob } from '../api';

// Generic API hook for handling loading states and errors
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('API call failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

// App-specific hooks

export function useHealthCheck() {
  return useApi(() => appApi.health());
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authApi.isAuthenticated()) {
          const result = await authApi.me();
          setUser(result.user);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        authApi.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authApi.login({ email, password });
      authApi.storeTokens(result.access_token, result.refresh_token);
      setUser(result.user);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authApi.register({ email, password, name });
      authApi.storeTokens(result.access_token, result.refresh_token);
      setUser(result.user);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}

export function useWallets() {
  return useApi<Wallet[]>(() => walletApi.getWallets());
}

export function useWallet(id: string) {
  return useApi<Wallet>(() => walletApi.getWallet(id), [id]);
}

export function useTransactions(walletId: string) {
  return useApi<Transaction[]>(() => walletApi.getTransactions(walletId), [walletId]);
}

export function useOCRJobs() {
  return useApi<OCRJob[]>(() => ocrApi.getJobs());
}