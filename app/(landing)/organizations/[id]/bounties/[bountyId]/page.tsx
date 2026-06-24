'use client';

import { useParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  Calendar,
  TrendingUp,
  Check,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import { useBounty } from '@/hooks/use-bounty';
import { Badge } from '@/components/ui/badge';
import type { BountyStatus } from '@/lib/api/bounties';

const STATUS_LABELS: Record<BountyStatus, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  DECIDING: 'Deciding',
  PAYING_OUT: 'Paying Out',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
};

const STATUS_COLORS: Record<BountyStatus, string> = {
  DRAFT: 'bg-zinc-700/40 text-zinc-300',
  ACTIVE: 'bg-green-500/20 text-green-400',
  DECIDING: 'bg-yellow-500/20 text-yellow-400',
  PAYING_OUT: 'bg-blue-500/20 text-blue-400',
  COMPLETED: 'bg-purple-500/20 text-purple-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
  DISPUTED: 'bg-orange-500/20 text-orange-400',
};

const PHASE_STEPS = [
  { key: 'ACTIVE', label: 'Operate', description: 'Bounty is live and accepting work' },
  { key: 'DECIDING', label: 'Decide', description: 'Review submissions and select winners' },
  { key: 'PAYING_OUT', label: 'Payout', description: 'Distribute rewards on-chain' },
  { key: 'COMPLETED', label: 'Wrap', description: 'Announce results and archive bounty' },
] as const;

const STATUS_ORDER: BountyStatus[] = [
  'ACTIVE',
  'DECIDING',
  'PAYING_OUT',
  'COMPLETED',
];

function getPhaseStatus(
  phaseKey: string,
  currentStatus: BountyStatus
): 'completed' | 'active' | 'pending' {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus as BountyStatus);
  const phaseIdx = STATUS_ORDER.indexOf(phaseKey as BountyStatus);
  if (phaseIdx < currentIdx) return 'completed';
  if (phaseIdx === currentIdx) return 'active';
  return 'pending';
}

export default function BountyOverviewPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const bountyId = params.bountyId as string;

  const { bounty, loading, error } = useBounty({ organizationId, bountyId });

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
          <p className='text-sm text-gray-500'>Loading bounty...</p>
        </div>
      </div>
    );
  }

  if (error || !bounty) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black p-6'>
        <Alert
          variant='destructive'
          className='max-w-md border-red-900/20 bg-red-950/20'
        >
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Unable to load bounty</AlertTitle>
          <AlertDescription className='text-sm text-gray-400'>
            {error || 'Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='min-h-screen bg-black'>
        {/* Header */}
        <div className='border-b border-gray-900 p-4'>
          <div className='mx-auto flex max-w-7xl items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <h1 className='text-3xl font-light tracking-tight text-white sm:text-4xl'>
                {bounty.title}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[bounty.status]}`}
              >
                {STATUS_LABELS[bounty.status]}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12'>
          {/* Stats */}
          <section className='mb-16'>
            <div className='mb-8 flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-gray-500' />
              <h2 className='text-sm font-medium tracking-wider text-gray-500 uppercase'>
                Overview
              </h2>
            </div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
                <div className='flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-2'>
                  <DollarSign className='h-3.5 w-3.5' />
                  Reward
                </div>
                <p className='text-2xl font-light text-white'>
                  {bounty.rewardAmount} {bounty.rewardToken}
                </p>
              </div>
              <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
                <div className='flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-2'>
                  <Clock className='h-3.5 w-3.5' />
                  Type
                </div>
                <p className='text-2xl font-light text-white capitalize'>
                  {bounty.entryType.replace(/_/g, ' ').toLowerCase()}
                </p>
                <p className='text-xs text-zinc-500 mt-1'>
                  {bounty.claimType === 'SINGLE_CLAIM'
                    ? '1 winner'
                    : 'Up to ' + bounty.maxWinners + ' winners'}
                </p>
              </div>
              <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'>
                <div className='flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-2'>
                  <Calendar className='h-3.5 w-3.5' />
                  Deadline
                </div>
                <p className='text-2xl font-light text-white'>
                  {bounty.submissionDeadline
                    ? new Date(bounty.submissionDeadline).toLocaleDateString()
                    : '—'}
                </p>
              </div>
            </div>
          </section>

          {/* Phase Timeline */}
          <section>
            <div className='mb-8 flex items-center gap-2 border-t border-gray-900 pt-16'>
              <Calendar className='h-4 w-4 text-gray-500' />
              <h2 className='text-sm font-medium tracking-wider text-gray-500 uppercase'>
                Lifecycle
              </h2>
            </div>

            <div className='relative space-y-0'>
              {PHASE_STEPS.map((phase, index) => {
                const status =
                  bounty.status === 'DRAFT' ||
                  bounty.status === 'CANCELLED' ||
                  bounty.status === 'DISPUTED'
                    ? 'pending'
                    : getPhaseStatus(phase.key, bounty.status);
                const isLast = index === PHASE_STEPS.length - 1;

                return (
                  <div
                    key={phase.key}
                    className={`relative flex items-start gap-3 sm:gap-4 ${!isLast ? 'pb-6' : ''}`}
                  >
                    <div className='relative flex flex-col items-center'>
                      {status === 'active' ? (
                        <div className='bg-active-bg z-10 flex shrink-0 items-center justify-center rounded-full p-1'>
                          <div className='bg-primary z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full' />
                        </div>
                      ) : status === 'completed' ? (
                        <div className='z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10'>
                          <Check className='h-3 w-3 text-green-500' />
                        </div>
                      ) : (
                        <div className='bg-inactive z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#1C1C1C] opacity-50' />
                      )}
                      {!isLast && (
                        <div className='absolute top-6 left-1/2 h-6 w-0.5 -translate-x-1/2'>
                          <div className='h-full border-l-2 border-dashed border-gray-600' />
                        </div>
                      )}
                    </div>
                    <div className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                      <div className='min-w-0 flex-1'>
                        <h3 className='mb-1 text-sm font-medium text-white sm:text-base'>
                          {phase.label}
                        </h3>
                        <p
                          className={`text-xs sm:text-sm ${
                            status === 'completed'
                              ? 'text-gray-400'
                              : status === 'active'
                                ? 'text-white/60'
                                : 'text-white/40'
                          }`}
                        >
                          {phase.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
