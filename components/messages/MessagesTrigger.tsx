'use client';

import { Button } from '@/components/ui/button';
import { useMessages } from '@/components/messages/MessagesProvider';
import { useAuthStatus } from '@/hooks/use-auth';
import { MessageCircle } from 'lucide-react';

export function MessagesTrigger() {
  const { user } = useAuthStatus();
  const { openMessages } = useMessages();

  if (!user) return null;

  return (
    <Button
      variant='ghost'
      size='icon'
      className='text-white hover:bg-white/10'
      onClick={() => openMessages()}
      aria-label='Open messages'
    >
      <MessageCircle className='h-5 w-5' />
    </Button>
  );
}
