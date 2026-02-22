'use client';

import React, { useMemo } from 'react';
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
  getPrizeForRank: (rank: number) => {
    amount: string;
    currency: string;
    label: string;
  };
}

export default function WinnersGrid({
  prizeTiers,
  winners,
  getPrizeForRank,
}: WinnersGridProps) {
  const totalTiers = prizeTiers.length;

  // Filter only tiers that have an assigned winner
  const tiersWithWinners = useMemo(() => {
    return prizeTiers.filter(tier => winners.some(w => w.rank === tier.rank));
  }, [prizeTiers, winners]);

  const getGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count === 3) return 'grid-cols-1 md:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  };

  const getTierOrder = (availableTiers: typeof prizeTiers) => {
    const sortedTiers = [...availableTiers].sort((a, b) => a.rank - b.rank);

    if (sortedTiers.length === 3) {
      const secondTier = sortedTiers.find(t => t.rank === 2) || sortedTiers[1];
      const firstTier = sortedTiers.find(t => t.rank === 1) || sortedTiers[0];
      const thirdTier = sortedTiers.find(t => t.rank === 3) || sortedTiers[2];
      return [secondTier, firstTier, thirdTier].filter(Boolean);
    }

    return sortedTiers;
  };

  const tiersToDisplay = getTierOrder(tiersWithWinners);

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-medium text-gray-500'>
          {winners.length}/{totalTiers} Winners Assigned
        </span>
      </div>

      <div
        className={cn('mb-8 grid gap-3', getGridCols(tiersToDisplay.length))}
      >
        {tiersToDisplay.map(tier => {
          if (!tier) return null;

          const rank = tier.rank;
          const winner = winners.find(s => s.rank === rank);
          const prize = getPrizeForRank(rank);
          const amount = prize.amount || '0';
          const currency = prize.currency || 'USDC';
          const label = prize.label;

          return (
            <WinnerCard
              key={rank}
              rank={rank}
              winner={winner}
              prizeAmount={amount}
              currency={currency}
              prizeLabel={label}
              maxRank={totalTiers}
            />
          );
        })}
      </div>
    </div>
  );
}
