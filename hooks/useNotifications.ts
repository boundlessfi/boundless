'use client';

import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp?: string;
  [key: string]: unknown;
}

export function useNotifications(userId?: string) {
  const { socket, isConnected } = useSocket({
    namespace: '/notifications',
    userId,
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Request initial unread count when socket connects
  useEffect(() => {
    if (socket && isConnected) {
      console.log('Socket connected, requesting unread count');
      // Request initial unread count from server
      socket.emit('get-unread-count');
    }
  }, [socket, isConnected]);

  // Set up event listeners
  useEffect(() => {
    if (!socket) {
      return;
    }

    // Listen for new notifications
    const handleNotification = (notification: Notification) => {
      setNotifications(prev => {
        // Avoid duplicates
        const exists = prev.some(n => n.id === notification.id);
        if (exists) {
          return prev;
        }
        return [notification, ...prev];
      });
      setUnreadCount(prev => prev + 1);
    };

    // Listen for unread count updates
    const handleUnreadCount = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    // Listen for notification updates
    const handleNotificationUpdated = (data: any) => {
      // Update notification if it exists
      if (data.notificationId) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === data.notificationId ? { ...notif, ...data } : notif
          )
        );
      }
    };

    // Listen for all notifications read
    const handleAllRead = () => {
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    };

    // Error handling
    const handleError = (error: { message: string }) => {
      console.error('WebSocket error:', error);
    };

    // Register all listeners
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
  }, [socket]);

  const markAsRead = (notificationId: string) => {
    if (socket && isConnected) {
      socket.emit('mark-read', { notificationId });
    } else {
      console.warn('Cannot mark as read: socket not connected');
    }
  };

  const markAllAsRead = () => {
    if (socket && isConnected) {
      socket.emit('mark-all-read');
    } else {
      console.warn('Cannot mark all as read: socket not connected');
    }
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
  };
}
