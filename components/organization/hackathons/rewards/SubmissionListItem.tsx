'use client';

import React from 'react';
import { Crown, ChevronDown } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Submission } from './types';
import { calculatePercentage, getScoreColor, getRankBadgeColor } from './utils';

interface SubmissionListItemProps {
  submission: Submission;
  onRankChange: (submissionId: string, newRank: number | null) => void;
  maxRank?: number;
}

export default function SubmissionListItem({
  submission,
  onRankChange,
  maxRank = 3,
}: SubmissionListItemProps) {
  const percentage = calculatePercentage(submission.score, submission.maxScore);

  return (
    <div className='bg-background-card flex flex-col gap-3 rounded-lg border border-gray-900 p-3 transition-colors hover:bg-gray-900/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4'>
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        <Avatar className='h-10 w-10 flex-shrink-0'>
          <AvatarImage src={submission.avatar} />
          <AvatarFallback>
            {submission.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2'>
            <span className='truncate text-sm font-medium text-white'>
              {submission.name}
            </span>
            <Link
              href={`#`}
              className='group hover:text-primary flex items-center gap-1 text-xs text-gray-400 transition-colors sm:text-sm'
            >
              <span className='truncate'>{submission.submissionTitle}</span>
              <ArrowUpRight className='h-3 w-3 flex-shrink-0 transition-opacity' />
            </Link>
          </div>
        </div>
      </div>
      <div className='flex flex-shrink-0 items-center justify-between gap-2 sm:gap-4'>
        <span
          className={cn(
            'text-xs font-medium sm:text-sm',
            getScoreColor(percentage)
          )}
        >
          {submission.score}/{submission.maxScore} ({percentage}%)
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className={cn(
                'gap-1.5 border border-gray-800 text-white hover:bg-gray-800 sm:gap-2',
                submission.rank === 1
                  ? 'bg-warning-800 border-warning-800'
                  : submission.rank === 2
                    ? 'bg-secondary-800 border-secondary-800'
                    : submission.rank === 3
                      ? 'bg-error-800 border-error-800'
                      : ''
              )}
            >
              {submission.rank ? (
                <>
                  <Image
                    src='/crown.svg'
                    alt='Crown'
                    width={16}
                    height={16}
                    className='h-3 w-3 object-contain sm:h-4 sm:w-4'
                  />
                  <span
                    className={cn(
                      'text-[10px] sm:text-xs',
                      getRankBadgeColor(submission.rank)
                    )}
                  >
                    {submission.rank}
                    {submission.rank === 1
                      ? 'st'
                      : submission.rank === 2
                        ? 'nd'
                        : submission.rank === 3
                          ? 'rd'
                          : 'th'}
                  </span>
                </>
              ) : (
                <Crown className='h-3 w-3 text-gray-400 sm:h-4 sm:w-4' />
              )}
              <ChevronDown className='h-2.5 w-2.5 sm:h-3 sm:w-3' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='bg-background-card border-gray-800 text-white'
          >
            {Array.from({ length: maxRank }, (_, i) => i + 1).map(rank => {
              const getRankSuffix = (r: number) => {
                if (r === 1) return 'st';
                if (r === 2) return 'nd';
                if (r === 3) return 'rd';
                return 'th';
              };

              const getRankIconColor = (r: number) => {
                if (r === 1) return 'text-yellow-400';
                if (r === 2) return 'text-blue-400';
                if (r === 3) return 'text-red-400';
                return 'text-gray-400';
              };

              return (
                <DropdownMenuItem
                  key={rank}
                  onClick={() => onRankChange(submission.id, rank)}
                  className='cursor-pointer hover:bg-gray-800'
                >
                  <Crown
                    className={cn('mr-2 h-4 w-4', getRankIconColor(rank))}
                  />
                  {rank}
                  {getRankSuffix(rank)} Place
                </DropdownMenuItem>
              );
            })}
            {submission.rank && (
              <DropdownMenuItem
                onClick={() => onRankChange(submission.id, null)}
                className='cursor-pointer text-red-400 hover:bg-gray-800'
              >
                Remove Rank
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
