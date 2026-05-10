'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getLeaderboard } from '@/lib/api/leaderboard';
import { LeaderboardTable } from './LeaderboardTable';
import { LeaderboardSkeleton } from './LeaderboardSkeleton';
import type {
  LeaderboardEntry,
  LeaderboardTimeframe,
  LeaderboardQueryParams,
} from '@/types/leaderboard';
import type { ReputationTier } from '@/lib/utils/reputation-tier';

const TIMEFRAME_LABELS: Record<LeaderboardTimeframe, string> = {
  ALL_TIME: 'All Time',
  THIS_MONTH: 'This Month',
  THIS_WEEK: 'This Week',
  THIS_DAY: 'Today',
};

const TIER_LABELS: Record<ReputationTier | 'ALL', string> = {
  ALL: 'All Tiers',
  NEWCOMER: 'Newcomer',
  CONTRIBUTOR: 'Contributor',
  ESTABLISHED: 'Established',
  EXPERT: 'Expert',
  LEGEND: 'Legend',
};

const PAGE_SIZE = 20;

export function LeaderboardPageClient() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('ALL_TIME');
  const [tier, setTier] = useState<ReputationTier | 'ALL'>('ALL');

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: LeaderboardQueryParams = {
        page,
        limit: PAGE_SIZE,
        timeframe,
      };
      if (tier !== 'ALL') params.tier = tier;

      const data = await getLeaderboard(params);
      setEntries(data?.entries ?? []);
      setTotalCount(data?.totalCount ?? 0);
    } catch {
      setEntries([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, timeframe, tier]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Real-time: subscribe to leaderboard:global and re-fetch on any activity/vote
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
    if (!baseUrl) return;

    const socket = io(`${baseUrl}/realtime`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('subscribe-entity', {
        entityType: 'leaderboard',
        entityId: 'global',
      });
    });

    socket.on(
      'entity-update',
      (payload: { entityType: string; entityId: string }) => {
        if (
          payload.entityType === 'leaderboard' &&
          payload.entityId === 'global'
        ) {
          fetchLeaderboard();
        }
      }
    );

    return () => {
      socket.emit('unsubscribe-entity', {
        entityType: 'leaderboard',
        entityId: 'global',
      });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchLeaderboard]);

  // Reset to page 1 when filters change
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value as LeaderboardTimeframe);
    setPage(1);
  };

  const handleTierChange = (value: string) => {
    setTier(value as ReputationTier | 'ALL');
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='space-y-2'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10'>
            <Trophy className='h-5 w-5 text-amber-400' />
          </div>
          <h1 className='text-3xl font-bold text-white'>
            Community Leaderboard
          </h1>
        </div>
        <p className='text-zinc-400'>
          Top contributors ranked by reputation score. Vote weight is determined
          by tier.
        </p>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap items-center gap-3'>
        {/* Timeframe tabs */}
        <div className='flex rounded-lg border border-zinc-800 bg-zinc-900/50 p-1'>
          {(Object.keys(TIMEFRAME_LABELS) as LeaderboardTimeframe[]).map(tf => (
            <button
              key={tf}
              onClick={() => handleTimeframeChange(tf)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {TIMEFRAME_LABELS[tf]}
            </button>
          ))}
        </div>

        {/* Tier filter */}
        <Select value={tier} onValueChange={handleTierChange}>
          <SelectTrigger className='w-40 border-zinc-800 bg-zinc-900/50 text-white'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='border-zinc-800 bg-zinc-950 text-white'>
            {(Object.keys(TIER_LABELS) as (ReputationTier | 'ALL')[]).map(t => (
              <SelectItem key={t} value={t} className='hover:bg-zinc-800'>
                {TIER_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {totalCount > 0 && (
          <span className='ml-auto text-sm text-zinc-500 tabular-nums'>
            {totalCount.toLocaleString()} contributor
            {totalCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <LeaderboardSkeleton />
      ) : (
        <LeaderboardTable entries={entries} />
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className='flex items-center justify-center gap-3'>
          <Button
            variant='outline'
            size='sm'
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className='border-zinc-800 bg-zinc-900/50 text-white hover:bg-zinc-800'
          >
            Previous
          </Button>
          <span className='text-sm text-zinc-400 tabular-nums'>
            Page {page} of {totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className='border-zinc-800 bg-zinc-900/50 text-white hover:bg-zinc-800'
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
