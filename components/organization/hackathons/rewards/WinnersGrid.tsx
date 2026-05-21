'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
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

  // Total prize pool across all tiers (overall + track). Drives the
  // summary chip in the header so the organizer sees the dollar figure
  // they're about to commit, not just the winner count.
  const totalPool = useMemo(() => {
    return prizeTiers.reduce((sum, t) => {
      const amount = parseFloat(t.prizeAmount || '0');
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);
  }, [prizeTiers]);
  const totalPoolCurrency = prizeTiers[0]?.currency || 'USDC';

  const assignedCount = winners.length;
  const isComplete = assignedCount === totalTiers && totalTiers > 0;

  return (
    <div className='flex flex-col gap-5'>
      {/* Summary header: completion state + total pool. Replaces the
          minimal "3/8 Winners Assigned" that read as confusing in the
          wizard preview. */}
      <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5'>
        <div className='flex items-center gap-2'>
          {isComplete ? (
            <CheckCircle2 className='h-4 w-4 text-green-400' />
          ) : (
            <AlertTriangle className='h-4 w-4 text-amber-400' />
          )}
          <div className='text-sm'>
            <span
              className={cn(
                'font-semibold',
                isComplete ? 'text-green-300' : 'text-amber-300'
              )}
            >
              {isComplete
                ? `All ${totalTiers} winners assigned`
                : `${assignedCount} of ${totalTiers} winners assigned`}
            </span>
            {!isComplete && totalTiers - assignedCount > 0 && (
              <span className='ml-1 text-xs text-gray-500'>
                ({totalTiers - assignedCount} unassigned)
              </span>
            )}
          </div>
        </div>
        {totalPool > 0 && (
          <div className='flex items-center gap-1.5 rounded-full border border-[#2775CA]/20 bg-[#2775CA]/10 px-3 py-1'>
            <span className='text-[10px] font-bold tracking-wide text-white uppercase'>
              {totalPool.toLocaleString('en-US')} {totalPoolCurrency} pool
            </span>
          </div>
        )}
      </div>

      {orderedOverall.length > 0 && (
        <div className='space-y-2'>
          {displayPairs.trackPairs.length > 0 && (
            <div className='text-xs font-semibold tracking-wide text-gray-400 uppercase'>
              Overall Placements
            </div>
          )}
          <div className={cn('grid gap-3', getGridCols(orderedOverall.length))}>
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
        </div>
      )}

      {displayPairs.trackPairs.length > 0 && (
        <div className='space-y-2'>
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
                  rank={tier.rank}
                  winner={winner}
                  prizeAmount={prize.amount}
                  currency={prize.currency}
                  prizeLabel={tier.place || prize.label}
                  maxRank={totalTiers}
                  // The card switches to track styling when this is set:
                  // shows the track name as a chip instead of the rank
                  // ribbon, and uses neutral (non-podium) borders.
                  trackName={tier.place || winner.trackName || 'Track'}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
