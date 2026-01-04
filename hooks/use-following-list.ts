import { useState, useEffect, useCallback } from 'react';
import {
  EntityType,
  FollowWithEntity,
  UseFollowingListReturn,
} from '@/types/follow';
import { followApi } from '@/lib/api/follow';

export const useFollowingList = (
  userId: string | undefined,
  entityType?: EntityType,
  initialLimit = 20
): UseFollowingListReturn => {
  const [following, setFollowing] = useState<FollowWithEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchFollowing = useCallback(
    async (pageNum = 1, reset = false) => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await followApi.getUserFollowing(
          userId,
          entityType,
          pageNum,
          initialLimit
        );

        if (reset) {
          setFollowing(response.data);
        } else {
          setFollowing(prev => [...prev, ...response.data]);
        }

        // Check if there are more pages (assuming we get full limit means there might be more)
        setHasMore(response.data.length === initialLimit);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch following list';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, entityType, initialLimit]
  );

  useEffect(() => {
    fetchFollowing(1, true);
    setPage(1);
  }, [userId, entityType, fetchFollowing]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    const nextPage = page + 1;
    setPage(nextPage);
    await fetchFollowing(nextPage, false);
  }, [hasMore, isLoading, page, fetchFollowing]);

  const refetch = useCallback(async () => {
    setPage(1);
    await fetchFollowing(1, true);
  }, [fetchFollowing]);

  return {
    following,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
  };
};
