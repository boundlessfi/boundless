import {
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';

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

  function getEventColor(event: Timeline['event']) {
    const normalized = event.toLowerCase();
    if (normalized.includes('start')) return 'emerald';
    if (normalized.includes('deadline')) return 'amber';
    if (normalized.includes('judging')) return 'blue';
    if (normalized.includes('winner')) return 'purple';
    return 'slate';
  }

  return (
    <div className='w-full py-12'>
      <div className='mx-auto'>
        {/* Header Section */}
        <div className='mb-12 text-center md:text-left'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-[#a7f950]/20 bg-gradient-to-r from-[#a7f950]/10 to-[#a7f950]/5 px-4 py-2'>
            <Clock className='h-4 w-4 text-[#a7f950]' />
            <span className='text-sm font-medium text-[#a7f950]'>
              Event Schedule
            </span>
          </div>
          <h2 className='mb-3 text-3xl font-bold tracking-tight text-white md:text-4xl'>
            Timeline & Key Dates
          </h2>
          <p className='text-lg text-gray-400'>
            Mark your calendar for these important milestones
          </p>
        </div>

        {/* Timeline Container */}
        <div className='relative'>
          {/* Enhanced gradient line */}
          <div className='absolute top-0 bottom-0 left-6 w-[3px] rounded-full bg-gradient-to-b from-[#a7f950] via-[#a7f950]/70 to-[#a7f950]/30 opacity-30 md:left-8' />
          <div className='absolute top-0 bottom-0 left-6 w-[3px] bg-gradient-to-b from-[#a7f950]/50 via-[#a7f950]/30 to-transparent blur-sm md:left-8' />

          {/* Timeline events */}
          <div className='space-y-8'>
            {events.map((event, index) => {
              const Icon = getEventIcon(event.event);
              const color = getEventColor(event.event);
              const isLast = index === events.length - 1;

              const colorClasses = {
                emerald: {
                  bg: 'bg-[#a7f950]/20',
                  border: 'border-[#a7f950]/50',
                  text: 'text-[#a7f950]',
                  glow: 'group-hover:shadow-[#a7f950]/30',
                  iconBg: 'bg-[#a7f950]/10',
                },
                amber: {
                  bg: 'bg-[#a7f950]/20',
                  border: 'border-[#a7f950]/50',
                  text: 'text-[#a7f950]',
                  glow: 'group-hover:shadow-[#a7f950]/30',
                  iconBg: 'bg-[#a7f950]/10',
                },
                blue: {
                  bg: 'bg-[#a7f950]/20',
                  border: 'border-[#a7f950]/50',
                  text: 'text-[#a7f950]',
                  glow: 'group-hover:shadow-[#a7f950]/30',
                  iconBg: 'bg-[#a7f950]/10',
                },
                purple: {
                  bg: 'bg-[#a7f950]/20',
                  border: 'border-[#a7f950]/50',
                  text: 'text-[#a7f950]',
                  glow: 'group-hover:shadow-[#a7f950]/30',
                  iconBg: 'bg-[#a7f950]/10',
                },
                slate: {
                  bg: 'bg-[#a7f950]/20',
                  border: 'border-[#a7f950]/50',
                  text: 'text-[#a7f950]',
                  glow: 'group-hover:shadow-[#a7f950]/30',
                  iconBg: 'bg-[#a7f950]/10',
                },
              };

              const colors = colorClasses[color as keyof typeof colorClasses];

              return (
                <div key={index} className='group relative pl-16 md:pl-24'>
                  {/* Icon marker */}
                  <div className='absolute top-1 left-0 flex items-center justify-center md:left-2'>
                    <div
                      className={`z-10 flex h-12 w-12 items-center justify-center rounded-2xl border-2 ${colors.border} ${colors.bg} backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 ${colors.glow} group-hover:shadow-xl`}
                    >
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    {/* Connecting pulse */}
                    {!isLast && (
                      <div
                        className={`absolute top-12 left-1/2 h-8 w-0.5 -translate-x-1/2 ${colors.bg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                      />
                    )}
                  </div>

                  {/* Content card */}
                  <div className='relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent transition-all duration-500 group-hover:-translate-y-2 group-hover:border-[#a7f950]/50 group-hover:shadow-2xl group-hover:shadow-[#a7f950]/10'>
                    {/* Wave background */}
                    <div className='absolute right-0 bottom-0 h-full w-full overflow-hidden rounded-2xl opacity-10'>
                      <Image
                        src='/wave.svg'
                        alt=''
                        fill
                        className='object-cover object-bottom-right'
                        priority={false}
                      />
                    </div>

                    {/* Animated background gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${colors.iconBg} to-transparent`}
                    />

                    <div className='relative z-10 p-6'>
                      <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                        <div className='flex-1 space-y-3'>
                          {/* Event title */}
                          <h3 className='text-left text-xl font-bold text-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text group-hover:text-transparent'>
                            {event.event}
                          </h3>

                          {/* Date with icon */}
                          <div className='flex items-center gap-2.5 text-left'>
                            <div
                              className={`rounded-lg p-2 ${colors.iconBg} border ${colors.border}`}
                            >
                              <Calendar className={`h-4 w-4 ${colors.text}`} />
                            </div>
                            <div className='flex flex-col'>
                              <span className='text-left text-sm font-medium text-white'>
                                {event.date}
                              </span>
                              <span className='text-xs text-gray-500'>
                                {index === 0
                                  ? 'Starting soon'
                                  : index === events.length - 1
                                    ? 'Final event'
                                    : `Milestone ${index + 1}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Step indicator */}
                        <div className='flex items-center gap-3 self-start md:self-center'>
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 ${colors.border} ${colors.bg} backdrop-blur-sm transition-all duration-300 group-hover:scale-110`}
                          >
                            <span
                              className={`text-lg font-bold ${colors.text}`}
                            >
                              {index + 1}
                            </span>
                          </div>
                          {!isLast && (
                            <ArrowRight className='hidden h-5 w-5 text-gray-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gray-400 md:block' />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div
                      className={`h-1 w-full bg-gradient-to-r ${colors.bg} to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer note */}
        <div className='mt-12 flex justify-center'>
          <div className='flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-sm'>
            <Clock className='h-4 w-4 text-gray-400' />
            <span className='text-sm text-gray-400'>
              All times displayed in UTC unless specified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
