'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';

import { useCastVote, useMyVote } from '@/features/crowdfunding';
import type { Crowdfunding } from '@/features/projects/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Public voting panel shown while a campaign is in community review. Anyone
 * signed in can vote yes/no; the tally fills toward the campaign's quorum.
 */
export function VotePanel({ campaign }: { campaign: Crowdfunding }) {
  const vote = useCastVote();
  const { data: myVoteRaw } = useMyVote(campaign.id);
  const current = (myVoteRaw as { choice?: 'UP' | 'DOWN' } | null)?.choice;

  const up = campaign.voteUpCount ?? 0;
  const down = campaign.voteDownCount ?? 0;
  const goal = Math.max(1, campaign.voteGoal ?? 1);
  const total = up + down;
  const reached = Math.min(100, Math.round((total / goal) * 100));

  const cast = (choice: 'UP' | 'DOWN') => {
    vote.mutate(
      { id: campaign.id, choice },
      {
        onSuccess: () =>
          toast.success(
            choice === 'UP' ? 'Thanks, your vote is in.' : 'Your vote is in.'
          ),
        onError: err =>
          toast.error(
            err instanceof Error
              ? err.message
              : 'Could not record your vote. Make sure you are signed in.'
          ),
      }
    );
  };

  return (
    <div className='space-y-4'>
      <div>
        <p className='text-sm font-medium text-zinc-200'>
          Help decide if this goes live
        </p>
        <p className='mt-1 text-xs text-zinc-500'>
          The community votes on which campaigns get to start raising. Your vote
          counts.
        </p>
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <Button
          onClick={() => cast('UP')}
          disabled={vote.isPending}
          className={cn(
            'gap-2',
            current === 'UP'
              ? 'bg-primary hover:bg-primary/90'
              : 'border border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800'
          )}
        >
          <ThumbsUp className='h-4 w-4' />
          Yes
        </Button>
        <Button
          onClick={() => cast('DOWN')}
          disabled={vote.isPending}
          className={cn(
            'gap-2',
            current === 'DOWN'
              ? 'bg-red-600 text-white hover:bg-red-500'
              : 'border border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800'
          )}
        >
          <ThumbsDown className='h-4 w-4' />
          No
        </Button>
      </div>

      <div>
        <div className='flex items-center justify-between text-xs text-zinc-500'>
          <span>
            {total} of {goal} {goal === 1 ? 'vote' : 'votes'} needed
          </span>
          <span>{reached}%</span>
        </div>
        <div className='mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-800'>
          <div
            className='bg-primary h-full rounded-full transition-all'
            style={{ width: `${reached}%` }}
          />
        </div>
        {current && (
          <p className='mt-2 text-xs text-zinc-500'>
            You voted {current === 'UP' ? 'yes' : 'no'}. You can change it
            anytime before voting ends.
          </p>
        )}
      </div>
    </div>
  );
}
