'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { DesktopFilters } from './filters/DesktopFilters';
import { MobileFilters } from './filters/MobileFilters';
import {
  sortOptions,
  statusOptions,
  categoryOptions,
  locationOptions,
} from './filters/filter-options';

interface HackathonsFiltersHeaderProps {
  onSearch?: (searchTerm: string) => void;
  onSortChange?: (sortType: string) => void;
  onStatusChange?: (status: string) => void;
  onCategoryChange?: (category: string) => void;
  onLocationChange?: (location: string) => void;
  totalCount?: number;
  className?: string;
  searchPlaceholder?: string;
}

const HackathonsFiltersHeader = ({
  onSearch,
  onSortChange,
  onStatusChange,
  onCategoryChange,
  onLocationChange,
  totalCount,
  className,
  searchPlaceholder = 'Search hackathons...',
}: HackathonsFiltersHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSort, setSelectedSort] = useState('Newest First');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (onSearch) onSearch(value);
  };

  const handleSort = (sortValue: string) => {
    const option = sortOptions.find(opt => opt.value === sortValue);
    setSelectedSort(option?.label || 'Newest First');
    if (onSortChange) onSortChange(sortValue);
  };

  const handleStatus = (statusValue: string) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    setSelectedStatus(option?.label || 'All Status');
    if (onStatusChange) onStatusChange(statusValue);
  };

  const handleCategory = (categoryValue: string) => {
    const option = categoryOptions.find(opt => opt.value === categoryValue);
    setSelectedCategory(option?.label || 'All Categories');
    if (onCategoryChange) onCategoryChange(categoryValue);
  };

  const handleLocation = (locationValue: string) => {
    const option = locationOptions.find(opt => opt.value === locationValue);
    setSelectedLocation(option?.label || 'All Locations');
    if (onLocationChange) onLocationChange(locationValue);
  };

  return (
    <div className={cn('w-full py-8 text-white sm:py-10', className)}>
      {/* Title row */}
      <div className='mb-6 flex items-end justify-between'>
        <h2
          id='explore-hackathons'
          className='text-xl font-bold text-white sm:text-2xl lg:text-3xl'
        >
          Explore Hackathons
        </h2>
        {totalCount !== undefined && (
          <span className='text-sm text-zinc-500 tabular-nums'>
            {totalCount} hackathon{totalCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <DesktopFilters
        searchTerm={searchTerm}
        selectedSort={selectedSort}
        selectedStatus={selectedStatus}
        selectedCategory={selectedCategory}
        selectedLocation={selectedLocation}
        searchPlaceholder={searchPlaceholder}
        onSearch={handleSearch}
        onSortChange={handleSort}
        onStatusChange={handleStatus}
        onCategoryChange={handleCategory}
        onLocationChange={handleLocation}
      />

      <MobileFilters
        searchTerm={searchTerm}
        selectedSort={selectedSort}
        selectedStatus={selectedStatus}
        selectedCategory={selectedCategory}
        selectedLocation={selectedLocation}
        searchPlaceholder={searchPlaceholder}
        onSearch={handleSearch}
        onSortChange={handleSort}
        onStatusChange={handleStatus}
        onCategoryChange={handleCategory}
        onLocationChange={handleLocation}
      />
    </div>
  );
};

export default HackathonsFiltersHeader;
