import { authApi } from './authService';
import { apiClient } from './apiClient';

jest.mock('./apiClient', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('Auth Service Tests', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@financeai.com',
    name: 'John Doe',
    profile_image_url: null,
    created_at: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('authApi.login', () => {
    it('calls the correct endpoint and returns auth response', async () => {
      const mockResponse = { data: { user: mockUser, access_token: 'access-123', refresh_token: 'refresh-123' } };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authApi.login('test@financeai.com', 'password123');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@financeai.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('authApi.me', () => {
    it('fetches current user profile from /auth/me', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: { user: mockUser } });

      const result = await authApi.me();
      
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('Tokens & Authentication State', () => {
    it('clears tokens appropriately upon logout', () => {
      localStorage.setItem('access_token', 'temp-access');
      localStorage.setItem('refresh_token', 'temp-refresh');
      
      authApi.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });

    it('correctly reports authenticated status based on local storage', () => {
      expect(authApi.isAuthenticated()).toBe(false);
      localStorage.setItem('access_token', 'test-token');
      expect(authApi.isAuthenticated()).toBe(true);
    });
  });
});
