'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { HelpCircle, BookOpen, ExternalLink, Lightbulb } from 'lucide-react';

const DOCS_URL = 'https://docs.boundlessfi.xyz/';

/** One short, contextual tip per wizard step. Keyed by 1-based step number. */
const STEP_TIPS: Record<number, string> = {
  1: 'Use a clear name and a square logo. The tagline is your one-line pitch to backers.',
  2: 'Tell backers the problem, your approach, and what success looks like. Specific beats vague.',
  3: 'Set the total you want to raise. Boundless takes its fee from that amount, so you receive your goal minus the fee.',
  4: 'Break the work into checkpoints. Funds release equally across milestones after a reviewer approves each one.',
  5: 'Building solo is fine, team is optional. Your Telegram handle lets the Boundless team reach you.',
  6: 'Add your repo and socials so backers can verify the project is real.',
  7: 'This is exactly what backers will see. Review it, then submit for review.',
};

interface Props {
  activeStep: number;
}

export default function WizardHelpButton({ activeStep }: Props) {
  const tip = STEP_TIPS[activeStep];

  return (
    <div className='fixed right-5 bottom-5 z-50'>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type='button'
            aria-label='Help and documentation'
            className='group hover:border-primary/60 hover:text-primary flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 shadow-lg shadow-black/40 transition'
          >
            <HelpCircle className='h-5 w-5' />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align='end'
          side='top'
          sideOffset={12}
          className='w-80 border-zinc-800 bg-zinc-950 p-0 text-white'
        >
          <div className='border-b border-zinc-800 px-4 py-3'>
            <p className='text-sm font-semibold'>Need a hand?</p>
            <p className='text-xs text-zinc-500'>
              Tips for this step, plus the full guide.
            </p>
          </div>

          {tip && (
            <div className='flex gap-2.5 px-4 py-3'>
              <Lightbulb className='mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400' />
              <p className='text-sm text-zinc-300'>{tip}</p>
            </div>
          )}

          <a
            href={DOCS_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-between gap-2 border-t border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-900'
          >
            <span className='flex items-center gap-2'>
              <BookOpen className='text-primary h-4 w-4' />
              Read the campaign guide
            </span>
            <ExternalLink className='h-3.5 w-3.5 text-zinc-600' />
          </a>
        </PopoverContent>
      </Popover>
    </div>
  );
}
