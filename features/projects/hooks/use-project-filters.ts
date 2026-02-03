'use client';

import * as React from 'react';
import { useDebounce } from '@/hooks/use-debounce';

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

interface UseProjectFiltersReturn {
  filters: ProjectFilters;
  searchTerm: string;
  debouncedSearchTerm: string;
  handleSearch: (searchTerm: string) => void;
  handleSort: (sortType: string) => void;
  handleStatus: (status: string) => void;
  handleCategory: (category: string) => void;
  clearSearch: () => void;
  clearAllFilters: () => void;
}

export function useProjectFilters(
  initialFilters: ProjectFilters = {}
): UseProjectFiltersReturn {
  const [filters, setFilters] = React.useState<ProjectFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Update filters when debounced search term changes
  React.useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearchTerm }));
  }, [debouncedSearchTerm]);

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

  const clearSearch = React.useCallback(() => {
    setSearchTerm('');
  }, []);

  const clearAllFilters = React.useCallback(() => {
    setSearchTerm('');
    setFilters({});
  }, []);

  return {
    filters,
    searchTerm,
    debouncedSearchTerm,
    handleSearch,
    handleSort,
    handleStatus,
    handleCategory,
    clearSearch,
    clearAllFilters,
  };
}
