'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeadlineBadgeProps {
  deadline: string | Date | null | undefined;
  /** Optional label prefix, eg "Judging ends". Defaults to no prefix. */
  prefix?: string;
  className?: string;
}

function dayDiff(target: Date): number {
  const ms = target.getTime() - Date.now();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function DeadlineBadge({
  deadline,
  prefix,
  className,
}: DeadlineBadgeProps) {
  if (!deadline) return null;
  const d = typeof deadline === 'string' ? new Date(deadline) : deadline;
  if (Number.isNaN(d.getTime())) return null;

  const days = dayDiff(d);
  let tone: string;
  let text: string;

  if (days < 0) {
    tone = 'border-red-900/40 bg-red-950/40 text-red-300';
    text = `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  } else if (days === 0) {
    tone = 'border-amber-800/40 bg-amber-950/40 text-amber-200';
    text = 'Ends today';
  } else if (days <= 2) {
    tone = 'border-amber-800/40 bg-amber-950/40 text-amber-200';
    text = `${days} day${days === 1 ? '' : 's'} left`;
  } else if (days <= 7) {
    tone = 'border-amber-900/30 bg-amber-950/20 text-amber-300/80';
    text = `${days} days left`;
  } else {
    tone = 'border-white/10 bg-white/5 text-gray-400';
    text = `${days} days left`;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium',
        tone,
        className
      )}
    >
      <Clock className='h-3 w-3' />
      {prefix && <span className='text-gray-500'>{prefix}</span>}
      {text}
    </span>
  );
}
