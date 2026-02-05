'use client';

import { useTeamInvitations } from '@/hooks/hackathon/use-team-invitations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, X, Clock, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TeamInvitationsListProps {
  hackathonId: string;
  teamId: string;
}

export function TeamInvitationsList({
  hackathonId,
  teamId,
}: TeamInvitationsListProps) {
  const { invitations, isLoading, cancelInvite } = useTeamInvitations({
    hackathonId,
    teamId,
  });

  if (isLoading) {
    return (
      <div className='flex justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin text-[#a7f950]' />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-8 text-center text-zinc-500'>
        <UserPlus className='mb-2 h-8 w-8 opacity-20' />
        <p className='text-sm'>No invitations sent yet</p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <h4 className='text-sm font-semibold tracking-wider text-zinc-400 uppercase'>
        Sent Invitations
      </h4>
      <div className='space-y-2'>
        {invitations.map(invite => {
          const invitee = invite.invitee as any;
          const inviteeName =
            invitee.name ||
            invitee.user?.profile?.name ||
            invitee.username ||
            'Unknown User';
          const inviteeUsername =
            invitee.username || invitee.user?.profile?.username;
          const inviteeAvatar = invitee.image || invitee.user?.profile?.image;

          return (
            <Card key={invite.id} className='border-zinc-800 bg-zinc-900/40'>
              <CardContent className='p-3'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-8 w-8 border border-zinc-700'>
                      <AvatarImage src={inviteeAvatar} alt={inviteeUsername} />
                      <AvatarFallback className='bg-zinc-800 text-xs text-zinc-400'>
                        {inviteeName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-medium text-white'>
                        @{inviteeUsername}
                      </p>
                      <div className='flex items-center gap-2 text-xs text-zinc-500'>
                        <Badge
                          variant='outline'
                          className={`h-4 px-1 py-0 text-[10px] ${
                            invite.status === 'pending'
                              ? 'border-[#a7f950]/30 text-[#a7f950]'
                              : 'border-zinc-700 text-zinc-500'
                          }`}
                        >
                          {invite.status.toUpperCase()}
                        </Badge>
                        <span className='flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          {formatDistanceToNow(new Date(invite.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {invite.status === 'pending' && (
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-8 w-8 text-zinc-500 hover:bg-red-400/10 hover:text-red-400'
                      onClick={() => cancelInvite(invite.id)}
                      title='Cancel Invitation'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
