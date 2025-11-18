'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { useNotificationPolling } from '@/hooks/use-notification-polling';
import { NotificationList } from '@/components/notifications/NotificationList';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const notificationsHook = useNotifications({
    page,
    limit,
    autoFetch: true,
  });

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

  // Enable polling for real-time updates
  useNotificationPolling(notificationsHook, {
    interval: 30000,
    enabled: true,
  });

  const totalPages = Math.ceil(total / limit);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
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
    <div className='container mx-auto max-w-4xl p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Notifications</h1>
          <p className='mt-1 text-sm text-zinc-400'>
            {loading ? (
              <Skeleton className='h-4 w-48' />
            ) : (
              <>
                {unreadCount} unread of {total} total
              </>
            )}
          </p>
        </div>
        {unreadCount > 0 && !loading && (
          <Button
            onClick={handleMarkAllAsRead}
            variant='outline'
            className='border-primary/30 text-primary hover:bg-primary/10'
          >
            Mark all as read
          </Button>
        )}
      </div>

      <NotificationList
        notifications={notifications}
        loading={loading}
        onNotificationClick={notification => {
          if (!notification.read) {
            markNotificationAsRead([notification._id]).catch(() => {
              // Silently handle error - user feedback already provided
            });
          }
        }}
        onMarkAsRead={id => {
          markNotificationAsRead([id]).catch(() => {
            // Silently handle error - user feedback already provided
          });
        }}
      />

      {totalPages > 1 && !loading && (
        <div className='mt-8 flex items-center justify-center gap-4'>
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            variant='outline'
            size='sm'
            className='border-zinc-800/50'
          >
            <ChevronLeft className='mr-1 h-4 w-4' />
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
            <ChevronRight className='ml-1 h-4 w-4' />
          </Button>
        </div>
      )}
    </div>
  );
}
