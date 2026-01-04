import { useState, useEffect, useCallback } from 'react';
import {
  EntityType,
  FollowWithEntity,
  UseFollowersListReturn,
} from '@/types/follow';
import { followApi } from '@/lib/api/follow';

export const useFollowersList = (
  entityType: EntityType,
  entityId: string,
  initialLimit = 20
): UseFollowersListReturn => {
  const [followers, setFollowers] = useState<FollowWithEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchFollowers = useCallback(
    async (pageNum = 1, reset = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await followApi.getEntityFollowers(
          entityType,
          entityId,
          pageNum,
          initialLimit
        );

        if (reset) {
          setFollowers(response.data);
        } else {
          setFollowers(prev => [...prev, ...response.data]);
        }

        // Check if there are more pages (assuming we get full limit means there might be more)
        setHasMore(response.data.length === initialLimit);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch followers list';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [entityType, entityId, initialLimit]
  );

  useEffect(() => {
    fetchFollowers(1, true);
    setPage(1);
  }, [entityType, entityId, fetchFollowers]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    const nextPage = page + 1;
    setPage(nextPage);
    await fetchFollowers(nextPage, false);
  }, [hasMore, isLoading, page, fetchFollowers]);

  const refetch = useCallback(async () => {
    setPage(1);
    await fetchFollowers(1, true);
  }, [fetchFollowers]);

  return {
    followers,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
  };
};
