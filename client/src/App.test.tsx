import React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

jest.mock('./services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('./services/authService', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn(),
    isAuthenticated: false,
  }),
}));

beforeAll(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }),
    });
  }
});

test('renders app root', () => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  act(() => {
    root.render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
  });

  root.unmount();
  container.remove();
});
