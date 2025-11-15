'use client';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Line, LineChart, XAxis } from 'recharts';
import { Loader2 } from 'lucide-react';
import type { HackathonTimeSeriesData } from '@/lib/api/hackathons';
import { useMemo } from 'react';

interface HackathonChartsProps {
  timeSeriesData: HackathonTimeSeriesData | null;
  loading: boolean;
}

const chartConfig = {
  desktop: {
    label: 'Count',
    color: '#ffffff',
  },
} satisfies ChartConfig;

export const HackathonCharts: React.FC<HackathonChartsProps> = ({
  timeSeriesData,
  loading,
}) => {
  const submissionsChartData = useMemo(() => {
    if (!timeSeriesData) return [];
    const daily = timeSeriesData.submissions.daily;
    return daily.map(point => ({
      month: new Date(point.date).toLocaleDateString('en-US', {
        month: 'short',
      }),
      desktop: point.count,
    }));
  }, [timeSeriesData]);

  const participantsChartData = useMemo(() => {
    if (!timeSeriesData) return [];
    const daily = timeSeriesData.participants.daily;
    return daily.map(point => ({
      month: new Date(point.date).toLocaleDateString('en-US', {
        month: 'short',
      }),
      desktop: point.count,
    }));
  }, [timeSeriesData]);

  return (
    <div className='mt-6 flex w-full flex-col justify-between gap-4 text-gray-500 md:mt-8 lg:flex-row lg:gap-6'>
      <div className='flex min-w-0 flex-1 flex-col gap-3 rounded-[6px] bg-[#101010] p-3 sm:p-4'>
        <div className='text-xs font-medium text-white uppercase'>
          Submissions <span className='text-gray-500'>over</span> time
        </div>
        {loading ? (
          <div className='flex h-[200px] items-center justify-center sm:h-[250px] lg:h-[300px]'>
            <Loader2 className='h-6 w-6 animate-spin' />
          </div>
        ) : submissionsChartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className='h-[200px] sm:h-[250px] lg:h-[300px]'
          >
            <LineChart
              accessibilityLayer
              data={submissionsChartData}
              margin={{
                left: 8,
                right: 8,
              }}
            >
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={value => value.slice(0, 3)}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey='desktop'
                type='natural'
                stroke='var(--color-desktop)'
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className='flex h-[200px] items-center justify-center text-sm text-gray-400 sm:h-[250px] lg:h-[300px]'>
            No submission data available
          </div>
        )}
      </div>
      <div className='flex min-w-0 flex-1 flex-col gap-3 rounded-[6px] bg-[#101010] p-3 sm:p-4'>
        <div className='text-xs font-medium text-white uppercase'>
          Participants sign-ups trend
        </div>
        {loading ? (
          <div className='flex h-[200px] items-center justify-center sm:h-[250px] lg:h-[300px]'>
            <Loader2 className='h-6 w-6 animate-spin' />
          </div>
        ) : participantsChartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className='h-[200px] sm:h-[250px] lg:h-[300px]'
          >
            <LineChart
              accessibilityLayer
              data={participantsChartData}
              margin={{
                left: 8,
                right: 8,
              }}
            >
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={value => value.slice(0, 3)}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey='desktop'
                type='natural'
                stroke='var(--color-desktop)'
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className='flex h-[200px] items-center justify-center text-sm text-gray-400 sm:h-[250px] lg:h-[300px]'>
            No participant data available
          </div>
        )}
      </div>
    </div>
  );
};
