'use client';

import { use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { useCampaign } from '@/features/crowdfunding';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: 'Draft', cls: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
  SUBMITTED_FOR_REVIEW: {
    label: 'Under Review',
    cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  REVIEW_REJECTED: {
    label: 'Changes Requested',
    cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  REVIEW_APPROVED: {
    label: 'Approved',
    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  VOTING: {
    label: 'Voting',
    cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  },
  VOTE_FAILED: {
    label: 'Voting Failed',
    cls: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  VOTE_PASSED: {
    label: 'Ready to Launch',
    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  PUBLISHING: {
    label: 'Launching',
    cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  FUNDING: {
    label: 'Live',
    cls: 'bg-primary/15 text-primary border-primary/30',
  },
  COMPLETED: {
    label: 'Completed',
    cls: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  },
  CANCELLED: {
    label: 'Cancelled',
    cls: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  PAUSED: {
    label: 'Paused',
    cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  FAILED: {
    label: 'Failed',
    cls: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-sm font-semibold text-white tabular-nums'>{value}</p>
      <p className='text-xs text-zinc-500'>{label}</p>
    </div>
  );
}

export default function CampaignManagementLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = use(params);
  const pathname = usePathname();
  const { data: campaign } = useCampaign(slug);

  const base = `/me/crowdfunding/${slug}`;
  const tabs = [
    { label: 'Overview', href: base, match: (p: string) => p === base },
    {
      label: 'Milestones',
      href: `${base}/milestones`,
      match: (p: string) => p.startsWith(`${base}/milestones`),
    },
    {
      label: 'Contributions',
      href: `${base}/contributions`,
      match: (p: string) => p.startsWith(`${base}/contributions`),
    },
  ];

  const status = campaign?.v2Status ?? 'DRAFT';
  const pill = STATUS_PILL[status] ?? STATUS_PILL.DRAFT;
  const raised = campaign?.fundingRaised ?? 0;
  const goal = campaign?.fundingGoal ?? 0;
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const backers = campaign?.contributors?.length ?? 0;
  const milestoneCount = campaign?.milestones?.length ?? 0;

  return (
    <div className='container mx-auto max-w-7xl px-4 py-8'>
      {/* Single shared header */}
      <div className='mb-6 space-y-4'>
        <Link
          href='/me/crowdfunding'
          className='inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-300'
        >
          <ArrowLeft className='h-4 w-4' />
          All campaigns
        </Link>

        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='flex items-center gap-4'>
            {campaign?.project?.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={campaign.project.logo}
                alt={campaign.project.title}
                className='h-14 w-14 flex-shrink-0 rounded-xl object-cover ring-1 ring-zinc-800'
              />
            )}
            <div className='min-w-0'>
              <h1 className='truncate text-2xl font-bold tracking-tight text-white'>
                {campaign?.project?.title ?? 'Campaign'}
              </h1>
              <div className='mt-1.5'>
                <Badge variant='outline' className={cn('text-xs', pill.cls)}>
                  {pill.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* One stat row */}
          <div className='flex items-center gap-6 sm:gap-8'>
            <Stat
              label={`Raised of $${goal.toLocaleString()}`}
              value={`$${raised.toLocaleString()} (${pct}%)`}
            />
            <Stat label='Backers' value={String(backers)} />
            <Stat label='Milestones' value={String(milestoneCount)} />
          </div>
        </div>
      </div>

      {/* Sub-tab nav */}
      <nav className='mb-8 flex gap-1 border-b border-zinc-800/60'>
        {tabs.map(tab => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition',
                active
                  ? 'border-primary text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
