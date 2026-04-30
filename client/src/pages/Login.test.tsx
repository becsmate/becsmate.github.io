import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';import '@testing-library/jest-dom';import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mivel a globális state-eket (Context) a Login oldal használja, mockoljuk (szimuláljuk) őket a teszt idejére
jest.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    login: jest.fn(),
    register: jest.fn(),
    isAuthenticated: false,
  }),
}));

describe('Login Page Component Tests', () => {
  // Segédfüggvény a tesztelt komponens Router-rel történő megjelenítéséhez
  const renderLogin = () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('renders the login form elements properly', () => {
    renderLogin();
    
    // Ellenőrizzük, hogy a főbb UI elemek a képernyőn vannak-e
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email formats', async () => {
    renderLogin();
    
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /Sign in/i });

    // Kitöltünk hibás email címmel
    fireEvent.change(emailInput, { target: { value: 'wrong-email-format' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    // Várjuk, hogy a UI-jára kitegye a hibaüzenetet a saját isValidEmail logikánk alapján
    await waitFor(() => {
      expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    });
  });

  it('shows error if password is shorter than 6 characters', async () => {
    renderLogin();
    
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /Sign in/i });

    // Kitöltünk jó emaillel, de rövid jelszóval
    fireEvent.change(emailInput, { target: { value: 'real@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitBtn);

    // Várjuk az elvárt hibaüzenetet
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });
});
