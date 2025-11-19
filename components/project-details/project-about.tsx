import { Github, Globe, Youtube, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CrowdfundingProject } from '@/lib/api/types';

interface ProjectAboutProps {
  project: CrowdfundingProject & {
    additionalCreator?: {
      name: string;
      role: string;
      avatar: string;
    };
    links?: Array<{
      type: string;
      url: string;
      icon: string;
    }>;
  };
}

/**
 * Project About component for mobile view
 * Contains creator info and project links
 */
export function ProjectAbout({ project }: ProjectAboutProps) {
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
    <div className='space-y-8 text-white'>
      {/* Creator Info */}
      <div className='rounded-xl border border-gray-800/50 bg-gradient-to-br from-gray-900/50 to-gray-950/50 p-6 backdrop-blur-sm'>
        <div className='mb-4 flex items-center gap-2'>
          <div className='h-1 w-1 rounded-full bg-[#a7f950]' />
          <h2 className='text-lg font-semibold text-white'>Creator</h2>
        </div>
        <div className='flex items-center gap-4'>
          <div className='relative'>
            <div className='absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#a7f950]/30 to-transparent opacity-50 blur-sm' />
            <Avatar className='relative h-14 w-14 ring-2 ring-gray-800/50'>
              <AvatarImage
                src={project.additionalCreator?.avatar || '/placeholder.svg'}
                alt={
                  project.additionalCreator?.name ||
                  project.creator.profile.firstName +
                    ' ' +
                    project.creator.profile.lastName
                }
              />
              <AvatarFallback className='bg-gradient-to-br from-[#a7f950] to-[#8fd93f] text-sm font-semibold text-black'>
                {(
                  project.additionalCreator?.name ||
                  project.creator.profile.firstName +
                    ' ' +
                    project.creator.profile.lastName
                )
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-lg leading-tight font-semibold text-white'>
              {project.additionalCreator?.name ||
                project.creator.profile.firstName +
                  ' ' +
                  project.creator.profile.lastName}
            </p>
            <p className='mt-1.5 inline-block rounded-lg border border-[#a7f950]/30 bg-[#a7f950]/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-[#a7f950] uppercase'>
              {project.additionalCreator?.role || 'CREATOR'}
            </p>
          </div>
        </div>
      </div>

      {/* Project Links */}
      {project.links && project.links.length > 0 && (
        <div className='rounded-xl border border-gray-800/50 bg-gradient-to-br from-gray-900/50 to-gray-950/50 p-6 backdrop-blur-sm'>
          <div className='mb-4 flex items-center gap-2'>
            <div className='h-1 w-1 rounded-full bg-[#a7f950]' />
            <h2 className='text-lg font-semibold text-white'>Project Links</h2>
          </div>
          <div className='space-y-2'>
            {project.links.map((link, index) => (
              <a
                key={index}
                href={
                  link.url.startsWith('http') ? link.url : `https://${link.url}`
                }
                target='_blank'
                rel='noopener noreferrer'
                className='group flex items-center gap-3 rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 text-sm text-white transition-all hover:border-[#a7f950]/30 hover:bg-[#a7f950]/5'
              >
                <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 transition-colors group-hover:bg-[#a7f950]/10 group-hover:text-[#a7f950]'>
                  {getIcon(link.icon)}
                </span>
                <span className='flex-1 truncate font-medium'>{link.url}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
