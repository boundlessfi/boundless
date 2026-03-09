'use client';

import React from 'react';
import { PublicUserProfile } from '@/features/projects/types';
import Link from 'next/link';
import ProjectCard from '@/features/projects/components/ProjectCard';

interface ProjectsTabProps {
  user: PublicUserProfile;
}

export default function ProjectsTabPublic({ user }: ProjectsTabProps) {
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
        {user.projects.map(project => {
          // Find if this project is a hackathon submission
          const submission = user.hackathonSubmissionsAsParticipant?.find(
            s => s.projectId === project.id
          );

          // If it's a submission, use the submission ID for the URL and add ?type=submission
          const displayId = submission?.id || project.id;
          const href = submission
            ? `/projects/${displayId}?type=submission`
            : `/projects/${displayId}`;

          return (
            <Link key={project.id} href={href}>
              <ProjectCard
                newTab={true}
                isFullWidth={true}
                data={{
                  id: displayId,
                  slug: displayId,
                  project: {
                    ...project,
                    creator: {
                      name: user.name,
                      image: user.image,
                    },
                  },
                  // Add a custom property to indicate it's a submission for ProjectCard
                  isSubmission: !!submission,
                  submissionStatus: submission?.status,
                }}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
