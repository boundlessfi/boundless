export function formatJudgeDate(
  value: string | Date | null | undefined
): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function relativeDeadline(
  value: string | Date | null | undefined
): string {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  const diffMs = d.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (Number.isNaN(diffMs)) return '';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays === -1) return 'yesterday';
  if (diffDays > 0) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

/** Break a future date into a `{days, hours, minutes, seconds}` countdown. */
export interface CountdownParts {
  isPast: boolean;
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function getCountdown(
  value: string | Date | null | undefined,
  now: number = Date.now()
): CountdownParts {
  if (!value) {
    return {
      isPast: true,
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }
  const target =
    typeof value === 'string' ? new Date(value).getTime() : value.getTime();
  const diff = target - now;
  if (Number.isNaN(diff)) {
    return {
      isPast: true,
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }
  if (diff <= 0) {
    return {
      isPast: true,
      totalMs: diff,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { isPast: false, totalMs: diff, days, hours, minutes, seconds };
}

export function formatCountdown(parts: CountdownParts): string {
  if (parts.isPast) return 'Closed';
  if (parts.days >= 1) {
    return `${parts.days}d ${parts.hours}h`;
  }
  if (parts.hours >= 1) {
    return `${parts.hours}h ${String(parts.minutes).padStart(2, '0')}m`;
  }
  return `${parts.minutes}m ${String(parts.seconds).padStart(2, '0')}s`;
}
