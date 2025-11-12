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

interface ParticipantsFilterProps {
  onSearch?: (searchTerm: string) => void;
  onSortChange?: (sortType: string) => void;
  onSubmissionStatusChange?: (status: string) => void;
  onSkillChange?: (skill: string) => void;
  className?: string;
  searchPlaceholder?: string;
  totalParticipants?: number;
  submittedCount?: number;
}

const ParticipantsFilter = ({
  onSearch,
  onSortChange,
  onSubmissionStatusChange,
  onSkillChange,
  className,
  searchPlaceholder = 'Search by name, role, or skills...',
  totalParticipants = 0,
  submittedCount = 0,
}: ParticipantsFilterProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSort, setSelectedSort] = useState('Newest First');
  const [selectedStatus, setSelectedStatus] = useState('All Participants');
  const [selectedSkill, setSelectedSkill] = useState('All Skills');

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
    setSelectedStatus(option?.label || 'All Participants');
    if (onSubmissionStatusChange) onSubmissionStatusChange(statusValue);
  };

  const handleSkill = (skillValue: string) => {
    const option = skillOptions.find(opt => opt.value === skillValue);
    setSelectedSkill(option?.label || 'All Skills');
    if (onSkillChange) onSkillChange(skillValue);
  };

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Most Followers', value: 'followers_high' },
    { label: 'Least Followers', value: 'followers_low' },
    { label: 'Most Projects', value: 'projects_high' },
    { label: 'Least Projects', value: 'projects_low' },
  ];

  const statusOptions = [
    { label: 'All Participants', value: 'all' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Not Submitted', value: 'not_submitted' },
  ];

  const skillOptions = [
    { label: 'All Skills', value: 'all' },
    { label: 'Full Stack Developer', value: 'fullstack' },
    { label: 'Frontend Developer', value: 'frontend' },
    { label: 'Backend Developer', value: 'backend' },
    { label: 'Mobile Developer', value: 'mobile' },
    { label: 'UI/UX Designer', value: 'uiux' },
    { label: 'Product Designer', value: 'product_designer' },
    { label: 'Data Scientist', value: 'data_scientist' },
    { label: 'DevOps Engineer', value: 'devops' },
    { label: 'React', value: 'react' },
    { label: 'Node.js', value: 'nodejs' },
    { label: 'Python', value: 'python' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Web3', value: 'web3' },
  ];

  return (
    <div className={cn('mb-8 w-full', className)}>
      {/* Stats Section */}
      <div className='mb-6 flex items-center gap-4 text-sm'>
        <span className='text-gray-400'>
          <span className='font-semibold text-[#a7f950]'>
            {totalParticipants}
          </span>{' '}
          total participants
        </span>
        <span className='text-gray-600'>•</span>
        <span className='text-gray-400'>
          <span className='font-semibold text-[#a7f950]'>{submittedCount}</span>{' '}
          projects submitted
        </span>
      </div>

      {/* Filters */}
      <div className='flex flex-col items-start gap-4 md:flex-row md:items-center'>
        <div className='flex w-full flex-wrap items-center gap-3 md:w-auto'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='min-w-[140px] justify-between rounded-lg border-white/24 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white'
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
                className='min-w-[140px] justify-between rounded-lg border-white/24 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white'
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
                className='min-w-[140px] justify-between rounded-lg border-white/24 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white'
              >
                {selectedSkill}
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='start'
              className='max-h-[300px] overflow-y-auto border-white/24 bg-black text-white'
            >
              {skillOptions.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSkill(option.value)}
                  className='cursor-pointer hover:bg-gray-800'
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='relative w-full md:ml-auto md:max-w-md'>
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
  );
};

export default ParticipantsFilter;
