import React, { useRef, useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

interface QuickUploadCardProps {
  onFileSelected: (file: File) => void;
  onOpenUploadPage: () => void;
}

const QuickUploadCard: React.FC<QuickUploadCardProps> = ({
  onFileSelected,
  onOpenUploadPage,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const pickFile = () => inputRef.current?.click();

  const handleFiles = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      onOpenUploadPage();
      return;
    }

    onFileSelected(file);
  };

  return (
    <Container
      sx={{
        border: "1px dashed",
        borderColor: dragActive ? "primary.main" : "divider",
        borderRadius: 5,
        p: { xs: 2, sm: 3 },
        bgcolor: "background.paper",
        width: { xs: "100%", lg: 280 },
        maxWidth: { xs: "100%", lg: 280 },
        minHeight: { xs: 170, lg: 220 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "border-color 0.2s ease",
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            bgcolor: "background.default",
            border: 1,
            borderColor: "divider",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1.5,
          }}
        >
          <UploadOutlinedIcon sx={{ color: "text.secondary" }} />
        </Box>

        <Typography sx={{ color: "text.primary", fontWeight: 600 }}>
          Quick Upload
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Drop a receipt image here for instant OCR extraction
        </Typography>

        <Button
          variant="contained"
          onClick={pickFile}
          fullWidth
          sx={{ textTransform: "none", borderRadius: 2, minHeight: 40 }}
        >
          Browse files
        </Button>

        <input
          ref={inputRef}
          type="file"
          hidden
          accept="image/jpeg,image/png,application/pdf"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </Box>
    </Container>
  );
};

export default QuickUploadCard;
