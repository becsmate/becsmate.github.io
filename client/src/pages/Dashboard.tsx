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
import { TRANSACTION_CATEGORIES } from "../constants/transactionCategories";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { wallets, error: walletsError, refetch } = useWallets();
  const [walletId, setWalletId] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletType, setNewWalletType] = useState<"personal" | "group">("personal");
  const [newWalletInviteEmails, setNewWalletInviteEmails] = useState("");
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
  const [editTxOpen, setEditTxOpen] = useState(false);
  const [editTxBusy, setEditTxBusy] = useState(false);
  const [editTxError, setEditTxError] = useState<string | null>(null);
  const [editTx, setEditTx] = useState<any | null>(null);
  const [editType, setEditType] = useState<"income" | "expense">("expense");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");

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

      let inviteWarning: string | null = null;
      if (newWalletType === "group") {
        const invitees = Array.from(
          new Set(
            newWalletInviteEmails
              .split(",")
              .map((value) => value.trim().toLowerCase())
              .filter(Boolean),
          ),
        );

        if (invitees.length > 0) {
          const results = await Promise.allSettled(
            invitees.map((email) => walletApi.inviteMember(wallet.id, email)),
          );
          const failedCount = results.filter((result) => result.status === "rejected").length;
          if (failedCount > 0) {
            inviteWarning = `Wallet created, but ${failedCount} invite(s) failed.`;
          }
        }
      }

      setCreateOpen(false);
      setNewWalletName("");
      setNewWalletType("personal");
      setNewWalletInviteEmails("");
      await refetch();
      setWalletId(wallet.id);
      if (inviteWarning) {
        window.alert(inviteWarning);
      }
    } catch (e: any) {
      setCreateError(e.response?.data?.error ?? "Failed to create wallet");
    } finally {
      setCreateBusy(false);
    }
  };

  const openCreateDialog = (type: "personal" | "group") => {
    setCreateError(null);
    setNewWalletType(type);
    setNewWalletInviteEmails("");
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
      await Promise.all([refetchTransactions(), refetchStatistics(), refetch()]);
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

  const openEditTransaction = (tx: any) => {
    setEditTx(tx);
    setEditType(tx.amount > 0 ? "income" : "expense");
    setEditAmount(String(Math.abs(tx.amount)));
    setEditDate((tx.date || "").slice(0, 10));
    setEditCategory(tx.category || "");
    setEditDescription(tx.description || "");
    setEditTxError(null);
    setEditTxOpen(true);
  };

  const handleSaveTransactionEdit = async () => {
    if (!walletId || !editTx) return;

    const numericAmount = Number(editAmount);
    if (!numericAmount || !editDate || !editCategory) {
      setEditTxError("Amount, category and date are required.");
      return;
    }

    setEditTxError(null);
    setEditTxBusy(true);
    try {
      const signedAmount = editType === "income" ? Math.abs(numericAmount) : -Math.abs(numericAmount);
      await walletApi.updateTransaction(walletId, editTx.id, {
        amount: signedAmount,
        category: editCategory,
        date: new Date(`${editDate}T12:00:00`).toISOString(),
        description: editDescription.trim() || undefined,
        merchant_name: editDescription.trim() || undefined,
      });
      await Promise.all([refetchTransactions(), refetchStatistics(), refetch()]);
      setEditTxOpen(false);
      setEditTx(null);
    } catch (e: any) {
      setEditTxError(e.response?.data?.error ?? "Failed to update transaction");
    } finally {
      setEditTxBusy(false);
    }
  };

  const handleDeleteTransaction = async (tx: any) => {
    if (!walletId) return;
    const confirmed = window.confirm("Delete this transaction?");
    if (!confirmed) return;

    try {
      await walletApi.deleteTransaction(walletId, tx.id);
      await Promise.all([refetchTransactions(), refetchStatistics(), refetch()]);
    } catch (e: any) {
      setAddTxError(e.response?.data?.error ?? "Failed to delete transaction");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 }, py: { xs: 2, md: 4 } }}>
      <Box sx={{ width: "100%" }}>
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
      <Box sx={{ width: "100%" }}>
        <SummaryCards
          userSummary={userSummary ?? undefined}
          currentMonthData={currentMonthData}
        />
      </Box>

      {/* charts */}
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.5fr) minmax(0, 1fr)" },
            gap: 2,
            width: { xs: "100%", xl: "75%" },
            mx: "auto",
          }}
        >
          <IncomeExpensesChart userMonthly={userMonthly} />
          <CategoryDonutChart categories={categories || []} />
        </Box>
      </Box>

      {/* table */}
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 280px" },
            gap: 2,
            width: { xs: "100%", xl: "75%" },
            mx: "auto",
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
              onEditTransaction={openEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onAddClick={() => {
                setAddTxError(null);
                setAddTxOpen(true);
              }}
              width="100%"
            />
          </Box>
          <Box sx={{ height: "50%" }}>
            <QuickUploadCard
              onFileSelected={(file) => openOcrUpload(file)}
              onOpenUploadPage={() => openOcrUpload()}
            />
          </Box>
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
            {newWalletType === "group" && (
              <TextField
                label="Invite emails (comma separated)"
                value={newWalletInviteEmails}
                onChange={(e) => setNewWalletInviteEmails(e.target.value)}
                placeholder="alice@example.com, bob@example.com"
                fullWidth
                size="small"
              />
            )}
            {createError && <Alert severity="error">{createError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: "100%" }}>
            <Button onClick={() => setCreateOpen(false)} fullWidth>
              Cancel
            </Button>
            <Button onClick={handleCreateWallet} variant="contained" disabled={createBusy} fullWidth>
              Create
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editTxOpen}
        onClose={() => !editTxBusy && setEditTxOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="edit-tx-type-label">Type</InputLabel>
              <Select
                labelId="edit-tx-type-label"
                value={editType}
                label="Type"
                onChange={(e) => setEditType(e.target.value as "income" | "expense")}
              >
                <MenuItem value="expense">Expense</MenuItem>
                <MenuItem value="income">Income</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Amount"
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth
              size="small"
            />

            <TextField
              label="Date"
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />

            <FormControl fullWidth size="small">
              <InputLabel id="edit-tx-category-label">Category</InputLabel>
              <Select
                labelId="edit-tx-category-label"
                value={editCategory}
                label="Category"
                onChange={(e) => setEditCategory(e.target.value)}
              >
                {TRANSACTION_CATEGORIES.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              fullWidth
              size="small"
            />

            {editTxError && <Alert severity="error">{editTxError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: "100%" }}>
            <Button onClick={() => setEditTxOpen(false)} disabled={editTxBusy} fullWidth>
              Cancel
            </Button>
            <Button onClick={handleSaveTransactionEdit} variant="contained" disabled={editTxBusy} fullWidth>
              Save
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
