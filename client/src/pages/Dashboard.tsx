import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTransactions, useWallets, walletApi } from "../services/walletService";
import { useStatistics } from "../services/statisticsService";
import SummaryCards from "../components/dashboard/SummaryCards";
import IncomeExpensesChart from "../components/dashboard/IncomeExpensesChart";
import CategoryDonutChart from "../components/dashboard/CategoryDonutChart";
import RecentTransactionsTable from "../components/dashboard/RecentTransactionsTable";
import WalletsPanel from "../components/dashboard/WalletsPanel";
import AddTransactionDialog from "../components/dashboard/AddTransactionDialog";
import QuickUploadCard from "../components/dashboard/QuickUploadCard";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { wallets, error: walletsError, refetch } = useWallets();
  const [walletId, setWalletId] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletType, setNewWalletType] = useState<"personal" | "group">("personal");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createBusy, setCreateBusy] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [addTxBusy, setAddTxBusy] = useState(false);
  const [addTxError, setAddTxError] = useState<string | null>(null);

  const { transactions = [], refetch: refetchTransactions } = useTransactions(walletId);

  const { userSummary, userMonthly, categories, refetch: refetchStatistics } = useStatistics(
    walletId || null,
  );

  useEffect(() => {
    if (wallets.length === 0) {
      if (walletId) setWalletId("");
      return;
    }

    const selectedWalletExists = wallets.some((wallet) => wallet.id === walletId);
    if (!walletId || !selectedWalletExists) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, walletId]);

  const handleCreateWallet = async () => {
    const name = newWalletName.trim();
    if (!name) {
      setCreateError("Wallet name is required.");
      return;
    }

    setCreateError(null);
    setCreateBusy(true);
    try {
      const wallet = await walletApi.createWallet(name, newWalletType);
      setCreateOpen(false);
      setNewWalletName("");
      setNewWalletType("personal");
      await refetch();
      setWalletId(wallet.id);
    } catch (e: any) {
      setCreateError(e.response?.data?.error ?? "Failed to create wallet");
    } finally {
      setCreateBusy(false);
    }
  };

  const openCreateDialog = (type: "personal" | "group") => {
    setCreateError(null);
    setNewWalletType(type);
    setCreateOpen(true);
  };

  const monthWithYear = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const currentMonthData = userMonthly.find((m) => m.month === monthWithYear);

  const handleAddTransaction = async (payload: {
    amount: number;
    category: string;
    date: string;
    description?: string;
    merchant_name?: string;
    currency?: string;
  }) => {
    if (!walletId) {
      setAddTxError("Please select a wallet first.");
      return;
    }

    setAddTxError(null);
    setAddTxBusy(true);
    try {
      await walletApi.createTransaction(walletId, payload);
      await Promise.all([refetchTransactions(), refetchStatistics()]);
      setAddTxOpen(false);
    } catch (e: any) {
      setAddTxError(e.response?.data?.error ?? "Failed to add transaction");
    } finally {
      setAddTxBusy(false);
    }
  };

  const openOcrUpload = (file?: File) => {
    navigate("/upload", {
      state: {
        quickFile: file,
        prefillWalletId: walletId || undefined,
      },
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <WalletsPanel
          wallets={wallets}
          walletId={walletId}
          walletsError={walletsError}
          onWalletChange={setWalletId}
          onCreateWallet={() => openCreateDialog("personal")}
          onCreateGroupWallet={() => openCreateDialog("group")}
        />
      </Box>

      {/* cards */}
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <SummaryCards
          userSummary={userSummary ?? undefined}
          currentMonthData={currentMonthData}
        />
      </Box>

      {/* charts */}
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Box
          sx={{ display: "flex", flexDirection: "row", gap: 2, width: "75%" }}
        >
          <IncomeExpensesChart userMonthly={userMonthly} />
          <CategoryDonutChart categories={categories || []} />
        </Box>
      </Box>

      {/* table */}
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            width: "75%",
            alignItems: "stretch",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <RecentTransactionsTable
              transactions={transactions}
              search={search}
              onSearchChange={setSearch}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              onAddClick={() => {
                setAddTxError(null);
                setAddTxOpen(true);
              }}
              width="100%"
            />
          </Box>

          <QuickUploadCard
            onFileSelected={(file) => openOcrUpload(file)}
            onOpenUploadPage={() => openOcrUpload()}
          />
        </Box>
      </Box>

      <AddTransactionDialog
        open={addTxOpen}
        onClose={() => setAddTxOpen(false)}
        onSubmit={handleAddTransaction}
        busy={addTxBusy}
        error={addTxError}
      />

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Create Wallet</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Wallet Name"
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
              fullWidth
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel id="new-wallet-type-label">Type</InputLabel>
              <Select
                labelId="new-wallet-type-label"
                value={newWalletType}
                label="Type"
                onChange={(e) => setNewWalletType(e.target.value as "personal" | "group")}
              >
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="group">Group</MenuItem>
              </Select>
            </FormControl>
            {createError && <Alert severity="error">{createError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateWallet} variant="contained" disabled={createBusy}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
