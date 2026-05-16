'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HackathonWinner, HackathonTrackWinner } from '@/lib/api/hackathons';
import { Trophy, ArrowUpRight, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Ribbon from '@/components/svg/Ribbon';
import {
  getRibbonColors,
  getRibbonText,
} from '@/components/organization/hackathons/rewards/winnersUtils';

interface WinnersTabProps {
  winners: HackathonWinner[];
  /** Track-based winners (Best UI/UX, Best Technical, etc.). Empty when
   *  the hackathon uses OVERALL_ONLY prize structure. */
  trackWinners?: HackathonTrackWinner[];
  hackathonSlug?: string; // Intentionally retained for API consistency/future use
}

export const WinnersTab = ({ winners, trackWinners }: WinnersTabProps) => {
  const hasOverall = winners && winners.length > 0;
  const hasTracks = trackWinners && trackWinners.length > 0;

  if (!hasOverall && !hasTracks) {
    return (
      <div className='flex min-h-[400px] flex-col items-center justify-center text-center'>
        <Trophy className='mb-4 h-16 w-16 text-white/20' />
        <h3 className='text-xl font-semibold text-white'>
          Winners Not Announced Yet
        </h3>
        <p className='mt-2 max-w-md text-gray-400'>
          The results are still being calculated. Check back soon to see who
          took home the prizes!
        </p>
      </div>
    );
  }

  // Sort by rank
  const sortedWinners = [...(winners ?? [])].sort((a, b) => a.rank - b.rank);

  // Split into podium (1-3) and others
  const podiumWinners = sortedWinners.filter(w => w.rank <= 3);
  const otherWinners = sortedWinners.filter(w => w.rank > 3);

  // Reorder podium to 2, 1, 3 for visual hierarchy
  const getPodiumOrder = (winners: HackathonWinner[]) => {
    if (winners.length < 2) return winners;
    const first = winners.find(w => w.rank === 1);
    const second = winners.find(w => w.rank === 2);
    const third = winners.find(w => w.rank === 3);

    return [second, first, third].filter(
      (w): w is HackathonWinner => w !== undefined
    );
  };

  const podiumToDisplay = getPodiumOrder(podiumWinners);

  const getPodiumGridCols = (count: number) => {
    if (count === 1) return 'mx-auto max-w-sm grid-cols-1';
    if (count === 2) return 'mx-auto max-w-2xl grid-cols-1 md:grid-cols-2';
    return 'grid-cols-1 md:grid-cols-3';
  };

  return (
    <div className='space-y-12 py-8'>
      {/* Podium Section */}
      {podiumToDisplay.length > 0 && (
        <div
          className={cn(
            'grid gap-6 md:gap-8',
            getPodiumGridCols(podiumToDisplay.length)
          )}
        >
          {podiumToDisplay.map(winner => (
            <WinnerCard
              key={`${winner.submissionId}-${winner.rank}`}
              winner={winner}
              isPodium
            />
          ))}
        </div>
      )}

      {/* Grid Section for Ranks 4+ */}
      {otherWinners.length > 0 && (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {otherWinners.map(winner => (
            <WinnerCard
              key={`${winner.submissionId}-${winner.rank}`}
              winner={winner}
            />
          ))}
        </div>
      )}

      {/* Track Winners */}
      {hasTracks && (
        <div className='space-y-6'>
          <div className='flex items-center gap-2'>
            <Layers className='text-primary h-5 w-5' />
            <h3 className='text-xl font-semibold text-white'>Track Winners</h3>
          </div>
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {trackWinners!.map(trackWinner => (
              <TrackWinnerCard
                key={`${trackWinner.submissionId}-${trackWinner.track.id}`}
                trackWinner={trackWinner}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TrackWinnerCard = ({
  trackWinner,
}: {
  trackWinner: HackathonTrackWinner;
}) => {
  const projectUrl = trackWinner.submissionId
    ? `/projects/${trackWinner.submissionId}?type=submission`
    : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className='bg-background-card relative w-full overflow-hidden rounded-xl border border-white/5 p-5 transition-all duration-300 hover:border-white/10'
    >
      <div className='mb-3 flex flex-wrap items-center justify-center gap-2'>
        <Badge variant='outline' className='text-primary border-primary/40'>
          {trackWinner.track.name}
        </Badge>
        {trackWinner.prize && (
          <div className='flex items-center gap-1.5 rounded-full border border-[#2775CA]/20 bg-[#2775CA]/10 px-3 py-1'>
            <Trophy className='h-4 w-4 text-yellow-500' />
            <span className='text-xs font-bold text-white uppercase'>
              {(() => {
                const match = trackWinner.prize.match(
                  /^(?:USDC)?\s*(\d+(?:\.\d+)?)\s*(?:USDC)?$/i
                );
                return match ? `${match[1]} USDC` : trackWinner.prize;
              })()}
            </span>
          </div>
        )}
      </div>

      <div className='mb-4 flex flex-col items-center justify-center gap-3'>
        <div className='flex -space-x-3'>
          {trackWinner.participants.map((p, i) => {
            const profileUrl = p.username ? `/profile/${p.username}` : null;
            const AvatarElement = (
              <Avatar
                className={cn(
                  'border-background h-14 w-14 border-2 shadow-xl',
                  profileUrl ? 'transition-transform hover:scale-105' : ''
                )}
              >
                <AvatarImage src={p.avatar} alt={p.username || 'Participant'} />
                <AvatarFallback className='bg-gray-800 text-base text-white uppercase'>
                  {p.username?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            );
            return profileUrl ? (
              <Link
                key={`${p.username}-${i}`}
                href={profileUrl}
                className='z-[1]'
              >
                {AvatarElement}
              </Link>
            ) : (
              <div key={`${p.username}-${i}`} className='z-[1]'>
                {AvatarElement}
              </div>
            );
          })}
        </div>
        {trackWinner.teamName && (
          <p className='text-sm text-gray-400'>{trackWinner.teamName}</p>
        )}
      </div>

      {projectUrl ? (
        <Link href={projectUrl}>
          <div className='flex items-center justify-between rounded-lg border border-gray-900 bg-black/20 p-2 transition-colors hover:bg-black/40'>
            <p className='line-clamp-1 text-sm font-medium text-white'>
              {trackWinner.projectName}
            </p>
            <ArrowUpRight className='h-4 w-4 text-gray-500' />
          </div>
        </Link>
      ) : (
        <div className='rounded-lg border border-gray-900 bg-black/20 p-2'>
          <p className='line-clamp-1 text-sm font-medium text-white'>
            {trackWinner.projectName}
          </p>
        </div>
      )}
    </motion.div>
  );
};

const WinnerCard = ({
  winner,
  isPodium = false,
}: {
  winner: HackathonWinner;
  isPodium?: boolean;
}) => {
  const getScaleClass = () => {
    if (!isPodium) return '';
    if (winner.rank === 1) return 'md:scale-110 z-10';
    return 'md:scale-95 opacity-90';
  };

  const projectUrl = winner.submissionId
    ? `/projects/${winner.submissionId}?type=submission`
    : winner.slug
      ? `/projects/${winner.slug}`
      : winner.projectId
        ? `/projects/${winner.projectId}`
        : null;

  const { primaryColor, secondaryColor } = getRibbonColors(winner.rank);

  const ProjectContent = (
    <div className='flex items-center justify-between rounded-lg border border-gray-900 bg-black/20 p-2 transition-colors hover:bg-black/40'>
      <div className='grid grid-cols-[44px_1fr] grid-rows-2 gap-x-2'>
        <div className='row-span-2 h-11 w-11 overflow-hidden rounded bg-gray-800'>
          {/* Fallback to trophy if no project image is available in HackathonWinner type */}
          <div className='flex h-full w-full items-center justify-center p-2'>
            <Trophy className='h-6 w-6 text-yellow-500/20' />
          </div>
        </div>
        <div className='flex items-center gap-1 overflow-hidden'>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className='line-clamp-1 cursor-help text-sm font-medium text-white'>
                {winner.projectName}
              </p>
            </TooltipTrigger>
            <TooltipContent side='top' className='max-w-xs'>
              <p className='break-words'>{winner.projectName}</p>
            </TooltipContent>
          </Tooltip>
          <Badge className='bg-office-brown border-office-brown-darker text-office-brown-darker shrink-0 rounded-[4px] border px-1 py-0.5 text-[10px] font-medium'>
            Project
          </Badge>
        </div>
        <div className='flex items-center gap-2 text-[10px] text-gray-500'>
          <span>Submission</span>
          <div className='h-2 w-px bg-gray-900' />
          <ArrowUpRight className='h-3 w-3' />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={cn(
        'bg-background-card relative w-full overflow-hidden rounded-xl border border-white/5 p-5 transition-all duration-300 hover:border-white/10',
        getScaleClass()
      )}
    >
      {/* Prize Header */}
      <div className='mb-4 flex items-center justify-center gap-2'>
        <div className='flex items-center gap-1.5 rounded-full border border-[#2775CA]/20 bg-[#2775CA]/10 px-3 py-1'>
          <Trophy className='h-4 w-4 text-yellow-500' />
          <span className='text-sm font-bold text-white uppercase'>
            {(() => {
              const prize = winner.prize || '';
              const match = prize.match(
                /^(?:USDC)?\s*(\d+(?:\.\d+)?)\s*(?:USDC)?$/i
              );
              return match ? `${match[1]} USDC` : prize;
            })()}
          </span>
        </div>
      </div>

      {/* Ranks/Participants */}
      <div className='mb-4 flex flex-col items-center justify-center gap-3'>
        <div className='flex -space-x-3'>
          {winner.participants.map((p, i) => {
            const profileUrl = p.username ? `/profile/${p.username}` : null;
            const AvatarElement = (
              <Avatar
                className={cn(
                  'border-background h-16 w-16 border-2 shadow-xl',
                  profileUrl ? 'transition-transform hover:scale-105' : ''
                )}
              >
                <AvatarImage src={p.avatar} alt={p.username || 'Participant'} />
                <AvatarFallback className='bg-gray-800 text-lg text-white uppercase'>
                  {p.username?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            );

            return profileUrl ? (
              <Link
                key={`${p.username}-${i}`}
                href={profileUrl}
                className='z-[1]'
              >
                {AvatarElement}
              </Link>
            ) : (
              <div key={`${p.username}-${i}`} className='z-[1]'>
                {AvatarElement}
              </div>
            );
          })}
        </div>

        {/* Ribbon */}
        <div className='relative flex items-center justify-center py-2'>
          <Ribbon
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            className='w-48'
          />
          <div className='absolute inset-0 flex items-center justify-center pb-2 pl-[1px] text-[10px] font-black tracking-tight text-white uppercase'>
            {getRibbonText(winner.rank)}
          </div>
        </div>

        {/* Team/Participant Name */}
        <div className='text-center'>
          <h3 className='text-sm font-semibold text-white'>
            {winner.teamName ||
              (winner.participants.length === 1 &&
              winner.participants[0].username ? (
                <Link
                  href={`/profile/${winner.participants[0].username}`}
                  className='transition-colors hover:text-blue-400'
                >
                  {winner.participants[0].username}
                </Link>
              ) : (
                'Team'
              ))}
          </h3>
        </div>
      </div>

      {/* Project Link */}
      {projectUrl ? (
        <Link
          href={projectUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='block no-underline'
        >
          {ProjectContent}
        </Link>
      ) : (
        <div className='block'>{ProjectContent}</div>
      )}
    </motion.div>
  );
};
