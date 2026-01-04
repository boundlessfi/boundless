'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { ProjectSidebarProgressProps } from './types';
import { getVoteCounts } from '@/lib/api/votes';
import { VoteEntityType } from '@/types/votes';
import { VoteCountResponse } from '@/types/votes';
import { useVoteRealtime } from '@/hooks/use-vote-realtime';

export function ProjectSidebarProgress({
  project,
  projectStatus,
}: ProjectSidebarProgressProps) {
  const [voteCounts, setVoteCounts] = useState<VoteCountResponse | null>(null);

  const projectId = project?.id;

  // Real-time vote updates
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
          userVote: data.voteCounts.userVote || null,
        });
      },
    }
  );

  useEffect(() => {
    if (!projectId) return;

    const fetchVoteCounts = async () => {
      try {
        const response = await getVoteCounts(
          projectId,
          VoteEntityType.CROWDFUNDING_CAMPAIGN
        );
        setVoteCounts(response);
      } catch {
        // Silently fail - voting data is not critical
      }
    };

    fetchVoteCounts();
  }, [projectId]);

  const fundingPercentage = project.funding
    ? (project.funding.raised / project.funding.goal) * 100
    : 0;

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
                ${project.funding?.raised?.toLocaleString() || 0}/ $
                {project.funding?.goal?.toLocaleString() || 0}{' '}
                <span className='font-normal text-zinc-400'>Raised</span>
              </span>
            </div>
            <Progress value={fundingPercentage} className='h-2 bg-zinc-800' />
          </div>
        );

      case 'Validation': {
        const validationProgress = Math.min(
          ((voteCounts?.upvotes || 0) / 50) * 100,
          100
        );
        return (
          <div className='space-y-3'>
            <div className='flex items-center justify-between text-sm'>
              <span className='font-medium text-white'>
                {voteCounts?.upvotes || 0}/50{' '}
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

      case 'Completed': {
        const completedMilestones =
          project.milestones?.filter(m => m.status === 'completed').length || 0;
        const totalMilestones = project.milestones?.length || 0;
        const rejectedMilestones =
          project.milestones?.filter(m => m.status === 'rejected').length || 0;

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
          ((voteCounts?.totalVotes || 0) / 50) * 100,
          100
        );
        return (
          <div className='space-y-3'>
            <div className='flex items-center justify-between text-sm'>
              <span className='font-medium text-white'>
                {voteCounts?.totalVotes || 0}/50{' '}
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
