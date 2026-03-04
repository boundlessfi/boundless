import { useState, useCallback } from 'react';
import { getHackathonSubmissions } from '@/lib/api/hackathons';
import type { ParticipantSubmission } from '@/lib/api/hackathons';

export type OrganizerSubmissionFilters = {
  status?: 'SUBMITTED' | 'SHORTLISTED' | 'DISQUALIFIED' | 'WITHDRAWN';
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

  const fetchSubmissions = useCallback(
    async (page = 1, filterOverrides?: OrganizerSubmissionFilters) => {
      if (!hackathonId) return;

      setLoading(true);
      setError(null);

      try {
        const appliedFilters = filterOverrides ?? filters;
        const res = await getHackathonSubmissions(
          hackathonId,
          page,
          initialLimit,
          appliedFilters
        );

        const list = res.data?.submissions ?? [];
        const pag = res.data?.pagination ?? {
          page: 1,
          limit: initialLimit,
          total: 0,
          totalPages: 0,
        };

        setSubmissions(list);
        setPagination(pag);
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
    [hackathonId, initialLimit, filters]
  );

  const updateFilters = useCallback(
    (next: OrganizerSubmissionFilters) => {
      setFilters(next);
      fetchSubmissions(1, next);
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
    updateFilters,
    loading,
    error,
    fetchSubmissions,
    goToPage,
    refresh,
  };
}
