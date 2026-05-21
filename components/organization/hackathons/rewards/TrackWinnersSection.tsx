'use client';

import React from 'react';
import { Layers, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { HackathonTrackWinner } from '@/lib/api/hackathons';

interface TrackWinnersSectionProps {
  trackWinners: HackathonTrackWinner[];
}

/**
 * Renders track winners on the organizer rewards page.
 *
 * Mirrors the pattern used by the public WinnersTab: one card per
 * track, scoped to its winning submission. Sits below the rank-based
 * PodiumSection so the page reads as "overall winners on top, track
 * winners below." Hidden entirely on OVERALL_ONLY hackathons (empty
 * trackWinners → render null).
 */
export const TrackWinnersSection: React.FC<TrackWinnersSectionProps> = ({
  trackWinners,
}) => {
  if (!trackWinners || trackWinners.length === 0) return null;

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Layers className='text-primary h-5 w-5' />
        <h3 className='text-lg font-semibold text-white'>Track Winners</h3>
        <span className='text-xs text-gray-500'>
          ({trackWinners.length} track
          {trackWinners.length === 1 ? '' : 's'})
        </span>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {trackWinners.map(trackWinner => (
          <TrackWinnerCard
            key={`${trackWinner.submissionId}-${trackWinner.track.id}`}
            trackWinner={trackWinner}
          />
        ))}
      </div>
    </div>
  );
};

const formatPrize = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  // Backend emits prize like "100 USDC" or "$100"; normalise to
  // "<amount> USDC" so the chip stays consistent across hackathons.
  const match = raw.match(/^(?:USDC)?\s*\$?(\d+(?:[.,]\d+)?)\s*(?:USDC)?$/i);
  return match ? `${match[1]} USDC` : raw;
};

const TrackWinnerCard: React.FC<{ trackWinner: HackathonTrackWinner }> = ({
  trackWinner,
}) => {
  const prize = formatPrize(trackWinner.prize);

  return (
    <div className='bg-background-card relative w-full overflow-hidden rounded-xl border border-white/5 p-4 transition-colors duration-200 hover:border-white/10'>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
        <Badge variant='outline' className='text-primary border-primary/40'>
          {trackWinner.track.name}
        </Badge>
        {prize && (
          <div className='flex items-center gap-1.5 rounded-full border border-[#2775CA]/20 bg-[#2775CA]/10 px-2.5 py-1'>
            <Trophy className='h-3.5 w-3.5 text-yellow-500' />
            <span className='text-[10px] font-bold text-white uppercase'>
              {prize}
            </span>
          </div>
        )}
      </div>

      <div className='mb-3 flex items-center gap-3'>
        <div className='flex -space-x-2'>
          {trackWinner.participants.slice(0, 3).map((p, i) => (
            <Avatar
              key={`${p.username || 'anon'}-${i}`}
              className={cn('border-background-card h-10 w-10 border-2 shadow')}
            >
              <AvatarImage src={p.avatar} alt={p.username || 'Participant'} />
              <AvatarFallback className='bg-gray-800 text-xs text-white uppercase'>
                {p.username?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          ))}
          {trackWinner.participants.length > 3 && (
            <div className='border-background-card flex h-10 w-10 items-center justify-center rounded-full border-2 bg-gray-800 text-xs font-medium text-gray-300'>
              +{trackWinner.participants.length - 3}
            </div>
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='truncate text-sm font-semibold text-white'>
            {trackWinner.projectName}
          </div>
          {trackWinner.teamName && (
            <div className='truncate text-xs text-gray-400'>
              {trackWinner.teamName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackWinnersSection;
