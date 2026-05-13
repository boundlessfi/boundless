'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCountdown, getCountdown } from './utils';

interface CountdownBannerProps {
  deadline: string | Date | null | undefined;
  /** Label shown before the countdown, e.g. "Judging closes in". */
  label?: string;
  /** Hides the banner entirely when the deadline is further out than this. */
  showWithinHours?: number;
  /** Optional copy rendered after the countdown. */
  hint?: string;
  /** Custom message when the deadline has passed. */
  closedLabel?: string;
  className?: string;
}

/**
 * Live deadline ticker. Ticks every second under one hour, every minute
 * otherwise. Stays out of the way when the deadline is far off, slides
 * in when it's near, and switches to a closed state past the deadline.
 */
export function CountdownBanner({
  deadline,
  label = 'Judging closes in',
  showWithinHours = 48,
  hint,
  closedLabel = 'Judging is closed',
  className,
}: CountdownBannerProps) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!deadline) return;
    const tick = () => setNow(Date.now());
    tick();
    // Tick every second under an hour for the live HH:MM:SS feel,
    // otherwise every minute to keep this cheap.
    const parts = getCountdown(deadline);
    const intervalMs = parts.totalMs < 60 * 60 * 1000 ? 1000 : 60_000;
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [deadline]);

  if (!deadline) return null;
  const parts = getCountdown(deadline, now);

  if (parts.isPast) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-2.5 text-sm text-red-200',
          className
        )}
      >
        <Clock className='h-4 w-4 shrink-0' />
        <span className='font-medium'>{closedLabel}</span>
        {hint && <span className='text-red-300/70'>· {hint}</span>}
      </div>
    );
  }

  const hoursLeft = parts.days * 24 + parts.hours;
  if (hoursLeft > showWithinHours) return null;

  const tone =
    hoursLeft < 1
      ? 'border-red-900/40 bg-red-950/30 text-red-200'
      : hoursLeft < 6
        ? 'border-amber-800/40 bg-amber-950/30 text-amber-200'
        : 'border-amber-900/30 bg-amber-950/20 text-amber-200/90';

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm',
        tone,
        className
      )}
    >
      <Clock className='h-4 w-4 shrink-0' />
      <span>{label}</span>
      <span className='font-mono font-semibold tabular-nums'>
        {formatCountdown(parts)}
      </span>
      {hint && <span className='ml-auto text-xs opacity-70'>{hint}</span>}
    </div>
  );
}
