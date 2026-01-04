import { useState, useEffect, useCallback } from 'react';
import { FollowStats, UseFollowStatsReturn } from '@/types/follow';
import { followApi } from '@/lib/api/follow';

export const useFollowStats = (
  userId: string | undefined
): UseFollowStatsReturn => {
  const [stats, setStats] = useState<FollowStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await followApi.getFollowStats(userId);
      setStats(response.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch follow stats';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
};
