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
        'group relative flex items-start gap-4 rounded-xl border p-3 transition-all duration-200',
        !notification.read
          ? 'border-primary/20 bg-primary/5 hover:bg-primary/10'
          : 'border-white/5 bg-zinc-900/40 hover:border-zinc-800 hover:bg-zinc-900/80',
        className
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors',
          !notification.read
            ? 'border-primary/20 bg-primary/10 text-primary'
            : 'border-white/5 bg-zinc-900 text-zinc-400 group-hover:text-zinc-300'
        )}
      >
        <Icon className='h-5 w-5' />
      </div>

      <div className='min-w-0 flex-1 space-y-1'>
        <div className='flex items-start justify-between gap-2'>
          <h4
            className={cn(
              'text-sm leading-snug font-medium',
              !notification.read
                ? 'text-zinc-100'
                : 'text-zinc-400 group-hover:text-zinc-300'
            )}
          >
            {notification.title}
          </h4>
          <span className='text-[10px] whitespace-nowrap text-zinc-500'>
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <p
          className={cn(
            'line-clamp-2 text-xs leading-relaxed',
            !notification.read ? 'text-zinc-300' : 'text-zinc-500'
          )}
        >
          {notification.message}
        </p>

        {notification.data.amount && (
          <div className='mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400'>
            <span>$</span>
            <span>{notification.data.amount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {!notification.read && showUnreadIndicator && (
        <div className='bg-primary absolute top-11 right-2 h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]' />
      )}
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
