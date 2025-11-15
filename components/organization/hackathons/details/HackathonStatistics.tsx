'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import type { HackathonStatistics as HackathonStatisticsType } from '@/lib/api/hackathons';

interface HackathonStatisticsProps {
  statistics: HackathonStatisticsType | null;
  loading: boolean;
}

export const HackathonStatistics: React.FC<HackathonStatisticsProps> = ({
  statistics,
  loading,
}) => {
  return (
    <div className='grid w-full grid-cols-2 gap-4 text-gray-500 md:flex md:grid-cols-4 md:justify-between md:gap-0'>
      <div className='flex flex-col'>
        <span className='text-xs'>Participants</span>
        <span className='text-sm font-medium'>
          {loading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            (statistics?.participantsCount ?? 0)
          )}
        </span>
      </div>
      <div className='flex flex-col'>
        <span className='text-xs'>Submissions</span>
        <span className='text-sm font-medium'>
          {loading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            (statistics?.submissionsCount ?? 0)
          )}
        </span>
      </div>
      <div className='flex flex-col'>
        <span className='text-xs'>Active Judges</span>
        <span className='text-sm font-medium'>
          {loading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            (statistics?.activeJudges ?? 0)
          )}
        </span>
      </div>
      <div className='flex flex-col'>
        <span className='text-xs'>Completed Milestones</span>
        <span className='text-sm font-medium'>
          {loading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            (statistics?.completedMilestones ?? 0)
          )}
        </span>
      </div>
    </div>
  );
};
