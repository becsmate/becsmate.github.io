import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import {
  useWallets,
  useWalletMembers,
  useWalletInvitations,
  walletApi,
  WalletInvitation,
} from '../services/walletService';
import { useAuthContext } from '../contexts/AuthContext';
import WalletInvitationPanel from '../components/dashboard/WalletInvitationPanel';
import WalletMembersPanel from '../components/dashboard/WalletMembersPanel';

const WalletSocialPage: React.FC = () => {
  const { user } = useAuthContext();
  const { walletId = '' } = useParams<{ walletId: string }>();
  const { wallets } = useWallets();
  const { members, loading: membersLoading, error: membersError, refetch: refetchMembers } =
    useWalletMembers(walletId, Boolean(walletId));
  const {
    invitations,
    loading: invitationsLoading,
    error: invitationsError,
    refetch: refetchInvitations,
  } = useWalletInvitations('pending', Boolean(walletId));

  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  const walletPendingInvitations = useMemo(
    () => invitations.filter((inv) => inv.wallet_id === walletId && inv.status === 'pending'),
    [invitations, walletId]
  );

  const owner = useMemo(
    () => members.find((member) => member.role === 'owner'),
    [members]
  );

  const currentWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === walletId),
    [wallets, walletId]
  );
  const isGroupWallet = currentWallet?.type === 'group';

  const isOwner = owner?.id === user?.id;
  const isMember = useMemo(
    () => members.some((member) => member.id === user?.id),
    [members, user?.id]
  );

  const handleInvitationAction = async (
    invitation: WalletInvitation,
    action: 'accept' | 'decline'
  ) => {
    setActionError(null);
    setBusyId(invitation.id);
    try {
      if (action === 'accept') {
        await walletApi.acceptInvitation(invitation.id);
      } else {
        await walletApi.declineInvitation(invitation.id);
      }
      await refetchInvitations();
      await refetchMembers();
    } catch (e: any) {
      setActionError(e.response?.data?.error ?? `Failed to ${action} invitation`);
    } finally {
      setBusyId(null);
    }
  };

  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;

    setActionError(null);
    setInviteMessage(null);
    setInviteBusy(true);
    try {
      await walletApi.inviteMember(walletId, email);
      setInviteEmail('');
      setInviteMessage('Invitation sent successfully.');
      await refetchInvitations();
      await refetchMembers();
    } catch (e: any) {
      setActionError(e.response?.data?.error ?? 'Failed to send invitation');
    } finally {
      setInviteBusy(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setActionError(null);
    setBusyId(memberId);
    try {
      await walletApi.removeMember(walletId, memberId);
      await refetchMembers();
      await refetchInvitations();
    } catch (e: any) {
      setActionError(e.response?.data?.error ?? 'Failed to remove member');
    } finally {
      setBusyId(null);
    }
  };

  const handleLeaveWallet = async () => {
    if (!user?.id) return;

    setActionError(null);
    setBusyId(user.id);
    try {
      await walletApi.removeMember(walletId, user.id);
      await refetchMembers();
      await refetchInvitations();
    } catch (e: any) {
      setActionError(e.response?.data?.error ?? 'Failed to leave wallet');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box sx={{ width: '75%' }}>
          <Typography variant="h4">Wallet Social</Typography>
          <Typography variant="body2" color="text.secondary">
            See who is in this wallet and handle your invitation decisions.
          </Typography>
        </Box>
      </Box>

      {(actionError || invitationsError) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Stack spacing={1} sx={{ width: '75%' }}>
            {actionError && <Alert severity="error">{actionError}</Alert>}
            {invitationsError && <Alert severity="error">{invitationsError}</Alert>}
          </Stack>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <WalletInvitationPanel
          invitationsLoading={invitationsLoading}
          walletPendingInvitations={walletPendingInvitations}
          busyId={busyId}
          onInvitationAction={handleInvitationAction}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <WalletMembersPanel
          membersLoading={membersLoading}
          membersError={membersError}
          members={members}
          isOwner={Boolean(isOwner)}
          isMember={isMember}
          isGroupWallet={Boolean(isGroupWallet)}
          hasCurrentWallet={Boolean(currentWallet)}
          userId={user?.id}
          busyId={busyId}
          inviteEmail={inviteEmail}
          inviteBusy={inviteBusy}
          inviteMessage={inviteMessage}
          onInviteEmailChange={setInviteEmail}
          onInvite={handleInvite}
          onRemoveMember={handleRemoveMember}
          onLeaveWallet={handleLeaveWallet}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Box sx={{ width: '75%' }}>
          <Button component={Link} to="/wallets/invitations" variant="text">
            Back to Invitations
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default WalletSocialPage;
