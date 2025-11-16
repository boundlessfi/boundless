'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Trophy,
  HandCoins,
  UserPlus,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Line, LineChart, XAxis } from 'recharts';
import {
  useOrganizationStats,
  useOrganization,
  useOrganizationProfileCompletion,
} from '@/lib/providers';
import { useOrganizationAnalytics } from '@/hooks/use-organization-analytics';
import { Progress } from '@/components/ui/progress';
import LoadingSpinner from '@/components/LoadingSpinner';

const OrganizationAnalytics = () => {
  const { activeOrg, isLoading } = useOrganization();
  const stats = useOrganizationStats();
  const { isComplete, percentage, missingFields } =
    useOrganizationProfileCompletion();
  const { analytics, isLoading: isLoadingAnalytics } = useOrganizationAnalytics(
    {
      organizationId: activeOrg?._id,
      enabled: !!activeOrg?._id,
    }
  );

  const chartData = useMemo(() => {
    if (!analytics?.timeSeries?.hackathons) return [];
    return analytics.timeSeries.hackathons.map(item => ({
      month: item.month,
      hackathons: item.count,
    }));
  }, [analytics]);

  const chartConfig = {
    hackathons: {
      label: 'Hackathons',
      color: '#a7f950',
    },
  } satisfies ChartConfig;

  const trends = useMemo(() => {
    if (!analytics?.trends) {
      return {
        members: { change: 0, isPositive: false },
        hackathons: { change: 0, isPositive: false },
        grants: { change: 0, isPositive: false },
      };
    }
    return {
      members: {
        change: analytics.trends.members.change,
        isPositive: analytics.trends.members.isPositive,
      },
      hackathons: {
        change: analytics.trends.hackathons.change,
        isPositive: analytics.trends.hackathons.isPositive,
      },
      grants: {
        change: analytics.trends.grants.change,
        isPositive: analytics.trends.grants.isPositive,
      },
    };
  }, [analytics]);

  if (isLoading || !activeOrg || isLoadingAnalytics) {
    return (
      <div className='flex h-[70vh] items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <LoadingSpinner size='lg' color='primary' variant='spinner' />
          <p className='text-sm text-zinc-500'>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Members',
      value: stats.memberCount,
      icon: Users,
      href: `/organizations/${activeOrg._id}/settings?tab=members`,
      trend: trends.members,
    },
    {
      title: 'Hackathons',
      value: stats.hackathonCount,
      icon: Trophy,
      href: `/organizations/${activeOrg._id}/hackathons`,
      trend: trends.hackathons,
    },
    {
      title: 'Grants',
      value: stats.grantCount,
      icon: HandCoins,
      href: `/organizations/${activeOrg._id}/grants`,
      trend: trends.grants,
    },
    {
      title: 'Invites',
      value: stats.pendingInviteCount,
      icon: UserPlus,
      href: `/organizations/${activeOrg._id}/settings?tab=members`,
    },
  ];

  return (
    <div className='min-h-screen bg-black'>
      <div className='mx-auto max-w-6xl px-6 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='mb-1 text-2xl font-medium text-white'>Analytics</h1>
          <p className='text-sm text-zinc-500'>
            Track your organization's performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const hasTrend = stat.trend !== undefined;
            const TrendIcon = stat.trend?.isPositive
              ? TrendingUp
              : TrendingDown;

            return (
              <Link key={index} href={stat.href}>
                <div className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/50'>
                  <div className='mb-4 flex items-center justify-between'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800'>
                      <Icon className='h-5 w-5 text-zinc-400' />
                    </div>
                    {hasTrend && (
                      <div
                        className={`flex items-center gap-1 text-xs font-medium ${
                          stat.trend.isPositive
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        <TrendIcon className='h-3.5 w-3.5' />
                        {stat.trend.change > 0 ? '+' : ''}
                        {stat.trend.change}
                      </div>
                    )}
                  </div>
                  <div className='mb-1 text-3xl font-semibold text-white'>
                    {stat.value}
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-zinc-500'>{stat.title}</span>
                    <ArrowRight className='h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-zinc-400' />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Profile Completion - Only show if incomplete */}
        {!isComplete && (
          <div className='mb-6 rounded-xl border border-amber-900/50 bg-amber-500/5 p-5'>
            <div className='mb-4 flex items-start justify-between'>
              <div className='flex items-start gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10'>
                  <AlertCircle className='h-5 w-5 text-amber-500' />
                </div>
                <div>
                  <h3 className='mb-1 font-medium text-white'>
                    Complete Your Profile
                  </h3>
                  <p className='text-sm text-zinc-400'>
                    Add missing information to unlock all features
                  </p>
                </div>
              </div>
              <span className='text-sm font-medium text-amber-500'>
                {percentage}%
              </span>
            </div>

            <Progress value={percentage} className='mb-4 h-2' />

            {missingFields.length > 0 && (
              <div className='mb-4 flex flex-wrap gap-2'>
                {missingFields.map((field, idx) => (
                  <span
                    key={idx}
                    className='rounded-lg bg-zinc-900/50 px-2.5 py-1 text-xs text-zinc-400'
                  >
                    {field}
                  </span>
                ))}
              </div>
            )}

            <Link
              href={`/organizations/${activeOrg._id}/settings?tab=profile`}
              className='inline-flex items-center gap-2 text-sm font-medium text-amber-500 transition-colors hover:text-amber-400'
            >
              Complete now
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
        )}

        {/* Chart */}
        <div className='mb-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6'>
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <h2 className='mb-1 text-lg font-medium text-white'>
                Hackathon Activity
              </h2>
              <p className='text-sm text-zinc-500'>
                Hackathons created over time
              </p>
            </div>
            <Link
              href={`/organizations/${activeOrg._id}/hackathons`}
              className='flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white'
            >
              View all
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>

          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className='h-[280px] w-full'>
              <LineChart
                data={chartData}
                margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
              >
                <XAxis
                  dataKey='month'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12, fill: '#71717a' }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent className='rounded-lg border-zinc-800 bg-zinc-900' />
                  }
                />
                <Line
                  dataKey='hackathons'
                  type='monotone'
                  stroke='var(--color-hackathons)'
                  strokeWidth={2}
                  dot={{ fill: '#a7f950', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className='flex h-[280px] flex-col items-center justify-center text-zinc-500'>
              <Trophy className='mb-3 h-12 w-12 text-zinc-700' />
              <p className='text-sm'>No hackathon data yet</p>
              <p className='mt-1 text-xs text-zinc-600'>
                Create your first hackathon to see analytics
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className='mb-4 text-lg font-medium text-white'>Quick Actions</h2>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
            <Link href={`/organizations/${activeOrg._id}/hackathons/new`}>
              <div className='group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/50'>
                <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg'>
                  <Trophy className='text-primary h-6 w-6' />
                </div>
                <div className='min-w-0 flex-1'>
                  <h3 className='mb-0.5 font-medium text-white'>
                    Host Hackathon
                  </h3>
                  <p className='truncate text-xs text-zinc-500'>
                    Create a new event
                  </p>
                </div>
                <ArrowRight className='h-5 w-5 flex-shrink-0 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-zinc-400' />
              </div>
            </Link>

            <Link href={`/organizations/${activeOrg._id}/settings?tab=members`}>
              <div className='group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/50'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10'>
                  <Users className='h-6 w-6 text-blue-400' />
                </div>
                <div className='min-w-0 flex-1'>
                  <h3 className='mb-0.5 font-medium text-white'>Manage Team</h3>
                  <p className='truncate text-xs text-zinc-500'>
                    Add or remove members
                  </p>
                </div>
                <ArrowRight className='h-5 w-5 flex-shrink-0 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-zinc-400' />
              </div>
            </Link>

            <Link href={`/organizations/${activeOrg._id}/settings`}>
              <div className='group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/50'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800'>
                  <CheckCircle2 className='h-6 w-6 text-zinc-400' />
                </div>
                <div className='min-w-0 flex-1'>
                  <h3 className='mb-0.5 font-medium text-white'>Settings</h3>
                  <p className='truncate text-xs text-zinc-500'>
                    Configure organization
                  </p>
                </div>
                <ArrowRight className='h-5 w-5 flex-shrink-0 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-zinc-400' />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationAnalytics;
