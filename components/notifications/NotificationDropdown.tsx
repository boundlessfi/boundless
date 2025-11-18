'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isToday, isYesterday } from 'date-fns';
import {
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { NotificationItem } from './NotificationItem';
import { Notification } from '@/types/notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { markAsRead } from '@/lib/api/notifications';
import { toast } from 'sonner';

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  loading?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllAsRead?: () => void;
  onClose?: () => void;
}

const groupNotificationsByTime = (
  notifications: Notification[]
): Record<string, Notification[]> => {
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

    if (isToday(date)) {
      groups.today.push(notification);
    } else if (isYesterday(date)) {
      groups.yesterday.push(notification);
    } else if (date > oneWeekAgo) {
      groups.thisWeek.push(notification);
    } else {
      groups.older.push(notification);
    }
  });

  return groups;
};

const getGroupLabel = (group: string): string => {
  switch (group) {
    case 'today':
      return 'Today';
    case 'yesterday':
      return 'Yesterday';
    case 'thisWeek':
      return 'This Week';
    case 'older':
      return 'Older';
    default:
      return group;
  }
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

  const handleNotificationClick = async (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    // Auto-mark as read on click
    if (!notification.read) {
      try {
        await markAsRead({ ids: [notification._id] });
      } catch {
        // Silently handle error - user feedback already provided
      }
    }

    // Navigate to relevant page based on priority
    // Organization notifications
    if (notification.data.organizationId) {
      router.push(`/organizations/${notification.data.organizationId}`);
    }
    // Hackathon notifications (prefer slug over ID)
    else if (notification.data.hackathonId) {
      if (notification.data.hackathonSlug) {
        router.push(`/hackathons/${notification.data.hackathonSlug}`);
      } else {
        router.push(`/hackathons/${notification.data.hackathonId}`);
      }
    }
    // Team invitation notifications (navigate to project if available)
    else if (
      notification.data.teamInvitationId &&
      notification.data.projectId
    ) {
      router.push(`/projects/${notification.data.projectId}`);
    }
    // Project notifications
    else if (notification.data.projectId) {
      router.push(`/projects/${notification.data.projectId}`);
    }
    // Comment notifications
    else if (notification.data.commentId) {
      router.push(`/comments/${notification.data.commentId}`);
    }
    // Milestone notifications
    else if (notification.data.milestoneId) {
      router.push(`/milestones/${notification.data.milestoneId}`);
    }

    if (onClose) {
      onClose();
    }
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

  const groupedNotifications = groupNotificationsByTime(notifications);
  const hasUnread = unreadCount > 0;

  return (
    <DropdownMenuContent
      className='w-80 rounded-xl border border-zinc-800/50 bg-zinc-950/95 p-0 backdrop-blur-xl'
      align='end'
    >
      <div className='border-b border-zinc-800/50 p-4'>
        <div className='flex items-center justify-between'>
          <h3 className='font-semibold text-white'>Notifications</h3>
          {hasUnread && (
            <span className='bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-semibold'>
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      <div className='max-h-96 overflow-y-auto p-2'>
        {loading ? (
          <div className='space-y-2'>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className='h-20 w-full rounded-lg' />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className='py-8 text-center'>
            <p className='text-sm text-zinc-400'>No notifications</p>
            <p className='mt-1 text-xs text-zinc-500'>You're all caught up!</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {Object.entries(groupedNotifications).map(
              ([group, groupNotifications]) => {
                if (groupNotifications.length === 0) return null;

                return (
                  <div key={group}>
                    <div className='mb-2 px-2'>
                      <p className='text-xs font-medium tracking-wider text-zinc-500 uppercase'>
                        {getGroupLabel(group)}
                      </p>
                    </div>
                    <div className='space-y-1'>
                      {groupNotifications.map(notification => (
                        <NotificationItem
                          key={notification._id}
                          notification={notification}
                          onMarkAsRead={() =>
                            handleNotificationClick(notification)
                          }
                          showUnreadIndicator={true}
                          className='cursor-pointer'
                        />
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <>
          <DropdownMenuSeparator className='bg-zinc-800/50' />
          <div className='border-t border-zinc-800/50 p-2'>
            <div className='flex items-center justify-between gap-2'>
              {hasUnread && (
                <button
                  onClick={handleMarkAllAsRead}
                  className='text-primary hover:text-primary/80 text-xs font-medium transition-colors'
                >
                  Mark all as read
                </button>
              )}
              <Link
                href='/notifications'
                className='text-primary hover:text-primary/80 ml-auto text-xs font-medium transition-colors'
                onClick={onClose}
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </DropdownMenuContent>
  );
};
