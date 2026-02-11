'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownIcon, RefreshCwIcon, XIcon, Loader2 } from 'lucide-react';

import ProjectCard from './ProjectCard';
import ExploreHeader from './ExploreHeader';
import { useProjects } from '@/features/projects/hooks/use-project';
import { useProjectFilters } from '@/features/projects/hooks/use-project-filters';
import { BoundlessButton } from '@/components/buttons';
import EmptyState from '@/components/EmptyState';
import LoadingScreen from '@/features/projects/components/CreateProjectModal/LoadingScreen';
import { cn } from '@/lib/utils';
import { Crowdfunding } from '@/features/projects/types';

interface ProjectsClientProps {
  className?: string;
}

export default function ProjectsClient({ className }: ProjectsClientProps) {
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

  const isFiltering =
    !!filters.search || !!filters.category || !!filters.status;

  const showResultsSummary = !loading && !error && projects.length > 0;
  const showEmptyState = !loading && !error && projects.length === 0;

  return (
    <div className={cn('flex flex-col gap-8', className)} id='explore-project'>
      <ExploreHeader
        onSearch={handleSearch}
        onSortChange={handleSort}
        onStatusChange={handleStatus}
        onCategoryChange={handleCategory}
      />

      <main className='min-h-[50vh]'>
        <AnimatePresence mode='wait'>
          {loading ? (
            <motion.div
              key='loading'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='flex items-center justify-center py-20'
            >
              <LoadingScreen />
            </motion.div>
          ) : error ? (
            <motion.div
              key='error'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ErrorState message={error} onRetry={refetch} />
            </motion.div>
          ) : showEmptyState ? (
            <motion.div
              key='empty'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <NoProjectsState
                isFiltering={isFiltering}
                onClearFilters={clearAllFilters}
              />
            </motion.div>
          ) : (
            <motion.div
              key='content'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {showResultsSummary && (
                <ResultsSummary
                  count={projects.length}
                  filters={filters}
                  onClearSearch={clearSearch}
                />
              )}

              <ProjectsGrid projects={projects} />

              {hasMore && (
                <LoadMoreSection
                  loadingMore={loadingMore}
                  onLoadMore={loadMore}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Sub-components for cleaner file structure

function ResultsSummary({
  count,
  filters,
  onClearSearch,
}: {
  count: number;
  filters: any; // Ideally this should be matched to FilterState type from hook
  onClearSearch: () => void;
}) {
  return (
    <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='text-muted-foreground text-sm'>
        Showing <span className='text-foreground font-medium'>{count}</span>{' '}
        project
        {count !== 1 && 's'}
        {filters.search && (
          <>
            {' '}
            matching{' '}
            <span className='font-medium'>&quot;{filters.search}&quot;</span>
          </>
        )}
        {filters.category && (
          <>
            {' '}
            in <span className='font-medium'>{filters.category}</span>
          </>
        )}
        {filters.status && (
          <>
            {' '}
            with status <span className='font-medium'>{filters.status}</span>
          </>
        )}
      </div>

      {filters.search && (
        <BoundlessButton
          onClick={onClearSearch}
          variant='ghost'
          size='sm'
          className='text-muted-foreground hover:text-foreground h-auto w-fit px-2 py-1 text-xs'
          icon={<XIcon className='h-3 w-3' />}
          iconPosition='right'
        >
          Clear search
        </BoundlessButton>
      )}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <EmptyState
        title='Unable to load projects'
        description={message}
        type='compact'
        action={
          <BoundlessButton
            onClick={onRetry}
            variant='outline'
            icon={<RefreshCwIcon className='h-4 w-4' />}
          >
            Try Again
          </BoundlessButton>
        }
      />
    </div>
  );
}

function NoProjectsState({
  isFiltering,
  onClearFilters,
}: {
  isFiltering: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <EmptyState
        title={isFiltering ? 'No matching projects' : 'No projects found'}
        description={
          isFiltering
            ? "We couldn't find any projects matching your filters. Try adjusting them."
            : 'There are no active projects to display at the moment.'
        }
        type='default'
        action={
          isFiltering ? (
            <BoundlessButton onClick={onClearFilters} variant='secondary'>
              Clear all filters
            </BoundlessButton>
          ) : undefined
        }
      />
    </div>
  );
}

function ProjectsGrid({ projects }: { projects: Crowdfunding[] }) {
  // Memoize projects if needed, though React usually handles this well enough in mapping
  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-2'>
      {projects.map(project => (
        <ProjectCard isFullWidth={true} key={project.id} data={project} />
      ))}
    </div>
  );
}

function LoadMoreSection({
  loadingMore,
  onLoadMore,
}: {
  loadingMore: boolean;
  onLoadMore: () => void;
}) {
  return (
    <div className='mt-12 flex justify-center'>
      <BoundlessButton
        onClick={onLoadMore}
        variant='outline'
        disabled={loadingMore}
        className='min-w-[200px]'
        icon={
          loadingMore ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <ArrowDownIcon className='h-4 w-4' />
          )
        }
      >
        {loadingMore ? 'Loading...' : 'Load More Projects'}
      </BoundlessButton>
    </div>
  );
}
