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
      case 'campaigning':
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
