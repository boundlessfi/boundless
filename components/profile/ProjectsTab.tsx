'use client';

import { useState, useEffect, useCallback } from 'react';
import ProjectCard from '../landing-page/project/ProjectCard';
import { Project } from '@/types/project';
import { GetMeResponse } from '@/lib/api/types';
import { useWindowSize } from '@/hooks/use-window-size';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProjectsTabProps {
  user: GetMeResponse;
}

export default function ProjectsTab({ user }: ProjectsTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { height: windowHeight } = useWindowSize();
  const itemsPerPage = 6;

  // Map project status to ProjectCard expected status
  const getProjectStatus = (
    status: string
  ): 'Validation' | 'Funding' | 'Funded' | 'Completed' => {
    switch (status) {
      case 'under_review':
        return 'Validation';
      case 'funding':
        return 'Funding';
      case 'funded':
        return 'Funded';
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'Funding';
      default:
        return 'Validation';
    }
  };

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
      setLoading(true);

      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const startIndex = (pageNum - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      // Use real projects data from API
      const allProjects = user.projects || [];
      const newProjects = allProjects.slice(startIndex, endIndex);

      if (pageNum === 1) {
        setProjects(newProjects);
      } else {
        setProjects(prev => [...prev, ...newProjects]);
      }

      setHasMore(endIndex < allProjects.length);
      setLoading(false);
    },
    [user.projects]
  );

  useEffect(() => {
    loadProjects(1);
  }, [loadProjects]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      if (
        scrollHeight - scrollTop <= clientHeight + 100 &&
        !loading &&
        hasMore
      ) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadProjects(nextPage);
      }
    },
    [loading, hasMore, page, loadProjects]
  );

  if (projects.length === 0 && !loading) {
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
          {user.projects?.length || 0} projects
        </span>
      </div>

      <ScrollArea
        className='w-full'
        style={{ height: calculateScrollHeight() }}
        onScrollCapture={handleScroll}
      >
        <div className='grid gap-4 pr-4 md:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2'>
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              projectId={project.id}
              creatorName={`${user.profile.firstName} ${user.profile.lastName}`}
              creatorLogo={user.profile.avatar || '/avatar.png'}
              projectImage={project.image || '/bitmed.png'}
              projectTitle={project.name}
              projectDescription={project.description}
              status={getProjectStatus(project.status)}
              deadlineInDays={30}
              milestoneRejected={false}
              isFullWidth={true}
              funding={{
                current: 0,
                goal: project.amount || 10000,
                currency: 'USDC',
              }}
            />
          ))}

          {loading && (
            <div className='col-span-full flex justify-center py-8'>
              <div className='flex items-center space-x-2'>
                <div className='border-primary h-6 w-6 animate-spin rounded-full border-b-2'></div>
                <span className='text-sm text-gray-400'>
                  Loading more projects...
                </span>
              </div>
            </div>
          )}

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
