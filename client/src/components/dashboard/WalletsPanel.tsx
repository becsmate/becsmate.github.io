import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Wallet } from "../../services/walletService";

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
  return (
    <Container
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 5,
        p: 3,
        bgcolor: "background.paper",
        width: "75%",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Typography sx={{ color: "text.primary", fontWeight: 600 }}>
            Wallets
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="outlined" onClick={onCreateGroupWallet}>
              Create Group Wallet
            </Button>
            <Button variant="contained" onClick={onCreateWallet}>
              Create Wallet
            </Button>
          </Stack>
        </Stack>

        {walletsError && <Alert severity="error">{walletsError}</Alert>}

        <FormControl size="small" fullWidth>
          <InputLabel id="dashboard-wallet-select-label">Active Wallet</InputLabel>
          <Select
            labelId="dashboard-wallet-select-label"
            label="Active Wallet"
            value={walletId}
            onChange={(e) => onWalletChange(e.target.value)}
          >
            {wallets.map((wallet) => (
              <MenuItem key={wallet.id} value={wallet.id}>
                {wallet.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {wallets.map((wallet) => (
            <Chip
              key={wallet.id}
              label={`${wallet.name}${wallet.type === "group" ? " (Group)" : ""}`}
              clickable
              color={walletId === wallet.id ? "primary" : "default"}
              onClick={() => onWalletChange(wallet.id)}
            />
          ))}
        </Stack>

        <Box sx={{ display: "flex", gap: 1, pt: 0.5 }}>
          <Button
            component={Link}
            to={walletId ? `/wallets/${walletId}/social` : "/wallets/invitations"}
            variant="outlined"
          >
            Open Wallet Social
          </Button>
          <Button component={Link} to="/wallets/invitations" variant="text">
            View Invitations
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default WalletsPanel;
