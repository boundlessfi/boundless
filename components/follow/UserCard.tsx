'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { UserCardProps } from '@/types/follow';

export const UserCard = ({ user, followedAt, className }: UserCardProps) => {
  const formatFollowedAt = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      className={cn(
        'transition-shadow duration-200 hover:shadow-md',
        className
      )}
    >
      <CardContent className='p-4'>
        <div className='flex items-center gap-3'>
          {/* User Avatar */}
          <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800'>
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || user.username || 'User'}
                fill
                className='object-cover'
                sizes='48px'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center text-gray-400'>
                <span className='text-lg font-semibold'>
                  {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className='min-w-0 flex-1'>
            <div className='flex items-center justify-between gap-2'>
              <div className='min-w-0 flex-1'>
                <Link
                  href={`/user/${user.username}`}
                  className='block hover:underline'
                >
                  <h3 className='text-foreground truncate font-medium'>
                    {user.name || 'Anonymous User'}
                  </h3>
                </Link>

                {user.username && (
                  <p className='text-muted-foreground text-sm'>
                    @{user.username}
                  </p>
                )}
              </div>

              <Link
                href={`/user/${user.username}`}
                className='hover:bg-accent rounded-md p-2 transition-colors'
                title='View profile'
              >
                <ExternalLink className='text-muted-foreground h-4 w-4' />
              </Link>
            </div>

            {/* Followed date */}
            <div className='text-muted-foreground mt-2 flex items-center gap-1 text-xs'>
              <Calendar className='h-3 w-3' />
              <span>Followed {formatFollowedAt(followedAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
