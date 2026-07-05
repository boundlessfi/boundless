'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Info, Loader2, Lock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import EmptyState from '@/components/EmptyState';
import { DueCountdown } from '@/components/bounties/DueCountdown';
import { bountyStatusClass } from '@/components/bounties/statusClass';
import {
  computeBountyModeLabel,
  computeBountyModeDescription,
} from '@/components/organization/bounties/new/tabs/schemas/modeSchema';
import {
  useBountyOverview,
  type BountyOperateOverview,
} from '@/features/bounties';
import { ordinal } from '@/lib/utils';
import BountySubmissionsPanel from './BountySubmissionsPanel';
import BountyPayoutPanel from './BountyPayoutPanel';

export default function BountyManagementDashboard() {
  const params = useParams<{ id: string; bountyId: string }>();
  const organizationId = params?.id ?? '';
  const bountyId = params?.bountyId ?? '';

  // Winner staging lives here (above the tab boundary) so it survives tab
  // switches and is reachable by the Payout tab (#633).
  const [stagedWinners, setStagedWinners] = useState<Set<string>>(new Set());
  const toggleStagedWinner = (id: string) =>
    setStagedWinners(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const {
    data: overview,
    isLoading,
    error,
  } = useBountyOverview(organizationId, bountyId);

  if (isLoading) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-zinc-500' />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className='py-20'>
        <EmptyState
          title="Couldn't load this bounty"
          description='It may not exist, or you may not have access to manage it.'
          type='compact'
        />
        <div className='mt-4 text-center'>
          <Link
            href={`/organizations/${organizationId}/bounties`}
            className='text-primary text-sm hover:underline'
          >
            Back to bounties
          </Link>
        </div>
      </div>
    );
  }

  const isApplication =
    overview.entryType === 'APPLICATION_LIGHT' ||
    overview.entryType === 'APPLICATION_FULL';
  const modeLabel =
    overview.entryType && overview.claimType
      ? computeBountyModeLabel(overview.entryType, overview.claimType)
      : 'Bounty';
  const modeDescription =
    overview.entryType && overview.claimType
      ? computeBountyModeDescription(overview.entryType, overview.claimType)
      : null;
  const statusClass = bountyStatusClass(overview.status);

  return (
    <div>
      <Link
        href={`/organizations/${organizationId}/bounties`}
        className='mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white'
      >
        <ArrowLeft className='h-4 w-4' />
        Back to bounties
      </Link>

      {/* Header */}
      <div className='mb-6'>
        <div className='mb-3 flex flex-wrap items-center gap-2'>
          <Badge
            variant='outline'
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusClass}`}
          >
            {overview.status.replace(/_/g, ' ')}
          </Badge>
          {modeDescription ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant='outline'
                  className='flex cursor-help items-center gap-1 rounded-full border-zinc-700 bg-zinc-800/60 px-3 py-1 text-xs font-medium text-zinc-200'
                >
                  {modeLabel}
                  <Info className='h-3 w-3 text-zinc-400' />
                </Badge>
              </TooltipTrigger>
              <TooltipContent className='max-w-xs text-xs leading-relaxed'>
                {modeDescription}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Badge
              variant='outline'
              className='rounded-full border-zinc-700 bg-zinc-800/60 px-3 py-1 text-xs font-medium text-zinc-200'
            >
              {modeLabel}
            </Badge>
          )}
        </div>
        <h1 className='text-2xl font-bold tracking-tight text-white sm:text-3xl'>
          {overview.title}
        </h1>
      </div>

      <Tabs defaultValue='overview'>
        <TabsList className='mb-6 flex flex-wrap'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          {isApplication && (
            <TabsTrigger value='applications'>Applications</TabsTrigger>
          )}
          <TabsTrigger value='submissions'>Submissions</TabsTrigger>
          <TabsTrigger value='payout'>Payout &amp; Winners</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>

        <TabsContent value='overview'>
          <OverviewPanel overview={overview} />
        </TabsContent>
        {isApplication && (
          <TabsContent value='applications'>
            <TabPlaceholder title='Applications review' issue='#631' />
          </TabsContent>
        )}
        <TabsContent value='submissions'>
          <BountySubmissionsPanel
            organizationId={organizationId}
            bountyId={bountyId}
            rewardCurrency={overview.rewardCurrency}
            staged={stagedWinners}
            onToggleStage={toggleStagedWinner}
          />
        </TabsContent>
        <TabsContent value='payout'>
          <BountyPayoutPanel
            organizationId={organizationId}
            bountyId={bountyId}
            overview={overview}
            staged={stagedWinners}
          />
        </TabsContent>
        <TabsContent value='settings'>
          <TabPlaceholder title='Settings & cancel / refund' issue='#634' />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewPanel({ overview }: { overview: BountyOperateOverview }) {
  const { intake } = overview;
  return (
    <div className='space-y-6'>
      {/* Intake stats */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <StatCard
          label='Applications'
          total={intake.applications.total}
          breakdown={[
            ['Submitted', intake.applications.submitted],
            ['Shortlisted', intake.applications.shortlisted],
            ['Selected', intake.applications.selected],
            ['Declined', intake.applications.declined],
            ['Withdrawn', intake.applications.withdrawn],
          ]}
        />
        <StatCard
          label='Submissions'
          total={intake.submissions.total}
          breakdown={[
            ['Pending', intake.submissions.pending],
            ['Accepted', intake.submissions.accepted],
            ['Rejected', intake.submissions.rejected],
            ['Disputed', intake.submissions.disputed],
          ]}
        />
        <StatCard
          label='Contributions'
          total={intake.contributions.count}
          breakdown={[
            [
              'Total',
              `${Number(intake.contributions.total).toLocaleString()} ${overview.rewardCurrency}`,
            ],
          ]}
        />
      </div>

      {/* Facts */}
      <div className='grid gap-4 lg:grid-cols-2'>
        <div className='rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5'>
          <h3 className='mb-3 text-sm font-semibold text-white'>Details</h3>
          <dl className='space-y-2 text-sm'>
            <Row
              label='Reward pool'
              value={`${overview.rewardAmount.toLocaleString()} ${overview.rewardCurrency}`}
            />
            {overview.submissionDeadline && (
              <div className='flex items-center justify-between gap-3'>
                <dt className='text-zinc-400'>Submission deadline</dt>
                <dd className='text-right'>
                  <DueCountdown
                    deadline={overview.submissionDeadline}
                    className='flex items-center gap-1.5 text-xs font-medium text-zinc-200'
                  />
                </dd>
              </div>
            )}
            {overview.applicationWindowCloseAt && (
              <div className='flex items-center justify-between gap-3'>
                <dt className='text-zinc-400'>Applications close</dt>
                <dd className='text-right'>
                  <DueCountdown
                    deadline={overview.applicationWindowCloseAt}
                    className='flex items-center gap-1.5 text-xs font-medium text-zinc-200'
                  />
                </dd>
              </div>
            )}
            {overview.maxApplicants != null && (
              <Row
                label='Max applicants'
                value={String(overview.maxApplicants)}
              />
            )}
            {overview.shortlistSize != null && (
              <Row
                label='Shortlist size'
                value={String(overview.shortlistSize)}
              />
            )}
            {overview.escrowEventId && (
              <Row label='Escrow event' value={overview.escrowEventId} mono />
            )}
          </dl>
        </div>

        {/* Prize tiers */}
        <div className='rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5'>
          <h3 className='mb-3 text-sm font-semibold text-white'>Prize tiers</h3>
          {overview.prizeTiers.length === 0 ? (
            <p className='text-sm text-zinc-500'>No prize tiers configured.</p>
          ) : (
            <div className='space-y-2'>
              {overview.prizeTiers.map(tier => (
                <div
                  key={tier.position}
                  className='flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-2.5'
                >
                  <span className='text-sm font-medium text-zinc-300'>
                    {ordinal(tier.position)} place
                  </span>
                  <span className='text-primary text-sm font-semibold'>
                    {Number(tier.amount).toLocaleString()}{' '}
                    {overview.rewardCurrency}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  total,
  breakdown,
}: {
  label: string;
  total: number;
  breakdown: Array<[string, string | number]>;
}) {
  return (
    <div className='rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5'>
      <p className='text-xs font-medium text-zinc-500'>{label}</p>
      <p className='mt-1 text-2xl font-bold text-white'>{total}</p>
      <dl className='mt-3 space-y-1 border-t border-zinc-800 pt-3'>
        {breakdown.map(([k, v]) => (
          <div key={k} className='flex items-center justify-between text-xs'>
            <dt className='text-zinc-500'>{k}</dt>
            <dd className='font-medium text-zinc-300'>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <dt className='text-zinc-400'>{label}</dt>
      <dd
        className={`max-w-[60%] truncate text-right font-medium text-white ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function TabPlaceholder({ title, issue }: { title: string; issue: string }) {
  return (
    <div className='rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 py-16 text-center'>
      <Lock className='mx-auto mb-3 h-5 w-5 text-zinc-600' />
      <p className='text-sm font-medium text-zinc-300'>{title}</p>
      <p className='mt-1 text-xs text-zinc-600'>Coming soon ({issue}).</p>
    </div>
  );
}
