'use client';

import Image from 'next/image';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelative } from './utils';
import { VoteType, type VoterDto } from '@/types/votes';

interface VoterRowProps {
  voter: VoterDto;
  onClick?: (voter: VoterDto) => void;
}

export function VoterRow({ voter, onClick }: VoterRowProps) {
  const isSupport = voter.voteType === VoteType.UPVOTE;
  const handleName = voter.user?.username
    ? `@${voter.user.username}`
    : 'anonymous';
  const displayName = voter.user?.name || 'Anonymous User';
  const hasProfile = !!voter.user?.username;

  return (
    <li
      onClick={() => hasProfile && onClick?.(voter)}
      role={hasProfile ? 'button' : undefined}
      tabIndex={hasProfile ? 0 : undefined}
      onKeyDown={
        hasProfile
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(voter);
              }
            }
          : undefined
      }
      className={cn(
        'border-stepper-border/60 grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 border-b py-5 last:border-b-0 sm:grid-cols-[auto_1fr_auto]',
        hasProfile && 'hover:bg-inactive/30 cursor-pointer transition-colors'
      )}
    >
      {/* Avatar */}
      <div className='border-stepper-border bg-inactive relative h-11 w-11 shrink-0 overflow-hidden rounded-full border'>
        {voter.user?.image ? (
          <Image
            src={voter.user.image}
            alt={displayName}
            fill
            className='object-cover'
            sizes='44px'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center text-sm font-semibold text-gray-500'>
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Identity */}
      <div className='min-w-0'>
        <p className='truncate text-sm font-semibold text-white sm:text-base'>
          {displayName}
        </p>
        <p className='text-primary truncate text-xs sm:text-sm'>{handleName}</p>
      </div>

      {/* Stance pill + timestamp */}
      <div className='col-span-3 flex items-center justify-end gap-3 sm:col-span-1 sm:flex-col sm:items-end sm:gap-1'>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase sm:text-xs',
            isSupport
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-error-500/40 bg-error-500/10 text-error-300'
          )}
        >
          {isSupport ? (
            <ThumbsUp className='h-3 w-3' />
          ) : (
            <ThumbsDown className='h-3 w-3' />
          )}
          {isSupport ? 'Support' : 'Against'}
        </span>
        <span className='text-xs text-gray-600'>
          {formatRelative(voter.createdAt)}
        </span>
      </div>
    </li>
  );
}
