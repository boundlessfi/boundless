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
    <div className='space-y-4'>
      <div className='flex gap-4'>
        <div className='relative shrink-0'>
          <div className='absolute -inset-0.5 rounded-xl bg-gradient-to-br from-[#a7f950]/20 to-transparent opacity-50 blur-sm' />
          <Image
            src={project.logo || project.media?.logo || '/icon.png'}
            alt={project.title}
            width={80}
            height={80}
            className='relative h-20 w-20 rounded-xl object-cover ring-2 ring-gray-800/50'
          />
        </div>

        <div className='min-w-0 flex-1 space-y-2'>
          <h1 className='line-clamp-2 text-xl leading-tight font-bold text-white lg:text-2xl'>
            {project.title}
          </h1>

          <div className='flex flex-wrap items-center gap-2'>
            <div className='rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-400'>
              {project.category}
            </div>
            <div
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${getStatusStyles()}`}
            >
              {projectStatus}
            </div>
          </div>
        </div>
      </div>

      <div className='flex items-center gap-2 rounded-lg border border-gray-800/50 bg-gray-900/30 px-3 py-2'>
        <Calendar className='h-4 w-4 text-gray-400' />
        <span className='text-sm text-gray-300'>
          {new Date(project.createdAt).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}
