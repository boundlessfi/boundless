'use client';

import { Github, Globe, Youtube, X } from 'lucide-react';
import { ProjectSidebarLinksProps } from './types';

export function ProjectSidebarLinks({ project }: ProjectSidebarLinksProps) {
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
        {/* GitHub Link */}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center gap-3 text-sm text-white transition-colors hover:text-white'
          >
            <span className='text-gray-400 transition-colors group-hover:text-white'>
              <Github className='h-4 w-4' />
            </span>
            <span className='truncate'>{project.githubUrl}</span>
          </a>
        )}

        {/* Project Website */}
        {project.projectWebsite && (
          <a
            href={project.projectWebsite}
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center gap-3 text-sm text-white transition-colors hover:text-white'
          >
            <span className='text-gray-400 transition-colors group-hover:text-white'>
              <Globe className='h-4 w-4' />
            </span>
            <span className='truncate'>{project.projectWebsite}</span>
          </a>
        )}

        {/* Demo Video */}
        {project.demoVideo && (
          <a
            href={project.demoVideo}
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center gap-3 text-sm text-white transition-colors hover:text-white'
          >
            <span className='text-gray-400 transition-colors group-hover:text-white'>
              <Youtube className='h-4 w-4' />
            </span>
            <span className='truncate'>{project.demoVideo}</span>
          </a>
        )}

        {/* Social Links */}
        {Object.entries(project.socialLinks).map(([platform, url], index) => (
          <a
            key={index}
            href={url.url}
            target='_blank'
            rel='noopener noreferrer'
            className='group flex items-center gap-3 text-sm text-white transition-colors hover:text-white'
          >
            <span className='text-gray-400 transition-colors group-hover:text-white'>
              {getIcon(platform.toLowerCase())}
            </span>
            <span className='truncate'>{url.url}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
