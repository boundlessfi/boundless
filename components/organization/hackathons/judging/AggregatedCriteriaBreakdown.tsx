'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { JudgingCriterion } from '@/lib/api/hackathons/judging';

interface AggregatedCriteriaBreakdownProps {
  criteriaBreakdown: Array<{
    criterionId: string;
    averageScore: number;
    min: number;
    max: number;
    variance: number;
  }>;
  criteria: JudgingCriterion[];
}

const AggregatedCriteriaBreakdown = ({
  criteriaBreakdown,
  criteria,
}: AggregatedCriteriaBreakdownProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-blue-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className='mt-6 space-y-4 rounded-lg border border-white/5 bg-white/5 p-4'>
      <div className='flex items-center justify-between'>
        <h6 className='text-xs font-semibold tracking-wider text-gray-400 uppercase'>
          Criteria Performance Summary
        </h6>
        <div className='flex gap-4 text-[10px] text-gray-500'>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='flex cursor-help items-center gap-1'>
                <div className='h-2 w-2 rounded-full bg-gray-500' /> Range
                (Min-Max)
              </span>
            </TooltipTrigger>
            <TooltipContent>
              The gap between the highest and lowest scores given by judges for
              this criterion
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='flex cursor-help items-center gap-1'>
                <div className='bg-primary h-2 w-2 rounded-full' /> Average
              </span>
            </TooltipTrigger>
            <TooltipContent>
              The mean score across all judges for this criterion
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {criteriaBreakdown.map(item => {
          const criterion = criteria.find(c => c.id === item.criterionId);
          const title = criterion?.title || criterion?.name || item.criterionId;

          return (
            <div key={item.criterionId} className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='max-w-[200px] truncate font-medium text-gray-300'>
                  {title}
                </span>
                <div className='flex items-center gap-2'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='flex cursor-help items-center gap-1 font-mono text-xs text-gray-500'>
                        <Info className='h-3 w-3' />
                        Var: {(item.variance ?? 0).toFixed(2)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Variance measures the diversity in judge scoring. Higher
                      values indicate disagreement among judges.
                    </TooltipContent>
                  </Tooltip>
                  <Badge
                    variant='outline'
                    className='bg-primary/10 text-primary border-primary/20 font-mono text-xs'
                  >
                    {(item.averageScore ?? 0).toFixed(2)}
                  </Badge>
                </div>
              </div>

              <div className='relative h-2 w-full overflow-hidden rounded-full bg-gray-800'>
                {/* Min-Max Range Bar */}
                <div
                  className='absolute h-full bg-gray-700/50'
                  style={{
                    left: `${(item.min ?? 0) * 10}%`,
                    width: `${((item.max ?? 0) - (item.min ?? 0)) * 10}%`,
                  }}
                />
                {/* Average Marker */}
                <div
                  className={cn(
                    'absolute h-full transition-all',
                    getScoreColor(item.averageScore ?? 0)
                  )}
                  style={{ width: `${(item.averageScore ?? 0) * 10}%` }}
                />
              </div>

              <div className='flex justify-between font-mono text-[9px] text-gray-500'>
                <span>Min: {(item.min ?? 0).toFixed(1)}</span>
                <span>Max: {(item.max ?? 0).toFixed(1)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AggregatedCriteriaBreakdown;
