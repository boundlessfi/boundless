import { useEffect, useRef } from 'react';
import type { UseNotificationsReturn } from './useNotifications';

interface UseNotificationPollingOptions {
  interval?: number;
  enabled?: boolean;
}

/**
 * Hook to poll for new notifications at a specified interval
 * Only polls when component is mounted and enabled is true
 */
export const useNotificationPolling = (
  notificationsHook: UseNotificationsReturn,
  options: UseNotificationPollingOptions = {}
): void => {
  const { interval = 900000000000000, enabled = false } = options;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { refetch } = notificationsHook;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Poll for new notifications at specified interval
    intervalRef.current = setInterval(() => {
      refetch().catch(() => {
        // Silently fail polling errors to avoid disrupting UX
      });
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetch, interval, enabled]);
};
