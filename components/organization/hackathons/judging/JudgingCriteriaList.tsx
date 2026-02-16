'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Info } from 'lucide-react';
import type { JudgingCriterion } from '@/lib/api/hackathons';
import EmptyState from '@/components/EmptyState';

interface JudgingCriteriaListProps {
  criteria: JudgingCriterion[];
  emptyState?: React.ReactNode;
}

export function JudgingCriteriaList({
  criteria,
  emptyState,
}: JudgingCriteriaListProps) {
  if (!criteria || criteria.length === 0) {
    return (
      emptyState || (
        <EmptyState
          title='No Judging Criteria Set'
          description='There are no judging criteria defined for this hackathon yet.'
        />
      )
    );
  }

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {criteria.map((criterion, index) => (
          <Card
            key={criterion.id || index}
            className='bg-background/8 border-gray-900'
          >
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-start justify-between text-base font-medium text-white'>
                <span>{criterion.title || criterion.name}</span>
                <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium'>
                  {criterion.weight}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-400'>
                {criterion.description || 'No description provided'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalWeight !== 100 && (
        <div className='flex items-center gap-3 rounded-lg border border-amber-900/50 bg-amber-950/20 p-4 text-amber-500'>
          <Info className='h-5 w-5 shrink-0' />
          <p className='text-sm'>
            Note: Total weight is {totalWeight}%. Recommended total is 100%.
          </p>
        </div>
      )}
    </div>
  );
}
