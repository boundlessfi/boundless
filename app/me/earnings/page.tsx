'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconCurrencyDollar,
  IconClock,
  IconCheck,
  IconTrophy,
  IconBriefcase,
  IconUsers,
  IconTarget,
} from '@tabler/icons-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { reportError } from '@/lib/error-reporting';
import {
  getUserEarnings,
  EarningsData,
  EarningActivity,
} from '@/lib/api/user/earnings';
import { toast } from 'sonner';

/**
 * Interface for SummaryCard props.
 */
interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

/**
 * SummaryCard component for displaying high-level stats.
 */
const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  description,
}) => (
  <Card>
    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
      <CardTitle className='text-sm font-medium'>{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className='text-2xl font-bold'>{value}</div>
      <p className='text-muted-foreground mt-1 text-xs'>{description}</p>
    </CardContent>
  </Card>
);

/**
 * Interface for BreakdownItem props.
 */
interface BreakdownItemProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

/**
 * BreakdownItem component for showing source-specific earnings.
 */
const BreakdownItem: React.FC<BreakdownItemProps> = ({
  label,
  value,
  icon,
}) => (
  <div className='group flex items-center justify-between'>
    <div className='flex items-center gap-3'>
      <div className='bg-muted group-hover:bg-primary/10 rounded-md p-2 transition-colors'>
        {icon}
      </div>
      <span className='font-medium'>{label}</span>
    </div>
    <span className='font-semibold'>${(value ?? 0).toLocaleString()}</span>
  </div>
);

/**
 * Interface for ActivityItem props.
 */
interface ActivityItemProps {
  activity: EarningActivity;
}

/**
 * ActivityItem component for displaying a single reward entry.
 */
const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => (
  <div className='flex items-center justify-between border-b pb-4 last:border-0 last:pb-0'>
    <div className='space-y-1'>
      <div className='font-semibold'>{activity.title}</div>
      <div className='text-muted-foreground flex items-center gap-3 text-sm'>
        <span className='capitalize'>{activity.source}</span>
        <span>•</span>
        <span>{new Date(activity.occurredAt).toLocaleDateString()}</span>
      </div>
    </div>
    <div className='text-right'>
      <p className='text-lg font-bold'>
        ${(activity.amount ?? 0).toLocaleString()}
      </p>
      {activity.currency && (
        <p className='text-muted-foreground text-xs'>{activity.currency}</p>
      )}
    </div>
  </div>
);

/**
 * EarningsSkeleton component for loading states.
 */
const EarningsSkeleton: React.FC = () => (
  <div className='container mx-auto space-y-8 px-6 py-8'>
    <div className='space-y-2'>
      <Skeleton className='h-10 w-[250px]' />
      <Skeleton className='h-6 w-[350px]' />
    </div>
    <div className='grid gap-4 md:grid-cols-3'>
      <Skeleton className='h-[120px] rounded-xl' />
      <Skeleton className='h-[120px] rounded-xl' />
      <Skeleton className='h-[120px] rounded-xl' />
    </div>
    <div className='grid gap-8 md:grid-cols-7'>
      <Skeleton className='h-[400px] rounded-xl md:col-span-3' />
      <Skeleton className='h-[400px] rounded-xl md:col-span-4' />
    </div>
  </div>
);

/**
 * EarningsPage component for managing and tracking user rewards.
 */
const EarningsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EarningsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getUserEarnings();
        if (res.success) {
          setData(res.data);
        } else {
          toast.error(res.error || 'Failed to load earnings data');
        }
      } catch (error) {
        reportError(error, { context: 'me-earnings-fetch' });
        toast.error('Failed to load earnings data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <EarningsSkeleton />;
  }

  if (!data) {
    return (
      <div className='container mx-auto py-8'>
        <p className='text-muted-foreground py-8 text-center'>
          No earnings data found.
        </p>
      </div>
    );
  }

  return (
    <div className='container mx-auto space-y-8 px-6 py-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col gap-2'
      >
        <h1 className='text-3xl font-bold tracking-tight'>
          Earnings Dashboard
        </h1>
        <p className='text-muted-foreground text-lg'>
          Manage and track your rewards across the platform.
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <SummaryCard
          title='Total Earned'
          value={`$${data.summary.totalEarned.toLocaleString()}`}
          icon={<IconCurrencyDollar className='text-primary h-5 w-5' />}
          description='Lifetime earnings'
        />
        <SummaryCard
          title='Pending Withdrawal'
          value={`$${data.summary.pendingWithdrawal.toLocaleString()}`}
          icon={<IconClock className='h-5 w-5 text-yellow-500' />}
          description='Awaiting processing'
        />
        <SummaryCard
          title='Completed Withdrawal'
          value={`$${data.summary.completedWithdrawal.toLocaleString()}`}
          icon={<IconCheck className='h-5 w-5 text-green-500' />}
          description='Successfully cashed out'
        />
      </div>

      <div className='grid gap-8 md:grid-cols-7'>
        {/* Breakdown */}
        <Card className='md:col-span-3'>
          <CardHeader>
            <CardTitle>Source Breakdown</CardTitle>
            <CardDescription>
              Earnings categorized by activity type
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <BreakdownItem
              label='Hackathons'
              value={data.breakdown.hackathons}
              icon={<IconTrophy className='h-4 w-4' />}
            />
            <BreakdownItem
              label='Grants'
              value={data.breakdown.grants}
              icon={<IconTarget className='h-4 w-4' />}
            />
            <BreakdownItem
              label='Crowdfunding'
              value={data.breakdown.crowdfunding}
              icon={<IconUsers className='h-4 w-4' />}
            />
            <BreakdownItem
              label='Bounties'
              value={data.breakdown.bounties}
              icon={<IconBriefcase className='h-4 w-4' />}
            />
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className='md:col-span-4'>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest wins and rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {data.activities.length === 0 ? (
                <p className='text-muted-foreground py-8 text-center'>
                  No recent activity found.
                </p>
              ) : (
                data.activities.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EarningsPage;
