'use client';

import { useParams } from 'next/navigation';
import { Loader2, AlertCircle, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import { useBounty } from '@/hooks/use-bounty';
import type { BountyStatus, BountyEntryType, BountyClaimType } from '@/lib/api/bounties';

const ENTRY_TYPE_LABELS: Record<BountyEntryType, string> = {
  OPEN: 'Open — anyone can submit',
  APPLICATION_REVIEW: 'Application with review',
  APPLICATION_DIRECT: 'Application direct select',
};

const CLAIM_TYPE_LABELS: Record<BountyClaimType, string> = {
  SINGLE_CLAIM: 'Single winner',
  COMPETITION: 'Competition (multiple winners)',
};

function SettingRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className='flex items-start justify-between gap-4 py-4 border-b border-zinc-800/50 last:border-0'>
      <p className='text-sm text-zinc-500 shrink-0 w-40'>{label}</p>
      <p className='text-sm text-white text-right'>{value}</p>
    </div>
  );
}

export default function SettingsPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const bountyId = params.bountyId as string;

  const { bounty, loading, error } = useBounty({ organizationId, bountyId });

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='min-h-screen bg-black'>
        {/* Header */}
        <div className='border-b border-gray-900 p-4'>
          <div className='mx-auto max-w-7xl flex items-center gap-3'>
            <Settings className='h-6 w-6 text-zinc-500' />
            <div>
              <h1 className='text-3xl font-light tracking-tight text-white sm:text-4xl'>
                Settings
              </h1>
              <p className='mt-1 text-sm text-gray-400'>Bounty configuration</p>
            </div>
          </div>
        </div>

        <div className='mx-auto max-w-3xl px-6 py-12 sm:px-8'>
          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
            </div>
          ) : error || !bounty ? (
            <Alert
              variant='destructive'
              className='border-red-900/20 bg-red-950/20'
            >
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error || 'Bounty not found'}</AlertDescription>
            </Alert>
          ) : (
            <div className='space-y-8'>
              {/* Core settings */}
              <section className='rounded-xl border border-zinc-800 bg-zinc-900/30 px-5'>
                <h2 className='py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500'>
                  Core
                </h2>
                <SettingRow label='Title' value={bounty.title} />
                <SettingRow label='Status' value={bounty.status} />
                <SettingRow label='Slug' value={`/${bounty.slug}`} />
              </section>

              {/* Mode settings */}
              <section className='rounded-xl border border-zinc-800 bg-zinc-900/30 px-5'>
                <h2 className='py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500'>
                  Mode
                </h2>
                <SettingRow
                  label='Entry type'
                  value={ENTRY_TYPE_LABELS[bounty.entryType]}
                />
                <SettingRow
                  label='Claim type'
                  value={CLAIM_TYPE_LABELS[bounty.claimType]}
                />
                <SettingRow
                  label='Max winners'
                  value={String(bounty.maxWinners)}
                />
              </section>

              {/* Reward settings */}
              <section className='rounded-xl border border-zinc-800 bg-zinc-900/30 px-5'>
                <h2 className='py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500'>
                  Reward
                </h2>
                <SettingRow
                  label='Amount'
                  value={`${bounty.rewardAmount} ${bounty.rewardToken}`}
                />
                {bounty.escrowAddress && (
                  <SettingRow
                    label='Escrow'
                    value={
                      <span className='font-mono text-xs break-all'>
                        {bounty.escrowAddress}
                      </span>
                    }
                  />
                )}
              </section>

              {/* Timeline */}
              <section className='rounded-xl border border-zinc-800 bg-zinc-900/30 px-5'>
                <h2 className='py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500'>
                  Timeline
                </h2>
                <SettingRow
                  label='Application deadline'
                  value={
                    bounty.applicationDeadline
                      ? new Date(bounty.applicationDeadline).toLocaleString()
                      : '—'
                  }
                />
                <SettingRow
                  label='Submission deadline'
                  value={
                    bounty.submissionDeadline
                      ? new Date(bounty.submissionDeadline).toLocaleString()
                      : '—'
                  }
                />
                <SettingRow
                  label='Created'
                  value={new Date(bounty.createdAt).toLocaleString()}
                />
              </section>

              <p className='text-xs text-zinc-600 text-center'>
                To modify these settings, use the bounty configure page.
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
