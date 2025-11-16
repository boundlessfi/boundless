'use client';
import React, { useRef, useCallback, memo } from 'react';
import { Project } from '@/types/project';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import { Progress } from './ui/progress';

interface ProjectCardProps {
  project: Project;
  creatorName?: string;
  creatorAvatar?: string;
  daysLeft?: number;
  votes?: {
    current: number;
    total: number;
  };
  onValidationClick?: () => void;
  onVoteClick?: () => void;
  className?: string;
  isFullWidth?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = memo(
  ({
    project,
    creatorName = 'Creator Name',
    creatorAvatar,
    className = '',
    isFullWidth = false,
  }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = useCallback(() => {
      if (!cardRef.current) return;

      gsap.to(cardRef.current, {
        y: -8,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out',
        force3D: true,
      });

      if (imageRef.current) {
        gsap.to(imageRef.current, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out',
          force3D: true,
        });
      }
    }, []);

    const handleMouseLeave = useCallback(() => {
      if (!cardRef.current) return;

      gsap.to(cardRef.current, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
        force3D: true,
      });

      if (imageRef.current) {
        gsap.to(imageRef.current, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
          force3D: true,
        });
      }
    }, []);

    useGSAP(
      (context, contextSafe) => {
        if (!cardRef.current) return;

        const elements = [
          imageRef.current,
          contentRef.current,
          bottomRef.current,
        ].filter(Boolean);

        gsap.set(elements, {
          opacity: 0,
          y: 20,
          force3D: true,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse',
            once: true,
          },
        });

        tl.to(imageRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          force3D: true,
        })
          .to(
            contentRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power2.out',
              force3D: true,
            },
            '-=0.2'
          )
          .to(
            bottomRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power2.out',
              force3D: true,
            },
            '-=0.2'
          );

        const safeHandleMouseEnter =
          contextSafe?.(handleMouseEnter) || handleMouseEnter;
        const safeHandleMouseLeave =
          contextSafe?.(handleMouseLeave) || handleMouseLeave;

        cardRef.current.addEventListener('mouseenter', safeHandleMouseEnter);
        cardRef.current.addEventListener('mouseleave', safeHandleMouseLeave);

        return () => {
          cardRef.current?.removeEventListener(
            'mouseenter',
            safeHandleMouseEnter
          );
          cardRef.current?.removeEventListener(
            'mouseleave',
            safeHandleMouseLeave
          );
        };
      },
      {
        scope: cardRef,
        dependencies: [handleMouseEnter, handleMouseLeave],
      }
    );

    return (
      <div
        ref={cardRef}
        className={`group mx-auto ${isFullWidth ? 'w-full' : 'w-full max-w-[397px]'} cursor-pointer overflow-hidden rounded-[8px] border border-[#2B2B2B] bg-[#030303] p-3 will-change-transform sm:p-5 ${className}`}
        style={{ transform: 'translateZ(0)' }}
      >
        <div className='mb-3 flex items-center justify-between sm:mb-4'>
          <div className='flex items-center space-x-2 sm:space-x-3'>
            <Avatar className='h-8 w-8 sm:h-6 sm:w-6'>
              <AvatarImage src={creatorAvatar} alt={creatorName} />
              <AvatarFallback className='bg-gray-700 text-white'>
                <Image
                  src='/globe.svg'
                  alt={creatorName}
                  width={24}
                  height={24}
                />
              </AvatarFallback>
            </Avatar>
            <span className='max-w-24 truncate text-xs font-medium text-gray-300 sm:max-w-none sm:text-sm'>
              {creatorName}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge className='flex-shrink-0 rounded-[4px] border border-[#645D5D] bg-[#E4DBDB] px-1 py-0.5 text-xs font-medium text-[#645D5D]'>
              {project.category}
            </Badge>
            <Badge className='bg-active-bg flex-shrink-0 rounded-[4px] border border-[#A7F950] px-1 py-0.5 text-xs font-medium text-[#A7F950]'>
              {project.category}
            </Badge>
          </div>
        </div>

        <div
          ref={imageRef}
          className='mb-3 flex items-start space-x-3 will-change-transform sm:mb-4 sm:space-x-4'
          style={{ transform: 'translateZ(0)' }}
        >
          <div className='relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl sm:h-[90px] sm:w-[80px]'>
            <Image
              src='/bitmed.png'
              alt={project.name}
              fill
              className='object-cover'
              priority={false}
              loading='lazy'
            />
          </div>

          <div ref={contentRef} className='min-w-0 flex-1 text-left'>
            <h3 className='mb-2 line-clamp-1 text-lg font-bold text-white sm:text-base'>
              {project.name}
            </h3>
            <p className='line-clamp-2 text-left text-xs leading-relaxed text-gray-300 sm:line-clamp-3 sm:text-sm'>
              {project.description}
            </p>
          </div>
        </div>

        <div ref={bottomRef} className='flex flex-col gap-2'>
          <div className='flex items-center justify-between space-x-2'>
            <div className='flex items-center space-x-2'>
              <span className='text-xs text-white sm:text-sm'>
                120/300 USDC
              </span>
              <span className='text-xs text-[#B5B5B5] sm:text-xs'>Raised</span>
            </div>
            <span className='text-xs text-[#F5B546] sm:text-xs'>
              15 days to deadline
            </span>
          </div>
          <Progress value={50} className='h-2' />
        </div>
      </div>
    );
  }
);

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;
