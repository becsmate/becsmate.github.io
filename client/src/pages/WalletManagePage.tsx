import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { useWalletMembers, useWallets, walletApi, Wallet } from "../services/walletService";
import { formatCurrency } from "../utils";

const WalletManagePage: React.FC = () => {
  const { user } = useAuthContext();
  const { wallets, error: walletsError, refetch } = useWallets();

  const [walletId, setWalletId] = useState("");
  const [detailWalletId, setDetailWalletId] = useState<string | null>(null);
  const [editWalletId, setEditWalletId] = useState<string | null>(null);
  const [deleteWalletId, setDeleteWalletId] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createType, setCreateType] = useState<"personal" | "group">("personal");
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (wallets.length === 0) {
      if (walletId) setWalletId("");
      return;
    }

    const exists = wallets.some((wallet) => wallet.id === walletId);
    if (!walletId || !exists) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, walletId]);

  const detailWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === detailWalletId) ?? null,
    [wallets, detailWalletId],
  );

  const editWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === editWalletId) ?? null,
    [wallets, editWalletId],
  );

  const deleteWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === deleteWalletId) ?? null,
    [wallets, deleteWalletId],
  );

  const {
    members,
    loading: membersLoading,
    error: membersError,
  } = useWalletMembers(detailWallet?.id ?? "", Boolean(detailWallet && detailWallet.type === "group"));

  const currentUserId = (user as { id?: string } | null)?.id;

  const closeCreateDialog = () => {
    setCreateOpen(false);
    setCreateName("");
    setCreateType("personal");
    setActionError(null);
  };

  const closeEditDialog = () => {
    setEditWalletId(null);
    setEditName("");
    setActionError(null);
  };

  const closeDeleteDialog = () => {
    setDeleteWalletId(null);
    setActionError(null);
  };

  const closeDetails = () => {
    setDetailWalletId(null);
  };

  const openEditDialog = (wallet: Wallet) => {
    setActionError(null);
    setEditWalletId(wallet.id);
    setEditName(wallet.name);
  };

  const openDeleteDialog = (wallet: Wallet) => {
    setActionError(null);
    setDeleteWalletId(wallet.id);
  };

  const handleWalletClick = (id: string) => {
    setWalletId(id);
    setDetailWalletId(id);
  };

  const handleCreateWallet = async () => {
    const name = createName.trim();
    if (!name) {
      setActionError("Wallet name is required.");
      return;
    }

    setActionBusy(true);
    setActionError(null);
    try {
      const wallet = await walletApi.createWallet(name, createType);
      await refetch();
      setWalletId(wallet.id);
      closeCreateDialog();
    } catch (e: any) {
      setActionError(e.response?.data?.error ?? "Failed to create wallet.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleSaveWalletName = async () => {
    if (!editWallet) return;

    const name = editName.trim();
    if (!name) {
      setActionError("Wallet name is required.");
      return;
    }

    setActionBusy(true);
    setActionError(null);
    try {
      await walletApi.updateWallet(editWallet.id, { name });
      await refetch();
      closeEditDialog();
    } catch (e: any) {
      setActionError(e.response?.data?.error ?? "Failed to update wallet.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeleteWallet = async () => {
    if (!deleteWallet) return;

    setActionBusy(true);
    setActionError(null);
    try {
      await walletApi.deleteWallet(deleteWallet.id);
      const remaining = wallets.filter((wallet) => wallet.id !== deleteWallet.id);
      setWalletId(remaining[0]?.id ?? "");
      if (detailWalletId === deleteWallet.id) {
        setDetailWalletId(null);
      }
      await refetch();
      closeDeleteDialog();
    } catch (e: any) {
      setActionError(e.response?.data?.error ?? "Failed to delete wallet.");
    } finally {
      setActionBusy(false);
    }
  };

  const detailIcon = detailWallet?.type === "group" ? (
    <GroupsOutlinedIcon fontSize="small" />
  ) : (
    <AccountBalanceWalletOutlinedIcon fontSize="small" />
  );

  return (
    <Box sx={{ py: 4 }}>
      <Container sx={{ width: "75%", minWidth: "75%" }}>
        <Stack spacing={2}>
          <Button
            variant="text"
            component={Link}
            to="/"
            startIcon={<ArrowBackIcon />}
            sx={{ textTransform: "none", alignSelf: "flex-start", px: 0, color: "text.secondary" }}
          >
            Back
          </Button>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Manage Wallets
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                View, edit, and manage all your wallets
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setActionError(null);
                setCreateOpen(true);
              }}
              sx={{ textTransform: "none", borderRadius: 2.5, alignSelf: { xs: "flex-start", sm: "center" } }}
            >
              New Wallet
            </Button>
          </Stack>

          {(walletsError || actionError) && (
            <Stack spacing={1}>
              {walletsError && <Alert severity="error">{walletsError}</Alert>}
              {actionError && <Alert severity="error">{actionError}</Alert>}
            </Stack>
          )}

          <Stack spacing={1.25}>
            {wallets.map((wallet) => {
              const selected = wallet.id === walletId;
              const isGroup = wallet.type === "group";

              return (
                <Box
                  key={wallet.id}
                  onClick={() => handleWalletClick(wallet.id)}
                  sx={{
                    border: 1,
                    borderColor: selected ? "primary.main" : "divider",
                    borderRadius: 3,
                    px: 2.2,
                    py: 1.75,
                    bgcolor: selected ? "rgba(25, 118, 210, 0.10)" : "background.paper",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      borderColor: selected ? "primary.main" : "text.secondary",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isGroup ? "rgba(25, 118, 210, 0.18)" : "rgba(25, 118, 210, 0.14)",
                      color: "primary.main",
                    }}
                  >
                    {isGroup ? <GroupsOutlinedIcon fontSize="small" /> : <AccountBalanceWalletOutlinedIcon fontSize="small" />}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontWeight: 700, color: "text.primary" }} noWrap>
                        {wallet.name}
                      </Typography>
                      {isGroup && (
                        <Box
                          sx={{
                            px: 1,
                            py: 0.2,
                            borderRadius: 999,
                            bgcolor: "action.hover",
                            color: "text.secondary",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          GROUP
                        </Box>
                      )}
                    </Stack>

                    <Stack direction="row" spacing={1.1} alignItems="center" sx={{ mt: 0.2 }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {formatCurrency(wallet.balance ?? 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "divider" }}>|</Typography>
                      <Stack direction="row" spacing={0.4} alignItems="center">
                        <SettingsOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          {wallet.is_owner ? "Owner" : "Member"}
                        </Typography>
                      </Stack>
                      {isGroup && (
                        <>
                          <Typography variant="body2" sx={{ color: "divider" }}>|</Typography>
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {wallet.member_count ?? 0} members
                          </Typography>
                        </>
                      )}
                    </Stack>
                  </Box>

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        setWalletId(wallet.id);
                        setDetailWalletId(wallet.id);
                      }}
                      sx={{ color: "text.secondary" }}
                    >
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditDialog(wallet);
                      }}
                      sx={{ color: "text.secondary" }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        openDeleteDialog(wallet);
                      }}
                      sx={{ color: "text.secondary" }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Stack>
      </Container>

      <Dialog
        open={Boolean(detailWallet)}
        onClose={closeDetails}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(25, 118, 210, 0.14)",
                  color: "primary.main",
                }}
              >
                {detailIcon}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{detailWallet?.name}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {detailWallet?.type === "group" ? `${detailWallet.member_count ?? 0} members` : "Personal wallet"}
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={closeDetails} size="small">
              <Typography component="span" sx={{ lineHeight: 1, fontSize: 18, color: "text.secondary" }}>
                ×
              </Typography>
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 0, pb: 3 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                px: 2,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "background.default",
              }}
            >
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Balance
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "1.75rem" }}>
                {formatCurrency(detailWallet?.balance ?? 0)}
              </Typography>
            </Box>

            <Typography sx={{ fontWeight: 600 }}>Members</Typography>

            {detailWallet?.type === "personal" ? (
              <>
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    px: 1.5,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {(user?.name || "U").charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600 }} noWrap>
                        {user?.name ?? "You"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
                        {user?.email ?? ""}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Chip label="You" size="small" variant="outlined" />
                    <Chip label="Owner" size="small" color="primary" />
                  </Stack>
                </Box>

                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Personal wallets cannot have additional members.
                </Alert>
              </>
            ) : membersLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : membersError ? (
              <Alert severity="error">{membersError}</Alert>
            ) : (
              members.map((member) => (
                <Box
                  key={member.id}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    px: 1.5,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                    <Avatar src={member.profile_image_url ?? undefined} sx={{ width: 32, height: 32 }}>
                      {(member.name || member.email || "U").charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600 }} noWrap>
                        {member.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
                        {member.email}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={0.75} alignItems="center">
                    {member.id === currentUserId && <Chip label="You" size="small" variant="outlined" />}
                    <Chip
                      icon={member.role === "owner" ? <SettingsOutlinedIcon sx={{ fontSize: 14 }} /> : <PersonOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
                      label={member.role === "owner" ? "Owner" : "Member"}
                      size="small"
                      color={member.role === "owner" ? "primary" : "default"}
                      variant={member.role === "owner" ? "filled" : "outlined"}
                    />
                  </Stack>
                </Box>
              ))
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onClose={closeCreateDialog} fullWidth maxWidth="xs">
        <DialogTitle>Create Wallet</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Wallet Name"
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              fullWidth
              size="small"
            />

            <FormControl fullWidth size="small">
              <InputLabel id="manage-wallet-type-label">Type</InputLabel>
              <Select
                labelId="manage-wallet-type-label"
                value={createType}
                label="Type"
                onChange={(event) => setCreateType(event.target.value as "personal" | "group")}
              >
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="group">Group</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDialog} disabled={actionBusy}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateWallet} disabled={actionBusy}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(editWallet)} onClose={closeEditDialog} fullWidth maxWidth="xs">
        <DialogTitle>Edit Wallet</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Update your wallet details and invite new members.
          </Typography>
          <TextField
            label="Wallet Name"
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} disabled={actionBusy}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveWalletName} disabled={actionBusy}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteWallet)} onClose={closeDeleteDialog} fullWidth maxWidth="sm">
        <DialogTitle>Delete Wallet</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "text.secondary" }}>
            Are you sure you want to delete "{deleteWallet?.name}"? This action cannot be undone and all transaction history will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={actionBusy}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteWallet} disabled={actionBusy}>Delete Wallet</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletManagePage;
