'use client';

import ProjectCard from '@/features/projects/components/ProjectCard';
import { CrowdfundingProject } from '@/features/projects/types';

interface ProjectListProps {
  projects: CrowdfundingProject[];
  activeTab: string;
}

export function ProjectList({ projects, activeTab }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className='py-8 text-center text-gray-400'>
        No {activeTab.toLowerCase()} found matching your filters
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          isFullWidth={true}
          data={
            {
              id: project.id,
              slug: project.id,
              project: project,
              fundingGoal: project.funding?.goal || 0,
              fundingRaised: project.funding?.raised || 0,
              fundingCurrency: project.funding?.currency || 'USDC',
              fundingEndDate: project.funding?.endDate || null,
              milestones:
                project.milestones?.map(m => ({
                  ...m,
                  reviewStatus: m.status,
                })) || [],
              voteGoal: project.voting?.goal || 0,
              voteProgress: project.voting?.current || 0,
            } as any
          }
        />
      ))}
    </div>
  );
}
