// ActivityTab.tsx - Redesigned
'use client';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Line, LineChart, XAxis } from 'recharts';
import { GetMeResponse } from '@/lib/api/types';
import { TrendingUp, Award, Zap, DollarSign } from 'lucide-react';

interface ActivityTabProps {
  user: GetMeResponse;
}

const STAT_CONFIGS = [
  { key: 'votes', label: 'Votes', icon: TrendingUp, color: 'text-primary' },
  { key: 'grants', label: 'Grants', icon: Award, color: 'text-green-400' },
  {
    key: 'hackathons',
    label: 'Hackathons',
    icon: Zap,
    color: 'text-amber-400',
  },
  {
    key: 'donations',
    label: 'Donations',
    icon: DollarSign,
    color: 'text-blue-400',
  },
];

export default function ActivityTab({ user }: ActivityTabProps) {
  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const stats = user.stats || {};

    return months.map(month => ({
      month,
      votes: Math.floor((stats.votes || 0) * (0.5 + Math.random() * 0.5)),
      grants: Math.floor((stats.grants || 0) * (0.5 + Math.random() * 0.5)),
      hackathons: Math.floor(
        (stats.hackathons || 0) * (0.5 + Math.random() * 0.5)
      ),
      donations: Math.floor(
        (stats.donations || 0) * (0.5 + Math.random() * 0.5)
      ),
    }));
  };

  const chartData = generateChartData();

  const chartConfig = {
    votes: { label: 'Votes', color: 'hsl(var(--primary))' },
    grants: { label: 'Grants', color: '#10b981' },
    hackathons: { label: 'Hackathons', color: '#f59e0b' },
    donations: { label: 'Donations', color: '#3b82f6' },
  } satisfies ChartConfig;

  return (
    <div className='space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6'>
      {/* Stats Grid */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {STAT_CONFIGS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className='space-y-2'>
            <div className='flex items-center gap-2'>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 ${color}`}
              >
                <Icon className='h-4 w-4' />
              </div>
              <span className='text-sm text-zinc-500'>{label}</span>
            </div>
            <p className='text-2xl font-bold text-white'>
              {user.stats?.[key as keyof typeof user.stats] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className='flex flex-wrap gap-4 text-xs text-zinc-500'>
        <span className='flex items-center gap-2'>
          <i className='bg-primary inline-block h-2 w-2 rounded-full' /> Votes
        </span>
        <span className='flex items-center gap-2'>
          <i className='inline-block h-2 w-2 rounded-full bg-green-400' />{' '}
          Grants
        </span>
        <span className='flex items-center gap-2'>
          <i className='inline-block h-2 w-2 rounded-full bg-amber-400' />{' '}
          Hackathons
        </span>
        <span className='flex items-center gap-2'>
          <i className='inline-block h-2 w-2 rounded-full bg-blue-400' />{' '}
          Donations
        </span>
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className='h-[250px] w-full'>
        <LineChart
          data={chartData}
          margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
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
              <ChartTooltipContent className='border-zinc-800 bg-zinc-900' />
            }
          />
          <Line
            dataKey='votes'
            type='monotone'
            stroke='var(--color-votes)'
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey='grants'
            type='monotone'
            stroke='var(--color-grants)'
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey='hackathons'
            type='monotone'
            stroke='var(--color-hackathons)'
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey='donations'
            type='monotone'
            stroke='var(--color-donations)'
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
