'use client';

import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Notification } from '@/types/notifications';
import { getNotificationIcon } from './NotificationIcon';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: () => void;
  showUnreadIndicator?: boolean;
  className?: string;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  showUnreadIndicator = true,
  className,
}: NotificationItemProps) => {
  const Icon = getNotificationIcon(notification.type);

  const getNotificationLink = (): string => {
    // Organization notifications
    if (notification.data.organizationId) {
      return `/organizations/${notification.data.organizationId}`;
    }

    // Hackathon notifications (prefer slug over ID)
    if (notification.data.hackathonId) {
      if (notification.data.hackathonSlug) {
        return `/hackathons/${notification.data.hackathonSlug}`;
      }
      return `/hackathons/${notification.data.hackathonId}`;
    }

    // Team invitation notifications (navigate to project if available)
    if (notification.data.teamInvitationId && notification.data.projectId) {
      return `/projects/${notification.data.projectId}`;
    }

    // Project notifications
    if (notification.data.projectId) {
      return `/projects/${notification.data.projectId}`;
    }

    // Comment notifications
    if (notification.data.commentId) {
      return `/comments/${notification.data.commentId}`;
    }

    // Milestone notifications
    if (notification.data.milestoneId) {
      return `/milestones/${notification.data.milestoneId}`;
    }

    return '#';
  };

  const handleClick = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead();
    }
  };

  const link = getNotificationLink();
  const isClickable = link !== '#';

  const content = (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 transition-all',
        !notification.read
          ? 'border-primary/30 bg-primary/5 hover:bg-primary/10'
          : 'border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/50',
        className
      )}
    >
      <div className='bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
        <Icon className='text-primary h-5 w-5' />
      </div>

      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <h4
                className={cn(
                  'font-semibold',
                  !notification.read ? 'text-white' : 'text-zinc-300'
                )}
              >
                {notification.title}
              </h4>
              {!notification.read && showUnreadIndicator && (
                <span className='bg-primary h-2 w-2 shrink-0 rounded-full' />
              )}
            </div>
            <p
              className={cn(
                'mt-1 line-clamp-2 text-sm',
                !notification.read ? 'text-zinc-300' : 'text-zinc-500'
              )}
            >
              {notification.message}
            </p>
            {notification.data.amount && (
              <p className='mt-2 text-sm font-medium text-green-400'>
                Amount: ${notification.data.amount.toLocaleString()}
              </p>
            )}
            <p className='mt-2 text-xs text-zinc-500'>
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isClickable) {
    return (
      <Link href={link} onClick={handleClick} className='block'>
        {content}
      </Link>
    );
  }

  return <div onClick={handleClick}>{content}</div>;
};
