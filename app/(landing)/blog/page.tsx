'use client';

import { useState, useEffect } from 'react';
import BlogHero from '@/components/landing-page/blog/BlogHero';
import StreamingBlogGrid from '@/components/landing-page/blog/StreamingBlogGrid';
import { getBlogPosts } from '@/lib/api/blog';
import { GetBlogPostsResponse } from '@/types/blog';
import { Loader2 } from 'lucide-react';

const BlogsPage = () => {
  const [blogData, setBlogData] = useState<GetBlogPostsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        setIsLoading(true);
        const response = await getBlogPosts({
          page: 1,
          limit: 12,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          status: 'PUBLISHED',
        });
        setBlogData(response);
      } catch {
        setError('Failed to load blog posts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialPosts();
  }, []);

  const handleLoadMore = async (
    page: number
  ): Promise<GetBlogPostsResponse> => {
    const response = await getBlogPosts({
      page,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: 'PUBLISHED',
    });
    return response;
  };

  return (
    <div className='bg-background-main-bg min-h-screen'>
      <div className='mx-auto max-w-[1440px] px-5 py-5 md:px-[50px] lg:px-[100px]'>
        <BlogHero />

        {isLoading ? (
          <div className='flex min-h-[400px] items-center justify-center'>
            <div className='flex flex-col items-center gap-3 text-[#B5B5B5]'>
              <Loader2 className='h-8 w-8 animate-spin' />
              <span>Loading articles...</span>
            </div>
          </div>
        ) : error ? (
          <div className='rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-8 text-center text-red-400'>
            <p>{error}</p>
          </div>
        ) : blogData ? (
          <StreamingBlogGrid
            initialPosts={blogData.data}
            hasMore={blogData.hasMore}
            initialPage={blogData.currentPage}
            totalPages={blogData.totalPages}
            onLoadMore={handleLoadMore}
          />
        ) : null}
      </div>
    </div>
  );
};

export default BlogsPage;
