'use client';

import React from 'react';
import PodiumCard from './PodiumCard';
import { Submission } from './types';
import { cn } from '@/lib/utils';

interface PodiumSectionProps {
  submissions: Submission[];
  maxRank?: number;
}

export default function PodiumSection({
  submissions,
  maxRank = 3,
}: PodiumSectionProps) {
  const winners = submissions
    .filter(s => s.rank && s.rank <= maxRank)
    .sort((a, b) => (a.rank || 0) - (b.rank || 0));

  const getGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    if (count === 4) return 'grid-cols-2 sm:grid-cols-4';
    if (count === 5) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
  };

  const shouldUsePodiumLayout = maxRank <= 3 && winners.length <= 3;

  if (shouldUsePodiumLayout) {
    const secondPlace = winners.find(s => s.rank === 2);
    const firstPlace = winners.find(s => s.rank === 1);
    const thirdPlace = winners.find(s => s.rank === 3);

    return (
      <div className='mb-6 flex flex-wrap items-start justify-center gap-2 sm:gap-3 md:gap-4'>
        {secondPlace && <PodiumCard rank={2} submission={secondPlace} />}
        {firstPlace && <PodiumCard rank={1} submission={firstPlace} />}
        {thirdPlace && <PodiumCard rank={3} submission={thirdPlace} />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mb-6 grid items-start justify-center gap-2 sm:gap-3 md:gap-4',
        getGridCols(winners.length)
      )}
    >
      {winners.map(winner => (
        <PodiumCard
          key={winner.id}
          rank={winner.rank || 0}
          submission={winner}
        />
      ))}
    </div>
  );
}
