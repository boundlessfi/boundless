'use client';

import Link from 'next/link';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useProfileCompleteness } from '@/hooks/use-profile-completeness';

export function ProfileIncompleteBanner() {
  const { isComplete, isLoading, isAuthenticated, missingFields } =
    useProfileCompleteness();
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || !isAuthenticated || isComplete || dismissed) {
    return null;
  }

  return (
    <div className='relative z-50 flex items-center gap-3 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm lg:px-6'>
      <AlertCircle className='h-4 w-4 shrink-0 text-amber-400' />
      <p className='flex-1 text-white/70'>
        <span className='text-white/90'>Profile incomplete</span>
        <span className='mx-1.5 hidden text-white/30 sm:inline'>—</span>
        <span className='hidden sm:inline'>
          missing {missingFields.join(', ')}.
        </span>{' '}
        <Link
          href='/me/settings?tab=profile'
          className='font-medium text-amber-400 underline-offset-2 hover:underline'
        >
          Complete now
        </Link>
      </p>
      <button
        onClick={() => setDismissed(true)}
        className='shrink-0 rounded-md p-1 text-white/30 transition-colors hover:bg-white/5 hover:text-white/60'
        aria-label='Dismiss'
      >
        <X className='h-3.5 w-3.5' />
      </button>
    </div>
  );
}
