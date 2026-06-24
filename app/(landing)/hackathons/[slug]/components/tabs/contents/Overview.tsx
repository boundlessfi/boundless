'use client';

import { useParams } from 'next/navigation';
import {
  useHackathon,
  useHackathonTracks,
} from '@/hooks/hackathon/use-hackathon-queries';
import { TabsContent } from '@/components/ui/tabs';
import {
  Info,
  Target,
  Clock,
  Trophy,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { useMarkdown } from '@/hooks/use-markdown';
import SponsorsSection from '../../SponsorsSection';

function getOrdinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const Overview = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: hackathon } = useHackathon(slug);
  // Only fetch tracks once we know the hackathon uses a tracked structure.
  // Avoids an extra network call on every overview render for legacy
  // overall-only hackathons.
  const tracksEnabled =
    hackathon?.prizeStructure === 'OVERALL_AND_TRACKS' ||
    hackathon?.prizeStructure === 'TRACKS_ONLY';
  const { data: hackathonTracks = [] } = useHackathonTracks(
    slug,
    tracksEnabled
  );
  const trackById = new Map(hackathonTracks.map(t => [t.id, t] as const));

  const { styledContent, loading: markdownLoading } = useMarkdown(
    hackathon?.description || '',
    {
      breaks: true,
      gfm: true,
    }
  );

  if (!hackathon) return null;

  const now = new Date();

  interface RawTimelineItem {
    label: string;
    date?: string;
    description?: string;
  }

  interface TimelineItem {
    label: string;
    date: string;
    description?: string;
  }

  const rawTimelineItems: RawTimelineItem[] = [
    {
      label: 'Registration Opens',
      date: hackathon.createdAt,
      description: 'Sign up and start brainstorming your project.',
    },
    {
      label: 'Registration Deadline',
      date: hackathon.registrationDeadline,
      description: 'Last chance to join and form your team.',
    },
    {
      label: 'Hackathon Starts',
      date: hackathon.startDate,
      description: 'The hacking phase begins! Start building.',
    },
    {
      label: 'Submission Deadline',
      date: hackathon.submissionDeadline,
      description: 'Final project submission and demo video due.',
    },
    {
      label: 'Judging Ends',
      date: hackathon.judgingDeadline,
      description: 'Winners will be announced soon after.',
    },
  ];

  const timelineItems: TimelineItem[] = rawTimelineItems.filter(
    (item): item is TimelineItem => !!item.date
  );

  // Determine current active milestone
  const getStatus = (itemDate: string, index: number) => {
    const d = new Date(itemDate);
    const nextItem = timelineItems[index + 1];
    const nextD = nextItem ? new Date(nextItem.date) : null;

    if (now > d && (!nextD || now < nextD)) {
      return 'active';
    }
    if (now > d) {
      return 'completed';
    }
    return 'upcoming';
  };

  return (
    <TabsContent
      value='overview'
      className='mt-0 w-full space-y-12 outline-none'
    >
      <div className='mb-10'>
        <h2 className='text-2xl font-bold text-white'>Overview</h2>
        <p className='mt-1 text-gray-400'>
          Everything you need to know about this hackathon.
        </p>
      </div>

      {/* About Section */}
      <section className='space-y-4'>
        <div className='flex items-center gap-2'>
          <h2 className='text-xl font-bold text-white'>About the Hackathon</h2>
        </div>
        <div className='max-w-none text-left'>
          {markdownLoading ? (
            <div className='flex items-center gap-2 text-gray-400'>
              <div className='border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent' />
              <span>Loading description...</span>
            </div>
          ) : (
            styledContent
          )}
        </div>
      </section>

      {/* Tracks & Focus Areas
      <section className='space-y-6'>
        <div className='flex items-center gap-2'>
          <Target className='text-primary h-5 w-5' />
          <h2 className='text-lg font-bold text-white'>Tracks & Focus Areas</h2>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {(hackathon.categories.length > 0
            ? hackathon.categories
            : ['DeFi 2.0', 'Infrastructure', 'Tooling', 'Public Goods']
          ).map((track, i) => (
            <div
              key={i}
              className='group hover:border-primary/20 relative overflow-hidden rounded-xl border border-white/5 bg-[#141517] p-5 transition-all'
            >
              <h3 className='text-primary mb-2 text-base font-bold'>{track}</h3>
              <p className='text-sm text-gray-500'>
                Focus on {track.toLowerCase()} innovations, scalability, and
                user-centric decentralized applications.
              </p>
            </div>
          ))}
        </div>
      </section> */}

      {/* Timeline Section */}
      <section className='space-y-8'>
        <div className='flex items-center gap-2'>
          <h2 className='text-xl font-bold text-white'>Timeline</h2>
        </div>
        <div className='relative ml-3 space-y-0'>
          {/* Vertical Line */}
          <div className='absolute top-2 bottom-0 left-[5px] w-px bg-white/10' />

          {timelineItems.map((item, i) => {
            const status = getStatus(item.date, i);
            const formattedDate = new Date(item.date).toLocaleDateString(
              'en-US',
              {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }
            );

            return (
              <div key={i} className='relative flex gap-8 pb-10 last:pb-0'>
                <div
                  className={cn(
                    'relative z-10 mt-1.5 h-[10px] w-[10px] shrink-0 rounded-full border-2 transition-all duration-500',
                    status === 'active'
                      ? 'ring-primary/10 bg-primary/40 shadow-[0_0_20px_rgba(46, 237, 170,0.5)] ring'
                      : status === 'completed'
                        ? 'bg-primary ring-primary/10 ring-8'
                        : 'border-[#262626] bg-[#262626]'
                  )}
                >
                  {status === 'active' && (
                    <div className='border-primary absolute -inset-2 animate-pulse rounded-full border-2 border-dashed' />
                  )}
                </div>

                <div className='flex flex-col gap-1 transition-all duration-500'>
                  <h3
                    className={cn(
                      'text-lg font-bold tracking-tight',
                      status === 'active' ? 'text-primary' : 'text-white/30'
                    )}
                  >
                    {item.label}
                    {status === 'active' && ' (Current)'}
                  </h3>
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      status === 'active' ? 'text-primary' : 'text-white/15'
                    )}
                  >
                    {formattedDate}
                  </p>
                  {item.description && (
                    <p
                      className={cn(
                        'mt-1 max-w-xl text-sm leading-relaxed',
                        status === 'active' ? 'text-white/60' : 'text-white/5'
                      )}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Prizes Section */}
      {(() => {
        // Partition tiers into overall vs track. Tiers without an
        // explicit kind are treated as OVERALL for backward compat with
        // hackathons created before the track structure landed.
        const overallTiers = hackathon.prizeTiers.filter(
          t => !t.kind || t.kind === 'OVERALL'
        );
        const trackTiers = hackathon.prizeTiers.filter(t => t.kind === 'TRACK');

        return (
          <section className='space-y-8'>
            {overallTiers.length > 0 && (
              <div className='space-y-6'>
                <div className='flex items-center gap-2'>
                  <h2 className='text-xl font-bold text-white'>
                    {trackTiers.length > 0 ? 'Overall Prizes' : 'Prizes'}
                  </h2>
                </div>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                  {overallTiers.map((tier, i) => (
                    <div
                      key={tier.id ?? `overall-${i}`}
                      className={cn(
                        'relative flex flex-col items-center rounded-2xl border bg-[#141517] p-8 text-center transition-all',
                        i === 0
                          ? 'border-primary/30 ring-primary/20 ring-1'
                          : 'border-white/5'
                      )}
                    >
                      {i === 0 && (
                        <Badge className='bg-primary absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-bold text-black uppercase'>
                          Top Tier
                        </Badge>
                      )}

                      <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5'>
                        <Trophy
                          className={cn(
                            'h-7 w-7',
                            i === 0
                              ? 'text-primary'
                              : i === 1
                                ? 'text-blue-400'
                                : 'text-gray-400'
                          )}
                        />
                      </div>

                      <h3 className='text-sm font-semibold text-gray-400'>
                        {tier.name || `${getOrdinal(i + 1)} Place`}
                      </h3>
                      <div className='my-2 flex items-baseline gap-1'>
                        <span className='text-3xl font-black text-white'>
                          {Number(tier.prizeAmount).toLocaleString()}
                        </span>
                        <span className='text-lg font-bold text-gray-500 uppercase'>
                          {tier.currency || 'USDC'}
                        </span>
                      </div>

                      {tier.description && (
                        <p className='mt-4 text-xs leading-relaxed text-gray-500'>
                          {tier.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {trackTiers.length > 0 && (
              <div className='space-y-6'>
                <div className='flex items-center gap-2'>
                  <Layers className='text-primary h-5 w-5' />
                  <h2 className='text-xl font-bold text-white'>Track Prizes</h2>
                </div>
                <p className='text-sm text-gray-400'>
                  Category prizes alongside the overall placements. Pick the
                  tracks you want your submission considered for when you
                  submit.
                </p>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {trackTiers.map((tier, i) => {
                    const track = tier.trackId
                      ? trackById.get(tier.trackId)
                      : undefined;
                    return (
                      <div
                        key={tier.id ?? `track-${i}`}
                        className='relative flex flex-col rounded-2xl border border-white/5 bg-[#141517] p-6 transition-all hover:border-white/10'
                      >
                        <div className='mb-3 flex items-start justify-between gap-2'>
                          <Badge
                            variant='outline'
                            className='border-primary/40 text-primary'
                          >
                            {track?.name ?? tier.name ?? 'Track'}
                          </Badge>
                          {track?.type && (
                            <span className='text-[10px] tracking-widest text-gray-500 uppercase'>
                              {track.type}
                            </span>
                          )}
                        </div>
                        <div className='mb-2 flex items-baseline gap-1'>
                          <span className='text-2xl font-black text-white'>
                            {Number(tier.prizeAmount).toLocaleString()}
                          </span>
                          <span className='text-sm font-bold text-gray-500 uppercase'>
                            {tier.currency || 'USDC'}
                          </span>
                        </div>
                        {(track?.description || tier.description) && (
                          <p className='text-xs leading-relaxed text-gray-500'>
                            {track?.description || tier.description}
                          </p>
                        )}
                        {!track && tier.trackId && (
                          <p className='mt-2 text-[10px] text-amber-400/70'>
                            Track details loading…
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        );
      })()}

      <SponsorsSection
        slug={slug}
        marketingPartners={hackathon.sponsorsPartners}
      />
    </TabsContent>
  );
};

export default Overview;
