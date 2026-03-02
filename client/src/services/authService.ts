import { useState, useEffect } from 'react';
import { apiClient } from './apiClient';

export interface User {
  id: number;
  email: string;
  name: string;
  profile_image_url: string | null;
  created_at: string;
}

interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

const storeTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const authApi = {
  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', { email, password, name });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<{ user: User }>('/auth/me');
    return data.user;
  },

  logout: clearTokens,
  isAuthenticated: () => !!localStorage.getItem('access_token'),
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    const result = await authApi.login(email, password);
    storeTokens(result.access_token, result.refresh_token);
    setUser(result.user);
  };

  const register = async (email: string, password: string, name: string) => {
    setError(null);
    const result = await authApi.register(email, password, name);
    storeTokens(result.access_token, result.refresh_token);
    setUser(result.user);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const updateUser = (updated: Partial<User>) =>
    setUser((prev) => (prev ? { ...prev, ...updated } : prev));

  return { user, loading, error, login, register, logout, updateUser, isAuthenticated: !!user };
}