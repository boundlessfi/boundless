'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { JudgingCriterion } from '@/lib/api/hackathons';

interface ScoringSectionProps {
  criteria: JudgingCriterion[];
  scores: Record<string, number | string>;
  validationErrors: Record<string, string | null>;
  focusedInput: string | null;
  onScoreChange: (criterionTitle: string, value: string | number) => void;
  onInputFocus: (criterionTitle: string) => void;
  onInputBlur: (criterionTitle: string) => void;
  onKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    criterionTitle: string
  ) => void;
  getScoreColor: (percentage: number) => string;
}

export const ScoringSection = ({
  criteria,
  scores,
  validationErrors,
  focusedInput,
  onScoreChange,
  onInputFocus,
  onInputBlur,
  onKeyDown,
  getScoreColor,
}: ScoringSectionProps) => {
  const scoredCount = criteria.filter(c => {
    const score = scores[c.title];
    return typeof score === 'number' && score > 0;
  }).length;

  return (
    <div className='mb-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h4 className='text-lg font-semibold text-white'>
          Evaluation Criteria
        </h4>
        <div className='text-sm text-gray-400'>
          <span className='font-medium text-white'>{scoredCount}</span> of{' '}
          {criteria.length} scored
        </div>
      </div>

      <div className='space-y-4'>
        {criteria.map(criterion => {
          const score =
            typeof scores[criterion.title] === 'number'
              ? (scores[criterion.title] as number)
              : 0;
          const hasError = validationErrors[criterion.title];
          const isFocused = focusedInput === criterion.title;
          const scorePercentage = score;

          return (
            <div
              key={criterion.title}
              className={cn(
                'rounded-xl border-1 bg-gray-900/50 p-4 transition-all',
                isFocused
                  ? 'border-primary shadow-primary/20 shadow-lg'
                  : 'border-gray-800',
                hasError && 'border-error-500/50'
              )}
            >
              <div className='mb-3 flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='mb-1 flex items-center gap-2'>
                    <span className='font-semibold text-white'>
                      {criterion.title}
                    </span>
                    <Badge className='rounded border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-gray-400'>
                      {criterion.weight}% weight
                    </Badge>
                  </div>
                  {criterion.description && (
                    <p className='mt-1 text-xs text-gray-500'>
                      {criterion.description}
                    </p>
                  )}
                  {hasError && (
                    <div className='mt-1 flex items-center gap-1 text-xs text-red-400'>
                      <AlertCircle className='h-3 w-3' />
                      <span>Score required</span>
                    </div>
                  )}
                </div>

                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    min='0'
                    max='100'
                    value={scores[criterion.title] === '' ? '' : score}
                    onChange={e =>
                      onScoreChange(criterion.title, e.target.value)
                    }
                    onFocus={() => onInputFocus(criterion.title)}
                    onBlur={() => onInputBlur(criterion.title)}
                    onKeyDown={e => onKeyDown(e, criterion.title)}
                    className={cn(
                      'w-20 rounded-lg border-1 bg-gray-950 px-3 py-2 text-center text-lg font-bold text-white transition-all',
                      'focus:ring-primary/50 focus:ring-2 focus:outline-none',
                      isFocused ? 'border-primary' : 'border-gray-700',
                      hasError && 'border-error-500'
                    )}
                    placeholder='0'
                  />
                  <span className='text-sm text-gray-500'>/ 100</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className='bg-background-card h-2 w-full overflow-hidden rounded-full'>
                <div
                  className={cn(
                    'h-full transition-all duration-500 ease-out',
                    getScoreColor(scorePercentage)
                  )}
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
