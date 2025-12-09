import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata';
import StreamingBlogGrid from '@/components/landing-page/blog/StreamingBlogGrid';
import { getBlogPosts } from '@/lib/api/blog';
import TestimonialSection from '@/components/testimonials/TestimonialsSection';
import { testimonials } from '@/components/testimonials/data/testimonial';
import { Skeleton } from '@/components/ui/skeleton';
import BlogCardSkeleton from '@/components/landing-page/blog/BlogCardSkeleton';
import BlogHero from '@/components/landing-page/blog/BlogHero';

export const metadata: Metadata = generatePageMetadata('blog');

async function StreamingBlogGridWrapper() {
  try {
    // Fetch blog posts from external backend API
    const result = await getBlogPosts({
      page: 1,
      limit: 12,
      sort: 'latest',
    });

    return (
      <StreamingBlogGrid
        initialPosts={result.posts}
        hasMore={result.hasMore}
        initialPage={1}
      />
    );
  } catch {
    return (
      <StreamingBlogGrid initialPosts={[]} hasMore={false} initialPage={1} />
    );
  }
}

function BlogGridLoading() {
  return (
    <div className='bg-background-main-bg min-h-screen'>
      <div className='mx-auto max-w-6xl px-6 py-8'>
        <div className='flex gap-3 md:flex-row md:items-center md:justify-between lg:gap-16'>
          <div className='flex items-center gap-3'>
            <Skeleton className='h-10 w-20 rounded-lg' />
            <Skeleton className='h-10 w-24 rounded-lg' />
          </div>
          <Skeleton className='h-10 w-full rounded-lg md:min-w-[300px]' />
        </div>
      </div>

      <div className='mx-auto max-w-6xl px-6 py-12'>
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

const BlogPage = async () => {
  return (
    <div className='min-h-screen bg-[#030303]'>
      <div className='mx-auto max-w-[1440px] px-5 py-5 md:px-[50px] lg:px-[100px]'>
        <BlogHero />
        <Suspense fallback={<BlogGridLoading />}>
          <StreamingBlogGridWrapper />
        </Suspense>
      </div>
      <TestimonialSection testimonials={testimonials} />
    </div>
  );
};

export default BlogPage;
