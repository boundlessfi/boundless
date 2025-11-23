'use client';
import { useMarkdown } from '@/hooks/use-markdown';
import { HackathonTimeline } from './hackathonTimeline';
import { HackathonPrizes } from './hackathonPrizes';
import { PrizeTier } from '@/lib/api/hackathons';

interface Timeline {
  event: string;
  date: string;
}
interface HackathonOverviewProps {
  content: string;
  timelineEvents?: Timeline[];
  prizes?: PrizeTier[];
  totalPrizePool: string;
  className?: string;
  hackathonSlugOrId?: string;
  organizationId?: string;
}

export function HackathonOverview({
  content,
  timelineEvents,
  prizes,
  className = '',
  totalPrizePool,
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
      {prizes && (
        <HackathonPrizes totalPrizePool={totalPrizePool} prizes={prizes} />
      )}
    </div>
  );
}
