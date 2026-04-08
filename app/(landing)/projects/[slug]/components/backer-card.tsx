'use client';

import Image from 'next/image';
import { Gem, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Contributor } from '@/features/projects/types';

export type BackerTier = 'lead' | 'top' | null;

interface BackerCardProps {
  backer: Contributor;
  tier?: BackerTier;
  currency?: string;
  onClick?: (backer: Contributor) => void;
  className?: string;
}

const TIER_LABELS: Record<Exclude<BackerTier, null>, string> = {
  lead: 'Lead Backer',
  top: 'Top Backer',
};

const TIER_ICONS: Record<Exclude<BackerTier, null>, typeof Gem> = {
  lead: Gem,
  top: Trophy,
};

function formatRelative(iso: string) {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(1, Math.round((now - then) / 1000));
    if (diff < 60) return `${diff}s ago`;
    const min = Math.round(diff / 60);
    if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
    const day = Math.round(hr / 24);
    if (day < 30) return `${day} day${day === 1 ? '' : 's'} ago`;
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function formatAmount(amount: number, currency?: string) {
  const formatted = new Intl.NumberFormat('en-US').format(amount);
  return currency ? `${formatted} ${currency}` : `$${formatted}`;
}

export function BackerCard({
  backer,
  tier = null,
  currency,
  onClick,
  className,
}: BackerCardProps) {
  const TierIcon = tier ? TIER_ICONS[tier] : null;
  const tierLabel = tier ? TIER_LABELS[tier] : 'Backer';
  const hasOnClick = !!onClick;

  return (
    <article
      onClick={() => onClick?.(backer)}
      role={hasOnClick ? 'button' : undefined}
      tabIndex={hasOnClick ? 0 : undefined}
      onKeyDown={
        hasOnClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(backer);
              }
            }
          : undefined
      }
      className={cn(
        'border-stepper-border bg-background-card relative flex flex-col gap-4 rounded-2xl border p-5 transition-colors',
        hasOnClick && 'hover:border-primary/40 cursor-pointer',
        className
      )}
    >
      {/* Tier badge */}
      {tier && (
        <span className='border-primary/40 bg-primary/15 text-primary absolute top-3 right-3 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-bold tracking-wider uppercase'>
          {TierIcon && <TierIcon className='h-3 w-3' />}
          {tier === 'lead' ? 'LEAD' : 'TOP'}
        </span>
      )}

      {/* Header */}
      <header className='flex items-center gap-3'>
        <div className='ring-primary/40 bg-inactive border-stepper-border relative h-12 w-12 shrink-0 overflow-hidden rounded-full border ring-2 ring-offset-2 ring-offset-[var(--color-background-card)]'>
          <Image
            src={backer.image || '/avatar.png'}
            alt={backer.name || 'Backer'}
            fill
            className='object-cover'
            sizes='48px'
          />
        </div>
        <div className='min-w-0'>
          <p className='truncate text-base font-semibold text-white'>
            {backer.name || 'Anonymous'}
          </p>
          <p className='text-primary text-[11px] font-bold tracking-wider uppercase'>
            {tierLabel}
          </p>
        </div>
      </header>

      {/* Stats */}
      <dl className='space-y-2 text-sm'>
        <div className='flex items-center justify-between'>
          <dt className='text-gray-500'>Contribution</dt>
          <dd
            className={cn(
              'font-semibold',
              tier ? 'text-primary' : 'text-white'
            )}
          >
            {formatAmount(backer.amount, currency)}
          </dd>
        </div>
        <div className='flex items-center justify-between'>
          <dt className='text-gray-500'>Time</dt>
          <dd className='text-gray-400'>{formatRelative(backer.date)}</dd>
        </div>
        {backer.username && (
          <div className='flex items-center justify-between'>
            <dt className='text-gray-500'>Handle</dt>
            <dd className='text-gray-400'>@{backer.username}</dd>
          </div>
        )}
      </dl>

      {/* Quote */}
      {backer.message && (
        <p className='border-stepper-border/60 border-t pt-3 text-xs leading-relaxed text-gray-500 italic'>
          &ldquo;{backer.message}&rdquo;
        </p>
      )}
    </article>
  );
}
