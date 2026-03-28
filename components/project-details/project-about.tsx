import { Github, Globe, Youtube, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ProjectViewModel } from '@/features/projects/types/view-model';

interface ProjectAboutProps {
  vm: ProjectViewModel;
}

/**
 * Project About component for mobile view
 * Contains creator info and project links
 */
export function ProjectAbout({ vm }: ProjectAboutProps) {
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

  const allLinks = [
    ...(vm.githubUrl ? [{ platform: 'github', url: vm.githubUrl }] : []),
    ...(vm.projectWebsite
      ? [{ platform: 'globe', url: vm.projectWebsite }]
      : []),
    ...(vm.demoVideo ? [{ platform: 'youtube', url: vm.demoVideo }] : []),
    ...vm.socialLinks,
  ];

  return (
    <div className='space-y-6 text-white sm:space-y-8'>
      {/* Creator Info */}
      <div className='rounded-xl border border-gray-800/50 bg-linear-to-br from-gray-900/50 to-gray-950/50 p-4 backdrop-blur-sm sm:p-6'>
        <div className='mb-3 flex items-center gap-2 sm:mb-4'>
          <div className='bg-primary h-1 w-1 rounded-full' />
          <h2 className='text-base font-semibold text-white sm:text-lg'>
            Creator
          </h2>
        </div>
        <div className='flex items-center gap-3 sm:gap-4'>
          <div className='relative'>
            <div className='from-primary/30 absolute -inset-0.5 rounded-full bg-linear-to-br to-transparent opacity-50 blur-sm' />
            <Avatar className='relative h-11 w-11 ring-2 ring-gray-800/50 sm:h-14 sm:w-14'>
              <AvatarImage
                src={vm.creator.image || '/placeholder.svg'}
                alt={vm.creator.name}
              />
              <AvatarFallback className='from-primary bg-linear-to-br to-[#8fd93f] text-sm font-semibold text-black'>
                {vm.creator.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-lg leading-tight font-semibold text-white'>
              {vm.creator.name}
            </p>
            <p className='border-primary/30 bg-primary/10 text-primary mt-1.5 inline-block rounded-lg border px-2.5 py-1 text-xs font-semibold tracking-wide uppercase'>
              CREATOR
            </p>
          </div>
        </div>
      </div>

      {/* Project Links */}
      {allLinks.length > 0 && (
        <div className='rounded-xl border border-gray-800/50 bg-gradient-to-br from-gray-900/50 to-gray-950/50 p-4 backdrop-blur-sm sm:p-6'>
          <div className='mb-3 flex items-center gap-2 sm:mb-4'>
            <div className='bg-primary h-1 w-1 rounded-full' />
            <h2 className='text-base font-semibold text-white sm:text-lg'>
              Project Links
            </h2>
          </div>
          <div className='space-y-2'>
            {allLinks.map((link, index) => (
              <a
                key={index}
                href={
                  link.url.startsWith('http') ? link.url : `https://${link.url}`
                }
                target='_blank'
                rel='noopener noreferrer'
                className='group hover:border-primary/30 hover:bg-primary/5 flex items-center gap-3 rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 text-sm text-white transition-all'
              >
                <span className='group-hover:bg-primary/10 group-hover:text-primary flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 transition-colors'>
                  {getIcon(link.platform.toLowerCase())}
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
