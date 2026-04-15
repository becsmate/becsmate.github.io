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
  title?: string;
  emptyMessage?: string;
}

const WalletInvitationPanel: React.FC<WalletInvitationPanelProps> = ({
  invitationsLoading,
  walletPendingInvitations,
  busyId,
  onInvitationAction,
  title = 'Your Pending Invitations',
  emptyMessage = 'No pending invitations right now.',
}) => {
  return (
    <Container
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 5,
        p: { xs: 2, sm: 3 },
        bgcolor: 'background.paper',
        // width: { xs: '100%', xl: '75%' },
        width: "100%",
        minWidth: 0,
      }}
    >
      <Stack spacing={2}>
        <Typography
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            fontSize: { xs: 16, sm: 18 },
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}
        >
          {title}
        </Typography>

        {invitationsLoading ? (
          <CircularProgress size={22} />
        ) : walletPendingInvitations.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
            {emptyMessage}
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
              <Typography variant="body2" sx={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                Invited by {invitation.invited_by?.name ?? invitation.invited_by?.email ?? 'Unknown user'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onInvitationAction(invitation, 'accept')}
                  disabled={busyId === invitation.id}
                  sx={{ textTransform: 'none', width: { xs: '50%', sm: 'auto' } }}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  onClick={() => onInvitationAction(invitation, 'decline')}
                  disabled={busyId === invitation.id}
                  sx={{ textTransform: 'none', width: { xs: '50%', sm: 'auto' } }}
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
