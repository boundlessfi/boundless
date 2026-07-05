import { EyeOff } from 'lucide-react';

import { DueCountdown } from './DueCountdown';

/**
 * Sealed-until-deadline card shared by the organizer submissions review and
 * payout tabs, so the competition seal looks and behaves the same on both.
 */
export function SealedUntilDeadline({
  deadline,
  title,
  description,
}: {
  deadline: string;
  title: string;
  description: string;
}) {
  return (
    <div className='rounded-2xl border border-zinc-800 bg-zinc-900/40 py-16 text-center'>
      <EyeOff className='mx-auto mb-3 h-6 w-6 text-zinc-500' />
      <p className='text-sm font-medium text-zinc-200'>{title}</p>
      <p className='mt-1 text-xs text-zinc-500'>{description}</p>
      <div className='mt-3 flex justify-center'>
        <DueCountdown
          deadline={deadline}
          className='flex items-center gap-1.5 text-xs font-medium text-zinc-300'
        />
      </div>
    </div>
  );
}
