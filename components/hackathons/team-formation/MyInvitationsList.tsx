'use client';

import {
  useMyTeamInvitations,
  useTeamInvitations,
} from '@/hooks/hackathon/use-team-invitations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2,
  UserPlus,
  X,
  Check,
  Clock,
  Send,
  Inbox,
  AlertCircle,
  Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useMemo } from 'react';
import { useParticipants } from '@/hooks/hackathon/use-participants';
import { useAuthStatus } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface MyInvitationsListProps {
  hackathonId: string;
}

export function MyInvitationsList({ hackathonId }: MyInvitationsListProps) {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const { user } = useAuthStatus();
  const { allParticipants } = useParticipants();

  // Find current user participant info
  const currentUserParticipant = useMemo(() => {
    if (!user) return null;
    const currentUsername = user.username || (user.profile as any)?.username;
    const currentUserId = user.id || (user as any).userId;

    return allParticipants.find(
      p =>
        (currentUsername && p.username === currentUsername) ||
        (currentUserId && p.userId === currentUserId)
    );
  }, [user, allParticipants]);

  const isLeader = currentUserParticipant?.role?.toLowerCase() === 'leader';
  const teamId = currentUserParticipant?.teamId;

  // Received Invitations
  const {
    invitations: receivedInvitations,
    isLoading: isLoadingReceived,
    isProcessing: isProcessingReceived,
    acceptInvite,
    rejectInvite,
    error: receivedError,
    fetchMyInvitations,
  } = useMyTeamInvitations(hackathonId);

  // Sent Invitations (only if leader)
  const {
    invitations: sentInvitations,
    isLoading: isLoadingSent,
    cancelInvite,
    isInviting: isProcessingSent,
    error: sentError,
    fetchInvitations,
  } = useTeamInvitations({
    hackathonId,
    teamId: teamId || '',
    autoFetch: !!teamId && isLeader,
  });

  const isLoading =
    activeTab === 'received' ? isLoadingReceived : isLoadingSent;
  const invitations =
    activeTab === 'received' ? receivedInvitations : sentInvitations;
  const error = activeTab === 'received' ? receivedError : sentError;

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'border-[#a7f950]/30 bg-[#a7f950]/10 text-[#a7f950]';
      case 'accepted':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500';
      case 'rejected':
        return 'border-red-500/30 bg-red-500/10 text-red-500';
      case 'expired':
        return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-500';
      default:
        return 'border-zinc-700 bg-zinc-800 text-zinc-400';
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className='h-3 w-3' />;
      case 'accepted':
        return <Check className='h-3 w-3' />;
      case 'rejected':
        return <X className='h-3 w-3' />;
      case 'expired':
        return <AlertCircle className='h-3 w-3' />;
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <h3 className='text-xl font-bold text-white'>Team Invitations</h3>

        {isLeader && (
          <div className='flex rounded-lg border border-zinc-800 bg-zinc-900 p-1'>
            <button
              onClick={() => setActiveTab('received')}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                activeTab === 'received'
                  ? 'bg-zinc-800 text-[#a7f950] shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <Inbox className='h-4 w-4' />
              Received
              {receivedInvitations.filter(i => i.status === 'pending').length >
                0 && (
                <span className='flex h-5 w-5 items-center justify-center rounded-full bg-[#a7f950] text-[10px] font-bold text-black'>
                  {
                    receivedInvitations.filter(i => i.status === 'pending')
                      .length
                  }
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                activeTab === 'sent'
                  ? 'bg-zinc-800 text-[#a7f950] shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <Send className='h-4 w-4' />
              Sent
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className='flex justify-center py-12'>
          <Loader2 className='h-10 w-10 animate-spin text-[#a7f950]' />
        </div>
      ) : error ? (
        <Card className='border border-red-500/20 bg-red-500/10'>
          <CardContent className='flex flex-col items-center justify-center py-8 text-center text-red-400'>
            <AlertCircle className='mb-2 h-8 w-8' />
            <p className='font-medium'>Failed to load invitations</p>
            <p className='text-sm opacity-80'>{error}</p>
            <Button
              variant='outline'
              size='sm'
              className='mt-4 border-red-500/30 hover:bg-red-500/10'
              onClick={() =>
                activeTab === 'received'
                  ? fetchMyInvitations()
                  : fetchInvitations()
              }
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : invitations.length === 0 ? (
        <Card className='border border-dashed border-zinc-800 bg-transparent'>
          <CardContent className='flex flex-col items-center justify-center py-12 text-center text-zinc-500'>
            <UserPlus className='mb-4 h-12 w-12 opacity-20' />
            <p className='text-lg font-medium'>
              No {activeTab} invitations found
            </p>
            <p className='mt-1 text-sm'>
              {activeTab === 'received'
                ? "You haven't received any team invitations yet."
                : "You haven't sent any team invitations yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4'>
          {(invitations as any[]).map(invite => {
            const isReceived = activeTab === 'received';
            const otherParty = (
              isReceived ? invite.inviter : invite.invitee
            ) as any;
            const otherPartyName =
              otherParty.name ||
              otherParty.user?.profile?.name ||
              otherParty.username ||
              otherParty.user?.profile?.username ||
              'Unknown User';
            const otherPartyUsername =
              otherParty.username || otherParty.user?.profile?.username;
            const otherPartyAvatar =
              otherParty.image || otherParty.user?.profile?.image;

            return (
              <Card
                key={invite.id}
                className='border-zinc-800 bg-zinc-900/50 transition-all hover:bg-zinc-900'
              >
                <CardContent className='p-5'>
                  <div className='flex flex-col justify-between gap-6 md:flex-row md:items-center'>
                    <div className='flex items-start gap-4'>
                      <Avatar className='h-12 w-12 border border-zinc-700'>
                        <AvatarImage
                          src={otherPartyAvatar}
                          alt={otherPartyUsername}
                        />
                        <AvatarFallback className='bg-zinc-800 text-zinc-400'>
                          {otherPartyName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='space-y-1'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <p className='font-bold text-white'>
                            {isReceived
                              ? 'Join Team Request'
                              : `Invitation to join @${otherPartyUsername}`}
                          </p>
                          <Badge
                            variant='outline'
                            className={cn(
                              'flex items-center gap-1 py-0.5 text-[10px] font-bold uppercase',
                              getStatusVariant(invite.status)
                            )}
                          >
                            <StatusIcon status={invite.status} />
                            {invite.status}
                          </Badge>
                        </div>
                        <p className='text-sm text-zinc-400'>
                          {isReceived ? 'From ' : 'To '}
                          <span className='font-semibold text-zinc-200'>
                            {otherPartyName}
                          </span>
                          {otherPartyUsername && (
                            <span className='ml-1 text-zinc-500'>
                              @{otherPartyUsername}
                            </span>
                          )}
                        </p>

                        {invite.message && (
                          <p className='mt-3 rounded-lg border-l-2 border-[#a7f950] bg-zinc-800/80 p-3 text-sm text-zinc-300 italic'>
                            "{invite.message}"
                          </p>
                        )}

                        <div className='flex items-center gap-4 pt-2'>
                          <div className='flex items-center gap-1.5 text-xs text-zinc-500'>
                            <Clock className='h-3 w-3' />
                            <span>
                              Sent{' '}
                              {formatDistanceToNow(new Date(invite.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          {invite.status === 'pending' && (
                            <div className='flex items-center gap-1.5 text-xs text-zinc-500'>
                              <AlertCircle className='h-3 w-3 text-amber-500/50' />
                              <span>
                                Expires{' '}
                                {formatDistanceToNow(
                                  new Date(invite.expiresAt),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-wrap items-center gap-3'>
                      {isReceived && invite.status === 'pending' && (
                        <>
                          <Button
                            size='sm'
                            variant='outline'
                            className='border-zinc-700 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white'
                            onClick={() => rejectInvite(invite.id)}
                            disabled={isProcessingReceived}
                          >
                            <X className='mr-2 h-4 w-4' />
                            Decline
                          </Button>
                          <Button
                            size='sm'
                            className='bg-[#a7f950] text-black transition-all hover:bg-[#8ae63a]'
                            onClick={() => acceptInvite(invite.id)}
                            disabled={isProcessingReceived}
                          >
                            <Check className='mr-2 h-4 w-4' />
                            Accept
                          </Button>
                        </>
                      )}
                      {!isReceived && invite.status === 'pending' && (
                        <Button
                          size='sm'
                          variant='outline'
                          className='border-red-500/20 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300'
                          onClick={() => cancelInvite(invite.id)}
                        >
                          <X className='mr-2 h-4 w-4' />
                          Cancel Invitation
                        </Button>
                      )}
                      {invite.status !== 'pending' && (
                        <div className='text-xs text-zinc-500 italic'>
                          {invite.status === 'accepted' &&
                            'This invitation has been accepted.'}
                          {invite.status === 'rejected' &&
                            'This invitation was declined.'}
                          {invite.status === 'expired' &&
                            'This invitation has expired.'}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
