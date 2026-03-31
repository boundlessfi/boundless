'use client';

import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Notification } from '@/types/notifications';
import {
  getNotificationIcon,
  getNotificationColorScheme,
} from './NotificationIcon';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: () => void;
  showUnreadIndicator?: boolean;
  compact?: boolean;
  className?: string;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  showUnreadIndicator = true,
  compact = false,
  className,
}: NotificationItemProps) => {
  const Icon = getNotificationIcon(notification.type);
  const colors = getNotificationColorScheme(notification.type);

  const getNotificationLink = (): string => {
    const data = notification.data;
    if (!data) return '#';

    if (data.organizationId) return `/organizations/${data.organizationId}`;
    if (data.hackathonId) {
      return data.hackathonSlug
        ? `/hackathons/${data.hackathonSlug}`
        : `/hackathons/${data.hackathonId}`;
    }
    if (data.teamInvitationId && data.projectId)
      return `/projects/${data.projectId}`;
    if (data.projectId) return `/projects/${data.projectId}`;
    if (data.commentId) return `/comments/${data.commentId}`;
    if (data.milestoneId) return `/milestones/${data.milestoneId}`;
    return '#';
  };

  const handleClick = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead();
    }
  };

  const link = getNotificationLink();
  const isClickable = link !== '#';
  const isUnread = !notification.read;

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  const content = (
    <div
      className={cn(
        'group relative flex items-start gap-3 rounded-lg px-3 py-3 transition-colors',
        isUnread
          ? 'bg-active-bg hover:bg-active-bg2/20'
          : 'hover:bg-gray-900/60',
        compact && 'py-2.5',
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg',
          compact ? 'h-8 w-8' : 'h-9 w-9',
          colors.bg,
          colors.text
        )}
      >
        <Icon className={cn(compact ? 'h-4 w-4' : 'h-[18px] w-[18px]')} />
      </div>

      {/* Content */}
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-3'>
          <p
            className={cn(
              'line-clamp-1 text-sm leading-snug font-medium',
              isUnread ? 'text-white' : 'text-gray-400'
            )}
          >
            {notification.title}
          </p>
          {isUnread && showUnreadIndicator && (
            <div className='bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full' />
          )}
        </div>

        <p
          className={cn(
            'mt-0.5 line-clamp-2 text-xs leading-relaxed',
            isUnread ? 'text-[#B5B5B5]' : 'text-gray-500'
          )}
        >
          {notification.message}
        </p>

        <div className='mt-1 flex items-center gap-3'>
          <span className='text-xs text-gray-600'>{timeAgo}</span>

          {notification.data?.amount != null && (
            <span className='border-success-300/20 bg-success-400/10 text-success-300 rounded border px-1.5 py-0.5 text-[11px] font-medium'>
              ${notification.data.amount.toLocaleString()}
            </span>
          )}
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

  return (
    <div onClick={handleClick} className='cursor-default'>
      {content}
    </div>
  );
};
