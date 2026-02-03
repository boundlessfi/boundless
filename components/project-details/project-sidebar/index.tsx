'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProjectSidebarHeader } from './ProjectSidebarHeader';
import { ProjectSidebarProgress } from './ProjectSidebarProgress';
import { ProjectSidebarActions } from './ProjectSidebarActions';
import { ProjectSidebarCreator } from './ProjectSidebarCreator';
import { ProjectSidebarLinks } from './ProjectSidebarLinks';
import { voteProject } from '@/features/projects/api';
import { createVote, deleteVote } from '@/lib/api/votes';
import { getProjectStatus } from './utils';
import { ProjectSidebarProps } from './types';
import { VoteCountResponse, VoteEntityType, VoteType } from '@/types/votes';
import { useVoteRealtime } from '@/hooks/use-vote-realtime';
import { getVoteCounts } from '@/lib/api/votes';

export function ProjectSidebar({
  project,
  crowdfund,
  isMobile = false,
  hideProgress = false,
}: ProjectSidebarProps) {
  const searchParams = useSearchParams();
  const isSubmission = searchParams.get('type') === 'submission';
  const entityType = isSubmission
    ? VoteEntityType.HACKATHON_SUBMISSION
    : VoteEntityType.CROWDFUNDING_CAMPAIGN;

  const [isVoting, setIsVoting] = useState(false);
  const [voteCounts, setVoteCounts] = useState<VoteCountResponse | null>(
    project.voting
      ? {
          upvotes: project.voting.upvotes,
          downvotes: project.voting.downvotes,
          totalVotes: project.voting.totalVotes,
          userVote: project.voting.userVote,
        }
      : null
  );

  const projectStatus = getProjectStatus(project, crowdfund);
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
          userVote: null,
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

  const handleVote = async (value: 1 | -1) => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      await voteProject(project.id, value);
      // Optimistic update could go here, but we rely on realtime/refetch
    } catch {
      // Handle error implicitly
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className='w-full space-y-6'>
      <ProjectSidebarHeader project={project} projectStatus={projectStatus} />

      {project.vision && (
        <div className='rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 backdrop-blur-sm'>
          <p className='text-sm leading-relaxed text-gray-300'>
            {project.vision}
          </p>
        </div>
      )}

      <div className='rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 backdrop-blur-sm'>
        <ProjectSidebarProgress
          project={project}
          crowdfund={crowdfund}
          projectStatus={projectStatus}
          voteCounts={voteCounts}
        />
      </div>

      <ProjectSidebarActions
        project={project}
        crowdfund={crowdfund}
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
        <div className='space-y-6 border-t border-gray-800/50 pt-6'>
          <ProjectSidebarCreator project={project} />
          <ProjectSidebarLinks project={project} />
        </div>
      )}
    </div>
  );
}
