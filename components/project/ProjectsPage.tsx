'use client';

import React from 'react';
import ProjectCard from '@/components/landing-page/project/ProjectCard';
import ExploreHeader from '@/components/projects/ExploreHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useProjects } from '@/hooks/project/use-project';
import { useProjectFilters } from '@/hooks/project/use-project-filters';
import { useProjectTransform } from '@/hooks/project/use-project-transform';
import { BoundlessButton } from '../buttons';
import { ArrowDownIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import EmptyState from '../EmptyState';
import LoadingScreen from '../landing-page/project/CreateProjectModal/LoadingScreen';

interface ProjectsClientProps {
  className?: string;
}

export default function ProjectsClient({
  className,
}: ProjectsClientProps = {}) {
  const {
    filters,
    handleSearch,
    handleSort,
    handleStatus,
    handleCategory,
    clearSearch,
    clearAllFilters,
  } = useProjectFilters();

  const { projects, loading, loadingMore, error, hasMore, loadMore, refetch } =
    useProjects({ initialFilters: filters });

  const { transformProjectForCard } = useProjectTransform();

  // Memoized project cards to prevent unnecessary re-renders
  const projectCards = React.useMemo(() => {
    return projects.map(project => {
      const cardData = transformProjectForCard(project);
      return <ProjectCard isFullWidth={true} key={project._id} {...cardData} />;
    });
  }, [projects, transformProjectForCard]);

  return (
    <div className={className} id='explore-project'>
      <ExploreHeader
        onSearch={handleSearch}
        onSortChange={handleSort}
        onStatusChange={handleStatus}
        onCategoryChange={handleCategory}
      />

      <main className='space-y-[40px] sm:space-y-[60px] md:space-y-[80px]'>
        {/* Results Summary */}
        {!loading && !error && projects.length > 0 && (
          <div className='mb-6 flex items-center justify-between'>
            <div className='text-gray-400'>
              <span>
                Showing {projects.length} project
                {projects.length !== 1 ? 's' : ''}
                {filters.search && ` for "${filters.search}"`}
                {filters.category && ` in ${filters.category}`}
                {filters.status && ` with status ${filters.status}`}
              </span>
            </div>
            {filters.search && (
              <BoundlessButton
                onClick={clearSearch}
                variant='outline'
                size='sm'
                className='text-primary hover:text-primary/80 text-sm'
                icon={<XIcon className='h-4 w-4' />}
                iconPosition='right'
              >
                Clear search
              </BoundlessButton>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className='flex flex-col items-center justify-center'>
            <LoadingScreen />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className='flex flex-col items-center justify-center py-16'>
            <div className='text-center'>
              <EmptyState
                title='Something went wrong'
                description={error}
                type='compact'
                action={
                  <BoundlessButton
                    onClick={refetch}
                    variant='outline'
                    size='sm'
                    icon={<RefreshCwIcon className='h-4 w-4' />}
                    iconPosition='right'
                  >
                    Try Again
                  </BoundlessButton>
                }
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && projects.length === 0 && (
          <div className='flex flex-col items-center justify-center py-16'>
            <div className='text-center'>
              <EmptyState
                title='No projects found'
                description={
                  filters.search || filters.category || filters.status
                    ? 'Try adjusting your filters to see more projects'
                    : 'No projects are available at the moment'
                }
                type='compact'
              />

              {(filters.search || filters.category || filters.status) && (
                <div className='mt-2'>
                  <BoundlessButton
                    onClick={clearAllFilters}
                    variant='outline'
                    className='bg-primary hover:bg-primary/80 rounded-lg px-6 py-3 text-white transition-colors'
                  >
                    Clear all filters
                  </BoundlessButton>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && projects.length > 0 && (
          <>
            <div className='mb-3 grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3'>
              {projectCards}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className='mt-8 flex items-center justify-center'>
                <BoundlessButton
                  onClick={loadMore}
                  variant='outline'
                  disabled={loadingMore}
                  icon={
                    loadingMore ? undefined : (
                      <ArrowDownIcon className='h-4 w-4' />
                    )
                  }
                  className='flex items-center gap-2 rounded-lg px-8 py-3 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-600'
                  iconPosition='right'
                >
                  {loadingMore && (
                    <LoadingSpinner size='sm' variant='spinner' color='white' />
                  )}
                  {loadingMore
                    ? 'Loading more projects...'
                    : 'Load More Projects'}
                </BoundlessButton>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
