'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type SubmissionStage =
  | 'Not Started'
  | 'In Progress'
  | 'Submitted'
  | 'Under Review'
  | 'Results Pending';

interface ProgressIndicatorProps {
  stage: SubmissionStage;
  className?: string;
}

const STAGE_CONFIG: Record<SubmissionStage, { color: string; label: string }> =
  {
    'Not Started': {
      color: 'bg-zinc-500/20 text-zinc-400',
      label: 'Not Started',
    },
    'In Progress': {
      color: 'bg-blue-500/20 text-blue-400',
      label: 'In Progress',
    },
    Submitted: { color: 'bg-green-500/20 text-green-400', label: 'Submitted' },
    'Under Review': {
      color: 'bg-purple-500/20 text-purple-400',
      label: 'Under Review',
    },
    'Results Pending': {
      color: 'bg-yellow-500/20 text-yellow-400',
      label: 'Results Pending',
    },
  };

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  stage,
  className,
}) => {
  const config = STAGE_CONFIG[stage];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-white/10 px-2.5 py-0.5 text-xs font-medium backdrop-blur-md',
        config.color,
        className
      )}
    >
      <div className='mr-1.5 h-1.5 w-1.5 rounded-full bg-current' />
      {config.label}
    </div>
  );
};
