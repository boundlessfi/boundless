'use client';

import { Button } from '@/components/ui/button';
import { useMessages } from '@/components/messages/MessagesProvider';
import { useAuthStatus } from '@/hooks/use-auth';
import { useUnreadMessagesCount } from '@/hooks/use-unread-messages-count';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessagesTriggerProps {
  className?: string;
  label?: string;
}

export function MessagesTrigger({ className, label }: MessagesTriggerProps) {
  const { user } = useAuthStatus();
  const { openMessages } = useMessages();
  const { count } = useUnreadMessagesCount();

  if (!user) return null;

  const display = count > 99 ? '99+' : String(count);

  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      className={cn('relative text-white hover:bg-white/10', className)}
      onClick={() => openMessages()}
      aria-label={
        label ??
        (count > 0 ? `Open messages (${count} unread)` : 'Open messages')
      }
    >
      <MessageCircle className='h-5 w-5' />
      {count > 0 && (
        <span
          aria-hidden
          className='bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold ring-2 ring-[#0D0E10]'
        >
          {display}
        </span>
      )}
    </Button>
  );
}
