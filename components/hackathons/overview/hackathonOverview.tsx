'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
}

export function HackathonOverview({
  content,
  timelineEvents,
  prizes,
  className = '',
}: HackathonOverviewProps) {
  return (
    <div className={`w-full py-8 ${className}`}>
      <article className='prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none text-left'>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            ul: ({ ...props }) => (
              <ul
                className='marker:text-primary mb-4 ml-4 list-inside list-disc space-y-2'
                {...props}
              />
            ),
            ol: ({ ...props }) => (
              <ol
                className='marker:text-primary mb-4 ml-4 list-inside list-decimal space-y-2'
                {...props}
              />
            ),

            table: ({ ...props }) => (
              <table
                className='w-full border border-gray-400 text-sm text-white'
                {...props}
              />
            ),
            thead: ({ ...props }) => (
              <thead
                className='border-b border-gray-400 text-white'
                {...props}
              />
            ),
            tbody: ({ ...props }) => (
              <tbody className='text-white' {...props} />
            ),
            tr: ({ ...props }) => (
              <tr className='border-b border-gray-400' {...props} />
            ),
            th: ({ ...props }) => (
              <th
                className='border border-gray-400 px-3 py-2 text-left font-semibold text-white'
                {...props}
              />
            ),
            td: ({ ...props }) => (
              <td
                className='border border-gray-400 px-3 py-2 text-white'
                {...props}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      {timelineEvents && <HackathonTimeline events={timelineEvents} />}
      {prizes && <HackathonPrizes prizes={prizes} />}
    </div>
  );
}
