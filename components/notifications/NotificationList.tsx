'use client';

import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { NotificationItem } from './NotificationItem';
import { Notification } from '@/types/notifications';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (id: string) => void;
}

const groupNotificationsByDate = (
  notifications: Notification[]
): Record<string, Notification[]> => {
  const groups: Record<string, Notification[]> = {};

  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    let groupKey: string;

    if (isToday(date)) {
      groupKey = 'Today';
    } else if (isYesterday(date)) {
      groupKey = 'Yesterday';
    } else if (isThisWeek(date)) {
      groupKey = format(date, 'EEEE'); // Day name
    } else {
      groupKey = format(date, 'MMMM d, yyyy'); // Full date
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });

  return groups;
};

export const NotificationList = ({
  notifications,
  loading = false,
  onNotificationClick,
  onMarkAsRead,
}: NotificationListProps) => {
  if (loading) {
    return (
      <div className='space-y-4'>
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className='h-24 w-full rounded-lg' />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-12 text-center'>
        <p className='text-lg font-medium text-zinc-300'>No notifications</p>
        <p className='mt-2 text-sm text-zinc-500'>
          You're all caught up! New notifications will appear here.
        </p>
      </div>
    );
  }

  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <div className='space-y-6'>
      {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
        <div key={date}>
          <div className='mb-3'>
            <h3 className='text-sm font-semibold tracking-wider text-zinc-500 uppercase'>
              {date}
            </h3>
          </div>
          <div className='space-y-2'>
            {dateNotifications.map(notification => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={() => {
                  if (onMarkAsRead) {
                    onMarkAsRead(notification._id);
                  }
                  if (onNotificationClick) {
                    onNotificationClick(notification);
                  }
                }}
                showUnreadIndicator={true}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
