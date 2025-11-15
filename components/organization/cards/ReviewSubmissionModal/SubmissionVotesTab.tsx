'use client';

import React from 'react';
import { ThumbsUp, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <ScrollArea className='h-4/5 pr-4'>
      <div className='space-y-3'>
        {voters && voters.length > 0 ? (
          voters.map(voter => (
            <div
              key={voter.id}
              className='group flex cursor-pointer items-center justify-between rounded-lg border border-gray-800 p-3 transition-colors hover:bg-gray-900/50'
            >
              <div className='flex min-w-0 flex-1 items-center gap-3'>
                <Avatar className='h-10 w-10 flex-shrink-0'>
                  <AvatarImage src={voter.avatar} alt={voter.name} />
                  <AvatarFallback>
                    {voter.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-white'>
                    {voter.name}
                  </p>
                  <p className='truncate text-xs text-gray-400'>
                    @{voter.username}
                  </p>
                  {voter.votedAt && (
                    <p className='mt-0.5 text-xs text-gray-500'>
                      {new Date(voter.votedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className='flex flex-shrink-0 items-center gap-2'>
                {voter.voteType === 'positive' ? (
                  <ThumbsUp className='h-4 w-4 text-green-500' />
                ) : (
                  <ThumbsUp className='h-4 w-4 rotate-180 text-red-500' />
                )}
                <ChevronRight className='h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100' />
              </div>
            </div>
          ))
        ) : (
          <div className='py-12 text-center'>
            <ThumbsUp className='mx-auto mb-4 h-12 w-12 text-gray-600' />
            <p className='text-sm text-gray-400'>No votes yet</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
