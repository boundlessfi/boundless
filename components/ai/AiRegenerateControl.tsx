'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { BoundlessButton } from '@/components/buttons';
import { ApiError } from '@/lib/api';

type RegenData = Record<string, unknown>;

interface AiRegenerateControlProps {
  /** Render only on AI-generated drafts. */
  available: boolean;
  /** True while the regenerate request is in flight. */
  isRunning: boolean;
  /** Run the regenerate; resolve with the proposed values (wizard section shape). */
  onRun: (instructions: string) => Promise<RegenData | null>;
  /** Apply the accepted values to the tab's form. */
  onApply: (data: RegenData) => void;
  label?: string;
  /** Optional custom preview of the proposed values. */
  summarize?: (data: RegenData) => string;
  /** Pre-fill the instructions box (e.g. after a mode change). */
  defaultInstruction?: string;
}

const truncate = (s: string, n = 80): string =>
  s.length > n ? `${s.slice(0, n)}…` : s;

/** Default compact preview: one line per changed field. */
function defaultSummary(data: RegenData): string {
  return Object.entries(data)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: ${v.length} item(s)`;
      if (v && typeof v === 'object') return `${k}: updated`;
      return `${k}: ${truncate(String(v ?? ''))}`;
    })
    .join('\n');
}

/**
 * Steerable, non-destructive "Regenerate with AI" control shared by the bounty
 * and hackathon wizards. The organizer can add a short instruction ("make the
 * deadline 3 weeks"), runs it, then **previews** the proposed values and chooses
 * Apply or Discard — so a regenerate never silently overwrites in-progress edits.
 */
export default function AiRegenerateControl({
  available,
  isRunning,
  onRun,
  onApply,
  label = 'Regenerate with AI',
  summarize,
  defaultInstruction,
}: AiRegenerateControlProps) {
  const [open, setOpen] = useState(false);
  const [instructions, setInstructions] = useState(defaultInstruction ?? '');
  const [proposed, setProposed] = useState<RegenData | null>(null);

  if (!available) return null;

  const reset = () => {
    setProposed(null);
    setInstructions(defaultInstruction ?? '');
  };

  const handleRun = async () => {
    try {
      const data = await onRun(instructions.trim());
      if (!data || Object.keys(data).length === 0) {
        toast.message('No changes were proposed. Try a different instruction.');
        return;
      }
      setProposed(data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 503) {
          toast.error('The AI assistant is busy. Try again in a moment.');
          return;
        }
        toast.error(err.message || 'Could not regenerate this section.');
        return;
      }
      toast.error('Could not regenerate this section.');
    }
  };

  const handleApply = () => {
    if (proposed) onApply(proposed);
    toast.success('Applied. Review the new values.');
    setOpen(false);
    reset();
  };

  return (
    <Popover
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <PopoverTrigger asChild>
        <BoundlessButton
          type='button'
          variant='outline'
          size='sm'
          className='gap-2'
        >
          <Sparkles className='h-4 w-4' />
          {label}
        </BoundlessButton>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-80 border-zinc-800 bg-zinc-950 text-white'
      >
        {proposed === null ? (
          <div className='space-y-3'>
            <div>
              <p className='text-sm font-medium'>Regenerate with AI</p>
              <p className='text-xs text-gray-400'>
                Optionally tell the AI what to change.
              </p>
            </div>
            <Textarea
              rows={3}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder='e.g. make the deadline about 3 weeks, or use two winners'
              className='text-sm'
            />
            <div className='flex justify-end'>
              <BoundlessButton
                type='button'
                size='sm'
                loading={isRunning}
                icon={<Sparkles className='h-4 w-4' />}
                iconPosition='left'
                onClick={handleRun}
              >
                Generate
              </BoundlessButton>
            </div>
          </div>
        ) : (
          <div className='space-y-3'>
            <p className='text-sm font-medium'>Proposed changes</p>
            <pre className='max-h-48 overflow-auto rounded-lg bg-black/30 p-2 text-xs whitespace-pre-wrap text-gray-300'>
              {(summarize ?? defaultSummary)(proposed)}
            </pre>
            <div className='flex justify-between gap-2'>
              <BoundlessButton
                type='button'
                variant='outline'
                size='sm'
                onClick={reset}
              >
                Discard
              </BoundlessButton>
              <BoundlessButton type='button' size='sm' onClick={handleApply}>
                Apply
              </BoundlessButton>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
