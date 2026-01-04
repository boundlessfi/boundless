'use client';

import { CrowdfundingProject } from '@/types/project';
import ProjectCard from '../landing-page/project/ProjectCard';

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

  // Map project status to ProjectCard expected status
  const getProjectStatus = (
    status: string
  ): 'Validation' | 'Funding' | 'Funded' | 'Completed' => {
    switch (status) {
      case 'under_review':
        return 'Validation';
      case 'funding':
        return 'Funding';
      case 'funded':
        return 'Funded';
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'Funding';
      default:
        return 'Validation';
    }
  };

  return (
    <div className='space-y-4'>
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          projectId={project.id}
          creatorName={project.creator.name || 'Creator'}
          creatorLogo={project.creator.image || '/avatar.png'}
          projectImage={project.banner || '/bitmed.png'}
          projectTitle={project.title}
          projectDescription={project.description}
          status={getProjectStatus(project.status)}
          deadlineInDays={30}
          isFullWidth={true}
          funding={{
            current: project.funding?.raised || 0,
            goal: project.funding?.goal || 10000,
            currency: project.funding?.currency || 'USDC',
          }}
        />
      ))}
    </div>
  );
}
