'use client';

import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ExploreHeaderProps {
  onSearch?: (searchTerm: string) => void;
  onSortChange?: (sortType: string) => void;
  onStatusChange?: (status: string) => void;
  onCategoryChange?: (category: string) => void;
  className?: string;
  searchPlaceholder?: string;
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

  return (
    <div className={cn('w-full py-12 text-white', className)}>
      <div className=''>
        <div className='mb-12'>
          <h1
            id='explore-project'
            className='font-inter text-center text-2xl text-white md:text-left md:text-4xl lg:text-5xl'
          >
            Explore Boundless Projects
          </h1>
        </div>

        <div className='hidden flex-col items-start gap-6 md:flex lg:flex-row lg:items-center lg:gap-8'>
          <div className='flex-wrsap flex w-full items-center gap-3 lg:max-w-1/4 lg:gap-4'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='msin-w-[100px] justify-between rounded-lg border-white/24 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white'
                >
                  <div className='flex items-center gap-2'>
                    <Image
                      src='/sort.svg'
                      alt='Sort'
                      width={16}
                      height={16}
                      className='h-4 w-4'
                    />
                    {selectedSort}
                  </div>
                  <ChevronDown className='ml-2 h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                className='border-white/24 bg-black text-white'
              >
                {sortOptions.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleSort(option.value)}
                    className='cursor-pointer hover:bg-gray-800'
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='min-sw-[100px] justify-between rounded-lg border-white/24 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white'
                >
                  {selectedStatus}
                  <ChevronDown className='ml-2 h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                className='border-white/24 bg-black text-white'
              >
                {statusOptions.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleStatus(option.value)}
                    className='cursor-pointer hover:bg-gray-800'
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='min-sw-[100px] justify-between rounded-lg border-white/24 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white'
                >
                  {selectedCategory}
                  <ChevronDown className='ml-2 h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                className='border-white/24 bg-black text-white'
              >
                {categoryOptions.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleCategory(option.value)}
                    className='cursor-pointer hover:bg-gray-800'
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className='relative ml-auto w-full max-w-sm'>
            <div className='relative'>
              <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-white/40' />
              <Input
                type='text'
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={e => handleSearch(e.target.value)}
                className='bg-background w-full rounded-lg border-gray-900 py-3 pr-4 pl-10 text-base text-white placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreHeader;
