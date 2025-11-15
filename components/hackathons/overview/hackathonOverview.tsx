'use client';
import ReactMarkdown from 'react-markdown';
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
          components={{
            h1: ({ ...props }) => (
              <h1 className='mb-6 text-4xl font-bold' {...props} />
            ),
            h2: ({ ...props }) => (
              <h2 className='mt-8 mb-4 text-3xl font-bold' {...props} />
            ),
            h3: ({ ...props }) => (
              <h3 className='mt-6 mb-3 text-2xl font-semibold' {...props} />
            ),
            p: ({ ...props }) => (
              <p className='mb-4 text-base leading-7' {...props} />
            ),
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
            li: ({ ...props }) => <li className='mb-1 text-base' {...props} />,
            blockquote: ({ ...props }) => (
              <blockquote
                className='border-primary my-4 border-l-4 pl-4 text-gray-600 italic dark:text-gray-400'
                {...props}
              />
            ),
            code: ({ ...props }) => (
              <code
                className='rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800'
                {...props}
              />
            ),
            pre: ({ ...props }) => (
              <pre
                className='mb-4 overflow-auto rounded bg-gray-100 p-4 dark:bg-gray-800'
                {...props}
              />
            ),
            table: ({ ...props }) => (
              <table className='mb-4 w-full border-collapse' {...props} />
            ),
            th: ({ ...props }) => (
              <th
                className='border border-gray-300 bg-gray-100 px-4 py-2 dark:border-gray-700 dark:bg-gray-800'
                {...props}
              />
            ),
            td: ({ ...props }) => (
              <td
                className='border border-gray-300 px-4 py-2 dark:border-gray-700'
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
