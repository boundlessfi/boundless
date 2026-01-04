'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectSidebarCreatorProps } from './types';

export function ProjectSidebarCreator({ project }: ProjectSidebarCreatorProps) {
  const creatorName = project.creator.name || `${project.creator.name}`;

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-3'>
        <Avatar className='h-10 w-10'>
          <AvatarImage
            src={project.creator.image || '/placeholder.svg'}
            alt={creatorName}
          />
          <AvatarFallback className='bg-blue-600 text-sm font-medium text-white'>
            {creatorName
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='min-w-0 flex-1'>
          <p className='text-sm leading-tight font-medium text-white'>
            {creatorName}
          </p>
          <p className='text-xs font-medium tracking-wide text-[#DBF936] uppercase'>
            {project.creator.role || 'CREATOR'}
          </p>
        </div>
      </div>
    </div>
  );
}
