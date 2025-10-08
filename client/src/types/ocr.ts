// types/ocr.ts
export interface OCRResult {
  success: boolean;
  ocr_text: string;
  parsed_data: ParsedReceipt;
  error?: string;
}

export interface ParsedReceipt {
  data: {
    currency: string | null;
    total_amount: number | null;
    date: string;
    merchant: string;
    items?: ReceiptItem[];
    raw_text: string;
  };
}

export interface ReceiptItem {
  name: string;
  price: number;
}

export interface UseOCRReturn {
  extractText: (file: File) => Promise<OCRResult | null>;
  extractTextFromBase64: (base64: string) => Promise<OCRResult | null>;
  loading: boolean;
  error: string | null;
}