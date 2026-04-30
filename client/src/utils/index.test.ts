import { formatCurrency, isValidEmail, isImageFile, getErrorMessage } from './index';

describe('Utility Functions Tests', () => {
  describe('formatCurrency', () => {
    it('formats HUF correctly', () => {
      const result = formatCurrency(15000);
      // Depending on the local environment, proper spacing is added (e.g. 15 000 HUF or 15 000 Ft)
      expect(result).toMatch(/15\s*000/);
      expect(result).toMatch(/HUF|Ft/);
    });

    it('formats USD correctly', () => {
      const result = formatCurrency(15000, 'USD');
      expect(result).toMatch(/15\s*000/);
      expect(result).toMatch(/USD/);
    });
  });

  describe('isValidEmail', () => {
    it('returns true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('returns false for invalid email addresses', () => {
      expect(isValidEmail('test@example')).toBe(false);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('isImageFile', () => {
    it('returns true for supported image MIME types', () => {
      expect(isImageFile({ type: 'image/jpeg' } as File)).toBe(true);
      expect(isImageFile({ type: 'image/png' } as File)).toBe(true);
      expect(isImageFile({ type: 'image/webp' } as File)).toBe(true);
    });

    it('returns false for unsupported MIME types', () => {
      expect(isImageFile({ type: 'application/pdf' } as File)).toBe(false);
      expect(isImageFile({ type: 'image/gif' } as File)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('extracts message from an Error object', () => {
      const err = new Error('Client-side error occurred');
      expect(getErrorMessage(err)).toBe('Client-side error occurred');
    });

    it('extracts error message from Axios-like server response', () => {
      const axiosErr = { response: { data: { error: 'Invalid credentials' } } };
      expect(getErrorMessage(axiosErr)).toBe('Invalid credentials');
    });

    it('returns a fallback message for unknown error types', () => {
      expect(getErrorMessage('Just a string error')).toBe('An unexpected error occurred');
      expect(getErrorMessage(null)).toBe('An unexpected error occurred');
    });
  });
});
