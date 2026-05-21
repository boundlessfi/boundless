'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Submission } from './types';
import WinnerCard from './WinnerCard';

interface WinnersGridTier {
  rank: number;
  prizeAmount: string;
  currency: string;
  place?: string;
  kind?: 'OVERALL' | 'TRACK';
  trackId?: string;
}

interface WinnersGridProps {
  prizeTiers: WinnersGridTier[];
  winners: Submission[];
  getPrizeForRank: (rank: number) => {
    amount: string;
    currency: string;
    label: string;
  };
}

const isOverallTier = (t: WinnersGridTier) => !t.kind || t.kind === 'OVERALL';
const isTrackTier = (t: WinnersGridTier) => t.kind === 'TRACK' && !!t.trackId;

const formatTrackPrize = (
  amount: string | undefined,
  currency: string | undefined
) => {
  const cleanAmount = parseFloat(amount || '0').toLocaleString('en-US');
  const cleanCurrency = currency || 'USDC';
  return {
    amount: cleanAmount,
    currency: cleanCurrency,
    label: `${cleanAmount} ${cleanCurrency}`,
  };
};

export default function WinnersGrid({
  prizeTiers,
  winners,
  getPrizeForRank,
}: WinnersGridProps) {
  const totalTiers = prizeTiers.length;

  // Build the display list as (tier, winner) pairs. Overall tiers are
  // matched to winners by `rank`, track tiers by `trackId`. Tiers
  // without a winner are skipped (preserves the previous "only show
  // tiers with assigned winners" behaviour).
  const displayPairs = useMemo(() => {
    type Pair = { key: string; tier: WinnersGridTier; winner: Submission };
    const overallPairs: Pair[] = [];
    const trackPairs: Pair[] = [];
    for (const tier of prizeTiers) {
      if (isOverallTier(tier)) {
        const winner = winners.find(
          w => w.rank === tier.rank && !w.isTrackWinner
        );
        if (winner) {
          overallPairs.push({
            key: `overall-${tier.rank}`,
            tier,
            winner,
          });
        }
      } else if (isTrackTier(tier)) {
        const winner = winners.find(
          w => w.isTrackWinner && w.trackId === tier.trackId
        );
        if (winner) {
          trackPairs.push({
            key: `track-${tier.trackId}`,
            tier,
            winner,
          });
        }
      }
    }
    return { overallPairs, trackPairs };
  }, [prizeTiers, winners]);

  const getGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count === 3) return 'grid-cols-1 md:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  };

  // 1st/2nd/3rd podium re-ordering (2-1-3) only kicks in when exactly
  // three overall winners are present, matching the prior look.
  const orderedOverall = useMemo(() => {
    const sorted = [...displayPairs.overallPairs].sort(
      (a, b) => a.tier.rank - b.tier.rank
    );
    if (sorted.length === 3) {
      const first = sorted.find(p => p.tier.rank === 1) ?? sorted[0];
      const second = sorted.find(p => p.tier.rank === 2) ?? sorted[1];
      const third = sorted.find(p => p.tier.rank === 3) ?? sorted[2];
      return [second, first, third].filter(Boolean);
    }
    return sorted;
  }, [displayPairs.overallPairs]);

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-medium text-gray-500'>
          {winners.length}/{totalTiers} Winners Assigned
        </span>
      </div>

      {orderedOverall.length > 0 && (
        <div
          className={cn('mb-2 grid gap-3', getGridCols(orderedOverall.length))}
        >
          {orderedOverall.map(({ key, tier, winner }) => {
            const prize = getPrizeForRank(tier.rank);
            return (
              <WinnerCard
                key={key}
                rank={tier.rank}
                winner={winner}
                prizeAmount={prize.amount || '0'}
                currency={prize.currency || 'USDC'}
                prizeLabel={prize.label}
                maxRank={totalTiers}
              />
            );
          })}
        </div>
      )}

      {displayPairs.trackPairs.length > 0 && (
        <div className='mb-6 space-y-2'>
          <div className='text-xs font-semibold tracking-wide text-gray-400 uppercase'>
            Track Winners
          </div>
          <div
            className={cn(
              'grid gap-3',
              getGridCols(displayPairs.trackPairs.length)
            )}
          >
            {displayPairs.trackPairs.map(({ key, tier, winner }) => {
              const prize = formatTrackPrize(tier.prizeAmount, tier.currency);
              return (
                <WinnerCard
                  key={key}
                  // Synthetic rank that's outside the overall range so
                  // the card doesn't render a crown / podium chrome
                  // meant for ranks 1-3.
                  rank={Math.max(totalTiers, 4)}
                  winner={winner}
                  prizeAmount={prize.amount}
                  currency={prize.currency}
                  prizeLabel={tier.place || prize.label}
                  maxRank={totalTiers}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
