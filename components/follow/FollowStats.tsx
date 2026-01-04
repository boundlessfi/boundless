'use client';

import { Users, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FollowStatsProps } from '@/types/follow';
import { useFollowStats } from '@/hooks/use-follow-stats';

export const FollowStats = ({ userId, className }: FollowStatsProps) => {
  const { stats, isLoading, error } = useFollowStats(userId);

  if (error) {
    return (
      <div className={cn('text-sm text-red-600', className)}>
        Error loading stats
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className='flex items-center gap-2'>
          <div className='h-4 w-4 animate-pulse rounded bg-gray-200'></div>
          <div className='h-4 w-8 animate-pulse rounded bg-gray-200'></div>
        </div>
        <div className='flex items-center gap-2'>
          <div className='h-4 w-4 animate-pulse rounded bg-gray-200'></div>
          <div className='h-4 w-8 animate-pulse rounded bg-gray-200'></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-6', className)}>
      <div className='text-muted-foreground hover:text-foreground group flex cursor-pointer items-center gap-2 text-sm transition-colors'>
        <UserCheck className='group-hover:text-primary h-4 w-4 transition-colors' />
        <span className='text-foreground font-medium'>{stats.following}</span>
        <span>Following</span>
      </div>

      <div className='text-muted-foreground hover:text-foreground group flex cursor-pointer items-center gap-2 text-sm transition-colors'>
        <Users className='group-hover:text-primary h-4 w-4 transition-colors' />
        <span className='text-foreground font-medium'>{stats.followers}</span>
        <span>Followers</span>
      </div>
    </div>
  );
};
