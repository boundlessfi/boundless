'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  projects: {
    label: 'Activity',
    color: '#2EEDAA',
  },
} satisfies ChartConfig;

interface ChartAreaInteractiveProps {
  chartData?: Array<{ date: string; projects: number }>;
  title?: string;
  description?: string;
}

export function ChartAreaInteractive({
  chartData = [],
  title = 'Activity',
  description: desc = 'Project activity over time',
}: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState<'90d' | '30d' | '7d'>('30d');

  const filteredData = React.useMemo(() => {
    const daysMap = { '90d': 90, '30d': 30, '7d': 7 } as const;
    const daysToSubtract = daysMap[timeRange];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return chartData.filter(item => new Date(item.date) >= startDate);
  }, [chartData, timeRange]);

  const ranges = [
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
  ] as const;

  return (
    <div className='flex h-full flex-col rounded-xl border border-white/6 bg-white/2'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-white/6 px-4 py-3 sm:px-5'>
        <div>
          <h3 className='text-sm font-medium text-white'>{title}</h3>
          <p className='mt-0.5 hidden text-xs text-white/30 sm:block'>{desc}</p>
        </div>
        <div className='flex gap-0.5 rounded-lg bg-white/4 p-0.5'>
          {ranges.map(r => (
            <button
              key={r.value}
              onClick={() => setTimeRange(r.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                timeRange === r.value
                  ? 'bg-white/10 text-white'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className='flex-1 p-4 sm:p-5'>
        {filteredData.length === 0 ? (
          <div className='flex h-full min-h-[180px] items-center justify-center'>
            <p className='text-xs text-white/20'>No activity in this period</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[200px] w-full sm:aspect-video lg:h-[240px]'
          >
            <BarChart data={filteredData}>
              <CartesianGrid vertical={false} stroke='rgba(255,255,255,0.04)' />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }}
                tickFormatter={value => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className='border-white/10 bg-zinc-900 text-white'
                    labelFormatter={value =>
                      new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    }
                  />
                }
              />
              <Bar
                dataKey='projects'
                fill='var(--color-projects)'
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
