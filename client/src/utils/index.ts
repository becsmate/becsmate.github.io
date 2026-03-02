export const formatCurrency = (amount: number, currency = 'HUF'): string =>
  new Intl.NumberFormat('hu-HU', { style: 'currency', currency }).format(amount);

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' });

export const formatDateForInput = (dateStr: string): string =>
  new Date(dateStr).toISOString().split('T')[0];

export const isImageFile = (file: File): boolean =>
  ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const e = err as any;
    return e.response?.data?.error ?? 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};

export const debounce = <T extends (...args: any[]) => void>(fn: T, ms: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};