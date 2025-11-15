'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TotalScoreCardProps {
  totalScore: number;
  percentage: number;
  getScoreColor: (percentage: number) => string;
}

export const TotalScoreCard = ({
  totalScore,
  percentage,
  getScoreColor,
}: TotalScoreCardProps) => {
  return (
    <div className='to-primary/20 relative overflow-hidden rounded-xl border-2 border-gray-800 bg-gradient-to-br from-gray-900 p-6'>
      <div className='absolute inset-0 top-1/2 right-0 h-full w-full -translate-y-1/2'>
        <div className='absolute top-0 right-0 bottom-0 left-0 h-full w-full rounded-xl backdrop-blur-[2px]' />
        <Image
          src='/metric-image.svg'
          alt='Metrics'
          width={40}
          height={40}
          className='h-full w-full object-cover'
        />
      </div>
      <div className='relative z-10'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <div className='mb-1 text-sm font-medium text-gray-400'>
              Weighted Total Score
            </div>
            <div className='flex items-baseline gap-2'>
              <span className='text-4xl font-bold text-white'>
                {totalScore.toFixed(1)}
              </span>
              <span className='text-xl text-gray-500'>/ 100</span>
            </div>
          </div>
          <div
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white',
              getScoreColor(percentage)
            )}
          >
            {percentage}%
          </div>
        </div>

        <div className='h-3 w-full overflow-hidden rounded-full bg-gray-800'>
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out',
              getScoreColor(percentage)
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
