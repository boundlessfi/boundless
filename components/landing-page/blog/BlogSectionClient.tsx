'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import AuthLoadingState from '@/components/auth/AuthLoadingState';
import BlogCard from './BlogCard';
import { MdxBlogPost } from '@/lib/mdx';

interface BlogSectionClientProps {
  posts: MdxBlogPost[];
}

const BlogSectionClient = ({ posts }: BlogSectionClientProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);

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
      )}
      <section
        className='relative h-full w-full'
        aria-labelledby='blog-heading'
      >
        <header className='mb-16 flex items-end justify-between'>
          <div className='max-w-[628px]'>
            <h3 className='bg-gradient-to-r from-[#3AE6B2] to-[#A7F950] bg-clip-text text-transparent'>
              From the Blog
            </h3>
            <h2
              id='blog-heading'
              className='mt-3 text-left text-[32px] leading-[140%] tracking-[0.48px] text-white md:text-[48px]'
            >
              Ideas that shape the future
            </h2>
            <p className='gradient-text-2 mt-3 max-w-[550px] text-left text-base leading-[160%] tracking-[-0.48px]'>
              Discover stories, tips, and updates on crowdfunding, grants, and
              Web3. Learn from builders and backers driving real impact.
            </p>
          </div>
          <div className='hidden items-end justify-end md:flex'>
            <Link
              className='flex items-center gap-2 font-medium text-white transition-colors hover:text-gray-300'
              href='/blog'
              aria-label='Read more blog articles'
            >
              <span className='underline'>Read More Articles</span>
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
        </header>

        {posts.length > 0 ? (
          <div
            className='grid w-full max-w-none grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-6'
            role='list'
            aria-label='Blog posts grid'
          >
            {posts.slice(0, 6).map(blog => (
              <div key={blog.slug} role='listitem'>
                <BlogCard post={blog} onCardClick={handleCardClick} />
              </div>
            ))}
          </div>
        ) : (
          <div className='flex min-h-[300px] items-center justify-center'>
            <p className='text-gray-400'>
              No blog posts available at the moment.
            </p>
          </div>
        )}

        <div className='mt-8 flex justify-center sm:hidden'>
          <Link
            className='flex items-center gap-2 font-medium text-white transition-colors hover:text-gray-300'
            href='/blog'
            aria-label='Read more blog articles'
          >
            <span className='underline'>Read More Articles</span>
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>
      </section>
    </>
  );
};

export default BlogSectionClient;
