import { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from './useSocket';
import { getNotifications } from '@/lib/api/notifications';
import { Notification, NotificationsResponse } from '@/types/notifications';
import { reportError } from '@/lib/error-reporting';
import { useNotificationStore } from '@/lib/stores/notification-store';

interface UseNotificationsOptions {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
  enabled?: boolean;
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

const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

const sortByCreatedAtDesc = (a: Notification, b: Notification) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export function useNotifications(
  input?: string | UseNotificationsOptions
): UseNotificationsReturn {
  // Handle overloaded arguments
  const userId = typeof input === 'string' ? input : undefined;
  const options = typeof input === 'object' ? input : {};
  const {
    page: initialPage = 1,
    limit = 10,
    autoFetch = true,
    enabled = true,
  } = options;

  const { socket, isConnected } = useSocket({
    namespace: '/notifications',
    userId,
    autoConnect: enabled && autoFetch,
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasFetched, setHasFetched] = useState(false);

  const { setUnreadCount: setGlobalUnreadCount } = useNotificationStore();
  const queryClient = useQueryClient();

  // Sync with global store
  useEffect(() => {
    if (hasFetched) {
      setGlobalUnreadCount(unreadCount);
    }
  }, [unreadCount, setGlobalUnreadCount, hasFetched]);

  // Merge server list with current state: dedupe by id, preserve optimistic read state
  const mergeNotifications = useCallback(
    (prev: Notification[], serverList: Notification[]): Notification[] => {
      const byId = new Map<string, Notification>();
      serverList.forEach(n => {
        const id = n.id ?? (n as { _id?: string })._id;
        if (id) byId.set(id, n);
      });
      const merged = Array.from(byId.values()).map(server => {
        const local = prev.find(p => p.id === server.id);
        const read = local?.read ?? server.read;
        return { ...server, read };
      });
      return merged.sort(sortByCreatedAtDesc);
    },
    []
  );

  // React Query handles dedupe across components. Multiple consumers calling this
  // hook with the same (page, limit) share a single network request.
  const {
    data: response,
    isFetching: queryFetching,
    error: queryError,
    refetch: refetchQuery,
  } = useQuery<NotificationsResponse>({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, 'list', currentPage, limit],
    queryFn: () => getNotifications(currentPage, limit),
    enabled: enabled && autoFetch,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  // Merge query data into local state so socket-driven updates can layer on top.
  useEffect(() => {
    if (response && Array.isArray(response.notifications)) {
      setNotifications(prev =>
        mergeNotifications(prev, response.notifications)
      );
      setTotal(response.total || 0);
      setHasFetched(true);
    }
  }, [response, mergeNotifications]);

  useEffect(() => {
    if (queryError) {
      reportError(queryError, { context: 'notifications-fetch' });
    }
  }, [queryError]);

  const fetchNotifications = useCallback(async () => {
    await refetchQuery();
  }, [refetchQuery]);

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

    const handleNotification = (notification: Record<string, unknown>) => {
      const normalizedNotification: Notification = {
        ...(notification as unknown as Notification),
        id: (notification.id || notification._id) as string,
        createdAt:
          (notification.createdAt as string) ||
          (notification.timestamp as string) ||
          new Date().toISOString(),
      };

      setNotifications(prev => {
        const exists = prev.some(n => n.id === normalizedNotification.id);
        if (exists) {
          return prev;
        }

        if (currentPage === 1) {
          return [normalizedNotification, ...prev];
        }
        return prev;
      });
      setUnreadCount(prev => prev + 1);

      // Keep React Query cache in sync so other consumers see the same data.
      queryClient.setQueryData<NotificationsResponse | undefined>(
        [...NOTIFICATIONS_QUERY_KEY, 'list', currentPage, limit],
        prevData => {
          if (!prevData) return prevData;
          const exists = prevData.notifications.some(
            n => n.id === normalizedNotification.id
          );
          if (exists || currentPage !== 1) return prevData;
          return {
            ...prevData,
            notifications: [
              normalizedNotification,
              ...prevData.notifications,
            ].sort(sortByCreatedAtDesc),
            total: (prevData.total || 0) + 1,
          };
        }
      );
    };

    const handleUnreadCount = (data: { count: number }) => {
      setUnreadCount(data.count);
      setHasFetched(true);
    };

    const handleNotificationUpdated = (data: Record<string, unknown>) => {
      const id = (data.notificationId || data.id || data._id) as
        | string
        | undefined;
      if (id) {
        setNotifications(prev =>
          prev.map(notif => (notif.id === id ? { ...notif, ...data } : notif))
        );
      }
    };

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
  }, [socket, currentPage, limit, queryClient]);

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
    loading: queryFetching,
    error: queryError as Error | null,
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
