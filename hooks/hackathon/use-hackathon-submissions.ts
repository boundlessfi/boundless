import { useState, useCallback } from 'react';
import { getHackathonSubmissions } from '@/lib/api/hackathons';
import type { ParticipantSubmission } from '@/lib/api/hackathons';

interface Filters {
  status?: 'SUBMITTED' | 'SHORTLISTED' | 'DISQUALIFIED' | 'WITHDRAWN';
  type?: 'INDIVIDUAL' | 'TEAM';
  search?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useHackathonSubmissions(
  hackathonId: string,
  initialLimit = 12
) {
  const [submissions, setSubmissions] = useState<ParticipantSubmission[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(
    async (page = 1, newFilters?: Filters) => {
      if (!hackathonId) return;

      setLoading(true);
      setError(null);

      try {
        const activeFilters = newFilters !== undefined ? newFilters : filters;
        const response = await getHackathonSubmissions(
          hackathonId,
          page,
          pagination.limit,
          activeFilters
        );

        if (response.success && response.data) {
          setSubmissions(response.data.submissions);
          setPagination(response.data.pagination);
        } else {
          setError(response.message || 'Failed to fetch submissions');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch submissions'
        );
      } finally {
        setLoading(false);
      }
    },
    [hackathonId, pagination.limit, filters]
  );

  const updateFilters = useCallback(
    (newFilters: Filters) => {
      setFilters(newFilters);
      fetchSubmissions(1, newFilters);
    },
    [fetchSubmissions]
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
    filters,
    loading,
    error,
    fetchSubmissions,
    updateFilters,
    goToPage,
    refresh,
  };
}
