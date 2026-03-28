'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectSidebarCreatorProps } from './types';

export function ProjectSidebarCreator({ vm }: ProjectSidebarCreatorProps) {
  const creatorName = vm.creator.name || 'Creator';

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-3'>
        <Avatar className='h-10 w-10'>
          <AvatarImage
            src={vm.creator.image || '/placeholder.svg'}
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
          <p className='text-xs font-medium tracking-wide text-gray-400'>
            @{vm.creator.username || 'username'}
          </p>
          <p className='mt-0.5 text-xs font-medium tracking-wide text-[#DBF936] uppercase'>
            CREATOR
          </p>
        </div>
      </div>
    </div>
  );
}
