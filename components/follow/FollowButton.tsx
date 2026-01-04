'use client';

import { useState } from 'react';
import { UserPlus, UserMinus } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { FollowButtonProps } from '@/types/follow';
import { useFollow } from '@/hooks/use-follow';
import { BoundlessButton } from '../buttons';

export const FollowButton = ({
  entityType,
  entityId,
  initialIsFollowing = false,
  onFollowChange,
  className,
}: FollowButtonProps) => {
  const [optimisticIsFollowing, setOptimisticIsFollowing] =
    useState(initialIsFollowing);

  const { isFollowing, isLoading, toggleFollow } = useFollow(
    entityType,
    entityId,
    initialIsFollowing
  );

  const displayIsFollowing = isLoading ? optimisticIsFollowing : isFollowing;

  const handleToggleFollow = async () => {
    // Optimistic update
    const newFollowState = !displayIsFollowing;
    setOptimisticIsFollowing(newFollowState);

    try {
      await toggleFollow();

      // Notify parent component of the change
      onFollowChange?.(newFollowState, newFollowState ? 1 : -1);

      // Show success toast
      toast.success(
        newFollowState
          ? `You are now following this ${entityType.toLowerCase()}`
          : `You unfollowed this ${entityType.toLowerCase()}`
      );
    } catch {
      setOptimisticIsFollowing(displayIsFollowing);
      const errorMessage = 'Failed to update follow status';
      toast.error(errorMessage);
    }
  };

  return (
    <BoundlessButton
      onClick={handleToggleFollow}
      disabled={isLoading}
      variant={displayIsFollowing ? 'outline' : 'default'}
      size='sm'
      fullWidth
      className={cn(
        'flex items-center gap-2 transition-all duration-200',
        displayIsFollowing
          ? 'hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50'
          : 'hover:bg-primary/90',
        className
      )}
    >
      {isLoading ? (
        <LoadingSpinner size='xs' color='default' />
      ) : displayIsFollowing ? (
        <UserMinus className='h-4 w-4' />
      ) : (
        <UserPlus className='h-4 w-4' />
      )}
      <span className='font-medium'>
        {isLoading
          ? 'Updating...'
          : displayIsFollowing
            ? 'Following'
            : 'Follow'}
      </span>
    </BoundlessButton>
  );
};
