'use client';

import { useEffect, useState } from 'react';
import { ProjectSidebarProgressProps } from './types';
import { CampaignStatus } from './utils';
import { Progress } from '@/components/ui/progress';
import { useCrowdfundContract } from '@/hooks/use-crowdfund-contract';
import { RefreshCw, Shield } from 'lucide-react';

export function ProjectSidebarProgress({
  vm,
  projectStatus,
  voteCounts,
  refreshTrigger,
}: ProjectSidebarProgressProps) {
  const campaign = vm.campaign;
  const fundingRaised = campaign?.fundingRaised ?? 0;
  const fundingGoal = campaign?.fundingGoal ?? 0;
  const voteGoal = campaign?.voteGoal ?? 50;

  const fundingPercentage =
    fundingGoal > 0 ? (fundingRaised / fundingGoal) * 100 : 0;

  const { getCampaignOnChain } = useCrowdfundContract();
  const [onChainData, setOnChainData] = useState<{
    currentFunding: number;
    backerCount: number;
  } | null>(null);

  useEffect(() => {
    if (!campaign?.onChainId) return;

    let cancelled = false;
    getCampaignOnChain(campaign.onChainId)
      .then(result => {
        if (cancelled || !result) return;
        const raw = result as unknown as Record<string, unknown>;
        let campaignData: Record<string, unknown> | null = null;

        if (raw.tag === 'Ok' && Array.isArray(raw.values)) {
          campaignData = raw.values[0] as Record<string, unknown>;
        } else if ('current_funding' in raw) {
          campaignData = raw;
        }

        if (campaignData) {
          setOnChainData({
            currentFunding: Number(campaignData.current_funding) / 10_000_000,
            backerCount: Number(campaignData.backer_count),
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [campaign?.onChainId, getCampaignOnChain, refreshTrigger]);

  const renderProgressSection = () => {
    if (
      projectStatus === CampaignStatus.FAILED ||
      projectStatus === CampaignStatus.CANCELLED
    ) {
      const contributors = campaign?.contributors ?? [];
      const refundedCount = contributors.filter(
        c => c.refundStatus === 'PROCESSED'
      ).length;
      const totalCount = contributors.length;
      const refundProgress =
        totalCount > 0 ? (refundedCount / totalCount) * 100 : 0;

      return (
        <div className='space-y-3'>
          <div className='flex items-center justify-between text-sm'>
            <span
              className={`font-medium ${projectStatus === CampaignStatus.FAILED ? 'text-red-400' : 'text-white/60'}`}
            >
              {projectStatus === CampaignStatus.FAILED
                ? 'Campaign Failed'
                : 'Campaign Cancelled'}
            </span>
          </div>
          {totalCount > 0 ? (
            <>
              <Progress
                value={refundProgress}
                className='h-2 bg-zinc-800 [&>div]:bg-amber-500'
              />
              <div className='flex items-center gap-1.5 text-xs text-zinc-500'>
                <RefreshCw className='h-3 w-3' />
                <span>
                  {refundedCount}/{totalCount} backers refunded
                </span>
              </div>
            </>
          ) : (
            <p className='text-xs text-zinc-500'>
              Refunds will be processed automatically.
            </p>
          )}
        </div>
      );
    }

    if (campaign && projectStatus === CampaignStatus.CAMPAIGNING) {
      return (
        <div className='space-y-3'>
          <div className='flex items-center justify-between text-sm'>
            <span className='font-medium text-white'>
              ${fundingRaised.toLocaleString()}/ ${fundingGoal.toLocaleString()}{' '}
              <span className='font-normal text-zinc-400'>Raised</span>
            </span>
          </div>
          <Progress value={fundingPercentage} className='h-2 bg-zinc-800' />
          {onChainData && (
            <div className='flex items-center gap-1.5 text-xs text-zinc-500'>
              <Shield className='h-3 w-3' />
              <span>
                On-chain: ${onChainData.currentFunding.toLocaleString()} raised
                · {onChainData.backerCount} backer
                {onChainData.backerCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      );
    }

    if (
      projectStatus === CampaignStatus.IDEA ||
      projectStatus === CampaignStatus.VOTING
    ) {
      const validationProgress = Math.min(
        ((voteCounts?.upvotes || 0) / voteGoal) * 100,
        100
      );
      return (
        <div className='space-y-3'>
          <div className='flex items-center justify-between text-sm'>
            <span className='font-medium text-white'>
              {voteCounts?.upvotes || 0}/{voteGoal}{' '}
              <span className='font-normal text-zinc-400'>Upvotes</span>
            </span>
            <span className='font-medium text-zinc-400'>
              {voteCounts?.totalVotes || 0} Total
            </span>
          </div>
          <Progress value={validationProgress} className='h-2 bg-zinc-800' />
        </div>
      );
    }

    if (
      campaign &&
      (projectStatus === CampaignStatus.COMPLETED ||
        projectStatus === CampaignStatus.FUNDED ||
        projectStatus === CampaignStatus.EXECUTING)
    ) {
      const completedMilestones =
        campaign.milestones?.filter(m => m.reviewStatus === 'completed')
          .length || 0;
      const totalMilestones = campaign.milestones?.length || 0;
      const rejectedMilestones =
        campaign.milestones?.filter(m => m.reviewStatus === 'rejected')
          .length || 0;
      const milestonePercentage =
        totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

      return (
        <div className='space-y-3'>
          <div className='flex items-center justify-between text-sm'>
            <span className='font-medium text-white'>
              {completedMilestones}/{totalMilestones}{' '}
              <span className='font-normal text-zinc-400'>Milestones</span>
            </span>
            {rejectedMilestones > 0 && (
              <span className='text-xs font-medium text-red-400'>
                {rejectedMilestones} rejected
              </span>
            )}
          </div>
          <Progress value={milestonePercentage} className='h-2 bg-zinc-800' />
          {onChainData && (
            <div className='flex items-center gap-1.5 text-xs text-zinc-500'>
              <Shield className='h-3 w-3' />
              <span>
                On-chain: ${onChainData.currentFunding.toLocaleString()} total
                funded · {onChainData.backerCount} backer
                {onChainData.backerCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      );
    }

    const defaultProgress = Math.min(
      ((voteCounts?.totalVotes || 0) / voteGoal) * 100,
      100
    );
    return (
      <div className='space-y-3'>
        <div className='flex items-center justify-between text-sm'>
          <span className='font-medium text-white'>
            {voteCounts?.totalVotes || 0}/{voteGoal}{' '}
            <span className='font-normal text-zinc-400'>Votes</span>
          </span>
        </div>
        <Progress value={defaultProgress} className='h-2 bg-zinc-800' />
      </div>
    );
  };

  return <>{renderProgressSection()}</>;
}
