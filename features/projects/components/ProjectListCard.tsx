'use client';

import { memo } from 'react';
import Image from 'next/image';
import { useRouter } from 'nextjs-toploader/app';
import { cn } from '@/lib/utils';
import type { Project } from '@/features/projects/types';

interface ProjectListCardProps {
  project: Project;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  IDEA: { label: 'Draft', style: 'text-amber-400 bg-amber-400/10' },
  REVIEWING: {
    label: 'In Review',
    style: 'text-yellow-400 bg-yellow-400/10',
  },
  ACTIVE: { label: 'Active', style: 'text-blue-400 bg-blue-400/10' },
  CAMPAIGNING: { label: 'Funding', style: 'text-blue-400 bg-blue-400/10' },
  LIVE: { label: 'Live', style: 'text-green-400 bg-green-400/10' },
  COMPLETED: {
    label: 'Completed',
    style: 'text-green-400 bg-green-400/10',
  },
  APPROVED: {
    label: 'Approved',
    style: 'text-emerald-400 bg-emerald-400/10',
  },
};

function ProjectListCard({ project, className }: ProjectListCardProps) {
  const router = useRouter();

  const banner =
    project.banner ||
    project.logo ||
    '/images/placeholders/project-banner-placeholder.png';

  const statusInfo = STATUS_CONFIG[project.status] ?? {
    label: project.status,
    style: 'text-gray-400 bg-gray-800/20',
  };

  const handleClick = () => {
    router.push(`/projects/${project.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-800 bg-[#0c0c0c] transition-all duration-300 hover:border-neutral-700 hover:shadow-lg hover:shadow-black/40',
        className
      )}
    >
      {/* Banner */}
      <div className='relative h-36 overflow-hidden sm:h-40 lg:h-44'>
        <Image
          src={banner}
          alt={project.title}
          fill
          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw'
          className='object-cover transition-transform duration-300 group-hover:scale-105'
          unoptimized
          onError={e => {
            e.currentTarget.src = project.logo || '';
            e.currentTarget.classList.add(
              'object-contain',
              'p-4',
              'bg-[#1a1a1a]'
            );
            e.currentTarget.classList.remove('object-cover');
          }}
        />
        <div className='absolute inset-0 bg-linear-to-t from-[#0c0c0c] via-black/40 to-transparent' />

        {/* Top: Category + Status */}
        <div className='absolute top-3 right-3 left-3 flex items-center justify-between'>
          {project.category && (
            <span className='rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-gray-300 backdrop-blur-md'>
              {project.category}
            </span>
          )}
          <span
            className={cn(
              'ml-auto rounded-md px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm',
              statusInfo.style
            )}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Bottom: Logo + Creator */}
        <div className='absolute right-3 bottom-3 left-3 flex items-end justify-between'>
          <div className='flex items-center gap-2'>
            {project.logo && (
              <div className='size-8 overflow-hidden rounded-lg border border-neutral-700 bg-[#1a1a1a]'>
                <Image
                  src={project.logo}
                  alt={project.title}
                  width={32}
                  height={32}
                  className='h-full w-full object-cover'
                  unoptimized
                />
              </div>
            )}
            <div className='flex items-center gap-1.5'>
              {project.creator?.image && (
                <div
                  className='size-5 rounded-full border border-white/20 bg-cover bg-center'
                  style={{
                    backgroundImage: `url(${project.creator.image})`,
                  }}
                />
              )}
              <span className='text-xs font-medium text-white/80 drop-shadow-md'>
                {project.creator?.name || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='flex flex-1 flex-col px-4 pt-3 sm:px-5'>
        <h2 className='line-clamp-2 text-base leading-tight font-semibold text-white'>
          {project.title}
        </h2>
        {(project.vision || project.tagline) && (
          <p className='mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500'>
            {project.vision || project.tagline}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className='mt-auto flex items-center justify-between border-t border-neutral-800 px-4 py-3 sm:px-5'>
        <div className='flex items-center gap-3'>
          {project._count?.votes !== undefined && project._count.votes > 0 && (
            <span className='text-xs text-gray-500'>
              {project._count.votes} vote{project._count.votes !== 1 && 's'}
            </span>
          )}
          {project._count?.comments !== undefined &&
            project._count.comments > 0 && (
              <span className='text-xs text-gray-500'>
                {project._count.comments} comment
                {project._count.comments !== 1 && 's'}
              </span>
            )}
        </div>
        {project.tags.length > 0 && (
          <div className='flex items-center gap-1'>
            {project.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className='rounded bg-neutral-800/60 px-1.5 py-0.5 text-[10px] text-gray-500'
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 2 && (
              <span className='text-[10px] text-gray-600'>
                +{project.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ProjectListCard);
