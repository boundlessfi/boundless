'use client';

import { ProjectSidebarProgressProps } from './types';
import { Progress } from '@/components/ui/progress';

export function ProjectSidebarProgress({
  vm,
  projectStatus,
  voteCounts,
}: ProjectSidebarProgressProps) {
  const campaign = vm.campaign;
  const fundingRaised = campaign?.fundingRaised ?? 0;
  const fundingGoal = campaign?.fundingGoal ?? 0;
  const voteGoal = campaign?.voteGoal ?? 50;

  const fundingPercentage =
    fundingGoal > 0 ? (fundingRaised / fundingGoal) * 100 : 0;

  const renderProgressSection = () => {
    // Funding progress — only for campaigns in funding phase
    if (
      campaign &&
      (projectStatus === 'Funding' || projectStatus === 'CAMPAIGNING')
    ) {
      return (
        <div className='space-y-3'>
          <div className='flex items-center justify-between text-sm'>
            <span className='font-medium text-white'>
              ${fundingRaised.toLocaleString()}/ ${fundingGoal.toLocaleString()}{' '}
              <span className='font-normal text-zinc-400'>Raised</span>
            </span>
          </div>
          <Progress value={fundingPercentage} className='h-2 bg-zinc-800' />
        </div>
      );
    }

    // Validation vote progress — all project types
    if (projectStatus === 'Validation') {
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

    // Milestone progress — only for funded/completed campaigns
    if (
      campaign &&
      (projectStatus === 'Completed' || projectStatus === 'Funded')
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
        </div>
      );
    }

    // Default: vote progress
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
