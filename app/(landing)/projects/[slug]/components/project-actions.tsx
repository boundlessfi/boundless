'use client';

import { useEffect, useState } from 'react';
import {
  ArrowUp,
  CheckCircle,
  DollarSign,
  HandCoins,
  Loader2,
  Share2,
  ThumbsUp,
  UserMinus,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { FundingModal } from '@/components/project-details/funding-modal';
import { SharePopup } from './share-popup';
import {
  CampaignStatus,
  getProjectStatus,
  type CampaignStatusValue,
} from './utils';

import { useFollow } from '@/hooks/use-follow';
import { useOptionalAuth } from '@/hooks/use-auth';
import { useCrowdfundContract } from '@/hooks/use-crowdfund-contract';
import { useVoteRealtime } from '@/hooks/use-vote-realtime';

import { createVote, getVoteCounts } from '@/lib/api/votes';
import { deleteCrowdfundingProject } from '@/features/projects/api';
import { reportError } from '@/lib/error-reporting';

import {
  VoteEntityType,
  VoteType,
  type VoteCountResponse,
} from '@/types/votes';

import type { ProjectViewModel } from '@/features/projects/types/view-model';

interface ProjectActionsProps {
  vm: ProjectViewModel;
  isSubmission?: boolean;
  onRefresh?: () => void;
}

/**
 * Action buttons (Back Project / Follow / Share / Cancel) for the project hero card.
 * Mirrors the behavior of the legacy ProjectSidebarActions but laid out for the
 * new design: a full-width primary "Back Project" button on its own row, then
 * a 2-column row with Follow + Share. Cancel Campaign (creator-only) and the
 * Voted/Funded/Completed status variants render in place of "Back Project".
 */
export function ProjectActions({
  vm,
  isSubmission = false,
  onRefresh,
}: ProjectActionsProps) {
  const projectStatus = getProjectStatus(vm);

  // ── Vote state (mirrors legacy ProjectSidebar) ────────────────────────────
  const entityType = isSubmission
    ? VoteEntityType.HACKATHON_SUBMISSION
    : VoteEntityType.CROWDFUNDING_CAMPAIGN;

  const { voteCampaign, isConnected: isWalletConnected } =
    useCrowdfundContract();
  const [isVoting, setIsVoting] = useState(false);
  const [voteCounts, setVoteCounts] = useState<VoteCountResponse | null>(
    initialVoteCounts(vm)
  );

  // Realtime listeners must subscribe to the same entityType used for writes
  // (submission vs crowdfunding) so a hackathon submission's votes don't get
  // routed through the campaign channel.
  useVoteRealtime(
    {
      entityType,
      entityId: vm.id || '',
      enabled: !!vm.id,
    },
    {
      // Merge incoming aggregates into the existing state — never let an
      // incoming payload that omits userVote wipe the current viewer's
      // selection (e.g. when another user votes).
      onVoteUpdated: data =>
        setVoteCounts(prev => mergeVoteCounts(prev, data.voteCounts)),
      onVoteCreated: data =>
        setVoteCounts(prev => mergeVoteCounts(prev, data.voteCounts)),
      onVoteDeleted: data =>
        setVoteCounts(prev => mergeVoteCounts(prev, data.voteCounts)),
    }
  );

  useEffect(() => {
    if (!vm.id) return;
    let cancelled = false;
    (async () => {
      try {
        const response = (await getVoteCounts(
          vm.id,
          entityType
        )) as unknown as Record<string, unknown>;
        if (cancelled) return;
        setVoteCounts(
          (response.data as VoteCountResponse) ||
            (response as unknown as VoteCountResponse)
        );
      } catch {
        // non-critical
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vm.id, entityType]);

  const userVote: 1 | -1 | null =
    voteCounts?.userVote === VoteType.UPVOTE
      ? 1
      : voteCounts?.userVote === VoteType.DOWNVOTE
        ? -1
        : null;

  const handleVote = async (value: 1 | -1) => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      if (vm.campaign?.onChainId && isWalletConnected) {
        try {
          await voteCampaign(vm.campaign.onChainId, value === 1 ? 1 : 0);
        } catch {
          // non-fatal: no vote session may exist
        }
      }
      await createVote({
        projectId: vm.id,
        entityType,
        voteType: value === 1 ? VoteType.UPVOTE : VoteType.DOWNVOTE,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit vote';
      toast.error(message);
    } finally {
      setIsVoting(false);
    }
  };

  // ── Cancel campaign (creator only) ───────────────────────────────────────
  const { user } = useOptionalAuth();
  const { isConnected, cancelCampaign, parseCrowdfundError } =
    useCrowdfundContract();
  const [isCancelling, setIsCancelling] = useState(false);

  const isCreator = !!(user && user.id === vm.creatorId);
  const cancellableStatuses: CampaignStatusValue[] = [
    CampaignStatus.CAMPAIGNING,
    CampaignStatus.IDEA,
    CampaignStatus.REVIEWING,
  ];
  const canCancel =
    isCreator &&
    !!vm.campaign?.onChainId &&
    cancellableStatuses.includes(projectStatus);

  const handleCancelCampaign = async () => {
    if (!vm.campaign?.onChainId) return;
    setIsCancelling(true);

    // Step 1 — on-chain cancellation. If this fails, nothing has changed and
    // we surface the parsed contract error to the user.
    let transactionHash: string;
    try {
      transactionHash = await cancelCampaign(vm.campaign.onChainId);
    } catch (err: unknown) {
      const errorMessage = parseCrowdfundError(err);
      toast.error('Failed to cancel campaign', { description: errorMessage });
      setIsCancelling(false);
      return;
    }

    toast.success('Campaign cancelled on-chain', {
      description: `Tx: ${transactionHash.slice(0, 8)}...`,
    });

    // Step 2 — off-chain delete. The on-chain state is already cancelled at
    // this point, so a failure here leaves the records out of sync; we tell
    // the user explicitly so they can retry rather than hiding it as a
    // generic cancel failure.
    try {
      await deleteCrowdfundingProject(vm.campaign.campaignId);
    } catch (err: unknown) {
      reportError(err, {
        context: 'project-actions-deleteCrowdfundingProject',
        campaignId: vm.campaign.campaignId,
        transactionHash,
      });
      toast.error('On-chain cancel succeeded but record cleanup failed', {
        description:
          'Your campaign was cancelled on-chain but we could not remove the off-chain record. Please refresh and try again.',
      });
    } finally {
      onRefresh?.();
      setIsCancelling(false);
    }
  };

  // ── Follow ───────────────────────────────────────────────────────────────
  const {
    isFollowing,
    isLoading: isFollowLoading,
    toggleFollow,
  } = useFollow('PROJECT', vm.id);

  const handleToggleFollow = async () => {
    try {
      await toggleFollow();
      toast.success(
        !isFollowing
          ? 'You are now following this project'
          : 'You unfollowed this project'
      );
    } catch {
      toast.error('Failed to update follow status');
    }
  };

  // ── Share ────────────────────────────────────────────────────────────────
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);

  // ── Render ───────────────────────────────────────────────────────────────
  const primary = renderPrimaryAction({
    vm,
    projectStatus,
    isVoting,
    userVote,
    onVote: handleVote,
    onRefresh,
  });

  return (
    <div className='space-y-3'>
      {primary}

      {canCancel && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant='outline'
              disabled={isCancelling || !isConnected}
              className='border-error-500/40 bg-error-500/10 hover:bg-error-500/20 text-error-300 h-11 w-full text-sm font-semibold'
            >
              {isCancelling ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <XCircle className='mr-2 h-4 w-4' />
              )}
              {isCancelling ? 'Cancelling...' : 'Cancel Campaign'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Campaign</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this campaign? This action will
                be recorded on-chain and cannot be undone. Any existing
                contributions will be eligible for refund.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Campaign</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelCampaign}
                className='bg-red-600 text-white hover:bg-red-700'
              >
                Yes, Cancel Campaign
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div className='grid grid-cols-2 gap-3'>
        <Button
          variant='outline'
          onClick={handleToggleFollow}
          disabled={isFollowLoading}
          className={cn(
            'h-10 text-sm font-medium',
            isFollowing
              ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15'
              : 'border-stepper-border bg-inactive/40 hover:bg-inactive text-white'
          )}
        >
          {isFollowLoading ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : isFollowing ? (
            <UserMinus className='mr-2 h-4 w-4' />
          ) : (
            <UserPlus className='mr-2 h-4 w-4' />
          )}
          {isFollowing ? 'Following' : 'Follow'}
        </Button>

        <div className='relative'>
          <Button
            variant='outline'
            onClick={() => setIsSharePopupOpen(true)}
            className='border-stepper-border bg-inactive/40 hover:bg-inactive h-10 w-full text-sm font-medium text-white'
          >
            <Share2 className='mr-2 h-4 w-4' />
            Share
          </Button>
          <SharePopup
            isOpen={isSharePopupOpen}
            onClose={() => setIsSharePopupOpen(false)}
            projectTitle={vm.title}
            projectUrl={
              typeof window !== 'undefined' ? window.location.href : ''
            }
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── helpers ─────────────────────────── */

function initialVoteCounts(vm: ProjectViewModel): VoteCountResponse | null {
  if (!vm.voting) return null;
  const v = vm.voting as Record<string, unknown>;
  const data = (v.data as Record<string, unknown> | undefined) ?? v;
  return {
    upvotes: Number(data.upvotes ?? 0),
    downvotes: Number(data.downvotes ?? 0),
    totalVotes: Number(data.totalVotes ?? 0),
    userVote: (data.userVote as VoteType) ?? null,
  };
}

/**
 * Merge an incoming aggregate vote count update into the current state
 * without losing the viewer's `userVote` selection. Realtime payloads from
 * other users typically omit `userVote`; we preserve the previous value in
 * that case so a teammate's upvote can't accidentally clear our own.
 */
function mergeVoteCounts(
  prev: VoteCountResponse | null,
  incoming: VoteCountResponse
): VoteCountResponse {
  return {
    upvotes: incoming.upvotes,
    downvotes: incoming.downvotes,
    totalVotes: incoming.totalVotes,
    userVote:
      incoming.userVote !== undefined
        ? incoming.userVote
        : (prev?.userVote ?? null),
  };
}

interface PrimaryActionArgs {
  vm: ProjectViewModel;
  projectStatus: CampaignStatusValue;
  isVoting: boolean;
  userVote: 1 | -1 | null;
  onVote: (value: 1 | -1) => Promise<void>;
  onRefresh?: () => void;
}

function renderPrimaryAction({
  vm,
  projectStatus,
  isVoting,
  userVote,
  onVote,
  onRefresh,
}: PrimaryActionArgs) {
  if (projectStatus === CampaignStatus.VOTING) {
    return (
      <Button
        onClick={() => onVote(1)}
        disabled={isVoting || userVote === 1}
        className={cn(
          'h-11 w-full text-base font-semibold',
          userVote === 1
            ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 border'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        )}
      >
        {isVoting ? (
          <Loader2 className='mr-2 h-5 w-5 animate-spin' />
        ) : userVote === 1 ? (
          <ThumbsUp className='mr-2 h-5 w-5' fill='currentColor' />
        ) : (
          <ArrowUp className='mr-2 h-5 w-5' />
        )}
        {isVoting ? 'Voting...' : userVote === 1 ? 'Upvoted' : 'Upvote'}
      </Button>
    );
  }

  if (vm.campaign && projectStatus === CampaignStatus.CAMPAIGNING) {
    return (
      <FundingModal
        campaignId={vm.campaign.campaignId}
        onChainId={vm.campaign.onChainId}
        projectTitle={vm.title}
        currentRaised={vm.campaign.fundingRaised}
        fundingGoal={vm.campaign.fundingGoal}
        escrowAddress={vm.campaign.escrowAddress}
        onSuccess={onRefresh}
      >
        <Button className='bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full text-base font-semibold'>
          <HandCoins className='mr-2 h-5 w-5' />
          Back Project
        </Button>
      </FundingModal>
    );
  }

  if (projectStatus === CampaignStatus.COMPLETED) {
    return (
      <Button
        disabled
        className='bg-success-75/40 border-success-600/40 text-success-300 h-11 w-full border text-base font-semibold disabled:opacity-100'
      >
        <CheckCircle className='mr-2 h-5 w-5' />
        Completed
      </Button>
    );
  }

  if (projectStatus === CampaignStatus.FUNDED) {
    return (
      <Button
        disabled
        className='bg-secondary-75/40 border-secondary-600/40 text-secondary-300 h-11 w-full border text-base font-semibold disabled:opacity-100'
      >
        <DollarSign className='mr-2 h-5 w-5' />
        Funded
      </Button>
    );
  }

  // No primary action for other statuses (IDEA / REVIEWING / EXECUTING /
  // LIVE / FAILED / CANCELLED / DRAFT) — matches legacy ProjectSidebarActions
  // which renders only Follow + Share in those cases.
  return null;
}
