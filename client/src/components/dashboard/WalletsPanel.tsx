import React, { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AddIcon from "@mui/icons-material/Add";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import { useWalletMembers, Wallet } from "../../services/walletService";
import { formatCurrency } from "../../utils";

interface WalletsPanelProps {
  wallets: Wallet[];
  walletId: string;
  walletsError: string | null;
  onWalletChange: (walletId: string) => void;
  onCreateWallet: () => void;
  onCreateGroupWallet: () => void;
}

const WalletsPanel: React.FC<WalletsPanelProps> = ({
  wallets,
  walletId,
  walletsError,
  onWalletChange,
  onCreateWallet,
  onCreateGroupWallet,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [detailWalletId, setDetailWalletId] = useState<string | null>(null);

  const detailWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === detailWalletId) ?? null,
    [wallets, detailWalletId],
  );

  const {
    members,
    loading: membersLoading,
    error: membersError,
  } = useWalletMembers(detailWallet?.id ?? "", Boolean(detailWallet && detailWallet.type === "group"));

  const currentUserId = (user as { id?: string } | null)?.id;

  const handleWalletClick = (id: string) => {
    if (id === walletId) {
      setDetailWalletId(id);
      return;
    }

    onWalletChange(id);
    setDetailWalletId(null);
  };

  const closeDetails = () => {
    setDetailWalletId(null);
  };

  const openSocialPage = () => {
    if (!detailWallet) return;
    navigate("/wallets/manage");
    closeDetails();
  };

  const titleIcon = detailWallet?.type === "group" ? (
    <GroupsOutlinedIcon fontSize="small" />
  ) : (
    <AccountBalanceWalletOutlinedIcon fontSize="small" />
  );

  return (
    <>
      <Container
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 5,
          p: { xs: 2, sm: 3 },
          bgcolor: "background.paper",
          width: { xs: "100%", xl: "75%" },
          minWidth: 0,
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccountBalanceWalletOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              <Typography sx={{ color: "text.primary", fontWeight: 600 }}>
                Wallets
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="outlined"
                component={Link}
                to="/wallets/manage"
                startIcon={<SettingsOutlinedIcon />}
                sx={{ textTransform: "none", borderRadius: 2, width: { xs: "100%", sm: "auto" } }}
              >
                Manage
              </Button>
              <Button
                variant="contained"
                onClick={onCreateWallet}
                startIcon={<AddIcon />}
                sx={{ textTransform: "none", borderRadius: 2, whiteSpace: "nowrap", width: { xs: "100%", sm: "auto" } }}
              >
                New Wallet
              </Button>
            </Stack>
          </Stack>

          {walletsError && <Alert severity="error">{walletsError}</Alert>}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 1,
            }}
          >
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
                    px: 2,
                    py: 1.5,
                    bgcolor: selected ? "rgba(71, 98, 255, 0.08)" : "background.default",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    transition: "all 0.15s ease",
                    "&:hover": {
                      borderColor: selected ? "primary.main" : "text.secondary",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isGroup ? "rgba(47,198,183,0.14)" : "rgba(71,98,255,0.14)",
                      color: isGroup ? "#2fc6b7" : "primary.main",
                    }}
                  >
                    {isGroup ? <GroupsOutlinedIcon fontSize="small" /> : <AccountBalanceWalletOutlinedIcon fontSize="small" />}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ color: "text.primary", fontWeight: 600 }} noWrap>
                        {wallet.name}
                      </Typography>
                      {isGroup && (
                        <Box
                          sx={{
                            px: 0.8,
                            py: 0.15,
                            borderRadius: 999,
                            bgcolor: "action.hover",
                            color: "text.secondary",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 0.2,
                          }}
                        >
                          GROUP
                        </Box>
                      )}
                    </Box>

                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {formatCurrency(wallet.balance ?? 0)}
                      {isGroup ? `  |  ${wallet.member_count ?? 0} members` : ""}
                    </Typography>
                  </Box>

                  <ChevronRightIcon sx={{ color: "text.secondary" }} />
                </Box>
              );
            })}
          </Box>
        </Stack>
      </Container>

      <Dialog
        open={Boolean(detailWallet)}
        onClose={closeDetails}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
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
                  bgcolor: detailWallet?.type === "group" ? "rgba(47,198,183,0.14)" : "rgba(71,98,255,0.14)",
                  color: detailWallet?.type === "group" ? "#2fc6b7" : "primary.main",
                }}
              >
                {titleIcon}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{detailWallet?.name}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {detailWallet?.type === "group" ? "Group wallet details" : "Personal wallet details"}
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
                borderRadius: 3,
                px: 2,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Current balance
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                {formatCurrency(detailWallet?.balance ?? 0)}
              </Typography>
            </Box>

            {detailWallet?.type === "group" && (
              <Box
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 3,
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Members
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {detailWallet.member_count ?? members.length}
                </Typography>
              </Box>
            )}

            <Divider />

            {detailWallet?.type === "personal" ? (
              <Stack spacing={1.5}>
                <Typography sx={{ fontWeight: 600 }}>Owner</Typography>
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    px: 2,
                    py: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography>{user?.name ?? "You"}</Typography>
                  <Chip label="Owner" size="small" color="primary" />
                </Box>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Personal wallets cannot have additional members.
                </Alert>
              </Stack>
            ) : (
              <Stack spacing={1.25}>
                <Typography sx={{ fontWeight: 600 }}>Wallet Members</Typography>

                {membersLoading ? (
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
                        borderRadius: 3,
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
            )}

            <Button variant="outlined" sx={{ textTransform: "none", borderRadius: 2 }} onClick={openSocialPage}>
              Open Wallet Social Settings
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletsPanel;
