'use client';

import { use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { useCampaign } from '@/features/crowdfunding';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { campaignStatus, TONE_PILL } from '@/lib/crowdfunding/status';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

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

  const milestones = campaign?.milestones ?? [];
  const completedMilestones = milestones.filter(m =>
    Boolean(m.claimedAt)
  ).length;
  const totalMilestones = milestones.length;

  const raised = campaign?.fundingRaised ?? 0;
  const goal = campaign?.fundingGoal ?? 0;
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const fullyFunded = goal > 0 && raised >= goal;

  const pill =
    fullyFunded && campaign?.v2Status === 'FUNDING'
      ? { label: 'Fully Funded', tone: 'success' as const }
      : campaignStatus(campaign?.v2Status);

  const backers = campaign?.contributors?.length ?? 0;

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
                <Badge
                  variant='outline'
                  className={cn('text-xs', TONE_PILL[pill.tone])}
                >
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
            <Stat label='Supporters' value={String(backers)} />
            {totalMilestones > 0 && (
              <Stat
                label='Milestones done'
                value={`${completedMilestones} / ${totalMilestones}`}
              />
            )}
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
