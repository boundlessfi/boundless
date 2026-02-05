'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTeamInvitations } from '@/hooks/hackathon/use-team-invitations';
import { Loader2 } from 'lucide-react';

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hackathonId: string;
  teamId: string;
  inviteeId: string;
  inviteeName: string;
}

export function InviteUserModal({
  open,
  onOpenChange,
  hackathonId,
  teamId,
  inviteeId,
  inviteeName,
}: InviteUserModalProps) {
  const [message, setMessage] = useState('');
  const { inviteUser, isInviting } = useTeamInvitations({
    hackathonId,
    teamId,
    autoFetch: false,
  });

  const handleInvite = async () => {
    try {
      await inviteUser({
        inviteeIdentifier: inviteeId,
        message: message.trim() || undefined,
      });
      onOpenChange(false);
      setMessage('');
    } catch (error) {
      // Error handled by hook toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='border-zinc-800 bg-zinc-900 text-white sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Invite to Team</DialogTitle>
          <DialogDescription className='text-zinc-400'>
            Invite{' '}
            <span className='font-semibold text-white'>{inviteeName}</span> to
            join your team.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='message' className='text-sm font-medium'>
              Optional Message
            </Label>
            <Textarea
              id='message'
              placeholder='e.g. We would love to have you on our team! We need someone with your skills.'
              className='min-h-[100px] border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus:ring-[#a7f950]'
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={500}
            />
            <p className='text-right text-xs text-zinc-500'>
              {message.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='border-zinc-700 text-white hover:bg-zinc-800'
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={isInviting}
            style={{ backgroundColor: '#a7f950', color: '#000000' }}
            className='hover:bg-[#8ae63a]'
          >
            {isInviting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Sending...
              </>
            ) : (
              'Send Invitation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
