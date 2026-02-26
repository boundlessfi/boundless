'use client';

import React, { useState, useCallback, useMemo, useTransition } from 'react';
import { MdxBlogPost } from '@/lib/mdx';
import { useRouter } from 'next/navigation';
import BlogCard from './BlogCard';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import AuthLoadingState from '@/components/auth/AuthLoadingState';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

interface StreamingBlogGridProps {
  initialPosts: MdxBlogPost[];
}

const StreamingBlogGrid: React.FC<StreamingBlogGridProps> = ({
  initialPosts,
}) => {
  const [allPosts] = useState<MdxBlogPost[]>(initialPosts);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'Latest' | 'Oldest' | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Extract unique categories from all posts
  const availableCategories = useMemo(() => {
    const categories = new Set(
      allPosts.map(post => post.categories || []).flat()
    );
    return Array.from(categories).sort();
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    let filtered = allPosts;

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(post =>
        post.categories?.some(category => selectedCategories.includes(category))
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        post =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return sortOrder === 'Latest' ? dateB - dateA : dateA - dateB;
      });
    }

    return filtered;
  }, [allPosts, selectedCategories, searchQuery, sortOrder]);

  const isFiltering = !!searchQuery || selectedCategories.length > 0;
  const displayPosts = isFiltering
    ? filteredPosts
    : filteredPosts.slice(0, visibleCount);
  const hasMoreToShow = !isFiltering && visibleCount < filteredPosts.length;

  const sortOptions: Array<'Latest' | 'Oldest'> = ['Latest', 'Oldest'];

  const handleShowMore = useCallback(() => {
    setVisibleCount(prev => prev + PAGE_SIZE);
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCardClick = useCallback(
    (slug: string) => {
      setIsNavigating(true);
      startTransition(() => {
        router.push(`/blog/${slug}`);
      });
    },
    [router]
  );

  return (
    <>
      {(isNavigating || isPending) && (
        <AuthLoadingState message='Loading article...' />
      )}{' '}
      <div className='bg-background-main-bg min-h-screen'>
        <div>
          <div className=''>
            <div className='mb-8 flex gap-3 md:flex-row md:items-center md:justify-between lg:gap-16'>
              <div className='flex items-center gap-3'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-2 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base',
                        sortOrder
                          ? 'border-[#A7F950]/30 bg-[#0F1A0B] text-[#A7F950]'
                          : 'border-white/24 text-white hover:bg-[#2A2A2A]'
                      )}
                    >
                      <svg
                        width='20'
                        height='20'
                        className={sortOrder ? 'text-[#A7F950]' : 'text-white'}
                        viewBox='0 0 20 20'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M9.16667 8.33333L15 8.33337M9.16667 11.6667H13.3333M9.16667 15H11.6667M9.16667 5H17.5M4.16667 17.5L4.16667 12.5M4.16667 17.5C3.69985 17.5 2.82769 16.0458 2.5 15.6771M4.16667 17.5C4.63348 17.5 5.50565 16.0458 5.83333 15.6771M4.16667 2.5V7.5M4.16667 2.5C4.63349 2.5 5.50565 3.95418 5.83333 4.32292M4.16667 2.5C3.69985 2.5 2.82769 3.95418 2.5 4.32292'
                          stroke='currentColor'
                          strokeWidth='1.4'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                      <span className='hidden md:block'>
                        {sortOrder || 'Sort'}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align='start'
                    className='bg-background mt-2.5 w-[250px] rounded-2xl border border-white/24 p-3 lg:w-[320px]'
                  >
                    <DropdownMenuRadioGroup
                      value={sortOrder}
                      onValueChange={value =>
                        setSortOrder(value as 'Latest' | 'Oldest')
                      }
                    >
                      {sortOptions.map((opt: 'Latest' | 'Oldest') => (
                        <DropdownMenuRadioItem
                          key={opt}
                          value={opt}
                          className='cursor-pointer rounded-md px-3 py-2 text-base font-medium text-white transition-colors duration-200 hover:bg-transparent! hover:text-white! data-[state=checked]:text-white [&>span:first-child]:hidden'
                        >
                          <span
                            className={cn(
                              'mr-3 inline-flex h-5 w-5 items-center justify-center rounded-full border-2',
                              opt === sortOrder
                                ? 'border-[#A7F950]'
                                : 'border-[#B5B5B5]'
                            )}
                          >
                            {opt === sortOrder && (
                              <span className='h-2.5 w-2.5 rounded-full bg-[#A7F950]' />
                            )}
                          </span>
                          <span className=''>{opt}</span>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        'flex items-center gap-2 rounded-lg border border-white/24 px-2 py-2 text-sm font-medium text-white transition-colors sm:px-4 sm:text-base',
                        selectedCategories.length > 0 &&
                          'border-[#A7F950]/30 bg-[#0F1A0B] text-[#A7F950]'
                      )}
                    >
                      <svg
                        width='20'
                        height='20'
                        className='md:hidden'
                        viewBox='0 0 20 20'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M5 10H15M2.5 5H17.5M7.5 15H12.5'
                          stroke='currentColor'
                          strokeWidth='1.4'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                      <span className='hidden md:block'>Category</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align='start'
                    className='bg-background mt-2.5 w-[220px] rounded-2xl border border-white/24 p-3 sm:w-[250px] lg:w-[320px]'
                  >
                    <div className='space-y-1'>
                      {availableCategories.length === 0 ? (
                        <div className='px-3 py-4 text-center text-sm text-[#B5B5B5]'>
                          No categories available
                        </div>
                      ) : (
                        availableCategories.map((cat: string) => (
                          <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className='flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-base font-medium text-white transition-colors duration-200 hover:bg-transparent hover:text-white'
                          >
                            <span
                              className={cn(
                                'mr-3 inline-flex h-5 w-5 items-center justify-center rounded-full border-2',
                                selectedCategories.includes(cat)
                                  ? 'border-[#A7F950]'
                                  : 'border-[#B5B5B5]'
                              )}
                            >
                              {selectedCategories.includes(cat) && (
                                <span className='h-2.5 w-2.5 rounded-full bg-[#A7F950]' />
                              )}
                            </span>
                            <span className=''>{cat}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className='relative w-full md:min-w-[300px]'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-700' />
                <Input
                  type='text'
                  placeholder='Search article'
                  className='bg-background-card w-full rounded-lg border border-white/10 py-2 pr-4 pl-10 text-sm text-white placeholder:text-[#B5B5B5] focus:outline-none focus-visible:border-[#A7F950] focus-visible:ring-[3px] focus-visible:ring-[#A7F950]/30 md:h-[42px] md:text-base'
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className=''>
          {displayPosts.length > 0 ? (
            <div className='grid grid-cols-1 gap-6 pt-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'>
              {displayPosts.map(post => (
                <div key={post.slug} className='w-full'>
                  <BlogCard post={post} onCardClick={handleCardClick} />
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <div className='mb-4 text-[#B5B5B5]'>
                <Search className='mx-auto h-12 w-12' />
              </div>
              <h3 className='mb-2 text-xl font-medium text-white'>
                No articles found
              </h3>
              <p className='text-[#B5B5B5]'>
                {searchQuery
                  ? `No articles match "${searchQuery}"`
                  : selectedCategories.length > 0
                    ? 'No articles in this category'
                    : 'No articles available'}
              </p>
            </div>
          )}

          {hasMoreToShow && (
            <div className='mt-12 flex justify-center'>
              <button
                onClick={handleShowMore}
                className='flex items-center gap-2 rounded-lg border border-[#2B2B2B] bg-[#1A1A1A] px-6 py-3 text-white transition-colors hover:bg-[#2A2A2A] hover:text-white focus:ring-2 focus:ring-[#A7F950] focus:outline-none'
              >
                View More
              </button>
            </div>
          )}

          {!hasMoreToShow && !isFiltering && filteredPosts.length > 0 && (
            <div className='mt-12 text-center text-[#B5B5B5]'>
              <p>You&apos;ve reached the end of the blog posts!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StreamingBlogGrid;
