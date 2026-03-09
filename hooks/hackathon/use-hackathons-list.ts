'use client';

import * as React from 'react';
import {
  getPublicHackathonsList,
  type Hackathon,
  type PublicHackathonsListData,
} from '@/lib/api/hackathons';
import type { HackathonFilters } from './use-hackathon-filters';
import { mapSortToAPI, mapStatusToAPI } from './use-hackathon-filters';
import { reportError } from '@/lib/error-reporting';

type SortOption =
  | 'newest'
  | 'oldest'
  | 'prize_pool_high'
  | 'prize_pool_low'
  | 'deadline_soon'
  | 'deadline_far';

interface UseHackathonsListOptions {
  initialPage?: number;
  pageSize?: number;
  initialFilters?: HackathonFilters;
}

interface UseHackathonsListReturn {
  hackathons: Hackathon[];
  featuredHackathons: Hackathon[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalCount: number;
  loadMore: () => void;
  refetch: () => void;
}

export const useHackathonsList: (
  options: UseHackathonsListOptions
) => UseHackathonsListReturn = (options: UseHackathonsListOptions = {}) => {
  const { initialPage = 1, pageSize = 10, initialFilters = {} } = options;

  const [hackathons, setHackathons] = React.useState<Hackathon[]>([]);
  const [featuredHackathons, setFeaturedHackathons] = React.useState<
    Hackathon[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [hasMore, setHasMore] = React.useState(true);
  const [totalCount, setTotalCount] = React.useState(0);
  const [filters, setFilters] =
    React.useState<HackathonFilters>(initialFilters);

  // Update filters when initialFilters change
  React.useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Get hackathon deadline in milliseconds
  const getHackathonDeadline = React.useCallback(
    (hackathon: Hackathon): number => {
      try {
        if (hackathon?.submissionDeadline) {
          return new Date(hackathon?.submissionDeadline).getTime();
        }
      } catch {
        // Handle error silently
      }
      return 0;
    },
    []
  );

  // Get prize pool total
  const getPrizePoolTotal = React.useCallback(
    (hackathon: Hackathon): number => {
      if (hackathon?.prizeTiers && hackathon?.prizeTiers.length > 0) {
        return hackathon?.prizeTiers.reduce((sum, tier) => {
          const raw = tier.prizeAmount ?? (tier as { amount?: string }).amount;
          const parsed = Number(raw);
          return sum + (Number.isFinite(parsed) ? parsed : 0);
        }, 0);
      }
      return 0;
    },
    []
  );

  // Sort hackathons for reverse sort options (client-side only)
  const sortHackathons = React.useCallback(
    (hackathonsList: Hackathon[], sortOption?: SortOption): Hackathon[] => {
      if (!sortOption) return hackathonsList;

      const sorted = [...hackathonsList];

      // Only handle reverse sort options that API doesn't support
      switch (sortOption) {
        case 'prize_pool_low':
          return sorted.sort(
            (a, b) => getPrizePoolTotal(a) - getPrizePoolTotal(b)
          );
        case 'deadline_far':
          return sorted.sort((a, b) => {
            const aDeadline = getHackathonDeadline(a);
            const bDeadline = getHackathonDeadline(b);
            if (aDeadline === 0) return 1;
            if (bDeadline === 0) return -1;
            return bDeadline - aDeadline;
          });
        default:
          // Other sorts are handled by API
          return sorted;
      }
    },
    [getHackathonDeadline, getPrizePoolTotal]
  );

  // Filter hackathons by location (client-side only, API doesn't support it)
  const filterByLocation = React.useCallback(
    (hackathonsList: Hackathon[], location?: string): Hackathon[] => {
      if (!location) return hackathonsList;

      let filtered = [...hackathonsList];

      if (location === 'virtual') {
        filtered = filtered.filter(h => h.venueType === 'VIRTUAL');
      } else if (location === 'physical') {
        filtered = filtered.filter(h => h.venueType === 'PHYSICAL');
      } else {
        // Filter by country/city/state if provided
        filtered = filtered.filter(h => {
          const country = h.country?.toLowerCase();
          const city = h.city?.toLowerCase();
          const state = h.state?.toLowerCase();
          const searchLocation = location.toLowerCase();

          return (
            country?.includes(searchLocation) ||
            city?.includes(searchLocation) ||
            state?.includes(searchLocation)
          );
        });
      }

      return filtered;
    },
    []
  );

  // Fetch hackathons from public API
  const fetchHackathons = React.useCallback(
    async (page: number, currentFilters: HackathonFilters, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        // Map UI filters to API format
        const apiStatus = mapStatusToAPI(currentFilters.status);
        const apiSort = mapSortToAPI(currentFilters.sort);

        // Build API filters
        const apiFilters = {
          page,
          limit: pageSize,
          status: apiStatus,
          category: currentFilters.category,
          search: currentFilters.search,
          sort: apiSort,
        };

        // Call public API
        const response: PublicHackathonsListData =
          await getPublicHackathonsList(apiFilters);
        let hackathonsList = response.hackathons || [];

        // Apply client-side location filtering (API doesn't support it)
        hackathonsList = filterByLocation(
          hackathonsList,
          currentFilters.location
        );

        // Apply client-side reverse sorting for options API doesn't support
        if (
          currentFilters.sort === 'prize_pool_low' ||
          currentFilters.sort === 'deadline_far'
        ) {
          hackathonsList = sortHackathons(
            hackathonsList,
            currentFilters.sort as SortOption
          );
        }

        // Separate featured hackathons (currently empty - no featured logic implemented)
        setFeaturedHackathons([]);

        // Update state
        setTotalCount(response.total || 0);
        setHasMore(response.hasMore ?? false);

        if (append) {
          setHackathons(prev => [...prev, ...hackathonsList]);
        } else {
          setHackathons(hackathonsList);
        }
      } catch (err) {
        reportError(err, {
          context: 'useHackathonsList-fetch',
          page: String(page),
        });
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch hackathons';
        setError(errorMessage);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pageSize, filterByLocation, sortHackathons, mapStatusToAPI, mapSortToAPI]
  );

  // Fetch hackathons when filters change
  React.useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchHackathons(1, filters);
  }, [filters, fetchHackathons]);

  const loadMore = React.useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchHackathons(nextPage, filters, true);
    }
  }, [loadingMore, hasMore, currentPage, filters, fetchHackathons]);

  const refetch = React.useCallback(() => {
    setCurrentPage(1);
    fetchHackathons(1, filters);
  }, [filters, fetchHackathons]);

  return {
    hackathons,
    featuredHackathons,
    loading,
    loadingMore,
    error,
    hasMore,
    currentPage,
    totalCount,
    loadMore,
    refetch,
  };
};
