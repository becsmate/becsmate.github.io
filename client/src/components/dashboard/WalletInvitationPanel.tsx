import React from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { WalletInvitation } from '../../services/walletService';

interface WalletInvitationPanelProps {
  invitationsLoading: boolean;
  walletPendingInvitations: WalletInvitation[];
  busyId: string | null;
  onInvitationAction: (invitation: WalletInvitation, action: 'accept' | 'decline') => void;
}

const WalletInvitationPanel: React.FC<WalletInvitationPanelProps> = ({
  invitationsLoading,
  walletPendingInvitations,
  busyId,
  onInvitationAction,
}) => {
  return (
    <Container
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 5,
        p: 3,
        bgcolor: 'background.paper',
        width: '75%',
      }}
    >
      <Stack spacing={2}>
        <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>
          Your Pending Invitation for This Wallet
        </Typography>

        {invitationsLoading ? (
          <CircularProgress size={22} />
        ) : walletPendingInvitations.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No pending invitation found for this wallet.
          </Typography>
        ) : (
          walletPendingInvitations.map((invitation) => (
            <Stack
              key={invitation.id}
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1}
              sx={{
                p: 1.25,
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.default',
              }}
            >
              <Chip label="Pending" size="small" color="warning" />
              <Typography variant="body2" sx={{ flex: 1 }}>
                Invited by {invitation.invited_by?.name ?? invitation.invited_by?.email ?? 'Unknown user'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onInvitationAction(invitation, 'accept')}
                  disabled={busyId === invitation.id}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  onClick={() => onInvitationAction(invitation, 'decline')}
                  disabled={busyId === invitation.id}
                >
                  Decline
                </Button>
              </Box>
            </Stack>
          ))
        )}
      </Stack>
    </Container>
  );
};

export default WalletInvitationPanel;
