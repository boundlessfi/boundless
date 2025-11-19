'use client';

import { useState } from 'react';
import { ProjectSidebarHeader } from './ProjectSidebarHeader';
import { ProjectSidebarProgress } from './ProjectSidebarProgress';
import { ProjectSidebarActions } from './ProjectSidebarActions';
import { ProjectSidebarCreator } from './ProjectSidebarCreator';
import { ProjectSidebarLinks } from './ProjectSidebarLinks';
import { voteProject } from '@/lib/api/project';
import { getProjectStatus } from './utils';
import { ProjectSidebarProps } from './types';

export function ProjectSidebar({
  project,
  crowdfund,
  isMobile = false,
}: ProjectSidebarProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);

  const projectStatus = getProjectStatus(project, crowdfund);

  const handleVote = async (value: 1 | -1) => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      await voteProject(project._id, value);
      setUserVote(value);
    } catch {
      // Handle error silently or show user-friendly message
      // You can add toast notifications here if needed
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
        />
      </div>

      <ProjectSidebarActions
        project={project}
        crowdfund={crowdfund}
        projectStatus={projectStatus}
        isVoting={isVoting}
        userVote={userVote}
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
