import { useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '@/lib/api/notifications';
import type { Notification } from '@/types/notifications';

interface UseNotificationsOptions {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: Error | null;
  total: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  unreadCount: number;
  markNotificationAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useNotifications = (
  options: UseNotificationsOptions = {}
): UseNotificationsReturn => {
  const { page: initialPage = 1, limit = 10, autoFetch = true } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNotifications(currentPage, limit);

      // Response structure: { data: Notification[], total: number, page: number, limit: number }
      if (response && Array.isArray(response.data)) {
        setNotifications(response.data || []);
        setTotal(response.total || 0);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err : new Error('Failed to fetch notifications');
      setError(errorMessage);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [fetchNotifications, autoFetch]);

  const markNotificationAsRead = useCallback(
    async (ids: string[]) => {
      // Optimistic update
      setNotifications(prev =>
        prev.map(notif =>
          ids.includes(notif._id)
            ? {
                ...notif,
                read: true,
                readAt: new Date().toISOString(),
              }
            : notif
        )
      );

      try {
        await markAsRead({ ids });
      } catch (err) {
        // Revert on error
        await fetchNotifications();
        throw err;
      }
    },
    [fetchNotifications]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(notif => ({
        ...notif,
        read: true,
        readAt: new Date().toISOString(),
      }))
    );

    try {
      await markAllAsRead();
    } catch (err) {
      // Revert on error
      await fetchNotifications();
      throw err;
    }
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    error,
    total,
    currentPage,
    setCurrentPage,
    unreadCount,
    markNotificationAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refetch: fetchNotifications,
  };
};
