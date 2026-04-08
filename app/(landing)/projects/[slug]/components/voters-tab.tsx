'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ClipboardList,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  createVote,
  getProjectVotes,
  getVoteCounts as apiGetVoteCounts,
} from '@/lib/api/votes';
import { useOptionalAuth } from '@/hooks/use-auth';
import { useVoteRealtime } from '@/hooks/use-vote-realtime';
import {
  VoteEntityType,
  VoteType,
  type VoteCountResponse,
  type VoterDto,
} from '@/types/votes';
import type { ProjectViewModel } from '@/features/projects/types/view-model';
import { VoterRow } from './voter-row';
import { VotersTabSkeleton } from './skeletons';

const VOTERS_PAGE_SIZE = 20;

function mergeVoteCounts(
  prev: VoteCountResponse,
  incoming: VoteCountResponse
): VoteCountResponse {
  return {
    upvotes: incoming.upvotes,
    downvotes: incoming.downvotes,
    totalVotes: incoming.totalVotes,
    userVote:
      incoming.userVote !== undefined ? incoming.userVote : prev.userVote,
  };
}

type StanceFilter = 'all' | 'support' | 'against';

const FILTERS: { value: StanceFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'support', label: 'Support' },
  { value: 'against', label: 'Against' },
];

interface VotersTabProps {
  vm: ProjectViewModel;
}

