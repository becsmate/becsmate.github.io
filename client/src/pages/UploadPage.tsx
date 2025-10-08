import React, { useState } from "react";
import { Box } from "@mui/material";
import { OCRResult } from "../types/ocr";
import OCRUpload from "../components/OCR/OCRUpload";
import ReceiptDisplay from "../components/OCR/ReceiptDisplay";

const ReceiptUpload: React.FC = () => {
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

  const handleOCRComplete = (result: OCRResult) => {
    setOcrResult(result);
  };

  return (
    <Box className="app" sx={{ textAlign: 'center', my: 2 }}>
      <Box className="app-header" sx={{ mb: 4 }}>
        <h1>🧾 Receipt Scanner</h1>
        <p>Upload a receipt to automatically extract transaction data</p>
      </Box>

      <Box className="app-main">
        <OCRUpload onResult={handleOCRComplete} />

        {ocrResult && <ReceiptDisplay result={ocrResult} />}
      </Box>
    </Box>
  );
};

export default ReceiptUpload;
