'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HackathonWinner } from '@/lib/api/hackathons';
import { Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface WinnersTabProps {
  winners: HackathonWinner[];
  hackathonSlug?: string;
}

export const WinnersTab = ({ winners, hackathonSlug }: WinnersTabProps) => {
  if (!winners || winners.length === 0) {
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

  // Sort by rank just in case
  const sortedWinners = [...winners].sort((a, b) => a.rank - b.rank);

  return (
    <div className='space-y-8'>
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {sortedWinners.map((winner, index) => (
          <WinnerCard
            key={`${winner.rank}-${winner.projectName}`}
            winner={winner}
            index={index}
            hackathonSlug={hackathonSlug}
          />
        ))}
      </div>
    </div>
  );
};

const WinnerCard = ({
  winner,
  index,
  hackathonSlug,
}: {
  winner: HackathonWinner;
  index: number;
  hackathonSlug?: string;
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className='h-6 w-6 text-yellow-500' />;
      case 2:
        return <Medal className='h-6 w-6 text-gray-300' />;
      case 3:
        return <Medal className='h-6 w-6 text-amber-600' />;
      default:
        return <Award className='h-6 w-6 text-blue-500' />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-yellow-500/50 bg-yellow-500/5 hover:border-yellow-500';
      case 2:
        return 'border-gray-300/50 bg-gray-300/5 hover:border-gray-300';
      case 3:
        return 'border-amber-600/50 bg-amber-600/5 hover:border-amber-600';
      default:
        return 'border-white/10 bg-white/5 hover:border-white/20';
    }
  };

  const CardContent = (
    <div
      className={`group relative h-full overflow-hidden rounded-xl border p-6 transition-all duration-300 ${getRankColor(
        winner.rank
      )}`}
    >
      <div className='mb-4 flex items-start justify-between'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-white/10'>
          {getRankIcon(winner.rank)}
        </div>
        <div className='rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white'>
          Rank #{winner.rank}
        </div>
      </div>

      <h3 className='mb-2 text-xl font-bold text-white group-hover:text-blue-400'>
        {winner.projectName}
      </h3>

      <div className='mb-4 flex items-center gap-2'>
        <div className='flex -space-x-2'>
          {winner.participants.map((p, i) => (
            <div
              key={i}
              className='relative h-8 w-8 overflow-hidden rounded-full border-2 border-black bg-gray-800'
              title={p.username}
            >
              {p.avatar ? (
                <Image
                  src={p.avatar}
                  alt={p.username}
                  fill
                  className='object-cover'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center text-xs text-white'>
                  {p.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
        </div>
        <span className='text-sm text-gray-400'>
          {winner.teamName ||
            (winner.participants.length === 1
              ? winner.participants[0].username
              : 'Team')}
        </span>
      </div>

      <div className='mt-auto border-t border-white/10 pt-4'>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-gray-400'>Prize</span>
          <span className='font-semibold text-white'>{winner.prize}</span>
        </div>
      </div>
    </div>
  );

  if (winner.projectId) {
    return (
      <Link
        href={`/projects/${winner.projectId}?type=submission`}
        target='_blank'
        className='block h-full no-underline'
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className='h-full'
        >
          {CardContent}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className='h-full'
    >
      {CardContent}
    </motion.div>
  );
};
