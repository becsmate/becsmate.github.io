/**
 * Main API exports - centralized access to all API services
 */

// Re-export all API services
export { authApi } from './auth';
export { appApi } from './app';
export { walletApi } from './wallet';
export { ocrApi } from './ocr';
export { apiClient } from './client';

// Re-export types
export type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshResponse,
} from './auth';

export type {
  AboutData,
  HealthData,
} from './app';

export type {
  Wallet,
  WalletMember,
  Transaction,
  CreateWalletRequest,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from './wallet';

export type {
  OCRJob,
  CreateOCRJobRequest,
} from './ocr';