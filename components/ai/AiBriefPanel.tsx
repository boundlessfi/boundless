'use client';

import { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';

interface AiBriefPanelProps {
  /** The brief that produced the AI draft (may include folded-in clarify answers). */
  brief?: string | null;
  className?: string;
}

/**
 * Collapsible "Your brief" panel shown beside an AI-generated draft on the review
 * step, so the organizer can compare what they asked for against what the AI
 * produced. Renders nothing for manually-created drafts. Shared by both wizards.
 */
export default function AiBriefPanel({ brief, className }: AiBriefPanelProps) {
  const [open, setOpen] = useState(false);
  if (!brief || brief.trim() === '') return null;

  return (
    <div
      className={[
        'rounded-xl border border-zinc-800 bg-zinc-900/40',
        className ?? '',
      ].join(' ')}
    >
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        className='flex w-full items-center justify-between gap-2 px-4 py-3 text-left'
        aria-expanded={open}
      >
        <span className='flex items-center gap-2 text-sm font-medium text-white'>
          <FileText className='h-4 w-4 text-gray-400' />
          Your brief
        </span>
        <ChevronDown
          className={[
            'h-4 w-4 text-gray-500 transition-transform',
            open ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>
      {open && (
        <div className='border-t border-zinc-800 px-4 py-3'>
          <p className='text-sm whitespace-pre-wrap text-gray-300'>{brief}</p>
        </div>
      )}
    </div>
  );
}
