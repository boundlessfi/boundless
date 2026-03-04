'use client';

import React, { useState } from 'react';
import HackathonCard from '@/components/landing-page/hackathon/HackathonCard';
import HackathonsFiltersHeader from '@/components/hackathons/HackathonsFiltersHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useHackathonFilters } from '@/hooks/hackathon/use-hackathon-filters';
import { useHackathonsList } from '@/hooks/hackathon/use-hackathons-list';
import { useHackathonTransform } from '@/hooks/hackathon/use-hackathon-transform';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { BoundlessButton } from '../buttons';
import { XIcon } from 'lucide-react';
import LoadingScreen from '@/features/projects/components/CreateProjectModal/LoadingScreen';
import EmptyState from '@/components/EmptyState';

interface HackathonsPageProps {
  className?: string;
}

const HackathonsPage: React.FC<HackathonsPageProps> = ({ className } = {}) => {
  const {
    filters,
    handleSearch,
    handleSort,
    handleStatus,
    handleCategory,
    handleLocation,
    clearSearch,
    clearAllFilters,
  } = useHackathonFilters();

  const {
    hackathons,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
  } = useHackathonsList({ initialFilters: filters });
  const hackathonCards = React.useMemo(() => {
    return hackathons.map(hackathon => {
      return (
        <HackathonCard
          isFullWidth={true}
          key={hackathon.id || hackathon.slug}
          {...hackathon}
        />
      );
    });
  }, [hackathons]);

  const [loadMoreSentinelEl, setLoadMoreSentinelRef] =
    useState<HTMLDivElement | null>(null);
  useInfiniteScroll(loadMoreSentinelEl, {
    onLoadMore: loadMore,
    hasMore,
    loading: loadingMore,
    rootMargin: '0px 0px 2000px 0px',
  });

  return (
    <div className={className} id='explore-hackathons'>
      <HackathonsFiltersHeader
        onSearch={handleSearch}
        onSortChange={handleSort}
        onStatusChange={handleStatus}
        onCategoryChange={handleCategory}
        onLocationChange={handleLocation}
        totalCount={totalCount}
      />

      <main className='space-y-[40px] sm:space-y-[60px] md:space-y-[80px]'>
        {!loading && !error && hackathons.length > 0 && (
          <div className='mb-6 flex items-center justify-between'>
            <div className='text-gray-400'>
              <span>
                Showing {hackathons.length} hackathon
                {hackathons.length !== 1 ? 's' : ''}
                {filters.search && ` for "${filters.search}"`}
                {filters.category && ` in ${filters.category}`}
                {filters.status && ` with status ${filters.status}`}
                {filters.location && ` in ${filters.location}`}
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

        {loading && (
          <div className='flex flex-col items-center justify-center'>
            <LoadingScreen />
          </div>
        )}

        {error && (
          <div className='flex flex-col items-center justify-center py-16'>
            <div className='text-center'>
              {/* <EmptyState
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
              /> */}
            </div>
          </div>
        )}

        {!loading && !error && hackathons.length === 0 && (
          <div className='flex flex-col items-center justify-center py-16'>
            <div className='text-center'>
              <EmptyState
                title='No available hackathon'
                description={
                  filters.search ||
                  filters.category ||
                  filters.status ||
                  filters.location
                    ? 'Try adjusting your filters to see more hackathons'
                    : 'No hackathons are available at the moment'
                }
                type='compact'
              />

              {(filters.search ||
                filters.category ||
                filters.status ||
                filters.location) && (
                <div className='mt-2'>
                  <BoundlessButton
                    onClick={clearAllFilters}
                    variant='outline'
                    className='bg-primary/10 border-primary text-primary hover:bg-primary/20 rounded-lg px-6 py-3 transition-colors'
                  >
                    Clear all filters
                  </BoundlessButton>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !error && hackathons.length > 0 && (
          <>
            <div className='mb-3 grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3'>
              {hackathonCards}
            </div>

            <div
              ref={setLoadMoreSentinelRef}
              className='h-px w-full'
              aria-hidden
            />

            {loadingMore && (
              <div className='mt-6 flex items-center justify-center gap-2 py-4 text-gray-400'>
                <LoadingSpinner size='sm' variant='spinner' color='white' />
                <span className='text-sm'>Loading more hackathons...</span>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default HackathonsPage;
