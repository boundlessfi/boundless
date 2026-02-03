'use client';

import { MetricCard } from '@/components/ui/metric-card';
import { Contributor } from '@/features/projects/types';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ContributionsMetricsProps {
  contributors: Contributor[];
  currencySymbol?: string;
}

export function ContributionsMetrics({
  contributors,
  currencySymbol = 'USDC',
}: ContributionsMetricsProps) {
  // Calculate metrics
  const totalContributions = contributors.reduce(
    (sum, contributor) => sum + contributor.amount,
    0
  );

  const averageContribution =
    contributors.length > 0 ? totalContributions / contributors.length : 0;

  // Get top 5 contributors
  const topContributors = [...contributors]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Group contributions by date for timeline
  const contributionsByDate = contributors.reduce(
    (acc, contributor) => {
      const date = format(new Date(contributor.date), 'MMM d, yyyy');
      if (!acc[date]) {
        acc[date] = { date, count: 0, total: 0 };
      }
      acc[date].count += 1;
      acc[date].total += contributor.amount;
      return acc;
    },
    {} as Record<string, { date: string; count: number; total: number }>
  );

  const timeline = Object.values(contributionsByDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className='space-y-4'>
      {/* Metrics Cards */}
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {/* Total Contributors */}
        <MetricCard>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <p className='text-muted-foreground text-xs'>
                Total Contributors
              </p>
              <p className='text-2xl font-bold'>{contributors.length}</p>
            </div>
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10'>
              <Users className='h-4 w-4 text-blue-500' />
            </div>
          </div>
        </MetricCard>

        {/* Average Contribution */}
        <MetricCard>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <p className='text-muted-foreground text-xs'>
                Average Contribution
              </p>
              <div className='flex items-baseline gap-1'>
                <p className='text-2xl font-bold'>
                  {averageContribution.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
                <span className='text-muted-foreground text-xs font-medium'>
                  {currencySymbol}
                </span>
              </div>
            </div>
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10'>
              <DollarSign className='h-4 w-4 text-green-500' />
            </div>
          </div>
        </MetricCard>

        {/* Total Raised */}
        <MetricCard>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <p className='text-muted-foreground text-xs'>Total Raised</p>
              <div className='flex items-baseline gap-1'>
                <p className='text-2xl font-bold'>
                  {totalContributions.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
                <span className='text-muted-foreground text-xs font-medium'>
                  {currencySymbol}
                </span>
              </div>
            </div>
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10'>
              <TrendingUp className='h-4 w-4 text-purple-500' />
            </div>
          </div>
        </MetricCard>
      </div>

      {/* Top Contributors & Timeline */}
      <div className='grid gap-4 lg:grid-cols-2'>
        {/* Top Contributors */}
        <MetricCard>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='text-sm font-semibold'>Top Contributors</h3>
            <Badge
              variant='outline'
              className='bg-primary/10 text-primary text-xs'
            >
              Top 5
            </Badge>
          </div>
          <div className='space-y-2'>
            {topContributors.length > 0 ? (
              topContributors.map((contributor, index) => (
                <div
                  key={contributor.transactionHash}
                  className='border-border/50 bg-background/50 hover:bg-background/80 flex items-center justify-between rounded-lg border p-2.5 transition-colors'
                >
                  <div className='flex items-center gap-2.5'>
                    <div className='relative'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={contributor.image}
                          alt={contributor.name}
                        />
                        <AvatarFallback className='text-xs'>
                          {contributor.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                          index === 0
                            ? 'bg-yellow-500 text-yellow-950'
                            : index === 1
                              ? 'bg-slate-400 text-slate-950'
                              : index === 2
                                ? 'bg-orange-600 text-orange-950'
                                : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <p className='text-sm font-medium'>{contributor.name}</p>
                      <p className='text-muted-foreground text-[10px]'>
                        @{contributor.username}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-semibold'>
                      {contributor.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className='text-muted-foreground text-[10px]'>
                      {currencySymbol}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-muted-foreground py-6 text-center text-xs'>
                No contributors yet
              </div>
            )}
          </div>
        </MetricCard>

        {/* Contribution Timeline */}
        <MetricCard>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='text-sm font-semibold'>Recent Activity</h3>
            <Badge
              variant='outline'
              className='bg-blue-500/10 text-xs text-blue-500'
            >
              Last 5 Days
            </Badge>
          </div>
          <div className='space-y-2'>
            {timeline.length > 0 ? (
              timeline.map(day => (
                <div
                  key={day.date}
                  className='border-border/50 bg-background/50 hover:bg-background/80 flex items-center justify-between rounded-lg border p-3 transition-colors'
                >
                  <div className='space-y-0.5'>
                    <p className='text-sm font-medium'>{day.date}</p>
                    <p className='text-muted-foreground text-xs'>
                      {day.count}{' '}
                      {day.count === 1 ? 'contribution' : 'contributions'}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-base font-semibold'>
                      {day.total.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className='text-muted-foreground text-[10px]'>
                      {currencySymbol}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-muted-foreground py-6 text-center text-xs'>
                No activity yet
              </div>
            )}
          </div>
        </MetricCard>
      </div>
    </div>
  );
}
