'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

import { BoundlessButton } from '@/components/buttons';

export interface AiAssumption {
  section: string;
  field: string;
  note: string;
}

interface AiAssumptionsBannerProps {
  assumptions: AiAssumption[];
  /** Jump to the wizard step that owns an assumption so the organizer can edit. */
  onReview?: (section: string) => void;
  className?: string;
}

/**
 * Shows the non-obvious choices an AI draft made ("Assumed a single winner…")
 * so the organizer can see and correct every guess. Shared by the bounty and
 * hackathon review steps. Dismissible; renders nothing when there's nothing to
 * surface.
 */
export default function AiAssumptionsBanner({
  assumptions,
  onReview,
  className,
}: AiAssumptionsBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !assumptions || assumptions.length === 0) return null;

  return (
    <div
      className={[
        'border-primary/30 from-primary/10 rounded-xl border bg-gradient-to-r to-transparent p-4',
        className ?? '',
      ].join(' ')}
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-start gap-3'>
          <span className='bg-primary/15 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg'>
            <Sparkles className='h-4 w-4' />
          </span>
          <div>
            <p className='text-sm font-semibold text-white'>
              A few things the AI assumed
            </p>
            <p className='text-xs text-gray-400'>
              Review these guesses and correct anything that doesn&apos;t match
              what you meant.
            </p>
          </div>
        </div>
        <button
          type='button'
          aria-label='Dismiss'
          onClick={() => setDismissed(true)}
          className='text-gray-500 transition-colors hover:text-gray-300'
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      <ul className='mt-3 space-y-2'>
        {assumptions.map((a, i) => (
          <li
            key={`${a.section}-${a.field}-${i}`}
            className='flex items-center justify-between gap-3 rounded-lg bg-black/20 px-3 py-2'
          >
            <span className='text-sm text-gray-300'>{a.note}</span>
            {onReview && (
              <BoundlessButton
                type='button'
                variant='outline'
                size='sm'
                onClick={() => onReview(a.section)}
              >
                Review
              </BoundlessButton>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
