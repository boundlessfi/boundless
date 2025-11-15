'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Submission } from './types';
import WinnerCard from './WinnerCard';

interface WinnersGridProps {
  prizeTiers: Array<{
    rank: number;
    prizeAmount: string;
    currency: string;
  }>;
  winners: Submission[];
  getPrizeForRank: (rank: number) => string;
}

export default function WinnersGrid({
  prizeTiers,
  winners,
  getPrizeForRank,
}: WinnersGridProps) {
  const maxRank = prizeTiers.length;

  const getGridCols = () => {
    if (maxRank === 1) return 'grid-cols-1';
    if (maxRank === 2) return 'grid-cols-1 md:grid-cols-2';
    if (maxRank === 3) return 'grid-cols-1 md:grid-cols-3';
    if (maxRank === 4) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  };

  const getTierOrder = () => {
    const sortedTiers = [...prizeTiers].sort((a, b) => a.rank - b.rank);

    if (maxRank <= 3) {
      const secondTier = sortedTiers.find(t => t.rank === 2);
      const firstTier = sortedTiers.find(t => t.rank === 1);
      const thirdTier = sortedTiers.find(t => t.rank === 3);
      return [secondTier, firstTier, thirdTier].filter(Boolean);
    }

    return sortedTiers;
  };

  const tiers = getTierOrder();

  return (
    <div className={cn('mb-12 grid gap-6', getGridCols())}>
      {tiers.map(tier => {
        if (!tier) return null;

        const rank = tier.rank;
        const winner = winners.find(s => s.rank === rank);
        const prize = getPrizeForRank(rank);
        const parts = prize.split(' ');
        const amount = parts.slice(0, -1).join(' ');
        const currency = parts[parts.length - 1];

        return (
          <WinnerCard
            key={rank}
            rank={rank}
            winner={winner}
            prizeAmount={amount}
            currency={currency}
            maxRank={maxRank}
          />
        );
      })}
    </div>
  );
}
