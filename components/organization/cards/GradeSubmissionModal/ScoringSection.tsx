'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { JudgingCriterion } from '@/lib/api/hackathons';

interface ScoringSectionProps {
  criteria: JudgingCriterion[];
  scores: Record<string, number | string>;
  comments: Record<string, string>;
  validationErrors: Record<string, string | null>;
  focusedInput: string | null;
  onScoreChange: (criterionKey: string, value: string | number) => void;
  onCommentChange: (criterionKey: string, value: string) => void;
  onInputFocus: (criterionKey: string) => void;
  onInputBlur: (criterionKey: string) => void;
  onKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    criterionKey: string
  ) => void;
  getScoreColor: (percentage: number) => string;
  overallComment: string;
  onOverallCommentChange: (value: string) => void;
  showComments?: boolean;
}

export const ScoringSection = ({
  criteria,
  scores,
  comments,
  validationErrors,
  focusedInput,
  onScoreChange,
  onCommentChange,
  onInputFocus,
  onInputBlur,
  onKeyDown,
  getScoreColor,
  overallComment,
  onOverallCommentChange,
  showComments = true,
}: ScoringSectionProps) => {
  const getCriterionKey = (criterion: JudgingCriterion) => {
    return criterion.id || criterion.name || criterion.title;
  };

  const scoredCount = criteria.filter(c => {
    const key = getCriterionKey(c);
    const score = scores[key];
    return typeof score === 'number' && score > 0;
  }).length;

  return (
    <div className='mb-6 px-1'>
      <div className='mb-4 flex items-center justify-between'>
        <h4 className='text-lg font-semibold text-white'>
          Evaluation Criteria
        </h4>
        <div className='text-sm text-gray-400'>
          <span className='font-medium text-white'>{scoredCount}</span> of{' '}
          {criteria.length} scored
        </div>
      </div>

      <div className='space-y-6'>
        {criteria.map(criterion => {
          const key = getCriterionKey(criterion);
          const criterionTitle =
            criterion.title || criterion.name || 'Untitled Criterion';
          const score =
            typeof scores[key] === 'number' ? (scores[key] as number) : 0;
          const comment = comments[key] || '';
          const hasError = validationErrors[key];
          const isFocused = focusedInput === key;
          const scorePercentage = score * 10;

          return (
            <div
              key={key}
              className={cn(
                'rounded-xl border bg-gray-900/50 p-5 transition-all',
                isFocused
                  ? 'border-primary shadow-primary/20 shadow-lg'
                  : 'border-gray-800',
                hasError && 'border-error-500/50'
              )}
            >
              <div className='mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start'>
                <div className='flex-1'>
                  <div className='mb-1 flex items-center gap-2'>
                    <span className='font-semibold text-white'>
                      {criterionTitle}
                    </span>
                    <Badge className='rounded border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-gray-400'>
                      {criterion.weight}% weight
                    </Badge>
                  </div>
                  {criterion.description && (
                    <p className='mt-1 max-w-xl text-xs leading-relaxed text-gray-400'>
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

                <div className='flex shrink-0 items-center gap-3'>
                  <div className='flex flex-col items-center gap-1'>
                    <div className='flex items-center gap-2'>
                      <input
                        type='number'
                        id={`score-${key}`}
                        min='0'
                        max='10'
                        step='0.1'
                        value={scores[key] === '' ? '' : score}
                        onChange={e => onScoreChange(key, e.target.value)}
                        onFocus={() => onInputFocus(key)}
                        onBlur={() => onInputBlur(key)}
                        onKeyDown={e => onKeyDown(e, key)}
                        className={cn(
                          'w-20 rounded-lg border bg-gray-950 px-3 py-2 text-center text-xl font-bold text-white transition-all',
                          'focus:ring-primary/50 focus:ring-2 focus:outline-none',
                          isFocused ? 'border-primary' : 'border-gray-700',
                          hasError && 'border-error-500'
                        )}
                        placeholder='0'
                      />
                      <span className='text-sm font-medium text-gray-500'>
                        / 10
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className='bg-background-card mb-4 h-1.5 w-full overflow-hidden rounded-full'>
                <div
                  className={cn(
                    'h-full transition-all duration-500 ease-out',
                    getScoreColor(scorePercentage)
                  )}
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>

              {showComments && (
                <div className='mt-4'>
                  <label
                    htmlFor={`comment-${key}`}
                    className='mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-500 uppercase'
                  >
                    Judge Feedback (Optional)
                  </label>
                  <textarea
                    id={`comment-${key}`}
                    value={comment}
                    onChange={e => onCommentChange(key, e.target.value)}
                    placeholder={`Share your thoughts on ${criterionTitle.toLowerCase()}...`}
                    className={cn(
                      'min-h-[80px] w-full rounded-lg border border-gray-800 bg-gray-950/50 p-3 text-sm text-gray-200 transition-all',
                      'focus:border-primary focus:ring-primary/20 focus:ring-1 focus:outline-none',
                      'resize-none placeholder:text-gray-600'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Global Comment Section */}
        {showComments && (
          <div className='mt-8 border-t border-gray-800 pt-8'>
            <h4 className='mb-4 flex items-center gap-2 text-lg font-semibold text-white'>
              Overall Evaluation
            </h4>
            <div className='rounded-xl border border-gray-800 bg-gray-900/50 p-5'>
              <label
                htmlFor='overall-comment'
                className='mb-2 block text-[10px] font-semibold tracking-wider text-gray-500 uppercase'
              >
                Summary Feedback for the Entire Project
              </label>
              <textarea
                id='overall-comment'
                value={overallComment}
                onChange={e => onOverallCommentChange(e.target.value)}
                placeholder='Summarize your evaluation or add any final notes here...'
                className={cn(
                  'min-h-[120px] w-full rounded-lg border border-gray-800 bg-gray-950/50 p-4 font-sans text-sm text-gray-200 transition-all',
                  'focus:border-primary focus:ring-primary/20 focus:ring-1 focus:outline-none',
                  'resize-none placeholder:text-gray-600'
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
