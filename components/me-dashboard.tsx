'use client';

import Link from 'next/link';
import Image from 'next/image';
import { GetMeResponse } from '@/lib/api/types';
import { SectionCards } from '@/components/section-cards';
import { useAuthStatus } from '@/hooks/use-auth';
import { useMyCampaigns } from '@/features/crowdfunding';
import type { CrowdfundingCampaign } from '@/features/crowdfunding';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rocket, ArrowRight, Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-zinc-800 text-zinc-400' },
  SUBMITTED_FOR_REVIEW: {
    label: 'Under Review',
    color: 'bg-blue-900/50 text-blue-400',
  },
  REVIEW_APPROVED: {
    label: 'Ready to Launch',
    color: 'bg-emerald-900/50 text-emerald-400',
  },
  VOTING: { label: 'Voting', color: 'bg-purple-900/50 text-purple-400' },
  VOTE_PASSED: {
    label: 'Ready to Launch',
    color: 'bg-emerald-900/50 text-emerald-400',
  },
  FUNDING: { label: 'Live', color: 'bg-emerald-900/50 text-emerald-400' },
  COMPLETED: { label: 'Completed', color: 'bg-zinc-800 text-zinc-400' },
};

function ActiveCampaigns() {
  const { data, isLoading } = useMyCampaigns(1, 10);

  const campaigns: CrowdfundingCampaign[] = (data?.data ?? [])
    .filter(c => {
      const s = c.v2Status;
      return (
        s &&
        s !== 'DRAFT' &&
        s !== 'COMPLETED' &&
        s !== 'CANCELLED' &&
        s !== 'FAILED'
      );
    })
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[0, 1].map(i => (
          <div key={i} className='h-14 animate-pulse rounded-xl bg-zinc-900' />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className='flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 py-10 text-center'>
        <Rocket className='h-8 w-8 text-zinc-700' />
        <p className='text-sm text-zinc-600'>No active campaigns yet.</p>
        <Button asChild size='sm' className='bg-primary hover:bg-primary/90'>
          <Link href='/me/crowdfunding/new'>Start a campaign</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {campaigns.map(c => {
        const v2Status = c.v2Status;
        const statusCfg = v2Status ? STATUS_LABELS[v2Status] : null;
        const progress =
          c.fundingRaised != null && c.fundingGoal
            ? Math.min(100, Math.round((c.fundingRaised / c.fundingGoal) * 100))
            : null;

        return (
          <Link
            key={c.id}
            href={`/me/crowdfunding/${c.slug ?? c.id}`}
            className='flex items-center justify-between gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/70'
          >
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium text-white'>
                {c.project?.title ?? 'Untitled'}
              </p>
              {progress != null && (
                <div className='mt-1.5 flex items-center gap-2'>
                  <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800'>
                    <div
                      className='bg-primary h-full rounded-full transition-all'
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className='text-xs text-zinc-500 tabular-nums'>
                    {progress}%
                  </span>
                </div>
              )}
            </div>
            <div className='flex flex-shrink-0 items-center gap-2'>
              {statusCfg && (
                <Badge className={cn('border-0 text-xs', statusCfg.color)}>
                  {statusCfg.label}
                </Badge>
              )}
              <ArrowRight className='h-4 w-4 text-zinc-600' />
            </div>
          </Link>
        );
      })}
      <div className='pt-1'>
        <Link
          href='/me/crowdfunding'
          className='flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300'
        >
          View all campaigns
          <ArrowRight className='h-3 w-3' />
        </Link>
      </div>
    </div>
  );
}

export function MeDashboard() {
  const { user, isLoading } = useAuthStatus();
  const meData = user?.profile as GetMeResponse | undefined;

  if (isLoading) {
    return <div className='p-8 text-center'>Loading...</div>;
  }

  if (!meData) {
    return <div className='p-8 text-center'>Failed to load data</div>;
  }

  const meUser = meData.user;
  const stats = meData.stats;

  return (
    <div className='flex flex-1 flex-col gap-8 px-4 py-8 lg:px-8'>
      {/* Profile card */}
      <div className='flex items-center gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6'>
        <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-zinc-800'>
          {meUser?.image ? (
            <Image
              src={meUser.image}
              alt={meUser.name || 'Profile'}
              fill
              className='object-cover'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-2xl font-bold text-zinc-500'>
              {(meUser?.name || 'B').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <h2 className='text-lg font-semibold text-white'>
            {meUser?.name || 'Builder'}
          </h2>
          {meUser?.username && (
            <p className='text-sm text-zinc-500'>@{meUser.username}</p>
          )}
        </div>
        <div className='hidden flex-shrink-0 items-center gap-6 sm:flex'>
          <div className='text-center'>
            <p className='text-lg font-bold text-white tabular-nums'>
              {stats?.hackathons ?? 0}
            </p>
            <div className='mt-0.5 flex items-center gap-1 text-xs text-zinc-500'>
              <Trophy className='h-3 w-3' />
              Hackathons
            </div>
          </div>
          <div className='text-center'>
            <p className='text-lg font-bold text-white tabular-nums'>
              {stats?.followers ?? 0}
            </p>
            <div className='mt-0.5 flex items-center gap-1 text-xs text-zinc-500'>
              <Users className='h-3 w-3' />
              Followers
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <SectionCards stats={stats} />

      {/* Active campaigns */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-semibold text-zinc-300'>
            Active campaigns
          </h3>
          <Button
            asChild
            size='sm'
            variant='ghost'
            className='h-7 gap-1 text-xs text-zinc-500 hover:text-zinc-300'
          >
            <Link href='/me/crowdfunding/new'>
              <Rocket className='h-3.5 w-3.5' />
              New campaign
            </Link>
          </Button>
        </div>
        <ActiveCampaigns />
      </div>
    </div>
  );
}
