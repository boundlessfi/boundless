import { useState, useCallback } from 'react';
import { getExploreSubmissions } from '@/lib/api/hackathons';
import type { ExploreSubmissionsResponse } from '@/lib/api/hackathons';

export function useHackathonSubmissions(
  hackathonId: string,
  initialLimit = 12
) {
  const [submissions, setSubmissions] = useState<ExploreSubmissionsResponse[]>(
    []
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(
    async (page = 1) => {
      if (!hackathonId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getExploreSubmissions(
          hackathonId,
          page,
          pagination.limit
        );
        setSubmissions(data);
        // No pagination info from getExploreSubmissions, so just update page/limit
        setPagination(prev => ({ ...prev, page }));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch submissions'
        );
      } finally {
        setLoading(false);
      }
    },
    [hackathonId, pagination.limit]
  );

  const goToPage = useCallback(
    (page: number) => {
      fetchSubmissions(page);
    },
    [fetchSubmissions]
  );

  const refresh = useCallback(() => {
    fetchSubmissions(pagination.page);
  }, [fetchSubmissions, pagination.page]);

  return {
    submissions,
    pagination,
    loading,
    error,
    fetchSubmissions,
    goToPage,
    refresh,
  };
}
