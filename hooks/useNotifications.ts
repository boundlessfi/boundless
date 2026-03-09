import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { getNotifications } from '@/lib/api/notifications';
import { Notification } from '@/types/notifications';
import { reportError } from '@/lib/error-reporting';

interface UseNotificationsOptions {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  loading: boolean;
  error: Error | null;
  total: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => Promise<void>;
  markNotificationAsRead: (ids: string[]) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotifications(
  input?: string | UseNotificationsOptions
): UseNotificationsReturn {
  // Handle overloaded arguments
  const userId = typeof input === 'string' ? input : undefined;
  const options = typeof input === 'object' ? input : {};
  const { page: initialPage = 1, limit = 10, autoFetch = true } = options;

  const { socket, isConnected } = useSocket({
    namespace: '/notifications',
    userId,
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Merge server list with current state: dedupe by id, preserve optimistic read state (short rollback path)
  const mergeNotifications = useCallback(
    (prev: Notification[], serverList: Notification[]): Notification[] => {
      const byId = new Map<string, Notification>();
      serverList.forEach(n => {
        const id = n.id ?? (n as any)._id;
        if (id) byId.set(id, n);
      });
      const merged = Array.from(byId.values()).map(server => {
        const local = prev.find(p => p.id === server.id);
        const read = local?.read ?? server.read;
        return { ...server, read };
      });
      return merged.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    []
  );

  // Fetch notifications with pagination; merge with current state to preserve optimistic read and dedupe by id
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNotifications(currentPage, limit);

      if (response && Array.isArray(response.notifications)) {
        setNotifications(prev =>
          mergeNotifications(prev, response.notifications)
        );
        setTotal(response.total || 0);
      }
    } catch (err) {
      reportError(err, { context: 'notifications-fetch' });
      setError(
        err instanceof Error ? err : new Error('Failed to fetch notifications')
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, mergeNotifications]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [fetchNotifications, autoFetch]);

  // Request initial unread count when socket connects
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('get-unread-count');
    }
  }, [socket, isConnected]);

  // Set up event listeners
  useEffect(() => {
    if (!socket) {
      return;
    }

    // Listen for new notifications
    const handleNotification = (notification: any) => {
      const normalizedNotification: Notification = {
        ...notification,
        id: notification.id || notification._id,
        createdAt:
          notification.createdAt ||
          notification.timestamp ||
          new Date().toISOString(),
      };

      setNotifications(prev => {
        // Avoid duplicates
        const exists = prev.some(n => n.id === normalizedNotification.id);
        if (exists) {
          return prev;
        }

        // Add new notification and resort
        // Note: For pagination, real-time updates might be tricky.
        // We typically add it to the top if we are on page 1.
        if (currentPage === 1) {
          return [normalizedNotification, ...prev];
        }
        return prev;
      });
      setUnreadCount(prev => prev + 1);
    };

    // Listen for unread count updates
    const handleUnreadCount = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    // Listen for notification updates
    const handleNotificationUpdated = (data: any) => {
      const id = data.notificationId || data.id || data._id;
      if (id) {
        setNotifications(prev =>
          prev.map(notif => (notif.id === id ? { ...notif, ...data } : notif))
        );
      }
    };

    // Listen for all notifications read
    const handleAllRead = () => {
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    };

    const handleError = (error: { message: string }) => {
      reportError(error, { context: 'notifications-websocket' });
    };

    socket.on('notification', handleNotification);
    socket.on('unread-count', handleUnreadCount);
    socket.on('notification-updated', handleNotificationUpdated);
    socket.on('all-notifications-read', handleAllRead);
    socket.on('error', handleError);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('unread-count', handleUnreadCount);
      socket.off('notification-updated', handleNotificationUpdated);
      socket.off('all-notifications-read', handleAllRead);
      socket.off('error', handleError);
    };
  }, [socket, currentPage]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    if (socket && isConnected) {
      socket.emit('mark-read', { notificationId });
    }
  };

  const markNotificationAsRead = async (ids: string[]) => {
    let markedUnreadCount = 0;
    setNotifications(prev => {
      markedUnreadCount = prev.filter(
        n => ids.includes(n.id) && !n.read
      ).length;
      return prev.map(n => (ids.includes(n.id) ? { ...n, read: true } : n));
    });
    setUnreadCount(prev => Math.max(0, prev - markedUnreadCount));

    if (socket && isConnected) {
      ids.forEach(id => socket.emit('mark-read', { notificationId: id }));
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    if (socket && isConnected) {
      socket.emit('mark-all-read');
    }
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    loading,
    error,
    total,
    currentPage,
    setCurrentPage,
    markAsRead,
    markAllAsRead,
    markNotificationAsRead,
    fetchNotifications,
    refetch: fetchNotifications,
  };
}
