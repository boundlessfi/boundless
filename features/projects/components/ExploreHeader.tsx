'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ExploreHeaderProps {
  onSearch?: (searchTerm: string) => void;
  onSortChange?: (sortType: string) => void;
  onStatusChange?: (status: string) => void;
  onCategoryChange?: (category: string) => void;
  className?: string;
  searchPlaceholder?: string;
}

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Most Funded', value: 'funding_goal_high' },
  { label: 'Least Funded', value: 'funding_goal_low' },
  { label: 'Ending Soon', value: 'deadline_soon' },
  { label: 'Recently Started', value: 'deadline_far' },
];

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Draft', value: 'draft' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Validated', value: 'validated' },
  { label: 'Funding', value: 'campaigning' },
  { label: 'Funded', value: 'funded' },
  { label: 'Live', value: 'live' },
  { label: 'Idea', value: 'idea' },
];

const categoryOptions = [
  { label: 'All Categories', value: 'all' },
  { label: 'Technology', value: 'technology' },
  { label: 'Art & Creative', value: 'art_creative' },
  { label: 'Environment', value: 'environment' },
  { label: 'Education', value: 'education' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Community', value: 'community' },
  { label: 'DeFi', value: 'defi' },
  { label: 'NFT', value: 'nft' },
  { label: 'Web3', value: 'web3' },
];

function FilterButton({
  label,
  options,
  onSelect,
}: {
  label: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className='justify-between rounded-lg border-[#2B2B2B] bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white'
        >
          {label}
          <ChevronDown className='ml-2 h-4 w-4 text-gray-500' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='border-[#2B2B2B] bg-black text-white'
      >
        {options.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSelect(option.value)}
            className='cursor-pointer hover:bg-gray-800'
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const ExploreHeader = ({
  onSearch,
  onSortChange,
  onStatusChange,
  onCategoryChange,
  className,
  searchPlaceholder = 'Search project or creator...',
}: ExploreHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSort, setSelectedSort] = useState('Newest First');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  const activeFilterCount = [
    selectedStatus !== 'All Status',
    selectedCategory !== 'All Categories',
    selectedSort !== 'Newest First',
  ].filter(Boolean).length;

  return (
    <div className={cn('w-full py-12 text-white', className)}>
      <div className='mb-8'>
        <h1
          id='explore-project'
          className='font-inter text-2xl text-white md:text-4xl lg:text-5xl'
        >
          Explore Boundless Projects
        </h1>
      </div>

      {/* Desktop */}
      <div className='hidden flex-col items-start gap-6 md:flex lg:flex-row lg:items-center lg:gap-8'>
        <div className='flex flex-wrap items-center gap-3 lg:gap-4'>
          <FilterButton
            label={selectedSort}
            options={sortOptions}
            onSelect={handleSort}
          />
          <FilterButton
            label={selectedStatus}
            options={statusOptions}
            onSelect={handleStatus}
          />
          <FilterButton
            label={selectedCategory}
            options={categoryOptions}
            onSelect={handleCategory}
          />
        </div>

        <div className='relative ml-auto w-full max-w-sm'>
          <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-500' />
          <Input
            type='text'
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            className='bg-background w-full rounded-lg border-[#2B2B2B] py-3 pr-4 pl-10 text-base text-white placeholder-gray-500 focus:border-gray-600'
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch('')}
              className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-white'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className='space-y-3 md:hidden'>
        <div className='relative'>
          <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-500' />
          <Input
            type='text'
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            className='bg-background w-full rounded-lg border-[#2B2B2B] py-3 pr-4 pl-10 text-base text-white placeholder-gray-500'
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch('')}
              className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-white'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>

        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className={cn(
            'flex items-center gap-2 rounded-lg border border-[#2B2B2B] px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-white',
            mobileFiltersOpen && 'bg-gray-900 text-white'
          )}
        >
          <SlidersHorizontal className='h-4 w-4' />
          Filters
          {activeFilterCount > 0 && (
            <span className='bg-primary ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold text-black'>
              {activeFilterCount}
            </span>
          )}
        </button>

        {mobileFiltersOpen && (
          <div className='flex flex-wrap gap-2'>
            <FilterButton
              label={selectedSort}
              options={sortOptions}
              onSelect={handleSort}
            />
            <FilterButton
              label={selectedStatus}
              options={statusOptions}
              onSelect={handleStatus}
            />
            <FilterButton
              label={selectedCategory}
              options={categoryOptions}
              onSelect={handleCategory}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreHeader;
