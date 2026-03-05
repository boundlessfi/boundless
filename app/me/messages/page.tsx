'use client';

import { useEffect } from 'react';
import { useMessages } from '@/components/messages/MessagesProvider';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';

export default function MessagesPage() {
  const { openMessages } = useMessages();

  useEffect(() => {
    openMessages();
  }, [openMessages]);

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='p-10'>
        <p className='text-sm text-zinc-400'>
          Use the messages icon in the header to open your conversations, or
          select a conversation above.
        </p>
      </div>
    </AuthGuard>
  );
}
