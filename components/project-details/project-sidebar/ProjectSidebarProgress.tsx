'use client';

import { ProjectSidebarProgressProps } from './types';
import { Progress } from '@/components/ui/progress';

export function ProjectSidebarProgress({
  project,
  crowdfund,
  projectStatus,
  voteCounts,
}: ProjectSidebarProgressProps) {
  const fundingRaised =
    crowdfund?.fundingRaised ?? project.funding?.raised ?? 0;
  const fundingGoal = crowdfund?.fundingGoal ?? project.funding?.goal ?? 0;
  const voteGoal = crowdfund?.voteGoal ?? crowdfund?.thresholdVotes ?? 50;

  const fundingPercentage =
    fundingGoal > 0 ? (fundingRaised / fundingGoal) * 100 : 0;

  const milestonePercentage = project.milestones
    ? (project.milestones.filter(m => m.status === 'completed').length /
        project.milestones.length) *
      100
    : 0;
  const renderProgressSection = () => {
    switch (projectStatus) {
      case 'Funding':
      case 'CAMPAIGNING':
        return (
          <div className='space-y-3'>
            <div className='flex items-center justify-between text-sm'>
              <span className='font-medium text-white'>
                ${fundingRaised.toLocaleString()}/ $
                {fundingGoal.toLocaleString()}{' '}
                <span className='font-normal text-zinc-400'>Raised</span>
              </span>
            </div>
            <Progress value={fundingPercentage} className='h-2 bg-zinc-800' />
          </div>
        );

      case 'Validation': {
        const quorumProgress = Math.min(
          ((voteCounts?.totalVotes || 0) / voteGoal) * 100,
          100
        );
        const totalWeighted = voteCounts?.totalWeightedVotes ?? 0;
        const weightedUp =
          voteCounts?.weightedUpvotes ?? voteCounts?.upvotes ?? 0;
        const weightedApprovalPct =
          totalWeighted > 0
            ? Math.round((weightedUp / totalWeighted) * 100)
            : 0;
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='font-medium text-white'>
                  {voteCounts?.totalVotes || 0}/{voteGoal}{' '}
                  <span className='font-normal text-zinc-400'>
                    Voters (quorum)
                  </span>
                </span>
              </div>
              <Progress value={quorumProgress} className='h-2 bg-zinc-800' />
            </div>
            <div className='space-y-1'>
              <div className='flex items-center justify-between text-xs text-zinc-400'>
                <span>Weighted approval</span>
                <span className='font-medium tabular-nums'>
                  {weightedApprovalPct}%
                </span>
              </div>
              <Progress
                value={weightedApprovalPct}
                className='h-1.5 bg-zinc-800'
              />
            </div>
          </div>
        );
      }

      case 'Validated':
        return (
          <div className='rounded-lg border border-green-600/30 bg-green-900/10 p-3 text-sm text-green-400'>
            Community validation passed. Project is approved for the next stage.
          </div>
        );

      case 'Rejected':
        return (
          <div className='rounded-lg border border-red-600/30 bg-red-900/10 p-3 text-sm text-red-400'>
            Community validation did not meet the required approval threshold.
          </div>
        );

      case 'Completed':
      case 'Funded': {
        const completedMilestones =
          crowdfund?.milestones?.filter(m => m.reviewStatus === 'completed')
            .length || 0;
        const totalMilestones = crowdfund?.milestones?.length || 0;
        const rejectedMilestones =
          crowdfund?.milestones?.filter(m => m.reviewStatus === 'rejected')
            .length || 0;

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

      default: {
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
      }
    }
  };

  return <>{renderProgressSection()}</>;
}
