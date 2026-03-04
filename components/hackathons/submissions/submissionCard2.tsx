'use client';

import React from 'react';
import Image from 'next/image';
import { MessageCircle, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SubmissionCard2Props {
  title: string;
  submitterName: string;
  submitterAvatar?: string;
  image?: string;
  upvotes?: number;
  comments?: number;
  submittedDate?: string;
  hasUserUpvoted?: boolean;
  rank?: number;
  submissionId?: string;
  onViewClick?: () => void;
  onUpvoteClick?: (e: React.MouseEvent) => void;
  onCommentClick?: (e: React.MouseEvent) => void;
  isVoting?: boolean;
}

const SubmissionCard2 = ({
  title = 'Untitled Submission',
  submitterName = 'Anonymous',
  submitterAvatar,
  image = '/banner.png',
  upvotes = 0,
  comments = 0,
  submittedDate,
  hasUserUpvoted = false,
  rank,
  onViewClick,
  onUpvoteClick,
  onCommentClick,
  isVoting = false,
}: SubmissionCard2Props) => {
  const formattedDate = submittedDate
    ? formatDistanceToNow(new Date(submittedDate), { addSuffix: true })
    : 'recently';

  return (
    <div
      onClick={onViewClick}
      className={cn(
        'group bg-background-card flex w-fit items-center gap-3 rounded-xl border border-zinc-800 p-3 transition-all duration-200',
        onViewClick &&
          'cursor-pointer hover:border-[#A7F950]/30 hover:bg-zinc-900 active:scale-[0.99]'
      )}
    >
      {/* Optional rank badge */}
      {rank !== undefined && (
        <span className='w-5 shrink-0 text-center text-xs font-bold text-zinc-600'>
          {rank}
        </span>
      )}

      {/* Thumbnail */}
      <div className='relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[10px] bg-zinc-800'>
        <Image
          src={image}
          alt={title}
          fill
          sizes='60px'
          className='object-cover transition-transform duration-300 group-hover:scale-105'
        />
      </div>

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <h3
          className={cn(
            'mb-1 line-clamp-1 max-w-[200px] text-sm font-semibold text-zinc-100 transition-colors',
            onViewClick && 'group-hover:text-[#A7F950]'
          )}
        >
          {title}
        </h3>

        <div className='flex max-w-[200px] items-center gap-1.5'>
          {/* Submitter avatar */}
          {submitterAvatar ? (
            <div
              style={{ backgroundImage: `url(${submitterAvatar})` }}
              className='h-4 w-4 shrink-0 rounded-full border border-zinc-700 bg-zinc-800 bg-cover bg-center'
            />
          ) : (
            <div className='flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800'>
              <span className='text-[7px] font-bold text-zinc-400 uppercase'>
                {submitterName.charAt(0)}
              </span>
            </div>
          )}

          <p className='truncate text-[11px] leading-none'>
            <span className='font-semibold text-zinc-300'>{submitterName}</span>
            <span className='mx-1 text-zinc-600'>·</span>
            <span className='text-zinc-500'>{formattedDate}</span>
          </p>
        </div>
      </div>

      {/* Interaction buttons */}
      <div className='flex shrink-0 items-center gap-1'>
        <button
          type='button'
          onClick={e => {
            e.stopPropagation();
            onUpvoteClick?.(e);
          }}
          disabled={isVoting}
          className={cn(
            'flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
            hasUserUpvoted
              ? 'bg-[#A7F950]/10 text-[#A7F950]'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100',
            isVoting && 'cursor-not-allowed opacity-50'
          )}
        >
          <ThumbsUp
            className='h-3.5 w-3.5'
            fill={hasUserUpvoted ? 'currentColor' : 'none'}
          />
          <span>{upvotes}</span>
        </button>

        <button
          type='button'
          onClick={e => {
            e.stopPropagation();
            onCommentClick?.(e);
          }}
          className='flex items-center gap-1 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-all duration-150 hover:bg-zinc-700 hover:text-zinc-100'
        >
          <MessageCircle className='h-3.5 w-3.5' />
          <span>{comments}</span>
        </button>
      </div>
    </div>
  );
};

export default SubmissionCard2;
