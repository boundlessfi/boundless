'use client';

interface TimelineEvent {
  event: string;
  date: string;
}

interface HackathonTimelineProps {
  events?: TimelineEvent[];
}

export function HackathonTimeline({
  events = [
    { event: 'Hackathon Launch', date: 'September 9, 2025' },
    { event: 'First Workshop: Getting Started', date: 'September 10' },
    {
      event: 'Weekly Web Design & Deployment Sessions',
      date: 'Sept 11 – Sep 28',
    },
    { event: 'Submission Deadline', date: 'October 28, 2025 @ 11:59 PM UTC' },
    { event: 'Judging Period', date: 'November 9' },
    { event: 'Winners Announced', date: 'December 15, 2025' },
  ],
}: HackathonTimelineProps) {
  return (
    <div className='w-full py-8'>
      <div className=''>
        <h2 className='text-primary mb-4 text-center text-2xl font-bold'>
          TIMELINE & KEY DATES
        </h2>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-white/10'>
              <th className='text-primary px-4 py-3 text-left text-sm font-bold'>
                EVENT
              </th>
              <th className='text-primary px-4 py-3 text-left text-sm font-bold'>
                DATE
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr
                key={index}
                className='border-b border-white/10 transition-colors hover:bg-white/5'
              >
                <td className='px-4 py-4 text-left text-sm text-white'>
                  {event.event}
                </td>
                <td className='px-4 py-4 text-left text-sm text-white/70'>
                  {event.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
