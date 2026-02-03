import React, { useState, useEffect } from 'react';
import Empty from './Empty';
import Image from 'next/image';
import { CrowdfundingProject } from '@/features/projects/types';
import { VoteType, VoteEntityType, VoterDto } from '@/types/votes';
import {
  getVoteCounts as apiGetVoteCounts,
  createVote,
  getProjectVotes,
} from '@/lib/api/votes';
import {
  ThumbsUp,
  ThumbsDown,
  Users,
  TrendingUp,
  Award,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoteRealtime } from '@/hooks/use-vote-realtime';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VoteStats {
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  userVote?: VoteType | null;
}

interface ProjectVotersProps {
  project?: CrowdfundingProject;
}

const ProjectVoters = ({ project }: ProjectVotersProps) => {
  const [voteStats, setVoteStats] = useState<VoteStats>({
    upvotes: 0,
    downvotes: 0,
    totalVotes: 0,
    userVote: null,
  });
  const [voters, setVoters] = useState<VoterDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const projectId = project?.id;

  useVoteRealtime(
    {
      entityType: VoteEntityType.CROWDFUNDING_CAMPAIGN,
      entityId: projectId || '',
      enabled: !!projectId,
    },
    {
      onVoteUpdated: data => {
        setVoteStats({
          upvotes: data.voteCounts.upvotes,
          downvotes: data.voteCounts.downvotes,
          totalVotes: data.voteCounts.totalVotes,
          userVote: data.voteCounts.userVote || null,
        });
        setVoters(data.voters);
      },
      onVoteCreated: data => {
        setVoteStats({
          upvotes: data.voteCounts.upvotes,
          downvotes: data.voteCounts.downvotes,
          totalVotes: data.voteCounts.totalVotes,
          userVote: data.voteCounts.userVote || null,
        });
        setVoters(data.voters);
      },
      onVoteDeleted: data => {
        setVoteStats({
          upvotes: data.voteCounts.upvotes,
          downvotes: data.voteCounts.downvotes,
          totalVotes: data.voteCounts.totalVotes,
          userVote: data.voteCounts.userVote || null,
        });
        setVoters(data.voters);
      },
    }
  );

  useEffect(() => {
    if (!projectId) return;

    const fetchInitialVoteData = async () => {
      setLoading(true);
      try {
        const response = await getProjectVotes(projectId, {
          limit: 20,
          offset: 0,
          entityType: VoteEntityType.CROWDFUNDING_CAMPAIGN,
          includeVoters: true,
        });

        if (
          response.data &&
          typeof response.data === 'object' &&
          'voters' in response.data &&
          'voteCounts' in response.data
        ) {
          setVoteStats({
            upvotes: response.data.voteCounts.upvotes,
            downvotes: response.data.voteCounts.downvotes,
            totalVotes: response.data.voteCounts.totalVotes,
            userVote: null,
          });
          setVoters(response.data.voters);
        } else {
          const countsResponse = await apiGetVoteCounts(
            projectId,
            VoteEntityType.CROWDFUNDING_CAMPAIGN
          );
          setVoteStats({
            upvotes: countsResponse.upvotes,
            downvotes: countsResponse.downvotes,
            totalVotes: countsResponse.totalVotes,
            userVote: countsResponse.userVote || null,
          });
          setVoters([]);
        }
      } catch {
        toast.error('Failed to load voting data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialVoteData();
  }, [projectId]);

  const handleVote = async (voteType: VoteType) => {
    if (!projectId || voting) return;

    const isSameVote = voteStats.userVote === voteType;

    setVoting(true);
    try {
      await createVote({
        projectId,
        entityType: VoteEntityType.CROWDFUNDING_CAMPAIGN,
        voteType,
      });

      if (isSameVote) {
        toast.success('Vote removed');
      } else {
        toast.success(voteType === VoteType.UPVOTE ? 'Upvoted!' : 'Downvoted!');
      }
    } catch {
      toast.error('Failed to submit vote. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  const handleVoterClick = (voter: VoterDto) => {
    if (voter.user?.username) {
      window.open(`/profile/${voter.user.username}`, '_blank');
    }
  };

  const voteRatio =
    voteStats.totalVotes > 0
      ? Math.round((voteStats.upvotes / voteStats.totalVotes) * 100)
      : 0;

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30 p-6'>
          <div className='mb-4 h-6 w-40 rounded bg-zinc-800'></div>
          <div className='flex items-center justify-between'>
            <div className='flex gap-3'>
              <div className='h-10 w-32 rounded-lg bg-zinc-800'></div>
              <div className='h-10 w-32 rounded-lg bg-zinc-800'></div>
            </div>
            <div className='h-16 w-24 rounded-lg bg-zinc-800'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 backdrop-blur-sm'>
        <div className='space-y-6 p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='flex items-center gap-2 text-xl font-semibold text-white'>
                <Award className='text-primary h-5 w-5' />
                Community Vote
              </h3>
              <p className='mt-1 text-sm text-zinc-400'>
                Help the community decide on this project
              </p>
            </div>
            {voteStats.totalVotes > 0 && (
              <div className='text-right'>
                <div className='text-3xl font-bold text-white tabular-nums'>
                  {voteStats.totalVotes}
                </div>
                <div className='text-xs tracking-wide text-zinc-400 uppercase'>
                  Total Votes
                </div>
              </div>
            )}
          </div>

          {voteStats.totalVotes > 0 && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs text-zinc-400'>
                <span className='flex items-center gap-1'>
                  <TrendingUp className='h-3 w-3' />
                  Approval Rating
                </span>
                <span className='font-medium tabular-nums'>{voteRatio}%</span>
              </div>
              <div className='relative h-2 w-full overflow-hidden rounded-full bg-zinc-800'>
                <div
                  className='from-primary to-primary/50 absolute top-0 left-0 h-full rounded-full bg-gradient-to-r transition-all duration-500'
                  style={{ width: `${voteRatio}%` }}
                />
              </div>
            </div>
          )}

          <div className='flex flex-col items-stretch gap-3 sm:flex-row sm:items-center'>
            <Button
              onClick={() => handleVote(VoteType.UPVOTE)}
              disabled={voting}
              size='lg'
              className={cn(
                'h-12 flex-1 font-medium transition-all duration-200',
                voteStats.userVote === VoteType.UPVOTE
                  ? 'bg-primary hover:bg-primary/90 border-primary shadow-primary/20 text-white shadow-lg'
                  : 'hover:border-primary/50 hover:shadow-primary/10 border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:shadow-md'
              )}
            >
              <ThumbsUp
                className={cn(
                  'mr-2 h-4 w-4 transition-transform',
                  voteStats.userVote === VoteType.UPVOTE &&
                    'scale-110 fill-current'
                )}
              />
              <span className='flex items-center gap-2'>
                Upvote
                <span
                  className={cn(
                    'inline-flex min-w-[2rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                    voteStats.userVote === VoteType.UPVOTE
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-zinc-700 text-zinc-300'
                  )}
                >
                  {voteStats.upvotes}
                </span>
              </span>
            </Button>

            <Button
              onClick={() => handleVote(VoteType.DOWNVOTE)}
              disabled={voting}
              size='lg'
              className={cn(
                'h-12 flex-1 font-medium transition-all duration-200',
                voteStats.userVote === VoteType.DOWNVOTE
                  ? 'border-red-500 bg-red-600 text-white shadow-lg shadow-red-500/20 hover:bg-red-700'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-red-500/50 hover:bg-zinc-700 hover:shadow-md hover:shadow-red-500/10'
              )}
            >
              <ThumbsDown
                className={cn(
                  'mr-2 h-4 w-4 transition-transform',
                  voteStats.userVote === VoteType.DOWNVOTE &&
                    'scale-110 fill-current'
                )}
              />
              <span className='flex items-center gap-2'>
                Downvote
                <span
                  className={cn(
                    'inline-flex min-w-[2rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                    voteStats.userVote === VoteType.DOWNVOTE
                      ? 'bg-red-700 text-red-100'
                      : 'bg-zinc-700 text-zinc-300'
                  )}
                >
                  {voteStats.downvotes}
                </span>
              </span>
            </Button>
          </div>

          {voteStats.userVote && (
            <div
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg p-3 text-sm',
                voteStats.userVote === VoteType.UPVOTE
                  ? 'bg-primary/10 text-primary border-primary/20 border'
                  : 'border border-red-500/20 bg-red-500/10 text-red-400'
              )}
            >
              <span className='font-medium'>
                {voteStats.userVote === VoteType.UPVOTE
                  ? '✓ You upvoted this project'
                  : '✗ You downvoted this project'}
              </span>
              <span className='text-zinc-400'>•</span>
              <span className='text-xs text-zinc-400'>Click to change</span>
            </div>
          )}

          {!voteStats.userVote && (
            <div className='flex items-center justify-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-3 text-sm text-zinc-400'>
              Cast your vote to help shape this project's future
            </div>
          )}
        </div>
      </div>

      <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Users className='h-5 w-5 text-zinc-400' />
            <h3 className='text-lg font-semibold text-white'>Recent Voters</h3>
          </div>
          {voters.length > 0 && (
            <span className='inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300'>
              {voters.length} {voters.length === 1 ? 'voter' : 'voters'}
            </span>
          )}
        </div>

        {voters.length === 0 ? (
          <Empty projectStatus={project?.status ?? ''} />
        ) : (
          <div className='space-y-2'>
            {voters.map((voter, index) => (
              <div
                key={voter.id}
                className={cn(
                  'group flex cursor-pointer items-center justify-between rounded-lg p-3 transition-all duration-200',
                  'hover:scale-[1.01] hover:bg-zinc-800/50 hover:shadow-md active:scale-[0.99]',
                  'border border-transparent hover:border-zinc-700/50'
                )}
                onClick={() => handleVoterClick(voter)}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.3s ease-out forwards',
                }}
              >
                <div className='flex items-center gap-3'>
                  <div className='relative'>
                    <div className='h-11 w-11 overflow-hidden rounded-full border-2 border-zinc-800 transition-colors group-hover:border-zinc-700'>
                      {voter.user?.image ? (
                        <Image
                          width={44}
                          height={44}
                          src={voter.user.image}
                          alt={voter.user.name || 'User'}
                          className='h-full w-full object-cover'
                        />
                      ) : (
                        <Image
                          width={44}
                          height={44}
                          src='/avatar.png'
                          alt='Default avatar'
                          className='h-full w-full object-cover'
                        />
                      )}
                    </div>
                    <div
                      className={cn(
                        'absolute -right-1 -bottom-1 rounded-full p-1',
                        voter.voteType === VoteType.UPVOTE
                          ? 'bg-primary'
                          : 'bg-red-500'
                      )}
                    >
                      {voter.voteType === VoteType.UPVOTE ? (
                        <ThumbsUp className='h-2.5 w-2.5 fill-current text-black' />
                      ) : (
                        <ThumbsDown className='h-2.5 w-2.5 fill-current text-white' />
                      )}
                    </div>
                  </div>

                  <div className='flex flex-col'>
                    <div className='flex items-center gap-2'>
                      <span className='group-hover:text-primary text-sm font-medium text-white transition-colors'>
                        {voter.user?.name || 'Anonymous User'}
                      </span>
                      <ExternalLink className='h-3 w-3 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100' />
                    </div>
                    <div className='flex items-center gap-2 text-xs text-zinc-400'>
                      <span>@{voter.user?.username || 'user'}</span>
                      <span className='text-zinc-600'>•</span>
                      <span>
                        {new Date(voter.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    voter.voteType === VoteType.UPVOTE
                      ? 'bg-primary/10 text-primary border-primary/20 border'
                      : 'border border-red-500/20 bg-red-500/10 text-red-400'
                  )}
                >
                  {voter.voteType === VoteType.UPVOTE ? (
                    <ThumbsUp className='h-3 w-3' />
                  ) : (
                    <ThumbsDown className='h-3 w-3' />
                  )}
                  <span className='hidden sm:inline'>
                    {voter.voteType === VoteType.UPVOTE
                      ? 'Upvoted'
                      : 'Downvoted'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectVoters;
