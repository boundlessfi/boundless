'use client';

import React, { useState, useMemo } from 'react';
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

interface SubmissionCardProps {
  title: string;
  description: string;
  submitterName: string;
  submitterAvatar?: string;
  category?: string;
  categories?: string[];
  status?: 'Pending' | 'Approved' | 'Rejected';
  upvotes?: number;
  votes?: { current: number; total: number };
  comments?: number;
  submittedDate?: string;
  daysLeft?: number;
  score?: number;
  image?: string;
  onViewClick?: () => void;
  onUpvoteClick?: () => void;
  onCommentClick?: () => void;
  hasUserUpvoted?: boolean;
}

interface SubmissionTabProps {
  submissions: SubmissionCardProps[];
}

const SubmissionTab: React.FC<SubmissionTabProps> = ({ submissions = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSort, setSelectedSort] = useState('Newest First');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Most Upvoted', value: 'upvotes_high' },
    { label: 'Least Upvoted', value: 'upvotes_low' },
    { label: 'Highest Score', value: 'score_high' },
    { label: 'Most Commented', value: 'comments_high' },
  ];

  // Extract unique categories from submissions
  const categoryOptions = useMemo(() => {
    const categoriesSet = new Set<string>();
    submissions.forEach(sub => {
      if (sub.category) categoriesSet.add(sub.category);
      if (sub.categories) sub.categories.forEach(cat => categoriesSet.add(cat));
    });

    return [
      { label: 'All Categories', value: 'all' },
      ...Array.from(categoriesSet).map(cat => ({
        label: cat,
        value: cat.toLowerCase(),
      })),
    ];
  }, [submissions]);

  const filteredAndSortedSubmissions = useMemo(() => {
    let filtered = submissions;

    // Filter by search term (project name or participant)
    if (searchTerm) {
      filtered = filtered.filter(
        sub =>
          sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.submitterName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(sub => {
        const allCategories = sub.category
          ? [sub.category, ...(sub.categories || [])]
          : sub.categories || [];
        return allCategories.some(
          cat => cat.toLowerCase() === selectedCategory.toLowerCase()
        );
      });
    }

    // Sort
    const sortValue =
      sortOptions.find(opt => opt.label === selectedSort)?.value || 'newest';

    filtered = [...filtered].sort((a, b) => {
      switch (sortValue) {
        case 'newest':
          if (a.submittedDate && b.submittedDate) {
            return (
              new Date(b.submittedDate).getTime() -
              new Date(a.submittedDate).getTime()
            );
          }
          return 0;
        case 'oldest':
          if (a.submittedDate && b.submittedDate) {
            return (
              new Date(a.submittedDate).getTime() -
              new Date(b.submittedDate).getTime()
            );
          }
          return 0;
        case 'upvotes_high':
          return (
            (b.votes?.current || b.upvotes || 0) -
            (a.votes?.current || a.upvotes || 0)
          );
        case 'upvotes_low':
          return (
            (a.votes?.current || a.upvotes || 0) -
            (b.votes?.current || b.upvotes || 0)
          );
        case 'score_high':
          return (b.score || 0) - (a.score || 0);
        case 'comments_high':
          return (b.comments || 0) - (a.comments || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedSort, selectedCategory, submissions]);

  const handleSort = (sortValue: string) => {
    const option = sortOptions.find(opt => opt.value === sortValue);
    setSelectedSort(option?.label || 'Newest First');
  };

  const handleCategory = (categoryValue: string) => {
    const option = categoryOptions.find(opt => opt.value === categoryValue);
    setSelectedCategory(option?.label || 'All Categories');
  };

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
                  onClick={() => handleSort(option.value)}
                  className='cursor-pointer text-sm hover:bg-gray-800'
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
                  onClick={() => handleCategory(option.value)}
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
            placeholder='Search by project name or participant...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full rounded-lg border-gray-900 bg-[#030303] py-3 pr-4 pl-10 text-base text-white placeholder-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-400'
          />
        </div>
      </div>

      {/* Submissions Grid */}
      {filteredAndSortedSubmissions.length > 0 ? (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {filteredAndSortedSubmissions.map((submission, index) => (
            <SubmissionCard
              key={index}
              {...submission}
              onViewClick={() =>
                console.log('View submission:', submission.title)
              }
              onUpvoteClick={() =>
                console.log('Upvote submission:', submission.title)
              }
              onCommentClick={() =>
                console.log('Comment on submission:', submission.title)
              }
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
