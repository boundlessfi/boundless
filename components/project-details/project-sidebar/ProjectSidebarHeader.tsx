'use client';

import { Calendar } from 'lucide-react';
import Image from 'next/image';
import { ProjectSidebarHeaderProps } from './types';

export function ProjectSidebarHeader({
  project,
  projectStatus,
}: ProjectSidebarHeaderProps) {
  const getStatusStyles = () => {
    switch (projectStatus) {
      case 'campaigning':
        return 'bg-secondary-75 border-secondary-600 text-secondary-600';
      case 'Funded':
        return 'bg-active-bg border-primary text-primary';
      case 'Completed':
        return 'bg-success-75 border-success-600 text-success-600';
      case 'Validation':
        return 'bg-warning-75 border-warning-600 text-warning-600';
      case 'idea':
        return 'bg-warning-75 border-warning-600 text-warning-600';
      default:
        return '';
    }
  };

  return (
    <div className='flex gap-5 space-y-4'>
      <div className='relative'>
        <Image
          src={project.logo || project.media?.logo || '/icon.png'}
          alt={project.title}
          width={64}
          height={64}
          className='h-24 w-24 rounded-[8px] object-cover'
        />
      </div>

      <div className='space-y-3'>
        <h1 className='text-2xl leading-tight font-medium text-white'>
          {project.title}
        </h1>

        <div className='flex flex-wrap items-center gap-3'>
          <div className='bg-office-brown border-office-brown-darker text-office-brown-darker flex w-auto items-center justify-center rounded-[4px] border px-1 py-0.5 text-xs font-semibold'>
            {project.category}
          </div>
          <div
            className={`rounded-[4px] px-1 py-0.5 ${getStatusStyles()} flex items-center justify-center border text-xs font-semibold`}
          >
            {projectStatus}
          </div>
        </div>

        <div className='flex items-center gap-2 text-sm text-white'>
          <Calendar className='h-4 w-4' />
          <span>
            {new Date(project.createdAt).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
