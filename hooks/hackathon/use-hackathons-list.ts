'use client';

import * as React from 'react';
import {
  getPublicHackathonsList,
  transformPublicHackathonToHackathon,
  type Hackathon,
} from '@/lib/api/hackathons';
import type { HackathonFilters } from './use-hackathon-filters';
import { mapSortToAPI, mapStatusToAPI } from './use-hackathon-filters';

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

export function useHackathonsList(
  options: UseHackathonsListOptions = {}
): UseHackathonsListReturn {
  const { initialPage = 1, pageSize = 9, initialFilters = {} } = options;

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
        if (hackathon.timeline?.submissionDeadline) {
          return new Date(hackathon.timeline.submissionDeadline).getTime();
        }
        if (hackathon.timeline?.winnerAnnouncementDate) {
          return new Date(hackathon.timeline.winnerAnnouncementDate).getTime();
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
      if (
        hackathon.rewards?.prizeTiers &&
        hackathon.rewards.prizeTiers.length > 0
      ) {
        return hackathon.rewards.prizeTiers.reduce(
          (sum, tier) => sum + (tier.amount || 0),
          0
        );
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
        filtered = filtered.filter(
          h => h.information?.venue?.type === 'virtual'
        );
      } else if (location === 'physical') {
        filtered = filtered.filter(
          h => h.information?.venue?.type === 'physical'
        );
      } else {
        // Filter by country/city if provided
        filtered = filtered.filter(h => {
          const venue = h.information?.venue;
          if (!venue) return false;
          return (
            venue.country?.toLowerCase().includes(location.toLowerCase()) ||
            venue.city?.toLowerCase().includes(location.toLowerCase())
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
        const response = await getPublicHackathonsList(apiFilters);

        // Transform API response to Hackathon format
        const transformedHackathons = response.data.hackathons.map(
          publicHackathon =>
            transformPublicHackathonToHackathon(publicHackathon)
        );

        // Apply client-side location filtering (API doesn't support it)
        let filteredHackathons = filterByLocation(
          transformedHackathons,
          currentFilters.location
        );

        // Apply client-side reverse sorting for options API doesn't support
        if (
          currentFilters.sort === 'prize_pool_low' ||
          currentFilters.sort === 'deadline_far'
        ) {
          filteredHackathons = sortHackathons(
            filteredHackathons,
            currentFilters.sort as SortOption
          );
        }

        // Separate featured hackathons
        const featured = filteredHackathons
          .filter(
            (h): h is Hackathon & { featured?: boolean } =>
              '_organizationName' in h || 'featured' in h
          )
          .filter(
            h =>
              'featured' in h &&
              (h as Hackathon & { featured?: boolean }).featured === true
          );
        setFeaturedHackathons(featured as Hackathon[]);

        // Update state
        setTotalCount(response.data.total);
        setHasMore(response.data.hasMore);

        if (append) {
          setHackathons(prev => [...prev, ...filteredHackathons]);
        } else {
          setHackathons(filteredHackathons);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch hackathons';
        setError(errorMessage);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pageSize, filterByLocation, sortHackathons]
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
}
