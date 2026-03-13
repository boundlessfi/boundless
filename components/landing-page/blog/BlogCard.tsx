import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import Image from 'next/image';
import { MdxBlogPost } from '@/lib/mdx';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock } from 'lucide-react';

interface BlogCardProps {
  post: MdxBlogPost;
  onCardClick?: (slug: string) => void;
}

const BlogCard = ({ post, onCardClick }: BlogCardProps) => {
  return (
    <Card className='group bg-background-card hover:border-primary/30 hover:shadow-primary/5 flex h-full w-full max-w-none flex-col overflow-hidden rounded-xl border border-[#1B1B1B] p-0 transition-all duration-300 hover:shadow-lg'>
      {/* Image Header with 2:1 Aspect Ratio */}
      <CardHeader className='relative overflow-hidden p-0'>
        <div className='relative aspect-2/1 w-full bg-[#1A1A1A]'>
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className='object-cover transition-transform duration-500 group-hover:scale-105'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
          {/* Gradient Overlay */}
          <div className='absolute inset-0 top-0 bottom-[-10] bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
        </div>
      </CardHeader>

      {/* Content Section */}
      <CardContent className='flex-1 space-y-4 px-5 pt-0 pb-0'>
        {/* Meta Information */}
        <div className='flex items-center justify-between gap-3'>
          {/* Categories */}
          <div className='flex flex-wrap items-center gap-1.5'>
            {post.categories?.slice(0, 2).map(category => (
              <Badge
                key={category}
                variant='secondary'
                className='border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors'
              >
                {category}
              </Badge>
            ))}
            {post.categories && post.categories.length > 2 && (
              <Badge
                variant='secondary'
                className='border-primary/20 bg-primary/10 text-primary rounded-md border px-2.5 py-1 text-xs font-medium'
              >
                +{post.categories.length - 2}
              </Badge>
            )}
          </div>

          {/* Date */}
          <span className='text-xs font-normal whitespace-nowrap text-gray-500'>
            {post.publishedAt}
          </span>
        </div>

        {/* Title */}
        <h2 className='group-hover:text-primary line-clamp-2 text-xl leading-tight font-semibold text-white transition-colors duration-300'>
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className='line-clamp-3 text-sm leading-relaxed text-[#B5B5B5]'>
          {post.excerpt}
        </p>

        {/* Reading Time (if available) */}
        {post.readingTime && (
          <div className='flex items-center gap-1.5 text-xs text-gray-500'>
            <Clock className='h-3.5 w-3.5' />
            <span>{post.readingTime} min read</span>
          </div>
        )}
      </CardContent>

      {/* Footer with CTA */}
      <CardFooter className='mt-auto border-t border-[#2B2B2B] px-5 py-0 pt-0!'>
        <button
          onClick={e => {
            e.preventDefault();
            onCardClick?.(post.slug);
          }}
          className='group/btn flex w-full items-center justify-between gap-2 rounded-lg px-0 py-3 text-left transition-all duration-300'
        >
          <span className='text-primary group-hover/btn:text-primary text-sm font-semibold'>
            Continue Reading
          </span>
          <ArrowRight className='text-primary h-4 w-4' />
        </button>
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
