'use client';

import React from 'react';
import { FilterDropdown } from './FilterDropdown';
import { SearchInput } from './SearchInput';
import {
  sortOptions,
  statusOptions,
  categoryOptions,
  locationOptions,
} from './filter-options';

interface DesktopFiltersProps {
  searchTerm: string;
  selectedSort: string;
  selectedStatus: string;
  selectedCategory: string;
  selectedLocation: string;
  searchPlaceholder?: string;
  onSearch: (value: string) => void;
  onSortChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}

export const DesktopFilters: React.FC<DesktopFiltersProps> = ({
  searchTerm,
  selectedSort,
  selectedStatus,
  selectedCategory,
  selectedLocation,
  searchPlaceholder,
  onSearch,
  onSortChange,
  onStatusChange,
  onCategoryChange,
  onLocationChange,
}) => {
  return (
    <div className='hidden flex-col items-start gap-6 md:flex lg:flex-row lg:items-center lg:gap-8'>
      <div className='flex w-full flex-wrap items-center gap-3 lg:max-w-2/3 lg:gap-4'>
        <FilterDropdown
          options={sortOptions}
          selectedLabel={selectedSort}
          onSelect={onSortChange}
          showIcon
          className='msin-w-[100px]'
        />
        <FilterDropdown
          options={statusOptions}
          selectedLabel={selectedStatus}
          onSelect={onStatusChange}
          className='min-sw-[100px]'
        />
        <FilterDropdown
          options={categoryOptions}
          selectedLabel={selectedCategory}
          onSelect={onCategoryChange}
          className='min-sw-[100px]'
        />
        <FilterDropdown
          options={locationOptions}
          selectedLabel={selectedLocation}
          onSelect={onLocationChange}
          className='min-sw-[100px]'
        />
      </div>

      <div className='relative ml-auto w-full lg:max-w-1/5'>
        <SearchInput
          value={searchTerm}
          onChange={onSearch}
          placeholder={searchPlaceholder}
        />
      </div>
    </div>
  );
};
