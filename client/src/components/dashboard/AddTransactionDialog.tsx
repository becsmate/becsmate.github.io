import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import SouthWestIcon from "@mui/icons-material/SouthWest";
import {
  DEFAULT_TRANSACTION_CATEGORY,
  TRANSACTION_CATEGORIES,
} from "../../constants/transactionCategories";

type EntryType = "expense" | "income";

interface AddTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    amount: number;
    category: string;
    date: string;
    description?: string;
    merchant_name?: string;
    currency?: string;
  }) => Promise<void>;
  busy: boolean;
  error: string | null;
}

const AddTransactionDialog: React.FC<AddTransactionDialogProps> = ({
  open,
  onClose,
  onSubmit,
  busy,
  error,
}) => {
  const [entryType, setEntryType] = useState<EntryType>("expense");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(DEFAULT_TRANSACTION_CATEGORY);
  const [amount, setAmount] = useState<string>("");

  const canSubmit = useMemo(
    () => Boolean(date && category && Number(amount) > 0 && !busy),
    [date, category, amount, busy],
  );

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const value = Number(amount);
    const signedAmount = entryType === "expense" ? -Math.abs(value) : Math.abs(value);

    await onSubmit({
      amount: signedAmount,
      category,
      date: new Date(`${date}T12:00:00`).toISOString(),
      description: description.trim() || undefined,
      merchant_name: description.trim() || undefined,
      currency: "HUF",
    });

    if (!busy) {
      setEntryType("expense");
      setDate(new Date().toISOString().slice(0, 10));
      setDescription("");
      setCategory(DEFAULT_TRANSACTION_CATEGORY);
      setAmount("");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          border: 1,
          borderColor: "divider",
          borderRadius: 5,
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Add Transaction
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              Manually add an expense or income entry to your records.
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Box>
            <Typography sx={{ mb: 1, color: "text.primary" }}>Type</Typography>
            <ToggleButtonGroup
              exclusive
              value={entryType}
              onChange={(_, value) => value && setEntryType(value)}
              fullWidth
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  textTransform: "none",
                  borderColor: "divider",
                  color: "text.secondary",
                  py: 1,
                },
                "& .MuiToggleButton-root.Mui-selected": {
                  bgcolor: "background.default",
                  color: "text.primary",
                },
                "& .MuiToggleButton-root.Mui-selected:hover": {
                  bgcolor: "background.default",
                },
              }}
            >
              <ToggleButton value="expense">
                <NorthEastIcon sx={{ mr: 1, fontSize: 16 }} /> Expense
              </ToggleButton>
              <ToggleButton value="income">
                <SouthWestIcon sx={{ mr: 1, fontSize: 16 }} /> Income
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.default",
              },
            }}
          />

          <TextField
            label={entryType === "income" ? "Source / Description" : "Merchant / Description"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              entryType === "income" ? "e.g. Monthly Salary" : "e.g. Whole Foods Market"
            }
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.default",
              },
            }}
          />

          <FormControl fullWidth size="small">
            <InputLabel id="tx-category-label">Category</InputLabel>
            <Select
              labelId="tx-category-label"
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{
                bgcolor: "background.default",
              }}
            >
              {TRANSACTION_CATEGORIES.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "background.default",
              },
            }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "auto auto" },
              justifyContent: { xs: "stretch", sm: "end" },
              gap: 1,
              pt: 1,
            }}
          >
            <Button
              onClick={handleClose}
              disabled={busy}
              fullWidth
              sx={{ textTransform: "none", borderRadius: 2, minHeight: 40 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!canSubmit}
              onClick={handleSubmit}
              fullWidth
              sx={{ textTransform: "none", borderRadius: 2, minHeight: 40 }}
            >
              {entryType === "income" ? "Add Income" : "Add Expense"}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;
