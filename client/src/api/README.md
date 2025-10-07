# Frontend API Structure

This directory contains all API-related functionality for the React frontend application.

## Structure

```
api/
├── index.ts        # Main exports and type re-exports
├── client.ts       # Base axios client with interceptors
├── auth.ts         # Authentication API services
├── app.ts          # General app info API services
├── wallet.ts       # Wallet and transaction API services
└── ocr.ts          # OCR processing API services
```

## Usage

### Basic API Calls

```typescript
import { appApi, authApi, walletApi } from './api';

// Get app information
const aboutData = await appApi.about();

// Login user
const result = await authApi.login({ email, password });

// Get user's wallets
const wallets = await walletApi.getWallets();
```

### Using Custom Hooks

```typescript
import { useAboutData, useAuth, useWallets } from './hooks/useApi';

function MyComponent() {
  const { data: aboutData, loading, error } = useAboutData();
  const { user, login, logout } = useAuth();
  const { data: wallets } = useWallets();
  
  // Component logic...
}
```

### Authentication Context

```typescript
import { AuthProvider, useAuthContext } from './contexts/AuthContext';

// Wrap your app
function App() {
  return (
    <AuthProvider>
      <YourAppContent />
    </AuthProvider>
  );
}

// Use in components
function SomeComponent() {
  const { user, isAuthenticated, logout } = useAuthContext();
  // Component logic...
}
```

## Features

### Automatic Token Management
- Access tokens are automatically added to requests
- Refresh tokens are handled automatically on 401 responses
- Tokens are stored in localStorage

### Error Handling
- Centralized error handling in API client
- Custom hooks provide loading and error states
- Utility functions for error message extraction

### Type Safety
- Full TypeScript support for all API calls
- Type definitions for all request/response objects
- Properly typed custom hooks

## Available Services

### Authentication (`authApi`)
- `register(data)` - Register new user
- `login(data)` - Login user
- `refresh()` - Refresh access token
- `me()` - Get current user profile
- `logout()` - Clear local tokens
- `isAuthenticated()` - Check auth status
- `storeTokens()` - Store auth tokens

### App Info (`appApi`)
- `health()` - Get app health status
- `about()` - Get app information

### Wallets (`walletApi`)
- `getWallets()` - Get user's wallets
- `getWallet(id)` - Get specific wallet
- `createWallet(data)` - Create new wallet
- `updateWallet(id, data)` - Update wallet
- `deleteWallet(id)` - Delete wallet
- `getTransactions(walletId)` - Get wallet transactions
- `createTransaction(data)` - Create transaction
- `updateTransaction(id, data)` - Update transaction
- `deleteTransaction(id)` - Delete transaction

### OCR (`ocrApi`)
- `createJob(data)` - Upload image for OCR
- `getJob(id)` - Get OCR job status
- `getJobs()` - Get all user's OCR jobs
- `deleteJob(id)` - Delete OCR job

## Custom Hooks

### `useApi<T>(apiCall, dependencies)`
Generic hook for any API call with loading/error states.

### `useAboutData()`
Fetch and cache app about information.

### `useAuth()`
Complete authentication management with login/register/logout.

### `useWallets()`
Fetch user's wallets.

### `useWallet(id)`
Fetch specific wallet by ID.

### `useTransactions(walletId)`
Fetch transactions for a wallet.

### `useOCRJobs()`
Fetch user's OCR jobs.

## Utilities

### Error Handling
```typescript
import { getErrorMessage } from './utils';

try {
  await someApiCall();
} catch (error) {
  const message = getErrorMessage(error);
  // Handle error...
}
```

### Formatting
```typescript
import { formatCurrency, formatDate } from './utils';

const price = formatCurrency(123.45); // "$123.45"
const date = formatDate(new Date()); // "Oct 7, 2025"
```

### Validation
```typescript
import { isValidEmail, isImageFile } from './utils';

const valid = isValidEmail("user@example.com"); // true
const isImage = isImageFile(file); // true/false
```