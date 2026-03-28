'use client';

import { Github, Globe, Youtube, X } from 'lucide-react';
import { ProjectSidebarLinksProps } from './types';

export function ProjectSidebarLinks({ vm }: ProjectSidebarLinksProps) {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'github':
        return <Github className='h-4 w-4' />;
      case 'twitter':
        return <X className='h-4 w-4' />;
      case 'globe':
        return <Globe className='h-4 w-4' />;
      case 'youtube':
        return <Youtube className='h-4 w-4' />;
      default:
        return <Globe className='h-4 w-4' />;
    }
  };

  return (
    <div className='space-y-4'>
      <h3 className='text-sm font-medium tracking-wide text-gray-300 uppercase'>
        PROJECT LINKS
      </h3>
      <div className='space-y-3'>
        {vm.githubUrl && (
          <a
            href={vm.githubUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center gap-3 text-sm text-white transition-colors hover:text-white'
          >
            <span className='text-gray-400 transition-colors group-hover:text-white'>
              <Github className='h-4 w-4' />
            </span>
            <span className='truncate'>{vm.githubUrl}</span>
          </a>
        )}

        {vm.projectWebsite && (
          <a
            href={vm.projectWebsite}
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center gap-3 text-sm text-white transition-colors hover:text-white'
          >
            <span className='text-gray-400 transition-colors group-hover:text-white'>
              <Globe className='h-4 w-4' />
            </span>
            <span className='truncate'>{vm.projectWebsite}</span>
          </a>
        )}

        {vm.demoVideo && (
          <a
            href={vm.demoVideo}
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center gap-3 text-sm text-white transition-colors hover:text-white'
          >
            <span className='text-gray-400 transition-colors group-hover:text-white'>
              <Youtube className='h-4 w-4' />
            </span>
            <span className='truncate'>{vm.demoVideo}</span>
          </a>
        )}

        {vm.socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center gap-3 text-sm text-white transition-colors hover:text-white'
          >
            <span className='text-gray-400 transition-colors group-hover:text-white'>
              {getIcon(link.platform.toLowerCase())}
            </span>
            <span className='truncate'>{link.url}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
