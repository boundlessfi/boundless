'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isToday, isYesterday } from 'date-fns';
import { DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { NotificationItem } from './NotificationItem';
import { Notification } from '@/types/notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { markAsRead } from '@/lib/api/notifications';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  loading?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllAsRead?: () => void;
  onClose?: () => void;
}

type FilterTab = 'all' | 'unread';

const groupNotificationsByTime = (
  notifications: Notification[]
): { key: string; label: string; items: Notification[] }[] => {
  const groups: Record<string, Notification[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    if (isToday(date)) groups.today.push(notification);
    else if (isYesterday(date)) groups.yesterday.push(notification);
    else if (date > oneWeekAgo) groups.thisWeek.push(notification);
    else groups.older.push(notification);
  });

  const labels: Record<string, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    older: 'Older',
  };

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([key, items]) => ({ key, label: labels[key], items }));
};

export const NotificationDropdown = ({
  notifications,
  unreadCount,
  loading = false,
  onNotificationClick,
  onMarkAllAsRead,
  onClose,
}: NotificationDropdownProps) => {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>('all');

  const handleNotificationClick = async (notification: Notification) => {
    if (onNotificationClick) onNotificationClick(notification);

    if (!notification.read) {
      try {
        await markAsRead({ ids: [notification.id] });
      } catch {
        // Silently handle
      }
    }

    const data = notification.data;
    if (!data) {
      if (onClose) onClose();
      return;
    }

    if (data.organizationId)
      router.push(`/organizations/${data.organizationId}`);
    else if (data.hackathonId)
      router.push(
        data.hackathonSlug
          ? `/hackathons/${data.hackathonSlug}`
          : `/hackathons/${data.hackathonId}`
      );
    else if (data.projectId) router.push(`/projects/${data.projectId}`);
    else if (data.commentId) router.push(`/comments/${data.commentId}`);
    else if (data.milestoneId) router.push(`/milestones/${data.milestoneId}`);

    if (onClose) onClose();
  };

  const handleMarkAllAsRead = async () => {
    if (onMarkAllAsRead) {
      try {
        await onMarkAllAsRead();
        toast.success('All notifications marked as read');
      } catch {
        toast.error('Failed to mark all as read');
      }
    }
  };

  const filteredNotifications =
    filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const grouped = groupNotificationsByTime(filteredNotifications);
  const hasUnread = unreadCount > 0;

  return (
    <DropdownMenuContent
      className='w-96 rounded-xl border border-[#2B2B2B] bg-[#0c0c0c] p-0 shadow-xl shadow-black/50'
      align='end'
      sideOffset={8}
    >
      {/* Header */}
      <div className='flex items-center justify-between border-b border-neutral-800 px-4 pt-4 pb-3'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-semibold text-white'>Notifications</h3>
          {hasUnread && (
            <span className='bg-primary rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold text-black'>
              {unreadCount}
            </span>
          )}
        </div>
        {hasUnread && (
          <button
            onClick={handleMarkAllAsRead}
            className='text-primary hover:text-primary/80 text-xs font-medium transition-colors'
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className='flex gap-1 border-b border-neutral-800 px-4 py-1.5'>
        {(['all', 'unread'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors',
              filter === tab
                ? 'bg-gray-800 text-white'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {tab}
            {tab === 'unread' && hasUnread && (
              <span className='ml-1 text-gray-600'>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className='max-h-96 overflow-y-auto'>
        {loading ? (
          <div className='space-y-1 p-2'>
            {[1, 2, 3].map(i => (
              <div key={i} className='flex gap-3 p-3'>
                <Skeleton className='h-8 w-8 shrink-0 rounded-lg' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-3 w-3/4' />
                  <Skeleton className='h-3 w-full' />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className='px-4 py-10 text-center'>
            <Bell className='mx-auto h-8 w-8 text-gray-700' />
            <p className='mt-3 text-sm text-gray-400'>
              {filter === 'unread'
                ? "You're all caught up!"
                : 'No notifications yet'}
            </p>
            <p className='mt-1 text-xs text-gray-600'>
              {filter === 'unread'
                ? "You've read all your notifications."
                : 'New notifications will show up here.'}
            </p>
          </div>
        ) : (
          <div className='p-1'>
            {grouped.map(group => (
              <div key={group.key}>
                <div className='px-3 pt-3 pb-1'>
                  <p className='text-[11px] font-medium tracking-wider text-gray-600 uppercase'>
                    {group.label}
                  </p>
                </div>
                {group.items.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => handleNotificationClick(notification)}
                    showUnreadIndicator
                    compact
                    className='cursor-pointer'
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className='border-t border-neutral-800 p-2'>
          <Link
            href='/me/notifications'
            onClick={onClose}
            className='text-primary hover:text-primary/80 block py-1.5 text-center text-xs font-medium transition-colors'
          >
            View all notifications
          </Link>
        </div>
      )}
    </DropdownMenuContent>
  );
};
