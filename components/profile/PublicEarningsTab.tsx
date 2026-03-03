'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Award,
  Users,
  Target,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  PublicEarningsResponse,
  EarningActivity,
  EarningSource,
} from '@/types/earnings';
import { getPublicEarnings } from '@/lib/api/earnings';
import EmptyState from '@/components/EmptyState';

interface PublicEarningsTabProps {
  username: string;
}

const SOURCE_CONFIG: Record<
  EarningSource,
  { label: string; icon: typeof Trophy; color: string }
> = {
  hackathons: { label: 'Hackathons', icon: Trophy, color: 'text-amber-400' },
  grants: { label: 'Grants', icon: Award, color: 'text-green-400' },
  crowdfunding: { label: 'Crowdfunding', icon: Users, color: 'text-blue-400' },
  bounties: { label: 'Bounties', icon: Target, color: 'text-purple-400' },
};

const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface EarningActivityItemProps {
  activity: EarningActivity;
}

const EarningActivityItem = ({
  activity,
}: EarningActivityItemProps): React.ReactElement => {
  const config = SOURCE_CONFIG[activity.source];
  const Icon = config.icon;

  return (
    <div className='flex items-start gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4'>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 ${config.color}`}
      >
        <Icon className='h-5 w-5' />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm text-white'>{activity.title}</p>
        <p className='mt-1 text-xs text-zinc-500'>
          {formatDistanceToNow(new Date(activity.occurredAt), {
            addSuffix: true,
          })}
        </p>
      </div>
      <div className='shrink-0 text-right'>
        <p className='text-primary text-sm font-bold'>
          {formatCurrency(activity.amount, activity.currency)}
        </p>
        <p className={`text-xs ${config.color}`}>{config.label}</p>
      </div>
    </div>
  );
};

const PublicEarningsTab = ({
  username,
}: PublicEarningsTabProps): React.ReactElement => {
  const [earnings, setEarnings] = useState<PublicEarningsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadEarnings = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPublicEarnings({ username });
        if (!controller.signal.aborted) {
          setEarnings(response.data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError('Unable to load earnings data');
          console.error('Failed to load earnings:', err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadEarnings();

    return () => {
      controller.abort();
    };
  }, [username]);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-500' />
      </div>
    );
  }

  if (error || !earnings) {
    return (
      <EmptyState
        type='compact'
        title='No Earnings Data'
        description={error || 'No earnings data available for this user yet.'}
        action={<></>}
      />
    );
  }

  const breakdown = earnings.breakdown ?? {
    hackathons: 0,
    grants: 0,
    crowdfunding: 0,
    bounties: 0,
  };

  const breakdownItems = Object.entries(breakdown)
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a) as [EarningSource, number][];

  return (
    <div className='space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6'>
      <div className='flex items-center gap-3'>
        <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800'>
          <TrendingUp className='text-primary h-6 w-6' />
        </div>
        <div>
          <p className='text-xs text-zinc-500'>Total Earned</p>
          <p className='text-2xl font-bold text-white'>
            {formatCurrency(earnings.summary?.totalEarned ?? 0)}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {breakdownItems.map(([source, amount]) => {
          const config = SOURCE_CONFIG[source];
          const Icon = config.icon;

          return (
            <div key={source} className='space-y-2'>
              <div className='flex items-center gap-2'>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 ${config.color}`}
                >
                  <Icon className='h-4 w-4' />
                </div>
                <span className='text-sm text-zinc-500'>{config.label}</span>
              </div>
              <p className='text-2xl font-bold text-white'>
                {formatCurrency(amount)}
              </p>
            </div>
          );
        })}
      </div>

      <div className='flex flex-wrap gap-4 text-xs text-zinc-500'>
        {breakdownItems.map(([source]) => {
          const config = SOURCE_CONFIG[source];
          return (
            <span key={source} className='flex items-center gap-2'>
              <i
                className={`inline-block h-2 w-2 rounded-full ${config.color.replace('text-', 'bg-')}`}
              />
              {config.label}
            </span>
          );
        })}
      </div>

      {(earnings.activities?.length ?? 0) > 0 && (
        <div className='space-y-4 border-t border-zinc-800 pt-6'>
          <h3 className='text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
            Verified Activity
          </h3>
          <div className='space-y-3'>
            {(earnings.activities ?? []).map((activity, index) => (
              <motion.div
                key={`${activity.source}-${activity.occurredAt}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <EarningActivityItem activity={activity} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicEarningsTab;
