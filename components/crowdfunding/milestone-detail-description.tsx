'use client';

import { useMarkdown } from '@/hooks/use-markdown';

interface MilestoneDetailDescriptionProps {
  content: string;
  title: string;
}

export function MilestoneDetailDescription({
  content,
  title,
}: MilestoneDetailDescriptionProps) {
  const { loading, error, styledContent } = useMarkdown(
    content || 'No description available.',
    {
      breaks: true,
      gfm: true,
      pedantic: true,
      loadingDelay: 100,
    }
  );

  return (
    <div className='space-y-4 border-t py-8'>
      <h2 className='text-xl font-semibold tracking-tight'>{title}</h2>

      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='text-muted-foreground'>Loading content...</div>
        </div>
      ) : error ? (
        <div className='rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-sm text-red-400'>
          <p className='font-medium'>Error loading content</p>
          <p className='mt-1'>{error}</p>
        </div>
      ) : (
        <div className='prose prose-invert max-w-none text-base leading-relaxed'>
          {styledContent}
        </div>
      )}
    </div>
  );
}
