'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProjectSidebarHeader } from './ProjectSidebarHeader';
import { ProjectSidebarProgress } from './ProjectSidebarProgress';
import { ProjectSidebarActions } from './ProjectSidebarActions';
import { ProjectSidebarCreator } from './ProjectSidebarCreator';
import { ProjectSidebarLinks } from './ProjectSidebarLinks';
import { createVote } from '@/lib/api/votes';
import { getProjectStatus } from './utils';
import { ProjectSidebarProps } from './types';
import { VoteCountResponse, VoteEntityType, VoteType } from '@/types/votes';
import { useVoteRealtime } from '@/hooks/use-vote-realtime';
import { getVoteCounts } from '@/lib/api/votes';
import { toast } from 'sonner';
import { useCrowdfundContract } from '@/hooks/use-crowdfund-contract';
import { CampaignStatus } from './utils';

export function ProjectSidebar({ vm, isMobile = false }: ProjectSidebarProps) {
  const searchParams = useSearchParams();
  const isSubmission = searchParams.get('type') === 'submission';
  const entityType = isSubmission
    ? VoteEntityType.HACKATHON_SUBMISSION
    : VoteEntityType.CROWDFUNDING_CAMPAIGN;

  const { voteCampaign, isConnected: isWalletConnected } =
    useCrowdfundContract();
  const [isVoting, setIsVoting] = useState(false);
  const [voteCounts, setVoteCounts] = useState<VoteCountResponse | null>(
    vm.voting
      ? {
          upvotes: (vm.voting as Record<string, unknown>).data
            ? ((vm.voting as Record<string, Record<string, number>>).data
                ?.upvotes ?? (vm.voting as Record<string, number>).upvotes)
            : ((vm.voting as Record<string, number>).upvotes ?? 0),
          downvotes: (vm.voting as Record<string, unknown>).data
            ? ((vm.voting as Record<string, Record<string, number>>).data
                ?.downvotes ?? (vm.voting as Record<string, number>).downvotes)
            : ((vm.voting as Record<string, number>).downvotes ?? 0),
          totalVotes: (vm.voting as Record<string, unknown>).data
            ? ((vm.voting as Record<string, Record<string, number>>).data
                ?.totalVotes ??
              (vm.voting as Record<string, number>).totalVotes)
            : ((vm.voting as Record<string, number>).totalVotes ?? 0),
          userVote: (vm.voting as Record<string, unknown>).data
            ? (((vm.voting as Record<string, Record<string, unknown>>).data
                ?.userVote as VoteType) ?? null)
            : (((vm.voting as Record<string, unknown>).userVote as VoteType) ??
              null),
        }
      : null
  );
  const projectStatus = getProjectStatus(vm);
  const projectId = vm.id;

  useVoteRealtime(
    {
      entityType: VoteEntityType.CROWDFUNDING_CAMPAIGN,
      entityId: projectId || '',
      enabled: !!projectId,
    },
    {
      onVoteUpdated: data => {
        setVoteCounts({
          upvotes: data.voteCounts.upvotes,
          downvotes: data.voteCounts.downvotes,
          totalVotes: data.voteCounts.totalVotes,
          userVote: data.voteCounts.userVote || null,
        });
      },
      onVoteCreated: data => {
        setVoteCounts({
          upvotes: data.voteCounts.upvotes,
          downvotes: data.voteCounts.downvotes,
          totalVotes: data.voteCounts.totalVotes,
          userVote: data.voteCounts.userVote || null,
        });
      },
      onVoteDeleted: data => {
        setVoteCounts({
          upvotes: data.voteCounts.upvotes,
          downvotes: data.voteCounts.downvotes,
          totalVotes: data.voteCounts.totalVotes,
          userVote: null,
        });
      },
    }
  );

  useEffect(() => {
    if (!projectId) return;

    const fetchVoteCounts = async () => {
      try {
        const response = (await getVoteCounts(
          projectId,
          VoteEntityType.CROWDFUNDING_CAMPAIGN
        )) as unknown as Record<string, unknown>;
        setVoteCounts(
          (response.data as VoteCountResponse) ||
            (response as unknown as VoteCountResponse)
        );
      } catch {
        // non-critical
      }
    };

    fetchVoteCounts();
  }, [projectId]);

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
        entityType: entityType,
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

  const shouldShowProgress =
    vm.projectType === 'campaign' ||
    projectStatus === CampaignStatus.IDEA ||
    projectStatus === CampaignStatus.VOTING;

  return (
    <div className='w-full space-y-4 sm:space-y-5 lg:space-y-6'>
      <ProjectSidebarHeader vm={vm} projectStatus={projectStatus} />

      {vm.vision && (
        <div className='rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 backdrop-blur-sm sm:p-4'>
          <p className='text-xs leading-relaxed text-gray-300 sm:text-sm'>
            {vm.vision}
          </p>
        </div>
      )}

      {shouldShowProgress && (
        <div className='rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 backdrop-blur-sm sm:p-4'>
          <ProjectSidebarProgress
            vm={vm}
            projectStatus={projectStatus}
            voteCounts={voteCounts}
          />
        </div>
      )}

      <ProjectSidebarActions
        vm={vm}
        projectStatus={projectStatus}
        isVoting={isVoting}
        userVote={
          voteCounts?.userVote === VoteType.UPVOTE
            ? 1
            : voteCounts?.userVote === VoteType.DOWNVOTE
              ? -1
              : null
        }
        onVote={handleVote}
      />

      {!isMobile && (
        <div className='space-y-4 border-t border-gray-800/50 pt-4 sm:space-y-6 sm:pt-6'>
          <ProjectSidebarCreator vm={vm} />
          <ProjectSidebarLinks vm={vm} />
        </div>
      )}
    </div>
  );
}
