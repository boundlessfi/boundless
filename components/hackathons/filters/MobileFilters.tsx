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

interface MobileFiltersProps {
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

export const MobileFilters: React.FC<MobileFiltersProps> = ({
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
    <div className='flex flex-col gap-4 md:hidden'>
      <SearchInput
        value={searchTerm}
        onChange={onSearch}
        placeholder={searchPlaceholder}
      />
      <div className='grid grid-cols-2 items-center gap-2'>
        <FilterDropdown
          options={sortOptions}
          selectedLabel={selectedSort}
          onSelect={onSortChange}
          size='sm'
        />
        <FilterDropdown
          options={statusOptions}
          selectedLabel={selectedStatus}
          onSelect={onStatusChange}
          size='sm'
        />
        <FilterDropdown
          options={categoryOptions}
          selectedLabel={selectedCategory}
          onSelect={onCategoryChange}
          size='sm'
        />
        <FilterDropdown
          options={locationOptions}
          selectedLabel={selectedLocation}
          onSelect={onLocationChange}
          size='sm'
        />
      </div>
    </div>
  );
};
