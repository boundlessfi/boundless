'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, ChevronRight } from 'lucide-react';

import { useCampaign } from '@/features/crowdfunding';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  campaignStatus,
  milestoneState,
  TONE_PILL,
} from '@/lib/crowdfunding/status';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PublicMilestonesPage({ params }: PageProps) {
  const { slug } = use(params);
  const { data: campaign, isLoading } = useCampaign(slug);

  if (isLoading) {
    return (
      <div className='container mx-auto max-w-3xl px-4 py-20 text-center text-zinc-500'>
        Loading...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className='container mx-auto max-w-3xl px-4 py-20 text-center text-zinc-500'>
        Campaign not found.
      </div>
    );
  }

  const status = campaignStatus(campaign.v2Status);
  const milestones = campaign.milestones ?? [];
  const totalAmount = milestones.reduce((s, m) => s + (m.amount ?? 0), 0);

  return (
    <div className='min-h-screen bg-zinc-950'>
      <div className='border-b border-zinc-900'>
        <div className='container mx-auto max-w-3xl px-4 py-3'>
          <Link
            href={`/crowdfunding/${slug}`}
            className='inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to campaign
          </Link>
        </div>
      </div>

      <div className='container mx-auto max-w-3xl px-4 py-10'>
        {/* Campaign header */}
        <div className='mb-8 flex flex-wrap items-center gap-3'>
          {campaign.project.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={campaign.project.logo}
              alt={campaign.project.title}
              className='h-10 w-10 flex-shrink-0 rounded-xl object-cover ring-1 ring-zinc-800'
            />
          )}
          <div className='min-w-0 flex-1'>
            <h1 className='truncate text-xl font-bold text-white'>
              {campaign.project.title}
            </h1>
          </div>
          <Badge
            variant='outline'
            className={cn('flex-shrink-0 text-xs', TONE_PILL[status.tone])}
          >
            {status.label}
          </Badge>
        </div>

        <div className='mb-6'>
          <h2 className='text-lg font-semibold text-white'>
            Milestones{' '}
            <span className='text-sm font-normal text-zinc-500'>
              ({milestones.length})
            </span>
          </h2>
          <p className='mt-1 text-sm text-zinc-500'>
            Funds are released one stage at a time as each milestone is
            delivered and approved.
          </p>
        </div>

        {milestones.length === 0 ? (
          <p className='text-zinc-600 italic'>No milestones listed.</p>
        ) : (
          <div className='space-y-3'>
            {milestones.map((m, idx) => {
              const st = milestoneState(m.reviewStatus);
              const planned = formatDate(m.endDate);
              const pct =
                totalAmount > 0
                  ? Math.round(((m.amount ?? 0) / totalAmount) * 100)
                  : 0;

              return m.id ? (
                <Link
                  key={m.id}
                  href={`/crowdfunding/${slug}/milestones/${m.id}`}
                  className='group flex items-center gap-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/60'
                >
                  {/* Number chip */}
                  <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-sm font-semibold text-zinc-300'>
                    {idx + 1}
                  </div>

                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold text-white'>
                      {m.title || m.name}
                    </p>
                    {m.description && (
                      <p className='mt-0.5 line-clamp-1 text-xs text-zinc-500'>
                        {m.description}
                      </p>
                    )}
                    <div className='mt-1.5 flex flex-wrap items-center gap-3 text-xs text-zinc-600'>
                      {m.amount != null && (
                        <span>${m.amount.toLocaleString()} USDC</span>
                      )}
                      {pct > 0 && <span>{pct}% of total</span>}
                      {planned && (
                        <span className='flex items-center gap-1'>
                          <CalendarDays className='h-3 w-3' />
                          {planned}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='flex flex-shrink-0 items-center gap-2'>
                    <Badge
                      variant='outline'
                      className={cn('text-xs', TONE_PILL[st.tone])}
                    >
                      {st.label}
                    </Badge>
                    <ChevronRight className='h-4 w-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-zinc-400' />
                  </div>
                </Link>
              ) : (
                <div
                  key={idx}
                  className='flex items-center gap-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5'
                >
                  <div className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-sm font-semibold text-zinc-300'>
                    {idx + 1}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold text-white'>
                      {m.title || m.name}
                    </p>
                  </div>
                  <Badge
                    variant='outline'
                    className={cn('text-xs', TONE_PILL[st.tone])}
                  >
                    {st.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