export function VotersTab({ vm }: VotersTabProps) {
  const { user } = useOptionalAuth();
  const projectId = vm.id;

  const [voteCounts, setVoteCounts] = useState<VoteCountResponse>({
    upvotes: 0,
    downvotes: 0,
    totalVotes: 0,
    userVote: null,
  });
  const [voters, setVoters] = useState<VoterDto[]>([]);
  const [totalVoters, setTotalVoters] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [voting, setVoting] = useState(false);
  const [filter, setFilter] = useState<StanceFilter>('all');

  // ── Owner / team gating (mirrors legacy ProjectVoters) ──
  const isOwner = !!(user && user.id === vm.creatorId);
  const isTeamMember = !!(
    user &&
    vm.team.some(m => m.username && m.username === user.profile?.username)
  );
  const isGated = isOwner || isTeamMember;

  // ── Realtime updates ──
  // Merge incoming aggregates so a vote from another user can't accidentally
  // wipe the current viewer's `userVote` selection (the realtime payload may
  // omit it or set it for a different user).
  useVoteRealtime(
    {
      entityType: VoteEntityType.CROWDFUNDING_CAMPAIGN,
      entityId: projectId || '',
      enabled: !!projectId,
    },
    {
      onVoteUpdated: data => {
        setVoteCounts(prev => mergeVoteCounts(prev, data.voteCounts));
        setVoters(data.voters);
      },
      onVoteCreated: data => {
        setVoteCounts(prev => mergeVoteCounts(prev, data.voteCounts));
        setVoters(data.voters);
      },
      onVoteDeleted: data => {
        setVoteCounts(prev => mergeVoteCounts(prev, data.voteCounts));
        setVoters(data.voters);
      },
    }
  );

  // ── Initial fetch ──
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const response = await getProjectVotes(projectId, {
          limit: VOTERS_PAGE_SIZE,
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
          if (cancelled) return;
          setVoteCounts({
            upvotes: response.data.voteCounts.upvotes,
            downvotes: response.data.voteCounts.downvotes,
            totalVotes: response.data.voteCounts.totalVotes,
            userVote: null,
          });
          setVoters(response.data.voters);
          setTotalVoters(
            response.pagination?.totalItems ??
              response.data.voteCounts.totalVotes
          );
        } else {
          const counts = await apiGetVoteCounts(
            projectId,
            VoteEntityType.CROWDFUNDING_CAMPAIGN
          );
          if (cancelled) return;
          setVoteCounts({
            upvotes: counts.upvotes,
            downvotes: counts.downvotes,
            totalVotes: counts.totalVotes,
            userVote: counts.userVote || null,
          });
          setVoters([]);
          setTotalVoters(0);
        }
      } catch {
        if (!cancelled) toast.error('Failed to load voting data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // ── Load more voters ──
  const handleLoadMore = async () => {
    if (!projectId || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await getProjectVotes(projectId, {
        limit: VOTERS_PAGE_SIZE,
        offset: voters.length,
        entityType: VoteEntityType.CROWDFUNDING_CAMPAIGN,
        includeVoters: true,
      });

      if (
        response.data &&
        typeof response.data === 'object' &&
        'voters' in response.data &&
        'voteCounts' in response.data
      ) {
        // Dedupe by id in case the realtime listener already merged some of
        // these voters between the request and the response.
        setVoters(prev => {
          const seen = new Set(prev.map(v => v.id));
          const next = [...prev];
          for (const v of response.data && 'voters' in response.data
            ? response.data.voters
            : []) {
            if (!seen.has(v.id)) next.push(v);
          }
          return next;
        });
        if (response.pagination?.totalItems !== undefined) {
          setTotalVoters(response.pagination.totalItems);
        }
      }
    } catch {
      toast.error('Failed to load more voters');
    } finally {
      setLoadingMore(false);
    }
  };

  const hasMoreVoters = totalVoters !== null && voters.length < totalVoters;

  // ── Vote action ──
  const handleVote = async (voteType: VoteType) => {
    if (!projectId || voting) return;
    const isSameVote = voteCounts.userVote === voteType;

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
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to submit vote. Please try again.';
      toast.error(message);
    } finally {
      setVoting(false);
    }
  };

  const handleVoterClick = (voter: VoterDto) => {
    if (voter.user?.username) {
      window.open(`/profile/${voter.user.username}`, '_blank');
    }
  };

  // ── Derived ──
  const visible = useMemo(() => {
    if (filter === 'all') return voters;
    return voters.filter(v =>
      filter === 'support'
        ? v.voteType === VoteType.UPVOTE
        : v.voteType === VoteType.DOWNVOTE
    );
  }, [voters, filter]);

  const approvalRating =
    voteCounts.totalVotes > 0
      ? Math.round((voteCounts.upvotes / voteCounts.totalVotes) * 100)
      : 0;

  // ── Render ──
  if (loading) {
    return <VotersTabSkeleton />;
  }

  return (
    <section className='space-y-8'>
      {/* Header */}
      <header className='flex flex-wrap items-center justify-between gap-4'>
        <h2 className='text-2xl font-bold text-white'>Voters</h2>
        <div className='flex items-center gap-3'>
          <span className='hidden text-sm text-gray-500 sm:inline'>
            Filter by stance:
          </span>
          <Select
            value={filter}
            onValueChange={v => setFilter(v as StanceFilter)}
          >
            <SelectTrigger className='border-stepper-border bg-background-card h-9 w-[130px] text-sm text-white'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='border-stepper-border bg-background-card text-white'>
              {FILTERS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Vote stats / actions */}
      <div className='border-stepper-border bg-background-card space-y-5 rounded-2xl border p-5 sm:p-6'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='text-primary text-xs font-semibold tracking-widest uppercase'>
              Community Vote
            </p>
            <p className='mt-1 text-sm text-gray-500'>
              Help the community decide on this project
            </p>
          </div>
          {voteCounts.totalVotes > 0 && (
            <div className='text-right'>
              <div className='text-3xl font-bold text-white tabular-nums'>
                {voteCounts.totalVotes}
              </div>
              <div className='text-[10px] tracking-widest text-gray-600 uppercase'>
                Total Votes
              </div>
            </div>
          )}
        </div>

        {voteCounts.totalVotes > 0 && (
          <div className='space-y-2'>
            <div className='flex items-center justify-between text-xs text-gray-500'>
              <span className='inline-flex items-center gap-1.5'>
                <TrendingUp className='h-3 w-3' />
                Approval Rating
              </span>
              <span className='font-medium tabular-nums'>
                {approvalRating}%
              </span>
            </div>
            <div className='bg-stepper-border relative h-2 w-full overflow-hidden rounded-full'>
              <div
                className='bg-primary absolute inset-y-0 left-0 rounded-full transition-all duration-500'
                style={{ width: `${approvalRating}%` }}
              />
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <Button
            onClick={() => handleVote(VoteType.UPVOTE)}
            disabled={voting || isGated}
            className={cn(
              'h-11 text-sm font-semibold',
              voteCounts.userVote === VoteType.UPVOTE
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border-stepper-border bg-inactive/40 hover:bg-inactive border text-white'
            )}
          >
            <ThumbsUp
              className={cn(
                'mr-2 h-4 w-4',
                voteCounts.userVote === VoteType.UPVOTE && 'fill-current'
              )}
            />
            Upvote
            <span
              className={cn(
                'ml-2 inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                voteCounts.userVote === VoteType.UPVOTE
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-stepper-border text-gray-300'
              )}
            >
              {voteCounts.upvotes}
            </span>
          </Button>

          <Button
            onClick={() => handleVote(VoteType.DOWNVOTE)}
            disabled={voting || isGated}
            className={cn(
              'h-11 text-sm font-semibold',
              voteCounts.userVote === VoteType.DOWNVOTE
                ? 'bg-error-500 hover:bg-error-600 text-white'
                : 'border-stepper-border bg-inactive/40 hover:bg-inactive border text-white'
            )}
          >
            <ThumbsDown
              className={cn(
                'mr-2 h-4 w-4',
                voteCounts.userVote === VoteType.DOWNVOTE && 'fill-current'
              )}
            />
            Downvote
            <span
              className={cn(
                'ml-2 inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                voteCounts.userVote === VoteType.DOWNVOTE
                  ? 'bg-white/20 text-white'
                  : 'bg-stepper-border text-gray-300'
              )}
            >
              {voteCounts.downvotes}
            </span>
          </Button>
        </div>

        {isGated && (
          <div className='border-warning-400/30 bg-warning-400/5 text-warning-200 flex items-center gap-2 rounded-lg border p-3 text-sm'>
            <AlertCircle className='h-4 w-4 shrink-0' />
            <p>
              As a project owner or team member, you are not allowed to vote for
              your own campaign.
            </p>
          </div>
        )}
      </div>

      {/* List or empty state */}
      {visible.length === 0 ? (
        voters.length === 0 ? (
          <VotersEmptyState vm={vm} />
        ) : (
          <div className='border-stepper-border bg-background-card flex items-center justify-center rounded-2xl border py-10'>
            <p className='text-sm text-gray-500'>
              No voters match the selected stance.
            </p>
          </div>
        )
      ) : (
        <>
          <ul className='flex flex-col'>
            {visible.map(voter => (
              <VoterRow
                key={voter.id}
                voter={voter}
                onClick={handleVoterClick}
              />
            ))}
          </ul>

          {hasMoreVoters && filter === 'all' && (
            <div className='flex justify-center pt-2'>
              <Button
                variant='outline'
                onClick={handleLoadMore}
                disabled={loadingMore}
                className='border-primary/40 bg-background-card hover:bg-primary/10 text-primary h-11 px-8 text-sm font-bold tracking-wider uppercase disabled:opacity-50'
              >
                {loadingMore ? 'Loading...' : 'Load more voters'}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function VotersEmptyState({ vm }: { vm: ProjectViewModel }) {
  return (
    <div className='flex flex-col items-center px-4 py-10 text-center sm:py-16'>
      <div className='relative mb-6'>
        <div className='border-stepper-border bg-inactive flex h-24 w-24 items-center justify-center rounded-full border'>
          <ClipboardList className='text-primary h-10 w-10' />
        </div>
        <div className='border-background-main-bg bg-primary text-primary-foreground absolute -right-1 -bottom-1 flex h-9 w-9 items-center justify-center rounded-full border-4 text-base font-bold'>
          !
        </div>
      </div>

      <h3 className='text-xl font-bold text-white sm:text-2xl'>No votes yet</h3>
      <p className='mt-3 max-w-md text-sm leading-relaxed text-gray-500'>
        Be the first to voice your support or provide feedback on this project.
        Every vote helps shape the future of {vm.title}.
      </p>
    </div>
  );
}
