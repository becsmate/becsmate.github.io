import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Navigation from './Navigation';
import * as authContextMod from '../../contexts/AuthContext';

jest.mock('../../services/walletService', () => ({
  useWalletInvitations: () => ({
    invitations: [],
    refetch: jest.fn(),
  }),
}));

const renderNav = (isAuthenticated: boolean, toggleDarkMode = jest.fn()) => {
  jest.spyOn(authContextMod, 'useAuthContext').mockReturnValue({
    user: isAuthenticated ? { id: '1', email: 'test@test.com', name: 'Tester', profile_image_url: null, created_at: '' } : null,
    loading: false,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn(),
    isAuthenticated: isAuthenticated,
  });
  
  return render(
    <BrowserRouter>
      <Navigation darkMode={false} toggleDarkMode={toggleDarkMode} />
    </BrowserRouter>
  );
};

describe('Navigation Component Tests', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders branding (FinanceAI)', () => {
    renderNav(false);
    expect(screen.getByText('FinanceAI')).toBeInTheDocument();
  });

  it('toggles dark mode when theme button is clicked', () => {
    const toggleMock = jest.fn();
    renderNav(false, toggleMock);
    
    // Find the button holding the LightMode/DarkMode Icon by its role or closest match
    // It's the first IconButton in the header (or you can use test IDs in real-world scenarios)
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // The theme toggle button
    
    expect(toggleMock).toHaveBeenCalledTimes(1);
  });

  it('renders specific navigation links ONLY when the user is logged in', () => {
    renderNav(true);
    
    // Checking for user-specific UI parts
    // In actual config, the wallet nav button implies logged in state.
    const walletLink = screen.getByRole('link', { name: /wallet invitations/i });
    expect(walletLink).toBeInTheDocument();
  });
  
  it('does NOT render protected elements for unauthenticated users', () => {
    renderNav(false);
    const walletLink = screen.queryByRole('link', { name: /wallet invitations/i });
    expect(walletLink).not.toBeInTheDocument();
  });
});
