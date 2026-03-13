import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useWalletInvitations, walletApi, WalletInvitation } from '../services/walletService';

const WalletInvitationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { invitations, loading, error, refetch } = useWalletInvitations('pending', true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const pendingInvitations = useMemo(
    () => invitations.filter((inv) => inv.status === 'pending'),
    [invitations]
  );

  const handleAction = async (
    invitation: WalletInvitation,
    action: 'accept' | 'decline'
  ) => {
    setActionError(null);
    setBusyId(invitation.id);
    try {
      if (action === 'accept') {
        await walletApi.acceptInvitation(invitation.id);
        await refetch();
        navigate(`/wallets/${invitation.wallet_id}/social`);
        return;
      }
      await walletApi.declineInvitation(invitation.id);
      await refetch();
    } catch (e: any) {
      setActionError(e.response?.data?.error ?? `Failed to ${action} invitation`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4">Wallet Invitations</Typography>
        <Typography variant="body2" color="text.secondary">
          Review pending group wallet invitations and choose whether to join.
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {actionError && <Alert severity="error">{actionError}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : pendingInvitations.length === 0 ? (
          <Alert severity="info">You have no pending invitations right now.</Alert>
        ) : (
          <Stack spacing={2}>
            {pendingInvitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Box>
                      <Typography variant="h6">
                        {invitation.wallet?.name ?? 'Unnamed wallet'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Invited by {invitation.invited_by?.name ?? invitation.invited_by?.email ?? 'Unknown user'}
                      </Typography>
                    </Box>
                    <Chip label="Pending" color="warning" size="small" />
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleAction(invitation, 'accept')}
                    disabled={busyId === invitation.id}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => handleAction(invitation, 'decline')}
                    disabled={busyId === invitation.id}
                  >
                    Decline
                  </Button>
                  <Button
                    component={Link}
                    to={`/wallets/${invitation.wallet_id}/social`}
                    variant="text"
                  >
                    Open Wallet Social View
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

export default WalletInvitationsPage;
