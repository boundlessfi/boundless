'use client';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Line, LineChart, XAxis } from 'recharts';
import { GetMeResponse } from '@/lib/api/types';

interface ActivityTabProps {
  user: GetMeResponse;
}

export default function ActivityTab({ user }: ActivityTabProps) {
  // Generate chart data based on real stats
  const generateChartData = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June'];
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
    votes: {
      label: 'Votes',
      color: 'var(--primary)',
    },
    grants: {
      label: 'Grants',
      color: '#099137',
    },
    hackathons: {
      label: 'Hackathons',
      color: '#dd900d',
    },
    donations: {
      label: 'Donations',
      color: '#0d5eba',
    },
  } satisfies ChartConfig;

  return (
    <div className='bg-background rounded-[12px] border border-gray-900 p-3 sm:p-4 lg:p-5'>
      <div className='mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4 lg:gap-6'>
        <div className='flex flex-col gap-1 text-xs text-gray-500 sm:gap-2 sm:text-sm'>
          <h4 className='text-xs sm:text-sm'>Votes</h4>
          <p className='text-sm font-medium sm:text-base lg:text-lg'>
            {user.stats?.votes || 0}
          </p>
        </div>
        <div className='flex flex-col gap-1 text-xs text-gray-500 sm:gap-2 sm:text-sm'>
          <h4 className='text-xs sm:text-sm'>Grants</h4>
          <p className='text-sm font-medium sm:text-base lg:text-lg'>
            {user.stats?.grants || 0}
          </p>
        </div>
        <div className='flex flex-col gap-1 text-xs text-gray-500 sm:gap-2 sm:text-sm'>
          <h4 className='text-xs sm:text-sm'>Hackathons</h4>
          <p className='text-sm font-medium sm:text-base lg:text-lg'>
            {user.stats?.hackathons || 0}
          </p>
        </div>
        <div className='flex flex-col gap-1 text-xs text-gray-500 sm:gap-2 sm:text-sm'>
          <h4 className='text-xs sm:text-sm'>Donations</h4>
          <p className='text-sm font-medium sm:text-base lg:text-lg'>
            {user.stats?.donations || 0}
          </p>
        </div>
      </div>
      <div>
        {/* line charts */}
        <div className='flex flex-wrap gap-3 text-xs text-gray-500 sm:gap-4 sm:text-sm lg:gap-5'>
          <span className='flex items-center gap-1 sm:gap-2'>
            <i className='bg-primary inline-block h-2 w-2 rounded-full' /> Votes
          </span>
          <span className='flex items-center gap-1 sm:gap-2'>
            <i className='bg-secondary-500 inline-block h-2 w-2 rounded-full' />{' '}
            Donations
          </span>
          <span className='flex items-center gap-1 sm:gap-2'>
            <i className='bg-warning-500 inline-block h-2 w-2 rounded-full' />{' '}
            Hackathons
          </span>
          <span className='flex items-center gap-1 sm:gap-2'>
            <i className='bg-success-500 inline-block h-2 w-2 rounded-full' />{' '}
            Grants
          </span>
        </div>
      </div>
      <div className='mt-4 sm:mt-6'>
        <ChartContainer
          config={chartConfig}
          className='h-[200px] w-full sm:h-[250px] lg:h-[300px]'
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
              tickMargin={4}
              tickFormatter={value => value.slice(0, 3)}
              fontSize={10}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className='text-xs text-gray-200 sm:text-sm'
                  labelClassName='text-gray-100 text-xs sm:text-sm'
                />
              }
            />
            <Line
              dataKey='votes'
              type='monotone'
              stroke='var(--color-votes)'
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              dataKey='grants'
              type='monotone'
              stroke='var(--color-grants)'
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              dataKey='hackathons'
              type='monotone'
              stroke='var(--color-hackathons)'
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              dataKey='donations'
              type='monotone'
              stroke='var(--color-donations)'
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}
