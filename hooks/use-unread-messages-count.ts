'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getConversations } from '@/lib/api/messages';
import { useAuthStatus } from '@/hooks/use-auth';

const UNREAD_MESSAGES_QUERY_KEY = ['messages', 'unread-count'] as const;
const REFETCH_INTERVAL_MS = 30_000;

/**
 * Total unread direct messages, for the navbar badge. Polled rather than
 * realtime because the messages websocket only subscribes to a single
 * conversation at a time.
 */
export function useUnreadMessagesCount(): {
  count: number;
  isLoading: boolean;
} {
  const { isAuthenticated } = useAuthStatus();

  const query = useQuery({
    queryKey: UNREAD_MESSAGES_QUERY_KEY,
    queryFn: async () => {
      const res = await getConversations(50, 0);
      return res.data.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
    },
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? REFETCH_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
    staleTime: REFETCH_INTERVAL_MS,
  });

  return {
    count: query.data ?? 0,
    isLoading: query.isLoading,
  };
}

export function useInvalidateUnreadMessagesCount(): () => void {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: UNREAD_MESSAGES_QUERY_KEY });
  };
}
