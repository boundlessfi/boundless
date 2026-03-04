'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationPolling } from '@/hooks/use-notification-polling';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { Notification } from '@/types/notifications';
import { NotificationDetailSheet } from './components/NotificationDetailSheet';
import { NotificationSection } from './components/NotificationSection';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCheck } from 'lucide-react';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function NotificationsPageSkeleton() {
  return (
    <div className='space-y-8'>
      {['New', 'Earlier', 'Archived'].map(sectionTitle => (
        <section key={sectionTitle}>
          <div className='mb-3 flex items-center gap-2'>
            <Skeleton className='h-4 w-4 rounded' />
            <Skeleton className='h-3 w-16' />
            <Skeleton className='h-5 w-6 rounded-full' />
          </div>
          <div className='overflow-hidden rounded-xl border border-zinc-800/30'>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className='flex items-start gap-4 border-t border-zinc-800/30 p-4 first:border-t-0'
              >
                <Skeleton className='h-10 w-10 shrink-0 rounded-full' />
                <div className='min-w-0 flex-1 space-y-2'>
                  <div className='flex justify-between gap-2'>
                    <Skeleton className='h-4 flex-1' />
                    <Skeleton className='h-3 w-14 shrink-0' />
                  </div>
                  <Skeleton className='h-3 w-full max-w-[85%]' />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

type NotificationGroups = {
  new: Notification[];
  earlier: Notification[];
  archived: Notification[];
};

const groupNotifications = (
  notifications: Notification[]
): NotificationGroups => {
  const now = Date.now();
  const sevenDaysAgo = now - SEVEN_DAYS_MS;

  const groups: NotificationGroups = { new: [], earlier: [], archived: [] };

  for (const notification of notifications) {
    const createdAt = new Date(notification.createdAt).getTime();

    if (!notification.read) {
      groups.new.push(notification);
    } else if (createdAt >= sevenDaysAgo) {
      groups.earlier.push(notification);
    } else {
      groups.archived.push(notification);
    }
  }

  return groups;
};

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const limit = 20;

  const notificationsHook = useNotifications({ page, limit, autoFetch: true });
  const {
    notifications,
    loading,
    error,
    total,
    unreadCount,
    markAllAsRead,
    markNotificationAsRead,
    setCurrentPage,
  } = notificationsHook;

  const { setUnreadCount, clearUnreadCount } = useNotificationStore();

  useEffect(() => {
    setUnreadCount(unreadCount);
  }, [unreadCount, setUnreadCount]);

  useNotificationPolling(notificationsHook, {
    interval: 30000,
    enabled: true,
  });

  const groups = useMemo(
    () => groupNotifications(notifications),
    [notifications]
  );

  const totalPages = Math.ceil(total / limit);

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      setSelectedNotification(notification);
      setSheetOpen(true);

      if (!notification.read) {
        markNotificationAsRead([notification.id]).catch(() => {});
      }
    },
    [markNotificationAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    setIsMarkingAll(true);
    try {
      await markAllAsRead();
      clearUnreadCount();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setTimeout(() => setIsMarkingAll(false), 600);
    }
  }, [markAllAsRead, clearUnreadCount]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setCurrentPage]
  );

  if (error) {
    return (
      <div className='p-10'>
        <div className='rounded-lg border border-red-800/50 bg-red-950/20 p-8 text-center'>
          <p className='text-lg font-semibold text-red-400'>
            Error loading notifications
          </p>
          <p className='mt-2 text-sm text-zinc-400'>{error.message}</p>
          <Button
            onClick={() => notificationsHook.refetch()}
            className='mt-4'
            variant='outline'
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='p-10'>
        {/* Header – matches me layout (Settings, etc.) */}
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='mb-2 text-2xl font-medium text-white'>
              Notifications
            </h1>
            <p className='text-sm text-zinc-500'>
              {loading ? (
                <span className='inline-block h-4 w-48 animate-pulse rounded bg-zinc-800' />
              ) : (
                <>
                  {unreadCount > 0
                    ? `${unreadCount} unread of ${total} total`
                    : `${total} notifications`}
                </>
              )}
            </p>
          </div>

          <AnimatePresence>
            {unreadCount > 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll}
                  variant='outline'
                  className='border-primary/30 text-primary hover:bg-primary/10 gap-2'
                >
                  <CheckCheck className='h-4 w-4' />
                  Mark all as read
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feed */}
        {loading ? (
          <NotificationsPageSkeleton />
        ) : notifications.length === 0 ? (
          <div className='rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-16 text-center'>
            <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900'>
              <Bell className='h-7 w-7 text-zinc-600' />
            </div>
            <p className='text-lg font-medium text-zinc-300'>
              No notifications yet
            </p>
            <p className='mx-auto mt-2 max-w-sm text-sm text-zinc-500'>
              When you receive notifications about your projects, hackathons, or
              account activity, they will appear here.
            </p>
          </div>
        ) : (
          <div className='space-y-8'>
            <NotificationSection
              title='New'
              notifications={groups.new}
              onNotificationClick={handleNotificationClick}
              isMarkingAll={isMarkingAll}
              emptyMessage='No new notifications'
              emptySubMessage="You're all caught up!"
            />

            <NotificationSection
              title='Earlier'
              notifications={groups.earlier}
              onNotificationClick={handleNotificationClick}
              isMarkingAll={false}
              emptyMessage='No earlier notifications'
              emptySubMessage='Read notifications from the past 7 days will show here.'
            />

            <NotificationSection
              title='Archived'
              notifications={groups.archived}
              onNotificationClick={handleNotificationClick}
              isMarkingAll={false}
              emptyMessage='No archived notifications'
              emptySubMessage='Older read notifications will appear here.'
            />
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className='mt-10 flex items-center justify-center gap-4'>
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              variant='outline'
              size='sm'
              className='border-zinc-800/50'
            >
              Previous
            </Button>
            <span className='text-sm text-zinc-400'>
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              variant='outline'
              size='sm'
              className='border-zinc-800/50'
            >
              Next
            </Button>
          </div>
        )}

        {/* Detail Sheet */}
        <NotificationDetailSheet
          notification={selectedNotification}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </div>
    </AuthGuard>
  );
}
