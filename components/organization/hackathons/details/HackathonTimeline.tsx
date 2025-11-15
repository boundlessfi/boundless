'use client';

import { Check } from 'lucide-react';
import {
  calculateTimelineStatus,
  formatTimelineDate,
} from '@/lib/utils/hackathon-timeline';
import type { HackathonTimeline as HackathonTimelineType } from '@/lib/api/hackathons';

interface HackathonTimelineProps {
  timeline: HackathonTimelineType | undefined;
}

export const HackathonTimeline: React.FC<HackathonTimelineProps> = ({
  timeline,
}) => {
  const timelineStatus = timeline ? calculateTimelineStatus(timeline) : null;

  if (!timelineStatus) {
    return (
      <div className='text-sm text-gray-400'>Timeline data not available</div>
    );
  }

  return (
    <div className='relative'>
      <div className='space-y-0'>
        {timelineStatus.phases.map((phase, index) => {
          const isLast = index === timelineStatus.phases.length - 1;
          const isActive = phase.status === 'active';
          const isCompleted = phase.status === 'completed';

          return (
            <div
              key={phase.name}
              className='relative flex items-start gap-3 pb-6 sm:gap-4'
              style={isLast ? {} : { paddingBottom: '1.5rem' }}
            >
              <div className='relative flex flex-col items-center'>
                {isActive ? (
                  <div className='bg-active-bg z-10 flex flex-shrink-0 items-center justify-center rounded-full p-1'>
                    <div className='bg-primary z-10 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full' />
                  </div>
                ) : isCompleted ? (
                  <div className='z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#1C1C1C] bg-[#171717]'>
                    <Check className='h-4 w-4 text-gray-800' />
                  </div>
                ) : (
                  <div className='z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#1C1C1C] bg-[#171717] opacity-50' />
                )}
                {!isLast && (
                  <div className='absolute top-6 left-1/2 h-6 w-0.5 -translate-x-1/2'>
                    <div className='h-full border-l-2 border-dashed border-gray-600' />
                  </div>
                )}
              </div>
              <div className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                <div className='min-w-0 flex-1'>
                  <h3 className='mb-1 text-sm font-medium text-white sm:text-base'>
                    {phase.name}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm ${
                      isCompleted
                        ? 'text-gray-400'
                        : isActive
                          ? 'text-white/60'
                          : 'text-white/40'
                    }`}
                  >
                    {phase.description}
                  </p>
                </div>
                <div className='flex-shrink-0 text-xs whitespace-nowrap text-white/60 sm:text-sm'>
                  {formatTimelineDate(phase.endDate)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
