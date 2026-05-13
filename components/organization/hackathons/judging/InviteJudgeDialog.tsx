'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useInviteJudge } from '@/hooks/judge/use-organizer-invitations';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteJudgeDialog({
  open,
  onOpenChange,
  organizationId,
  hackathonId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  hackathonId: string;
}) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const invite = useInviteJudge(organizationId, hackathonId);

  const reset = () => {
    setEmail('');
    setDisplayName('');
    setMessage('');
    setEmailError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError(null);
    invite.mutate(
      {
        email: trimmed,
        displayName: displayName.trim() || undefined,
        message: message.trim() || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className='border-white/5 bg-[#101010] text-white sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Invite a judge</DialogTitle>
          <DialogDescription className='text-gray-500'>
            They receive an email with a link to accept. Accepting grants access
            only to this hackathon, not to your organization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='judge-email'
              className='mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-500 uppercase'
            >
              Email
            </label>
            <Input
              id='judge-email'
              type='email'
              autoFocus
              required
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              placeholder='judge@example.com'
              className='border-white/10 bg-black/40 text-white'
            />
            {emailError && (
              <p className='mt-1 text-xs text-red-400'>{emailError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='judge-display-name'
              className='mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-500 uppercase'
            >
              Display name (optional)
            </label>
            <Input
              id='judge-display-name'
              type='text'
              maxLength={120}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder='Shown on the judging panel'
              className='border-white/10 bg-black/40 text-white'
            />
          </div>

          <div>
            <label
              htmlFor='judge-message'
              className='mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-500 uppercase'
            >
              Personal note (optional)
            </label>
            <Textarea
              id='judge-message'
              maxLength={1000}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder='Why you’d like them on the panel, what to expect…'
              className='min-h-[96px] border-gray-800 bg-gray-950 text-white'
            />
          </div>

          <DialogFooter className='gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={invite.isPending}
              className='border-white/10 bg-transparent text-gray-300 hover:bg-white/5'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={invite.isPending || !email.trim()}
              className='bg-primary hover:bg-primary/90 text-primary-foreground'
            >
              {invite.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Sending…
                </>
              ) : (
                'Send invitation'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
