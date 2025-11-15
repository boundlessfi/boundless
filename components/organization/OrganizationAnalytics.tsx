'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Trophy,
  HandCoins,
  UserPlus,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Use real chart data from API
  const chartData = useMemo(() => {
    if (!analytics?.timeSeries?.hackathons) {
      return [];
    }

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

  // Use real trends from API
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
        <div className='flex flex-col items-center gap-3 text-zinc-400'>
          <LoadingSpinner size='lg' color='primary' variant='spinner' />
          <p className='text-sm text-zinc-400'>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Members',
      value: stats.memberCount,
      icon: Users,
      description: 'Active organization members',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      href: `/organizations/${activeOrg._id}/settings?tab=members`,
      trend: trends.members,
    },
    {
      title: 'Hackathons',
      value: stats.hackathonCount,
      icon: Trophy,
      description: 'Total hackathons hosted',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      href: `/organizations/${activeOrg._id}/hackathons`,
      trend: trends.hackathons,
    },
    {
      title: 'Grants',
      value: stats.grantCount,
      icon: HandCoins,
      description: 'Total grants available',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      href: `/organizations/${activeOrg._id}/grants`,
      trend: trends.grants,
    },
    {
      title: 'Pending Invites',
      value: stats.pendingInviteCount,
      icon: UserPlus,
      description: 'Invitations awaiting response',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      href: `/organizations/${activeOrg._id}/settings?tab=members`,
    },
  ];

  return (
    <div className='bg-background-main-bg min-h-screen p-6 text-white'>
      <div className='mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-white'>Analytics</h1>
          <p className='mt-2 text-sm text-gray-400'>
            Overview of your organization's key metrics
          </p>
        </div>

        {/* Stats Cards Grid */}
        <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend?.isPositive
              ? TrendingUp
              : TrendingDown;
            const trendColor = stat.trend?.isPositive
              ? 'text-green-400'
              : 'text-red-400';

            return (
              <Link key={index} href={stat.href || '#'}>
                <Card className='bg-background-card border-gray-900 transition-all hover:border-gray-800 hover:shadow-lg'>
                  <CardHeader className='flex flex-row items-center justify-between pb-2'>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor} ${stat.color}`}
                    >
                      <Icon className='h-5 w-5' />
                    </div>
                    {stat.trend && (
                      <div className={`flex items-center gap-1 ${trendColor}`}>
                        <TrendIcon className='h-4 w-4' />
                        <span className='text-xs font-medium'>
                          {stat.trend.change > 0 ? '+' : ''}
                          {stat.trend.change}
                        </span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <div className='flex items-center justify-between'>
                      <p className='text-2xl font-bold text-white'>
                        {stat.value}
                      </p>
                      <ArrowUpRight className='h-4 w-4 text-gray-500' />
                    </div>
                    <p className='mt-1 text-sm font-medium text-gray-300'>
                      {stat.title}
                    </p>
                    <p className='mt-1 text-xs text-gray-500'>
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Profile Completion Card */}
        <div className='mb-8'>
          <Card className='bg-background-card border-gray-900'>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span className='text-lg font-semibold text-white'>
                  Profile Completion
                </span>
                {isComplete ? (
                  <CheckCircle2 className='h-5 w-5 text-green-400' />
                ) : (
                  <span className='text-sm font-normal text-gray-400'>
                    {percentage}%
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <Progress value={percentage} className='h-3' />
                {!isComplete && missingFields.length > 0 && (
                  <div className='mt-4'>
                    <p className='mb-2 text-sm text-gray-400'>
                      Missing fields:
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {missingFields.map((field, idx) => (
                        <span
                          key={idx}
                          className='rounded-md bg-gray-900 px-2 py-1 text-xs text-gray-300'
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/organizations/${activeOrg._id}/settings?tab=profile`}
                      className='text-primary mt-3 inline-flex items-center gap-2 text-sm hover:underline'
                    >
                      Complete Profile
                      <ArrowUpRight className='h-4 w-4' />
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hackathons Over Time Chart */}
        <div className='mb-8'>
          <Card className='bg-background-card border-gray-900'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-lg font-semibold text-white'>
                  Hackathons Over Time
                </CardTitle>
                <Link
                  href={`/organizations/${activeOrg._id}/hackathons`}
                  className='text-primary flex items-center gap-2 text-sm hover:underline'
                >
                  View All
                  <ArrowUpRight className='h-4 w-4' />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className='mt-4'>
                {chartData.length > 0 ? (
                  <ChartContainer
                    config={chartConfig}
                    className='h-[300px] w-full'
                  >
                    <LineChart
                      accessibilityLayer
                      data={chartData}
                      margin={{
                        left: 8,
                        right: 8,
                        top: 8,
                        bottom: 8,
                      }}
                    >
                      <XAxis
                        dataKey='month'
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            className='rounded-lg border border-gray-800 bg-gray-900 text-white'
                            labelClassName='text-gray-300'
                          />
                        }
                      />
                      <Line
                        dataKey='hackathons'
                        type='monotone'
                        stroke='var(--color-hackathons)'
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <div className='flex h-[300px] items-center justify-center text-gray-400'>
                    <p className='text-sm'>No hackathon data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <Link href={`/organizations/${activeOrg._id}/hackathons/new`}>
            <Card className='bg-background-card hover:border-primary/50 border-gray-900 transition-all hover:shadow-lg'>
              <CardContent className='flex items-center gap-4 p-6'>
                <div className='bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg'>
                  <Trophy className='h-6 w-6' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-white'>Create Hackathon</h3>
                  <p className='text-sm text-gray-400'>
                    Start a new hackathon event
                  </p>
                </div>
                <ArrowUpRight className='h-5 w-5 text-gray-500' />
              </CardContent>
            </Card>
          </Link>

          <Link href={`/organizations/${activeOrg._id}/settings?tab=members`}>
            <Card className='bg-background-card hover:border-primary/50 border-gray-900 transition-all hover:shadow-lg'>
              <CardContent className='flex items-center gap-4 p-6'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400'>
                  <Users className='h-6 w-6' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-white'>Manage Members</h3>
                  <p className='text-sm text-gray-400'>
                    View and manage team members
                  </p>
                </div>
                <ArrowUpRight className='h-5 w-5 text-gray-500' />
              </CardContent>
            </Card>
          </Link>

          <Link href={`/organizations/${activeOrg._id}/settings`}>
            <Card className='bg-background-card hover:border-primary/50 border-gray-900 transition-all hover:shadow-lg'>
              <CardContent className='flex items-center gap-4 p-6'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gray-500/10 text-gray-400'>
                  <CheckCircle2 className='h-6 w-6' />
                </div>
                <div className='flex-1'>
                  <h3 className='font-semibold text-white'>Settings</h3>
                  <p className='text-sm text-gray-400'>
                    Configure organization settings
                  </p>
                </div>
                <ArrowUpRight className='h-5 w-5 text-gray-500' />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrganizationAnalytics;
