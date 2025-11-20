'use client';
import { useMarkdown } from '@/hooks/use-markdown';
import { HackathonTimeline } from './hackathonTimeline';
import { HackathonPrizes } from './hackathonPrizes';

interface TimelineEvent {
  event: string;
  date: string;
}

interface Prize {
  title: string;
  rank: string;
  prize: string;
  details: string[];
  icon?: string;
}

interface HackathonOverviewProps {
  content: string;
  timelineEvents?: TimelineEvent[];
  prizes?: Prize[];
  className?: string;
  hackathonSlugOrId?: string;
  organizationId?: string;
}

export function HackathonOverview({
  content,
  timelineEvents,
  prizes,
  className = '',
}: HackathonOverviewProps) {
  // Use the markdown hook to parse and style the content
  const { styledContent, loading, error } = useMarkdown(content, {
    breaks: true,
    gfm: true,
    pedantic: true,
    loadingDelay: 0,
  });

  return (
    <div className={`w-full py-8 ${className}`}>
      <article className='max-w-none text-left'>
        {loading && <div className='text-gray-400'>Loading content...</div>}
        {error && (
          <div className='text-red-400'>Error loading content: {error}</div>
        )}
        {!loading && !error && styledContent}
      </article>

      {timelineEvents && <HackathonTimeline events={timelineEvents} />}
      {prizes && <HackathonPrizes prizes={prizes} />}
    </div>
  );
}
