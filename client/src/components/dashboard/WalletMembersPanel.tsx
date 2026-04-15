import React from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { WalletMember } from '../../services/walletService';

interface WalletMembersPanelProps {
  membersLoading: boolean;
  membersError: string | null;
  members: WalletMember[];
  isOwner: boolean;
  isMember: boolean;
  isGroupWallet: boolean;
  hasCurrentWallet: boolean;
  userId?: string;
  busyId: string | null;
  inviteEmail: string;
  inviteBusy: boolean;
  inviteMessage: string | null;
  onInviteEmailChange: (value: string) => void;
  onInvite: () => void;
  onRemoveMember: (memberId: string) => void;
  onLeaveWallet: () => void;
}

const WalletMembersPanel: React.FC<WalletMembersPanelProps> = ({
  membersLoading,
  membersError,
  members,
  isOwner,
  isMember,
  isGroupWallet,
  hasCurrentWallet,
  userId,
  busyId,
  inviteEmail,
  inviteBusy,
  inviteMessage,
  onInviteEmailChange,
  onInvite,
  onRemoveMember,
  onLeaveWallet,
}) => {
  return (
    <Container
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 5,
        p: { xs: 2, sm: 3 },
        bgcolor: 'background.paper',
        width: { xs: '100%', xl: '75%' },
      }}
    >
      <Stack spacing={2}>
        <Typography sx={{ color: 'text.primary', fontWeight: 600 }}>
          Members
        </Typography>

        {membersLoading ? (
          <CircularProgress size={22} />
        ) : membersError ? (
          <Alert severity="info">
            Accept the invitation first to view the member list for this wallet.
          </Alert>
        ) : members.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No members found.
          </Typography>
        ) : (
          <List disablePadding>
            {members.map((member) => (
              <ListItem
                key={member.id}
                disableGutters
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  py: 1,
                }}
              >
                <ListItemText
                  primary={member.name}
                  secondary={`${member.email} • ${member.role}`}
                />
                {isOwner && member.role === 'member' && (
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => onRemoveMember(member.id)}
                      disabled={busyId === member.id}
                    >
                      Remove
                    </Button>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        )}

        {isOwner && isGroupWallet && (
          <>
            <Divider />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                fullWidth
                size="small"
                label="Invite member by email"
                value={inviteEmail}
                onChange={(e) => onInviteEmailChange(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={onInvite}
                disabled={inviteBusy || !inviteEmail.trim()}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                Invite
              </Button>
            </Stack>
            {inviteMessage && <Alert severity="success">{inviteMessage}</Alert>}
          </>
        )}

        {isOwner && hasCurrentWallet && !isGroupWallet && (
          <Alert severity="info">
            Inviting members is only available for group wallets.
          </Alert>
        )}

        {!isOwner && isMember && (
          <Button
            variant="outlined"
            color="error"
            onClick={onLeaveWallet}
            disabled={busyId === userId}
            sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, textTransform: 'none' }}
          >
            Leave Wallet
          </Button>
        )}
      </Stack>
    </Container>
  );
};

export default WalletMembersPanel;
