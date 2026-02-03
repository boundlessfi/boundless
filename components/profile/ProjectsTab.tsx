'use client';

import React, { useState, useEffect, useCallback } from 'react';
// import ProjectCard from '../landing-page/project/ProjectCard';
import { Project } from '@/types/user';
import { useWindowSize } from '@/hooks/use-window-size';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { GetMeResponse } from '@/lib/api/types';
import { mapProjectToCardData } from '@/features/projects/utils/card-mappers';
import ProjectCard from '@/features/projects/components/ProjectCard';

interface ProjectsTabProps {
  user: GetMeResponse;
}

export default function ProjectsTab({ user }: ProjectsTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { height: windowHeight } = useWindowSize();
  const itemsPerPage = 6;

  const calculateScrollHeight = () => {
    if (!windowHeight) return '400px';

    const headerHeight = 80;
    const tabsHeight = 60;
    const projectsHeaderHeight = 60;
    const padding = 40;

    const availableHeight =
      windowHeight - headerHeight - tabsHeight - projectsHeaderHeight - padding;

    return Math.max(300, Math.min(availableHeight, windowHeight * 0.6)) + 'px';
  };

  const loadProjects = useCallback(
    async (pageNum: number) => {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const startIndex = (pageNum - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      // Use real projects data from API
      const allProjects = user.user.projects || [];
      const newProjects = allProjects.slice(startIndex, endIndex);

      if (pageNum === 1) {
        setProjects(newProjects);
      } else {
        setProjects(prev => [...prev, ...newProjects]);
      }

      setHasMore(endIndex < allProjects.length);
    },
    [user.user.projects]
  );

  useEffect(() => {
    loadProjects(1);
  }, [loadProjects]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadProjects(nextPage);
      }
    },
    [hasMore, page, loadProjects]
  );

  if (projects.length === 0) {
    return (
      <div className='py-8 text-center'>
        <h3 className='mb-2 text-lg font-medium text-gray-300'>
          Your Projects
        </h3>
        <p className='text-sm text-gray-500'>No projects found</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-medium text-gray-300'>Your Projects</h3>
        <span className='text-sm text-gray-500'>
          {user.user.projects?.length || 0} projects
        </span>
      </div>

      <ScrollArea
        className='w-full'
        style={{ height: calculateScrollHeight() }}
        onScrollCapture={handleScroll}
      >
        <div className='grid gap-4 pr-4 md:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2'>
          {projects.map(project => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              target='_blank'
            >
              <ProjectCard
                newTab={true}
                isFullWidth={true}
                data={mapProjectToCardData(project, {
                  // Yes, `ProjectsTab` is for "Your Projects", so creator is the user.
                  name: user.user.name || 'User',
                  image: user.user.image || '/avatar.png',
                })}
              />
            </Link>
          ))}

          {!hasMore && projects.length > 0 && (
            <div className='col-span-full py-4 text-center'>
              <p className='text-sm text-gray-500'>No more projects to load</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
