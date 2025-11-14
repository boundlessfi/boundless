'use client';

import { Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SubmissionCard from './submissionCard';
import { useSubmissions } from '@/hooks/hackathon/use-submissions';

const SubmissionTab: React.FC = () => {
  const {
    submissions,
    searchTerm,
    selectedSort,
    selectedCategory,
    sortOptions,
    categoryOptions,
    setSearchTerm,
    setSelectedSort,
    setSelectedCategory,
  } = useSubmissions();

  return (
    <div className='w-full'>
      {/* Stats Section */}
      <div className='mb-6 flex items-center gap-4 text-left text-sm'>
        <span className='text-gray-400'>
          <span className='font-semibold text-[#a7f950]'>
            {submissions.length}
          </span>{' '}
          total submissions
        </span>
      </div>

      {/* Filters */}
      <div className='mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center'>
        <div className='flex w-full flex-wrap items-center gap-3 md:w-auto'>
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='min-w-[140px] justify-between rounded-lg border-white/24 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white'
              >
                <div className='flex items-center gap-2'>{selectedSort}</div>
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='start'
              className='border-white/24 bg-black text-sm text-white'
            >
              {sortOptions.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSelectedSort(option.label)}
                  className='cursor-pointer text-sm hover:bg-gray-800'
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='min-w-[140px] justify-between rounded-lg border-white/24 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 hover:text-white'
              >
                {selectedCategory}
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='start'
              className='max-h-[300px] overflow-y-auto border-white/24 bg-black text-white'
            >
              {categoryOptions.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSelectedCategory(option.label)}
                  className='cursor-pointer hover:bg-gray-800'
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search Input */}
        <div className='relative w-full md:ml-auto md:max-w-md'>
          <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-white/40' />
          <Input
            type='text'
            placeholder='Search by project name or participant...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full rounded-lg border-gray-900 bg-[#030303] py-3 pr-4 pl-10 text-base text-white placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400'
          />
        </div>
      </div>

      {/* Submissions Grid */}
      {submissions.length > 0 ? (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {submissions.map((submission, index) => (
            <SubmissionCard
              key={index}
              {...submission}
              onViewClick={() => {}}
              onUpvoteClick={() => {}}
              onCommentClick={() => {}}
            />
          ))}
        </div>
      ) : (
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='text-center'>
            <p className='text-xl text-gray-400'>No submissions found</p>
            <p className='mt-2 text-sm text-gray-500'>
              Try adjusting your filters or search term
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionTab;
