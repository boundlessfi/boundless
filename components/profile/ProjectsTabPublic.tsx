'use client';

import React from 'react';
import ProjectCard from '../landing-page/project/ProjectCard';
import { PublicUserProfile } from '@/types/project';
import Link from 'next/link';

interface ProjectsTabProps {
  user: PublicUserProfile;
}

export default function ProjectsTabPublic({ user }: ProjectsTabProps) {
  // Map project status to ProjectCard expected status
  const getProjectStatus = (
    status: string
  ): 'Validation' | 'Funding' | 'Funded' | 'Completed' => {
    switch (status) {
      case 'IDEA':
        return 'Validation';
      case 'ACTIVE':
        return 'Funding';
      case 'COMPLETED':
        return 'Completed';
      default:
        return 'Validation';
    }
  };

  if (user.projects.length === 0) {
    return (
      <div className='py-8 text-center'>
        <h3 className='mb-2 text-lg font-medium text-zinc-300'>
          No Projects Yet
        </h3>
        <p className='text-sm text-zinc-500'>
          This user hasn't created any projects
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium text-zinc-300'>Projects</h3>
        <span className='text-sm text-zinc-500'>
          {user.projects.length} project{user.projects.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {user.projects.map(project => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <ProjectCard
              projectId={project.id}
              creatorName={user.name}
              creatorLogo={user.image}
              projectImage={project.logo}
              projectTitle={project.title}
              projectDescription={project.description}
              status={getProjectStatus(project.status)}
              deadlineInDays={0}
              isFullWidth={true}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
