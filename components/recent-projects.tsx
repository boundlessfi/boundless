'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as React from 'react';
import Image from 'next/image';

interface Project {
  id: string;
  title: string;
  vision: string;
  category: string;
  status: string;
  banner?: string | null;
  logo?: string | null;
  createdAt: string;
}

interface RecentProjectsProps {
  projects: Project[];
  maxDisplay?: number;
}

function mapStatus(status: string) {
  switch (status.toLowerCase()) {
    case 'campaigning':
      return {
        label: 'Funding',
        color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
      };
    case 'idea':
      return {
        label: 'Validation',
        color: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      };
    case 'completed':
      return {
        label: 'Completed',
        color: 'bg-green-500/15 text-green-400 border-green-500/20',
      };
    case 'live':
      return {
        label: 'Funded',
        color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      };
    case 'reviewing':
      return {
        label: 'Reviewing',
        color: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
      };
    default:
      return {
        label: status,
        color: 'bg-white/10 text-white/50 border-white/10',
      };
  }
}

function ProjectImage({ project }: { project: Project }) {
  const imageUrl = project.logo || project.banner;
  const [failed, setFailed] = React.useState(false);

  if (
    !imageUrl ||
    imageUrl === '' ||
    imageUrl.includes('example.com') ||
    failed
  ) {
    return (
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5'>
        <Package className='h-4 w-4 text-white/30' />
      </div>
    );
  }

  return (
    <Image
      width={40}
      height={40}
      src={imageUrl}
      alt={project.title}
      className='h-10 w-10 shrink-0 rounded-lg object-cover'
      onError={() => setFailed(true)}
    />
  );
}

export function RecentProjects({
  projects,
  maxDisplay = 5,
}: RecentProjectsProps) {
  const { displayProjects, hasMoreProjects } = React.useMemo(() => {
    const sorted = [...projects].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return {
      displayProjects: sorted.slice(0, maxDisplay),
      hasMoreProjects: sorted.length > maxDisplay,
    };
  }, [projects, maxDisplay]);

  if (displayProjects.length === 0) {
    return (
      <div className='flex h-full flex-col items-center justify-center rounded-xl border border-white/6 bg-white/2 p-8 text-center'>
        <Package className='mb-3 h-10 w-10 text-white/20' />
        <p className='text-sm font-medium text-white/60'>No projects yet</p>
        <p className='mt-0.5 text-xs text-white/30'>
          Your projects will appear here once you create one.
        </p>
      </div>
    );
  }

  return (
    <div className='rounded-xl border border-white/6 bg-white/2'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-white/6 px-4 py-3 sm:px-5'>
        <h3 className='text-sm font-medium text-white'>Recent Projects</h3>
        {hasMoreProjects && (
          <Link
            href='/me/projects'
            className='flex items-center gap-1 text-xs text-white/40 transition-colors hover:text-white/70'
          >
            View all
            <ArrowRight className='h-3 w-3' />
          </Link>
        )}
      </div>

      {/* Desktop table view */}
      <div className='hidden sm:block'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-white/4'>
              <th className='px-4 py-2.5 text-left text-xs font-medium tracking-wide text-white/30 uppercase sm:px-5'>
                Project
              </th>
              <th className='px-4 py-2.5 text-left text-xs font-medium tracking-wide text-white/30 uppercase'>
                Category
              </th>
              <th className='px-4 py-2.5 text-left text-xs font-medium tracking-wide text-white/30 uppercase'>
                Status
              </th>
              <th className='px-4 py-2.5 text-right text-xs font-medium tracking-wide text-white/30 uppercase sm:px-5'>
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {displayProjects.map((project, i) => {
              const status = mapStatus(project.status);
              return (
                <tr
                  key={project.id}
                  className={`transition-colors hover:bg-white/2 ${i < displayProjects.length - 1 ? 'border-b border-white/4' : ''}`}
                >
                  <td className='px-4 py-3 sm:px-5'>
                    <div className='flex items-center gap-3'>
                      <ProjectImage project={project} />
                      <span className='truncate text-sm font-medium text-white'>
                        {project.title}
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <span className='text-sm text-white/50'>
                      {project.category}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <Badge
                      variant='outline'
                      className={`border text-[11px] font-medium ${status.color}`}
                    >
                      {status.label}
                    </Badge>
                  </td>
                  <td className='px-4 py-3 text-right sm:px-5'>
                    <span className='text-xs text-white/30'>
                      {format(new Date(project.createdAt), 'MMM d, yyyy')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className='divide-y divide-white/4 sm:hidden'>
        {displayProjects.map(project => {
          const status = mapStatus(project.status);
          return (
            <div key={project.id} className='flex items-center gap-3 px-4 py-3'>
              <ProjectImage project={project} />
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium text-white'>
                  {project.title}
                </p>
                <div className='mt-1 flex items-center gap-2'>
                  <Badge
                    variant='outline'
                    className={`border text-[10px] font-medium ${status.color}`}
                  >
                    {status.label}
                  </Badge>
                  <span className='text-[11px] text-white/25'>
                    {format(new Date(project.createdAt), 'MMM d')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile view all */}
      {hasMoreProjects && (
        <div className='border-t border-white/4 p-3 sm:hidden'>
          <Button
            asChild
            variant='ghost'
            size='sm'
            className='w-full text-xs text-white/40 hover:text-white/70'
          >
            <Link
              href='/me/projects'
              className='flex items-center justify-center gap-1.5'
            >
              View All Projects
              <ArrowRight className='h-3 w-3' />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
