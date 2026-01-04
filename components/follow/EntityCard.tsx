'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EntityCardProps } from '@/types/follow';

const entityTypeLabels = {
  USER: 'User',
  PROJECT: 'Project',
  ORGANIZATION: 'Organization',
  CROWDFUNDING_CAMPAIGN: 'Campaign',
  BOUNTY: 'Bounty',
  GRANT: 'Grant',
  HACKATHON: 'Hackathon',
};

const entityTypeColors = {
  USER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  PROJECT:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  ORGANIZATION:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CROWDFUNDING_CAMPAIGN:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  BOUNTY: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  GRANT: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  HACKATHON:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
};

export const EntityCard = ({
  entity,
  entityType,
  followedAt,
  className,
}: EntityCardProps) => {
  const getEntityUrl = () => {
    switch (entityType) {
      case 'USER':
        return `/user/${entity.username}`;
      case 'PROJECT':
        return `/projects/${entity.id}`;
      case 'ORGANIZATION':
        return `/organizations/${entity.id}`;
      case 'CROWDFUNDING_CAMPAIGN':
        return `/campaigns/${entity.id}`;
      case 'BOUNTY':
        return `/bounties/${entity.id}`;
      case 'GRANT':
        return `/grants/${entity.id}`;
      case 'HACKATHON':
        return `/hackathons/${entity.id}`;
      default:
        return '#';
    }
  };

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
        <div className='flex items-start gap-3'>
          <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800'>
            {entity.image || entity.logo || entity.banner ? (
              <Image
                src={entity.image || entity.logo || entity.banner || '/'}
                alt={entity.title || entity.name || 'Entity'}
                fill
                className='object-cover'
                sizes='48px'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center text-gray-400'>
                <span className='text-lg font-semibold'>
                  {(entity.title || entity.name || 'E').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Entity Info */}
          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between gap-2'>
              <div className='min-w-0 flex-1'>
                <Link href={getEntityUrl()} className='block hover:underline'>
                  <h3 className='text-foreground truncate font-medium'>
                    {entity.title || entity.name}
                  </h3>
                </Link>

                {entity.tagline && (
                  <p className='text-muted-foreground mt-1 line-clamp-2 text-sm'>
                    {entity.tagline}
                  </p>
                )}

                <div className='mt-2 flex items-center gap-2'>
                  <Badge
                    variant='secondary'
                    className={cn('text-xs', entityTypeColors[entityType])}
                  >
                    {entityTypeLabels[entityType]}
                  </Badge>

                  {entity.category && (
                    <span className='text-muted-foreground text-xs'>
                      {entity.category}
                    </span>
                  )}

                  {entity.status && (
                    <Badge variant='outline' className='text-xs'>
                      {entity.status}
                    </Badge>
                  )}
                </div>
              </div>

              <Link
                href={getEntityUrl()}
                className='hover:bg-accent rounded-md p-2 transition-colors'
                title='View details'
              >
                <ExternalLink className='text-muted-foreground h-4 w-4' />
              </Link>
            </div>

            {/* Followed date */}
            <div className='text-muted-foreground mt-3 flex items-center gap-1 text-xs'>
              <Calendar className='h-3 w-3' />
              <span>Followed {formatFollowedAt(followedAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
