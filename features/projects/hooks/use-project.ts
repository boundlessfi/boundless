'use client';

import * as React from 'react';
import { getCrowdfundingProjects } from '@/features/projects/api';
import type { Crowdfunding } from '@/features/projects/types';

type SortOption =
  | 'newest'
  | 'oldest'
  | 'funding_goal_high'
  | 'funding_goal_low'
  | 'deadline_soon'
  | 'deadline_far';

interface ProjectFilters {
  category?: string;
  status?: string;
  search?: string;
  sort?: SortOption;
}

interface UseProjectsOptions {
  initialPage?: number;
  pageSize?: number;
  initialFilters?: ProjectFilters;
}

interface UseProjectsReturn {
  projects: Crowdfunding[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  filters: ProjectFilters;
  setFilters: React.Dispatch<React.SetStateAction<ProjectFilters>>;
  loadMore: () => void;
  refetch: () => void;
}

export function useProjects(
  options: UseProjectsOptions = {}
): UseProjectsReturn {
  const { initialPage = 1, pageSize = 9, initialFilters = {} } = options;

  const [projects, setProjects] = React.useState<Crowdfunding[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [hasMore, setHasMore] = React.useState(true);
  const [filters, setFilters] = React.useState<ProjectFilters>(initialFilters);

  // Update filters when initialFilters change
  React.useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Get campaign deadline in milliseconds
  // const getProjectDeadline = React.useCallback(
  //   (campaign: CrowdfundingCampaign): number => {
  //     return new Date(campaign.fundingEndDate).getTime();
  //   },
  //   []
  // );

  const fetchProjects = React.useCallback(
    async (page: number, currentFilters: ProjectFilters, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        // Map sort option to API parameters
        const getSortParams = (sortOption: SortOption) => {
          switch (sortOption) {
            case 'newest':
              return { sortBy: 'createdAt', sortOrder: 'desc' as const };
            case 'oldest':
              return { sortBy: 'createdAt', sortOrder: 'asc' as const };
            case 'funding_goal_high':
              return { sortBy: 'fundingGoal', sortOrder: 'desc' as const };
            case 'funding_goal_low':
              return { sortBy: 'fundingGoal', sortOrder: 'asc' as const };
            case 'deadline_soon':
              return { sortBy: 'fundingEndDate', sortOrder: 'asc' as const };
            case 'deadline_far':
              return { sortBy: 'fundingEndDate', sortOrder: 'desc' as const };
            default:
              return { sortBy: 'createdAt', sortOrder: 'desc' as const };
          }
        };

        const sortParams = currentFilters.sort
          ? getSortParams(currentFilters.sort)
          : {};

        const response = await getCrowdfundingProjects(page, pageSize, {
          category: currentFilters.category,
          status: currentFilters.status,
          search: currentFilters.search,
          ...sortParams,
        });

        const fetchedProjects = response.data.campaigns;

        if (append) {
          setProjects(prev => [...prev, ...fetchedProjects]);
        } else {
          setProjects(fetchedProjects);
        }

        setHasMore(response.data.pagination.totalPages > page);
      } catch (err) {
        setError(
          'Failed to fetch projects. Please try again.' + (err as Error).message
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pageSize]
  );

  // Fetch projects when filters change
  React.useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchProjects(1, filters);
  }, [filters, fetchProjects]);

  const loadMore = React.useCallback(() => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchProjects(nextPage, filters, true);
  }, [currentPage, filters, fetchProjects]);

  const refetch = React.useCallback(() => {
    fetchProjects(currentPage, filters);
  }, [currentPage, filters, fetchProjects]);

  return {
    projects,
    loading,
    loadingMore,
    error,
    hasMore,
    currentPage,
    filters,
    setFilters,
    loadMore,
    refetch,
  };
}
