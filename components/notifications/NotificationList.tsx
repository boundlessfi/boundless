'use client';

import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { NotificationItem } from './NotificationItem';
import { Notification } from '@/types/notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell } from 'lucide-react';

interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (id: string) => void;
}

const groupNotificationsByDate = (
  notifications: Notification[]
): { key: string; label: string; items: Notification[] }[] => {
  const orderedGroups: { key: string; label: string; items: Notification[] }[] =
    [];
  const seen = new Set<string>();

  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    let groupKey: string;

    if (isToday(date)) {
      groupKey = 'Today';
    } else if (isYesterday(date)) {
      groupKey = 'Yesterday';
    } else if (isThisWeek(date)) {
      groupKey = format(date, 'EEEE');
    } else {
      groupKey = format(date, 'MMMM d, yyyy');
    }

    if (!seen.has(groupKey)) {
      seen.add(groupKey);
      orderedGroups.push({ key: groupKey, label: groupKey, items: [] });
    }

    const group = orderedGroups.find(g => g.key === groupKey);
    group?.items.push(notification);
  });

  return orderedGroups;
};

export const NotificationList = ({
  notifications,
  loading = false,
  onNotificationClick,
  onMarkAsRead,
}: NotificationListProps) => {
  if (loading) {
    return (
      <div className='space-y-3'>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className='flex gap-3 p-4'>
            <Skeleton className='h-9 w-9 shrink-0 rounded-lg' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-2/3' />
              <Skeleton className='h-3 w-full' />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className='rounded-xl border border-[#2B2B2B] bg-[#0c0c0c] px-6 py-16 text-center'>
        <Bell className='mx-auto h-10 w-10 text-gray-700' />
        <p className='mt-4 text-base font-medium text-white'>
          No notifications
        </p>
        <p className='mt-1 text-sm text-gray-500'>
          You&apos;re all caught up! New notifications will appear here.
        </p>
      </div>
    );
  }

  const grouped = groupNotificationsByDate(notifications);

  return (
    <div className='space-y-6'>
      {grouped.map(group => (
        <div key={group.key}>
          <div className='mb-2 px-1'>
            <h3 className='text-xs font-medium tracking-wider text-gray-600 uppercase'>
              {group.label}
            </h3>
          </div>
          <div className='space-y-1'>
            {group.items.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={() => {
                  if (onMarkAsRead) onMarkAsRead(notification.id);
                  if (onNotificationClick) onNotificationClick(notification);
                }}
                showUnreadIndicator
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
