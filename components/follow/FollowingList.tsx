'use client';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { cn } from '@/lib/utils';
import { FollowingListProps } from '@/types/follow';
import { useFollowingList } from '@/hooks/use-following-list';
import { EntityCard } from './EntityCard';
import EmptyState from '../EmptyState';

export const FollowingList = ({
  userId,
  entityType,
  className,
}: FollowingListProps) => {
  const { following, isLoading, error, hasMore, loadMore } = useFollowingList(
    userId,
    entityType
  );

  if (error) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <div className='mb-4 text-red-600'>
          <p className='text-sm'>Failed to load following list</p>
          <p className='text-muted-foreground mt-1 text-xs'>{error}</p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading && following.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='animate-pulse'>
            <div className='flex items-center gap-3 rounded-lg border p-4'>
              <div className='h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-800'></div>
              <div className='flex-1 space-y-2'>
                <div className='h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800'></div>
                <div className='h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800'></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <div className={cn('', className)}>
        <EmptyState
          title='Not following anyone yet'
          description={
            entityType
              ? `This user isn't following any ${entityType.toLowerCase()}s.`
              : "This user isn't following anyone yet."
          }
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className='space-y-3'>
        {following.map(follow => (
          <EntityCard
            key={follow.id}
            entity={follow.entity}
            entityType={follow.entityType}
            followedAt={follow.followedAt}
          />
        ))}
      </div>

      {hasMore && (
        <div className='flex justify-center pt-4'>
          <Button
            variant='outline'
            onClick={loadMore}
            disabled={isLoading}
            className='min-w-[120px]'
          >
            {isLoading ? (
              <>
                <LoadingSpinner size='xs' className='mr-2' />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
