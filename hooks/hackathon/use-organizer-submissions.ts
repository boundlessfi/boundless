import { useState, useCallback, useEffect } from 'react';
import { getHackathonSubmissions } from '@/lib/api/hackathons';
import type { ParticipantSubmission } from '@/lib/api/hackathons';
import { useDebounce } from '@/hooks/use-debounce';

export type OrganizerSubmissionFilters = {
  status?: 'SUBMITTED' | 'SHORTLISTED' | 'DISQUALIFIED';
  type?: 'INDIVIDUAL' | 'TEAM';
  search?: string;
};

const DEFAULT_PAGINATION = (limit: number) => ({
  page: 1,
  limit,
  total: 0,
  totalPages: 0,
});

export interface UseOrganizerSubmissionsReturn {
  submissions: ParticipantSubmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: OrganizerSubmissionFilters;
  updateFilters: (next: OrganizerSubmissionFilters) => void;
  loading: boolean;
  error: string | null;
  fetchSubmissions: (
    page?: number,
    filterOverrides?: OrganizerSubmissionFilters
  ) => Promise<void>;
  goToPage: (page: number) => void;
  refresh: () => void;
  updateLimit: (limit: number) => void;
}

export function useOrganizerSubmissions(
  hackathonId: string,
  initialLimit = 12
): UseOrganizerSubmissionsReturn {
  const [submissions, setSubmissions] = useState<ParticipantSubmission[]>([]);
  const [pagination, setPagination] = useState(() =>
    DEFAULT_PAGINATION(initialLimit)
  );
  const [filters, setFilters] = useState<OrganizerSubmissionFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchSubmissions = useCallback(
    async (page = 1, filterOverrides?: OrganizerSubmissionFilters) => {
      if (!hackathonId) return;

      setLoading(true);
      setError(null);

      try {
        const appliedFilters = filterOverrides ?? {
          ...filters,
          search: debouncedSearch,
        };
        const res = await getHackathonSubmissions(
          hackathonId,
          page,
          pagination.limit || initialLimit,
          appliedFilters
        );

        const list = res.data?.submissions ?? [];
        const rawPag = res.data?.pagination;

        const currentPage = rawPag?.page || page;
        const limit = rawPag?.limit || pagination.limit || initialLimit;
        const total = rawPag?.total || 0;
        const totalPages = Math.ceil(total / limit) || 1;

        setSubmissions(list);
        setPagination({
          page: currentPage,
          limit,
          total,
          totalPages,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch submissions'
        );
        setSubmissions([]);
        setPagination(DEFAULT_PAGINATION(initialLimit));
      } finally {
        setLoading(false);
      }
    },
    [
      hackathonId,
      initialLimit,
      debouncedSearch,
      pagination.limit,
      filters.status,
      filters.type,
    ]
  );

  // Sync with backend on filter/pagination changes
  useEffect(() => {
    fetchSubmissions(1);
  }, [
    fetchSubmissions,
    debouncedSearch,
    filters.status,
    filters.type,
    pagination.limit,
  ]);

  const updateFilters = useCallback((next: OrganizerSubmissionFilters) => {
    setFilters(next);
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      fetchSubmissions(page);
    },
    [fetchSubmissions]
  );

  const refresh = useCallback(() => {
    fetchSubmissions(pagination.page);
  }, [fetchSubmissions, pagination.page]);

  const updateLimit = useCallback((nextLimit: number) => {
    setPagination(prev => ({ ...prev, limit: nextLimit }));
  }, []);

  return {
    submissions,
    pagination,
    filters,
    updateFilters,
    loading,
    error,
    fetchSubmissions,
    goToPage,
    refresh,
    updateLimit,
  };
}
