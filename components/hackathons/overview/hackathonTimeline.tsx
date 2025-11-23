'use client';

import { Calendar, CheckCircle2, Clock, Flag, Trophy } from 'lucide-react';

interface Timeline {
  event: string;
  date: string;
}
interface HackathonTimelineProps {
  events: Timeline[];
}

export function HackathonTimeline({ events }: HackathonTimelineProps) {
  if (!events.length) return null;

  function getEventIcon(event: Timeline['event']) {
    const normalized = event.toLowerCase();

    if (normalized.includes('start')) return Flag;
    if (normalized.includes('deadline')) return Clock;
    if (normalized.includes('judging')) return CheckCircle2;
    if (normalized.includes('winner')) return Trophy;

    return Calendar;
  }

  return (
    <div className='w-full py-8'>
      <div className='max-w-4xl'>
        <h2 className='text-primary mb-4 text-2xl font-bold'>
          TIMELINE & KEY DATES
        </h2>

        <div className='relative'>
          {/* Vertical line */}
          <div className='from-primary/50 via-primary/30 to-primary/10 absolute top-0 bottom-0 left-4 w-0.5 bg-gradient-to-b md:left-8' />

          {/* Timeline events */}
          <div className='space-y-4'>
            {events.map((event, index) => {
              const Icon = getEventIcon(event.event);
              return (
                <div key={index} className='group relative pl-12 md:pl-20'>
                  {/* Dot marker */}
                  <div className='absolute top-2 left-0 flex items-center justify-center md:left-4'>
                    <div className='border-primary group-hover:border-primary z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-slate-950 transition-all duration-300 group-hover:scale-125 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'>
                      <Icon className='text-primary h-4 w-4' />
                    </div>
                  </div>

                  {/* Content card */}
                  <div className='hover:border-primary/50 hover:shadow-primary/10 rounded-lg border border-slate-800 bg-[#111827] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
                    <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                      <div className='flex-1'>
                        <h3 className='group-hover:text-primary mb-2 text-lg font-semibold text-slate-200 transition-colors'>
                          {event.event}
                        </h3>
                        <div className='flex items-center gap-2 text-sm text-slate-400'>
                          <Calendar className='h-4 w-4' />
                          <span>{event.date}</span>
                        </div>
                      </div>

                      {/* Event number badge */}
                      <div className='self-start md:self-center'>
                        <div className='bg-primary/10 text-primary border-primary/20 inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold'>
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom decoration */}
        {/* <div className="mt-12 flex justify-start">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>All times in UTC unless specified</span>
          </div>
        </div> */}
      </div>
    </div>
  );
}
