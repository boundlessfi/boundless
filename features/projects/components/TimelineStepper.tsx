'use client';

import React from 'react';
import { CrowdfundingProject } from '@/features/projects/types';
import { Check, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineStepperProps {
  project: CrowdfundingProject;
}

interface TimelineItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  date: string;
  completed: boolean;
  current: boolean;
}

const TimelineStepper: React.FC<TimelineStepperProps> = () => {
  const timelineItems: TimelineItem[] = [
    {
      id: 'public-voting',
      label: 'Public Voting',
      icon: <ThumbsUp className='h-4 w-4' />,
      date: 'July 23, 2025',
      completed: true,
      current: false,
    },
    {
      id: 'admin-approval',
      label: 'Admin Approval',
      icon: <Check className='h-4 w-4' />,
      date: 'July 23, 2025',
      completed: true,
      current: false,
    },
    {
      id: 'submitted-validation',
      label: 'Submitted for Validation',
      icon: <Check className='h-4 w-4' />,
      date: 'July 21, 2025',
      completed: true,
      current: false,
    },
    {
      id: 'project-created',
      label: 'Project Created',
      icon: <Check className='h-4 w-4' />,
      date: 'July 21, 2025',
      completed: true,
      current: false,
    },
  ];

  return (
    <div className='space-y-4'>
      {timelineItems.map((item, index) => (
        <div key={item.id} className='flex items-start space-x-4'>
          {}
          <div className='flex flex-col items-center'>
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                item.completed
                  ? 'border border-[#1C1C1C] bg-[#1C1C1C] text-[#B5B5B5]'
                  : item.current
                    ? 'bg-[#04326B] text-white'
                    : 'border border-[#1C1C1C] bg-[#1C1C1C] text-[#B5B5B5]'
              )}
              style={{
                boxShadow: '0px 1.5px 4px -1px #10192812',
              }}
            >
              {item.icon}
            </div>
            {}
            {index < timelineItems.length - 1 && (
              <div className='mt-2 h-8 w-0.5 bg-[#2A2A2A]'></div>
            )}
          </div>

          {}
          <div className='flex-1 pt-1'>
            <h4
              className={cn(
                'mb-1 font-medium',
                item.id === 'public-voting' ? 'text-[#F5F5F5]' : 'text-gray-600'
              )}
            >
              {item.label}
            </h4>
            <span
              className={cn(
                'text-sm',
                item.id === 'public-voting' ? 'text-[#B5B5B5]' : 'text-gray-600'
              )}
            >
              {item.date}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineStepper;
