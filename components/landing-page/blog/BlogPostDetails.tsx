'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Tag, BookOpen, Check } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { getRelatedPosts } from '@/lib/api/blog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useMarkdown } from '@/hooks/use-markdown';
import BlogCard from './BlogCard';
import AuthLoadingState from '@/components/auth/AuthLoadingState';

interface BlogPostDetailsProps {
  post: BlogPost;
}

const BlogPostDetails: React.FC<BlogPostDetailsProps> = ({ post }) => {
  const { loading, error, styledContent } = useMarkdown(post.content, {
    breaks: true,
    gfm: true,
    pedantic: true,
    loadingDelay: 100,
  });

  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [relatedPostsError, setRelatedPostsError] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        setIsLoadingRelated(true);
        setRelatedPostsError(null);
        const related = await getRelatedPosts(post.slug, { limit: 3 });
        setRelatedPosts(related || []);
      } catch {
        setRelatedPostsError('Failed to load related posts');
        setRelatedPosts([]);
      } finally {
        setIsLoadingRelated(false);
      }
    };
    fetchRelatedPosts();
  }, [post.slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = post.title;
    const text = post.excerpt;

    try {
      switch (platform) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            '_blank',
            'noopener,noreferrer'
          );
          break;
        case 'discord':
          await navigator.clipboard.writeText(`${title} ${url}`);
          setCopiedStates(prev => ({ ...prev, discord: true }));
          setTimeout(
            () => setCopiedStates(prev => ({ ...prev, discord: false })),
            2000
          );
          break;
        case 'link':
          await navigator.clipboard.writeText(url);
          setCopiedStates(prev => ({ ...prev, link: true }));
          setTimeout(
            () => setCopiedStates(prev => ({ ...prev, link: false })),
            2000
          );
          break;
        default:
          if (navigator.share) {
            await navigator.share({ title, text, url });
          } else {
            await navigator.clipboard.writeText(url);
            setCopiedStates(prev => ({ ...prev, default: true }));
            setTimeout(
              () => setCopiedStates(prev => ({ ...prev, default: false })),
              2000
            );
          }
      }
    } catch {
      // Handle error silently in production
    }
  };

  const handleRelatedPostClick = (slug: string) => {
    setIsNavigating(true);
    // The navigation will be handled by Next.js Link, but we show loading state
    // eslint-disable-next-line no-console
    console.log(`Navigating to related post: ${slug}`);
    setTimeout(() => {
      setIsNavigating(false);
    }, 2000); // Fallback timeout
  };

  return (
    <>
      {isNavigating && <AuthLoadingState message='Loading article...' />}
      <div className='relative z-10 mx-auto min-h-screen max-w-[1440px] justify-start space-y-[23px] bg-[#030303] px-5 py-5 text-white md:space-y-[80px] md:px-[50px] md:py-16 lg:px-[100px]'>
        <div className='relative flex flex-col lg:flex-row'>
          <div className='flex-1'>
            <div className='max-w-4xl py-6 sm:py-8'>
              <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
                <div className='flex-1'>
                  <div className='mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:gap-3'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8 border border-[#2B2B2B] bg-[#1C1C1C] sm:h-10 sm:w-10'>
                        <AvatarImage
                          src={post.author.avatar}
                          alt={post.author.name}
                        />
                        <AvatarFallback className='border border-[#2B2B2B] bg-[#1C1C1C] text-base sm:text-lg'>
                          {post.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='font-medium text-white'>
                        {post.author.name}
                      </span>
                    </div>
                    <span className='text-sm text-[#DFDFDF] sm:text-base'>
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>

                  <h1 className='mb-4 text-2xl leading-tight font-bold sm:mb-6 sm:text-3xl lg:text-4xl'>
                    {post.title}
                  </h1>

                  <p className='mb-6 text-base leading-relaxed text-white sm:mb-8 sm:text-lg'>
                    {post.excerpt}
                  </p>
                </div>
              </div>
            </div>

            <div className='max-w-4xl'>
              <div className='relative h-[250px] w-full overflow-hidden rounded-lg border border-white/20 sm:h-[300px] md:h-[400px] lg:h-[500px]'>
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className='rounded-lg object-cover'
                  priority
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw'
                />
              </div>
            </div>

            <div className='max-w-4xl py-8 sm:py-12'>
              <div className='prose prose-invert prose-sm sm:prose-base max-w-none'>
                {loading ? (
                  <div className='flex items-center justify-center py-12'>
                    <div className='flex items-center gap-2 text-[#B5B5B5]'>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-[#A7F950] border-t-transparent'></div>
                      Loading content...
                    </div>
                  </div>
                ) : error ? (
                  <div className='rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-red-400'>
                    <p className='font-medium'>Error loading content:</p>
                    <p className='mt-1 text-sm'>{error}</p>
                  </div>
                ) : (
                  styledContent
                )}
              </div>

              <div className='mt-8 border-t border-[#2B2B2B] pt-6 sm:mt-12 sm:pt-8'>
                <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
                  <span className='text-sm font-medium text-white sm:text-base'>
                    Tags:
                  </span>
                  {post.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant='secondary'
                      className='bg-[#2B2B2B] text-[#B5B5B5] transition-colors hover:bg-[#3B3B3B]'
                    >
                      <Tag className='mr-1 h-3 w-3' />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className='lg:w-[300px]'>
            <div className='sticky top-[100px] flex w-fit flex-col items-start lg:ml-8 lg:items-end'>
              <h3 className='mb-3 text-sm font-medium text-white sm:mb-4'>
                SHARE
              </h3>
              <div className='flex gap-3 lg:flex-col'>
                <button
                  onClick={() => handleShare('twitter')}
                  className='bg-active-bg flex h-10 w-10 items-center justify-center rounded-full text-black transition-colors hover:bg-[#A7F950]/80 focus:ring-2 focus:ring-[#A7F950]/50 focus:outline-none'
                  aria-label='Share on Twitter'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='18'
                    height='18'
                    viewBox='0 0 18 18'
                    fill='none'
                  >
                    <path
                      d='M1.5 16.5L7.79032 10.2097M16.5 1.5L10.2097 7.79032M10.2097 7.79032L5.66667 1.5H1.5L7.79032 10.2097M10.2097 7.79032L16.5 16.5H12.3333L7.79032 10.2097'
                      stroke='#99FF2D'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare('discord')}
                  className='bg-active-bg flex h-10 w-10 items-center justify-center rounded-full text-black transition-colors hover:bg-[#A7F950]/80 focus:ring-2 focus:ring-[#A7F950]/50 focus:outline-none'
                  aria-label='Copy for Discord'
                >
                  {copiedStates.discord ? (
                    <Check className='h-5 w-5' />
                  ) : (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='20'
                      height='16'
                      viewBox='0 0 20 16'
                      fill='none'
                    >
                      <path
                        d='M6.68359 6.56555C6.3753 6.56555 6.08615 6.65168 5.83398 6.80286C5.86071 6.73663 5.8898 6.67102 5.91797 6.60461L6.68359 6.48743M6.68359 6.56555V6.48743M6.68359 6.56555L6.83008 6.57336C6.84126 6.53557 6.85246 6.49776 6.86426 6.46008L6.68359 6.48743M6.68359 6.56555V6.48743M13.3291 6.56555L13.5156 6.57629C13.75 6.60287 13.9698 6.68028 14.168 6.79602C14.1413 6.72999 14.1158 6.66346 14.0879 6.59778L13.3291 6.48352M13.3291 6.56555V6.48352M13.3291 6.56555V6.48352M13.3291 6.56555C13.2818 6.56555 13.2348 6.56939 13.1885 6.57336C13.1772 6.53503 13.1672 6.49633 13.1553 6.45813L13.3291 6.48352'
                        stroke='#99FF2D'
                        strokeWidth='10'
                      />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleShare('send')}
                  className='bg-active-bg flex h-10 w-10 items-center justify-center rounded-full text-black transition-colors hover:bg-[#A7F950]/80 focus:ring-2 focus:ring-[#A7F950]/50 focus:outline-none'
                  aria-label='Share via native share'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='18'
                    viewBox='0 0 20 18'
                    fill='none'
                  >
                    <path
                      d='M9.98721 11.8403L12.6883 14.9113C13.6891 16.0491 14.1895 16.618 14.7133 16.4795C15.2371 16.341 15.4167 15.5923 15.7759 14.0949L17.7684 5.78825C18.3217 3.48194 18.5983 2.32878 17.9834 1.76C17.3685 1.19122 16.3027 1.61437 14.1711 2.46068L4.28165 6.38707C2.57679 7.06395 1.72436 7.40239 1.67024 7.98403C1.6647 8.04353 1.66461 8.10344 1.66996 8.16295C1.7223 8.74477 2.57369 9.08605 4.27647 9.7686C5.048 10.0779 5.43377 10.2325 5.71035 10.5286C5.74145 10.5619 5.77135 10.5964 5.8 10.632C6.05484 10.9486 6.16359 11.3642 6.38109 12.1954L6.78812 13.7508C6.99977 14.5596 7.10559 14.964 7.38275 15.0191C7.65991 15.0743 7.90122 14.7389 8.38384 14.0683L9.98721 11.8403ZM9.98721 11.8403L9.72237 11.5642C9.42097 11.2501 9.27026 11.0931 9.27026 10.8979C9.27026 10.7027 9.42097 10.5457 9.72237 10.2315L12.6998 7.12841'
                      stroke='#99FF2D'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare('link')}
                  className='bg-active-bg flex h-10 w-10 items-center justify-center rounded-full text-black transition-colors hover:bg-[#A7F950]/80 focus:ring-2 focus:ring-[#A7F950]/50 focus:outline-none'
                  aria-label='Copy link'
                >
                  {copiedStates.link ? (
                    <Check className='h-5 w-5' />
                  ) : (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='20'
                      height='20'
                      viewBox='0 0 20 20'
                      fill='none'
                    >
                      <path
                        d='M7.49935 14.1666H5.83268C3.5315 14.1666 1.66602 12.3012 1.66602 9.99998C1.66602 7.69879 3.5315 5.83331 5.83268 5.83331H7.49935M12.4993 14.1666H14.166C16.4672 14.1666 18.3327 12.3012 18.3327 9.99998C18.3327 7.69879 16.4672 5.83331 14.166 5.83331H12.4993M5.83268 9.99998L14.166 9.99998'
                        stroke='#99FF2D'
                        strokeWidth='1.4'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='border-t border-[#2B2B2B] py-8 sm:py-12 lg:py-16'>
          <div className=''>
            <h2 className='mb-6 text-xl font-bold text-white sm:mb-8 sm:text-2xl lg:text-3xl'>
              Related Articles
            </h2>
            {isLoadingRelated ? (
              <div className='grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3'>
                {[...Array(3)].map((_, index) => (
                  <div key={index} className='animate-pulse'>
                    <div className='mb-4 h-48 rounded-lg bg-[#1C1C1C]'></div>
                    <div className='mb-2 h-4 rounded bg-[#1C1C1C]'></div>
                    <div className='h-4 w-3/4 rounded bg-[#1C1C1C]'></div>
                  </div>
                ))}
              </div>
            ) : relatedPostsError ? (
              <div className='py-12 text-center text-[#B5B5B5]'>
                <BookOpen className='mx-auto mb-4 h-12 w-12' />
                <p className='text-base'>{relatedPostsError}</p>
              </div>
            ) : relatedPosts && relatedPosts.length > 0 ? (
              <div className='grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3'>
                {relatedPosts.map(relatedPost => (
                  <BlogCard
                    key={relatedPost.slug}
                    post={relatedPost}
                    onCardClick={handleRelatedPostClick}
                  />
                ))}
              </div>
            ) : (
              <div className='py-12 text-center text-[#B5B5B5]'>
                <BookOpen className='mx-auto mb-4 h-12 w-12' />
                <p className='text-base'>No related posts found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPostDetails;
