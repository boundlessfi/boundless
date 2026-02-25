'use client';

import { useEffect, useState } from 'react';
import { useAuthStatus } from '@/hooks/use-auth';
import { getUserEarnings, claimEarning } from '@/lib/api/user/earnings';
import { EarningsData, EarningActivity, EarningSourceBreakdown } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

const SOURCE_LABELS: Record<string, string> = {
  hackathon: 'Hackathons',
  grant: 'Grants',
  crowdfunding: 'Crowdfunding',
  bounty: 'Bounties',
};

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  claimable: 'bg-green-500/20 text-green-400 border-green-500/30',
  claimed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

function EarningsSkeleton() {
  return (
    <div className='space-y-6 px-4 py-6 lg:px-6'>
      <div>
        <Skeleton className='mb-2 h-8 w-48' />
        <Skeleton className='h-4 w-80' />
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className='rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-6'
          >
            <Skeleton className='mb-3 h-4 w-32' />
            <Skeleton className='mb-1 h-8 w-36' />
          </div>
        ))}
      </div>
      <div className='rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-6'>
        <Skeleton className='mb-4 h-6 w-40' />
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-6 w-28' />
            </div>
          ))}
        </div>
      </div>
      <div className='rounded-[12px] border border-[#2B2B2B] bg-[#1C1C1C] p-6'>
        <Skeleton className='mb-4 h-6 w-24' />
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className='flex items-center justify-between rounded-[8px] border border-[#2B2B2B] p-4'
            >
              <div className='flex items-start gap-3'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div>
                  <Skeleton className='mb-2 h-4 w-44' />
                  <Skeleton className='h-3 w-28' />
                </div>
              </div>
              <Skeleton className='h-8 w-16' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  currency,
  icon,
}: {
  title: string;
  value: number;
  currency: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className='rounded-[12px] border-[#2B2B2B] bg-[#1C1C1C]'>
      <CardContent className='p-6'>
        <div className='mb-3 flex items-center justify-between'>
          <p className='text-sm text-white/60'>{title}</p>
          {icon}
        </div>
        <p className='text-2xl font-bold text-white'>
          {currency} {value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

function BreakdownSection({ breakdown }: { breakdown: EarningSourceBreakdown[] }) {
  return (
    <Card className='rounded-[12px] border-[#2B2B2B] bg-[#1C1C1C]'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-base text-white'>
          <TrendingUp className='h-4 w-4' />
          Earnings by Source
        </CardTitle>
      </CardHeader>
      <CardContent>
        {breakdown.length === 0 ? (
          <p className='text-sm text-white/40'>No earnings recorded yet.</p>
        ) : (
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            {breakdown.map(item => (
              <div
                key={item.source}
                className='rounded-[8px] border border-[#2B2B2B] bg-[#111] p-4'
              >
                <p className='mb-1 text-xs text-white/50'>
                  {SOURCE_LABELS[item.source] ?? item.source}
                </p>
                <p className='text-lg font-semibold text-white'>
                  {item.currency} {item.totalEarned.toLocaleString()}
                </p>
                {item.pendingAmount > 0 && (
                  <p className='mt-1 text-xs text-yellow-400'>
                    {item.currency} {item.pendingAmount.toLocaleString()} pending
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityItem({
  activity,
  claimingId,
  onClaim,
}: {
  activity: EarningActivity;
  claimingId: string | null;
  onClaim: (id: string) => void;
}) {
  return (
    <div className='flex items-center justify-between rounded-[8px] border border-[#2B2B2B] bg-[#111] p-4'>
      <div className='flex min-w-0 items-start gap-3'>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-white/40'>
          <DollarSign className='h-4 w-4' />
        </div>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium leading-tight text-white'>
            {activity.title}
          </p>
          <p className='mt-0.5 text-xs text-white/50'>
            {SOURCE_LABELS[activity.source] ?? activity.source} &middot;{' '}
            {new Date(activity.date).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className='ml-4 flex flex-shrink-0 items-center gap-3'>
        <div className='text-right'>
          <p className='text-sm font-semibold text-white'>
            {activity.currency} {activity.amount.toLocaleString()}
          </p>
          <Badge
            variant='outline'
            className={`mt-0.5 text-xs ${STATUS_CLASSES[activity.status] ?? ''}`}
          >
            {activity.status}
          </Badge>
        </div>
        {activity.status === 'claimable' && (
          <Button
            size='sm'
            disabled={claimingId === activity.id}
            onClick={() => onClaim(activity.id)}
          >
            {claimingId === activity.id ? 'Claiming…' : 'Claim'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function EarningsPage() {
  const { user: authUser, isLoading } = useAuthStatus();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchEarnings = async () => {
    try {
      const response = await getUserEarnings();
      setEarnings(response.data);
    } catch {
      setError('Failed to load earnings data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !authUser) {
      setLoading(false);
      return;
    }
    if (authUser) {
      fetchEarnings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, isLoading]);

  const handleClaim = async (activityId: string) => {
    setClaimingId(activityId);
    try {
      await claimEarning(activityId);
      await fetchEarnings();
    } finally {
      setClaimingId(null);
    }
  };

  if (isLoading || loading) {
    return <EarningsSkeleton />;
  }

  if (error || !earnings) {
    return (
      <div className='px-4 py-6 lg:px-6'>
        <Card className='rounded-[12px] border-[#2B2B2B] bg-[#1C1C1C]'>
          <CardContent className='py-12 text-center'>
            <p className='text-white/60'>{error ?? 'Failed to load earnings.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6 px-4 py-6 lg:px-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-white'>Earnings</h1>
        <p className='mt-1 text-white/60'>
          Track and claim your income from hackathons, grants, crowdfunding, and bounties.
        </p>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <SummaryCard
          title='Total Earned'
          value={earnings.totalEarned}
          currency={earnings.currency}
          icon={<DollarSign className='h-5 w-5 text-white/30' />}
        />
        <SummaryCard
          title='Pending Withdrawal'
          value={earnings.pendingWithdrawal}
          currency={earnings.currency}
          icon={<Clock className='h-5 w-5 text-yellow-400/60' />}
        />
        <SummaryCard
          title='Completed Withdrawal'
          value={earnings.completedWithdrawal}
          currency={earnings.currency}
          icon={<CheckCircle2 className='h-5 w-5 text-green-400/60' />}
        />
      </div>

      {/* Breakdown by source */}
      <BreakdownSection breakdown={earnings.breakdown} />

      {/* Activity Feed */}
      <Card className='rounded-[12px] border-[#2B2B2B] bg-[#1C1C1C]'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base text-white'>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.activities.length === 0 ? (
            <p className='text-sm text-white/40'>No earning activities found.</p>
          ) : (
            <div className='space-y-3'>
              {earnings.activities.map(activity => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  claimingId={claimingId}
                  onClaim={handleClaim}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
