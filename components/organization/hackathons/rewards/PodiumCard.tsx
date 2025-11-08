'use client';

import React from 'react';
import Image from 'next/image';
import { Crown, Triangle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Submission } from './types';
import { calculatePercentage, getScoreColor } from './utils';

interface PodiumCardProps {
  rank: number;
  submission?: Submission;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) {
    return <Crown className='h-6 w-6 text-yellow-400' />;
  }
  if (rank === 2) {
    return <Triangle className='h-4 w-4 fill-green-500 text-green-500' />;
  }
  if (rank === 3) {
    return (
      <Triangle className='h-4 w-4 rotate-180 fill-gray-500 text-gray-500' />
    );
  }
  return null;
};

const getRankLabel = (rank: number) => {
  return String(rank);
};

const getCardStyles = (rank: number) => {
  if (rank === 1) {
    return {
      gradient: 'from-[#030303] to-[#F5B546]',
      minHeight: 'min-h-[140px] sm:min-h-[180px]',
      avatarSize: 'h-16 w-16 sm:h-21 sm:w-21',
    };
  }
  if (rank === 2) {
    return {
      gradient: 'from-[#030303] to-[#04326B]',
      minHeight: 'min-h-[120px] sm:min-h-[158px]',
      avatarSize: 'h-14 w-14 sm:h-21 sm:w-21',
    };
  }
  if (rank === 3) {
    return {
      gradient: 'from-[#030303] to-[#DD524D]',
      minHeight: 'min-h-[140px] sm:min-h-[180px]',
      avatarSize: 'h-16 w-16 sm:h-21 sm:w-21',
    };
  }
  return {
    gradient: 'from-[#030303] to-[#4A4A4A]',
    minHeight: 'min-h-[120px] sm:min-h-[158px]',
    avatarSize: 'h-14 w-14 sm:h-21 sm:w-21',
  };
};

export default function PodiumCard({ rank, submission }: PodiumCardProps) {
  const styles = getCardStyles(rank);
  const percentage = submission
    ? calculatePercentage(submission.score, submission.maxScore)
    : 0;

  return (
    <div className={cn('flex flex-col items-center')}>
      <div className='mb-2 w-full overflow-hidden rounded-b-lg bg-gradient-to-b from-[#030303] to-[#919191] p-px sm:mb-3'>
        <div
          className={cn(
            'flex w-full flex-col items-center rounded-b-lg bg-gradient-to-b p-2 sm:p-4',
            styles.gradient,
            styles.minHeight
          )}
        >
          <div className='mb-1 text-sm font-bold text-white sm:mb-2 sm:text-lg'>
            {getRankLabel(rank)}
            <sup>
              {rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'}
            </sup>
          </div>
          <div className='mb-2 sm:mb-4'>
            {rank === 1 ? (
              <Image
                src='/crown.svg'
                alt='Crown'
                width={45}
                height={45}
                className='h-8 w-8 object-contain sm:h-[45px] sm:w-[45px]'
              />
            ) : rank <= 3 ? (
              getRankIcon(rank)
            ) : (
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-white sm:h-[45px] sm:w-[45px] sm:text-lg'>
                {rank}
              </div>
            )}
          </div>
          <Avatar
            className={cn(
              'border-background-main-bg bg-background-main-bg rounded-full border',
              styles.avatarSize
            )}
          >
            {submission ? (
              <>
                <AvatarImage
                  src={submission.avatar || 'https://github.com/shadcn.png'}
                />
                <AvatarFallback>
                  {submission.name.charAt(0) || 'U'}
                </AvatarFallback>
              </>
            ) : (
              <AvatarFallback className='text-lg text-gray-500 sm:text-2xl'>
                ?
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      </div>
      <div className='mb-0.5 text-center text-xs font-medium text-white sm:mb-1 sm:text-sm'>
        {submission?.name || '?'}
      </div>
      <div className='mb-1 text-center text-xs text-gray-400 sm:mb-2 sm:text-sm'>
        {submission?.projectName || '?'}
      </div>
      <div
        className={cn(
          'text-xs font-medium sm:text-sm',
          submission ? getScoreColor(percentage) : 'text-gray-500'
        )}
      >
        {submission
          ? `${submission.score}/${submission.maxScore} (${percentage}%)`
          : '0/0 (0%)'}
      </div>
    </div>
  );
}
