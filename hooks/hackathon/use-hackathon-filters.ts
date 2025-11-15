'use client';

import * as React from 'react';
import { useDebounce } from '../use-debounce';
import type { PublicHackathonsListFilters } from '@/lib/api/hackathons';

type SortOption =
  | 'newest'
  | 'oldest'
  | 'prize_pool_high'
  | 'prize_pool_low'
  | 'deadline_soon'
  | 'deadline_far';

/**
 * Map UI sort option to API sort format
 */
export const mapSortToAPI = (
  sort?: SortOption
): PublicHackathonsListFilters['sort'] => {
  switch (sort) {
    case 'newest':
      return 'latest';
    case 'oldest':
      return 'oldest';
    case 'prize_pool_high':
      return 'prize';
    case 'deadline_soon':
      return 'deadline';
    case 'prize_pool_low':
    case 'deadline_far':
      // These require reverse sorting which API doesn't support directly
      // We'll handle them client-side or use the opposite API sort
      return undefined;
    default:
      return undefined;
  }
};

/**
 * Map UI status to API status format
 * UI uses: published, ongoing, completed, cancelled
 * API uses: upcoming, ongoing, ended (calculated based on dates)
 */
export const mapStatusToAPI = (
  status?: string
): PublicHackathonsListFilters['status'] => {
  if (!status || status === 'all') {
    return undefined;
  }

  // API uses calculated status based on dates, not the hackathon's status field
  // We map UI status values to API calculated status values
  switch (status) {
    case 'published':
      // Published hackathons could be upcoming or ongoing, but we'll treat as upcoming
      // since published typically means not started yet
      return 'upcoming';
    case 'ongoing':
      return 'ongoing';
    case 'completed':
      return 'ended';
    case 'cancelled':
      // Cancelled hackathons are excluded from public API, so return undefined
      return undefined;
    default:
      return undefined;
  }
};

type ViewType = 'grid' | 'list';

export interface HackathonFilters {
  category?: string;
  status?: string;
  location?: string;
  search?: string;
  sort?: SortOption;
}

interface UseHackathonFiltersReturn {
  filters: HackathonFilters;
  viewType: ViewType;
  searchTerm: string;
  debouncedSearchTerm: string;
  handleSearch: (searchTerm: string) => void;
  handleSort: (sortType: string) => void;
  handleStatus: (status: string) => void;
  handleCategory: (category: string) => void;
  handleLocation: (location: string) => void;
  handleViewType: (viewType: ViewType) => void;
  clearSearch: () => void;
  clearAllFilters: () => void;
}

const VIEW_TYPE_STORAGE_KEY = 'hackathons-view-type';

export function useHackathonFilters(
  initialFilters: HackathonFilters = {}
): UseHackathonFiltersReturn {
  const [filters, setFilters] =
    React.useState<HackathonFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Load view type from localStorage
  const [viewType, setViewType] = React.useState<ViewType>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(VIEW_TYPE_STORAGE_KEY);
      return (
        stored === 'grid' || stored === 'list' ? stored : 'grid'
      ) as ViewType;
    }
    return 'grid';
  });

  // Update filters when debounced search term changes
  React.useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearchTerm }));
  }, [debouncedSearchTerm]);

  // Save view type to localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VIEW_TYPE_STORAGE_KEY, viewType);
    }
  }, [viewType]);

  const handleSearch = React.useCallback((searchTerm: string) => {
    setSearchTerm(searchTerm);
  }, []);

  const handleSort = React.useCallback((sortType: string) => {
    setFilters(prev => ({ ...prev, sort: sortType as SortOption }));
  }, []);

  const handleStatus = React.useCallback((status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status,
    }));
  }, []);

  const handleCategory = React.useCallback((category: string) => {
    setFilters(prev => ({
      ...prev,
      category: category === 'all' ? undefined : category,
    }));
  }, []);

  const handleLocation = React.useCallback((location: string) => {
    setFilters(prev => ({
      ...prev,
      location: location === 'all' ? undefined : location,
    }));
  }, []);

  const handleViewType = React.useCallback((newViewType: ViewType) => {
    setViewType(newViewType);
  }, []);

  const clearSearch = React.useCallback(() => {
    setSearchTerm('');
  }, []);

  const clearAllFilters = React.useCallback(() => {
    setSearchTerm('');
    setFilters({});
  }, []);

  return {
    filters,
    viewType,
    searchTerm,
    debouncedSearchTerm,
    handleSearch,
    handleSort,
    handleStatus,
    handleCategory,
    handleLocation,
    handleViewType,
    clearSearch,
    clearAllFilters,
  };
}
