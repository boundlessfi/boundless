'use client';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { cn } from '@/lib/utils';
import { FollowersListProps } from '@/types/follow';
import { useFollowersList } from '@/hooks/use-followers-list';
import { UserCard } from './UserCard';
import EmptyState from '../EmptyState';

export const FollowersList = ({
  entityType,
  entityId,
  className,
}: FollowersListProps) => {
  const { followers, isLoading, error, hasMore, loadMore } = useFollowersList(
    entityType,
    entityId
  );

  if (error) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <div className='mb-4 text-red-600'>
          <p className='text-sm'>Failed to load followers list</p>
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

  if (isLoading && followers.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='animate-pulse'>
            <div className='flex items-center gap-3 rounded-lg border p-4'>
              <div className='h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800'></div>
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

  if (followers.length === 0) {
    return (
      <div className={cn('', className)}>
        <EmptyState
          title='No followers yet'
          description='Be the first to follow this entity!'
          //   icon="users"
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className='space-y-3'>
        {followers.map(follow => (
          <UserCard
            key={follow.id}
            user={follow.entity}
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
