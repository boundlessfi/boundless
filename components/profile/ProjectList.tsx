'use client';

import { mapCrowdfundingProjectToCardData } from '@/features/projects/utils/card-mappers';
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
          data={mapCrowdfundingProjectToCardData(project)}
        />
      ))}
    </div>
  );
}
