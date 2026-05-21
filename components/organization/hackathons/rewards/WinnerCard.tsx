'use client';

import React from 'react';
import { Trophy, Layers } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Submission } from './types';
import { getRibbonColors } from './winnersUtils';

interface WinnerCardProps {
  rank: number;
  winner?: Submission;
  prizeAmount?: string;
  currency?: string;
  prizeLabel?: string;
  maxRank: number;
  /**
   * Track name to render as the primary badge instead of the
   * rank ribbon. When present, the card switches to track-winner
   * styling (no podium scaling, neutral border accent).
   */
  trackName?: string;
}

const formatPrize = (amount?: string, currency?: string) => {
  if (!amount || amount === '0' || amount === '0.00') return null;
  const c = currency || 'USDC';
  // Industry-standard format: amount first, single currency suffix.
  // The previous "$300 USDC" double-signed the value and read as
  // confusing for USDC payouts (USDC is the unit, not USD).
  const numeric = Number(amount);
  const display = Number.isFinite(numeric)
    ? numeric.toLocaleString('en-US')
    : amount;
  return `${display} ${c}`;
};

const ordinalSuffix = (rank: number) => {
  const j = rank % 10;
  const k = rank % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

export default function WinnerCard({
  rank,
  winner,
  prizeAmount,
  currency,
  prizeLabel,
  maxRank,
  trackName,
}: WinnerCardProps) {
  const isTrack = !!trackName;
  const prizeText = formatPrize(prizeAmount, currency) || prizeLabel || null;
  const ribbonColors = getRibbonColors(rank);

  // Subtle scale only for overall podium (rank 1-3). Track cards stay
  // uniform — they're a flat sibling row, not a podium.
  const scaleClass =
    !isTrack && rank === 1 && maxRank <= 3 ? 'md:scale-105' : '';

  return (
    <div
      className={cn(
        'bg-background-card relative flex flex-col gap-3 overflow-hidden rounded-xl border border-white/5 p-4 transition-all hover:border-white/10',
        scaleClass
      )}
    >
      {/* Header: rank/track badge + prize chip */}
      <div className='flex flex-wrap items-center justify-between gap-2'>
        {isTrack ? (
          <Badge
            variant='outline'
            className='border-primary/40 text-primary gap-1'
          >
            <Layers className='h-3 w-3' />
            {trackName}
          </Badge>
        ) : (
          <Badge
            variant='outline'
            className='gap-1 border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
            style={{
              borderColor: `${ribbonColors.primaryColor}66`,
              backgroundColor: `${ribbonColors.primaryColor}1A`,
              color: ribbonColors.primaryColor,
            }}
          >
            {rank}
            <sup className='font-semibold'>{ordinalSuffix(rank)}</sup>
            <span className='ml-0.5'>Place</span>
          </Badge>
        )}

        {prizeText && (
          <div className='flex items-center gap-1.5 rounded-full border border-[#2775CA]/20 bg-[#2775CA]/10 px-2.5 py-1'>
            <Trophy className='h-3.5 w-3.5 text-yellow-500' />
            <span className='text-[10px] font-bold tracking-wide text-white uppercase'>
              {prizeText}
            </span>
          </div>
        )}
      </div>

      {/* Project block: avatar + name + category */}
      {winner ? (
        <div className='flex items-center gap-3'>
          <Avatar className='h-12 w-12'>
            <AvatarImage
              src={winner.avatar || undefined}
              alt={winner.name || 'Participant'}
            />
            <AvatarFallback className='bg-gray-800 text-sm text-white uppercase'>
              {winner.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className='min-w-0 flex-1'>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className='line-clamp-1 cursor-help text-sm font-semibold text-white'>
                  {winner.projectName}
                </p>
              </TooltipTrigger>
              <TooltipContent side='top' className='max-w-xs'>
                <p className='break-words'>{winner.projectName}</p>
              </TooltipContent>
            </Tooltip>
            <div className='mt-0.5 flex items-center gap-2 text-xs text-gray-400'>
              <span className='line-clamp-1'>{winner.name || 'Unknown'}</span>
              {winner.category && (
                <>
                  <span className='text-gray-700'>•</span>
                  <span className='line-clamp-1'>{winner.category}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className='flex items-center gap-3 opacity-50'>
          <Avatar className='h-12 w-12'>
            <AvatarFallback className='bg-gray-900 text-gray-500'>
              ?
            </AvatarFallback>
          </Avatar>
          <div className='text-xs text-gray-500'>No winner assigned</div>
        </div>
      )}
    </div>
  );
}
