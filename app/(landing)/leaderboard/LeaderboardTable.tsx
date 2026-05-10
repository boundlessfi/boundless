import Image from 'next/image';
import Link from 'next/link';
import { ChevronUp, ChevronDown, Minus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReputationTierBadge } from '@/components/ui/ReputationTierBadge';
import type { LeaderboardEntry } from '@/types/leaderboard';
import { cn } from '@/lib/utils';

const RANK_STYLES: Record<number, string> = {
  1: 'text-amber-400 font-bold',
  2: 'text-zinc-300 font-bold',
  3: 'text-amber-700 font-bold',
};

const ROW_HIGHLIGHT: Record<number, string> = {
  1: 'bg-amber-400/5 border-l-2 border-l-amber-400/50',
  2: 'bg-zinc-400/5 border-l-2 border-l-zinc-400/30',
  3: 'bg-amber-700/5 border-l-2 border-l-amber-700/30',
};

function RankChange({ change }: { change?: number }) {
  if (!change || change === 0)
    return <Minus className='inline h-3 w-3 text-zinc-600' />;
  if (change > 0)
    return (
      <span className='inline-flex items-center gap-0.5 text-xs text-green-400'>
        <ChevronUp className='h-3 w-3' />
        {change}
      </span>
    );
  return (
    <span className='inline-flex items-center gap-0.5 text-xs text-red-400'>
      <ChevronDown className='h-3 w-3' />
      {Math.abs(change)}
    </span>
  );
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 rounded-xl border border-zinc-800 py-20 text-center'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800'>
          <span className='text-3xl'>🏆</span>
        </div>
        <div>
          <p className='font-semibold text-white'>No contributors found</p>
          <p className='mt-1 text-sm text-zinc-500'>
            Try adjusting the filters to see results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-xl border border-zinc-800'>
      <Table>
        <TableHeader>
          <TableRow className='border-zinc-800 hover:bg-transparent'>
            <TableHead className='w-16 text-zinc-400'>Rank</TableHead>
            <TableHead className='text-zinc-400'>Contributor</TableHead>
            <TableHead className='text-zinc-400'>Tier</TableHead>
            <TableHead className='text-right text-zinc-400'>
              Reputation
            </TableHead>
            <TableHead className='text-right text-zinc-400'>
              Activities
            </TableHead>
            <TableHead className='text-right text-zinc-400'>Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map(entry => {
            const { rank, rankChange, contributor } = entry;
            const profileHref = contributor.username
              ? `/profile/${contributor.username}`
              : null;

            return (
              <TableRow
                key={contributor.userId}
                className={cn(
                  'border-zinc-800 transition-colors hover:bg-zinc-800/40',
                  ROW_HIGHLIGHT[rank] ?? ''
                )}
              >
                {/* Rank */}
                <TableCell>
                  <div className='flex items-center gap-1'>
                    <span
                      className={cn(
                        'tabular-nums',
                        RANK_STYLES[rank] ?? 'text-zinc-400'
                      )}
                    >
                      {rank}
                    </span>
                    <RankChange change={rankChange} />
                  </div>
                </TableCell>

                {/* Contributor */}
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <div className='relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-zinc-700'>
                      <Image
                        src={contributor.avatarUrl || '/avatar.png'}
                        alt={contributor.displayName || 'User'}
                        fill
                        className='object-cover'
                      />
                    </div>
                    <div>
                      {profileHref ? (
                        <Link
                          href={profileHref}
                          className='hover:text-primary font-medium text-white transition-colors'
                        >
                          {contributor.displayName || 'Anonymous'}
                        </Link>
                      ) : (
                        <span className='font-medium text-white'>
                          {contributor.displayName || 'Anonymous'}
                        </span>
                      )}
                      {contributor.username && (
                        <p className='text-xs text-zinc-500'>
                          @{contributor.username}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Tier */}
                <TableCell>
                  <ReputationTierBadge tier={contributor.tier} />
                </TableCell>

                {/* Score */}
                <TableCell className='text-right text-white tabular-nums'>
                  {contributor.totalScore?.toLocaleString() ?? '0'}
                </TableCell>

                {/* Completed */}
                <TableCell className='text-right text-zinc-300 tabular-nums'>
                  {contributor.stats.totalCompleted}
                </TableCell>

                {/* Rate */}
                <TableCell className='text-right text-zinc-300 tabular-nums'>
                  {contributor.stats.completionRate.toFixed(1)}%
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
