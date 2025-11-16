'use client';

import React from 'react';
import HackathonCard from '@/components/landing-page/hackathon/HackathonCard';
import HackathonsFiltersHeader from '@/components/hackathons/HackathonsFiltersHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useHackathonFilters } from '@/hooks/hackathon/use-hackathon-filters';
import { useHackathonsList } from '@/hooks/hackathon/use-hackathons-list';
import { useHackathonTransform } from '@/hooks/hackathon/use-hackathon-transform';
import type { Hackathon } from '@/lib/api/hackathons';
import { BoundlessButton } from '../buttons';
import { ArrowDownIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import EmptyState from '../EmptyState';
import LoadingScreen from '../landing-page/project/CreateProjectModal/LoadingScreen';

interface HackathonsPageProps {
  className?: string;
}

export default function HackathonsPage({
  className,
}: HackathonsPageProps = {}) {
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
    refetch,
  } = useHackathonsList({ initialFilters: filters });

  const { transformHackathonForCard } = useHackathonTransform();

  const hackathonCards = React.useMemo(() => {
    return hackathons.map(hackathon => {
      const orgName =
        '_organizationName' in hackathon
          ? (hackathon as Hackathon & { _organizationName?: string })
              ._organizationName
          : undefined;
      const cardData = transformHackathonForCard(hackathon, orgName);
      return (
        <HackathonCard isFullWidth={true} key={hackathon._id} {...cardData} />
      );
    });
  }, [hackathons, transformHackathonForCard]);

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

        {!loading && !error && hackathons.length === 0 && (
          <div className='flex flex-col items-center justify-center py-16'>
            <div className='text-center'>
              <EmptyState
                title='No hackathons found'
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
                    className='bg-primary hover:bg-primary/80 rounded-lg px-6 py-3 text-white transition-colors'
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
                    ? 'Loading more hackathons...'
                    : 'Load More Hackathons'}
                </BoundlessButton>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
