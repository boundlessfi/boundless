'use client';

import React from 'react';
import { ThumbsUp, Heart, Star, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface Voter {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  votedAt?: string;
  voteType?: 'positive' | 'negative';
}

interface SubmissionVotesTabProps {
  voters?: Voter[];
}

export const SubmissionVotesTab: React.FC<SubmissionVotesTabProps> = ({
  voters,
}) => {
  return (
    <ScrollArea className='h-full pr-4'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='space-y-4'
      >
        {voters && voters.length > 0 ? (
          voters.map((voter, index) => (
            <motion.div
              key={voter.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className='group bg-background-card/10 hover:bg-background-card/30 flex items-center justify-between rounded-2xl border border-gray-900/40 p-4 transition-all'
            >
              <div className='flex min-w-0 items-center gap-4'>
                <div className='relative'>
                  <Avatar className='h-12 w-12 shrink-0 border border-gray-800'>
                    <AvatarImage src={voter.avatar} alt={voter.name} />
                    <AvatarFallback className='bg-background-card font-bold text-gray-400'>
                      {voter.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-950 bg-yellow-500 shadow-lg'>
                    <Star className='h-2.5 w-2.5 fill-white text-white' />
                  </div>
                </div>

                <div className='min-w-0 flex-1 space-y-0.5'>
                  <div className='flex items-center gap-2'>
                    <p className='truncate text-sm font-bold text-white'>
                      {voter.name}
                    </p>
                    <span className='rounded-full bg-gray-950 px-1.5 py-0.5 text-[8px] font-black tracking-widest text-gray-500 uppercase'>
                      Voter
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <p className='truncate text-xs font-medium text-gray-500'>
                      @{voter.username}
                    </p>
                    {voter.votedAt && (
                      <>
                        <div className='h-1 w-1 rounded-full bg-gray-800' />
                        <p className='text-[10px] font-bold tracking-tighter text-gray-600 uppercase'>
                          {new Date(voter.votedAt).toLocaleDateString(
                            undefined,
                            { month: 'short', day: 'numeric' }
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-gray-900/60 bg-gray-950/40'>
                <ThumbsUp
                  className={cn(
                    'h-4 w-4 transition-transform group-hover:scale-110',
                    voter.voteType === 'positive'
                      ? 'text-green-500'
                      : voter.voteType === 'negative'
                        ? 'rotate-180 text-red-500'
                        : 'text-gray-400'
                  )}
                />
              </div>
            </motion.div>
          ))
        ) : (
          <div className='py-20 text-center opacity-50'>
            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-900/50'>
              <Star className='h-10 w-10 text-gray-800' />
            </div>
            <h3 className='text-sm font-black tracking-[0.2em] text-gray-500 uppercase'>
              Waiting for the first vote
            </h3>
            <p className='mt-2 text-xs font-medium text-gray-600'>
              Community activity will appear here once judging begins.
            </p>
          </div>
        )}
      </motion.div>
    </ScrollArea>
  );
};
