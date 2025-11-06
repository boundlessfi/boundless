'use client';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useParams } from 'next/navigation';
import { Line, LineChart, XAxis } from 'recharts';
import { Check } from 'lucide-react';

export default function HackathonPage() {
  const params = useParams();
  void params.id;
  void params.hackathonId;
  const chartData = [
    { month: 'January', desktop: 186 },
    { month: 'February', desktop: 305 },
    { month: 'March', desktop: 237 },
    { month: 'April', desktop: 73 },
    { month: 'May', desktop: 209 },
    { month: 'June', desktop: 214 },
  ];
  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: '#ffffff',
    },
  } satisfies ChartConfig;

  return (
    <div className='min-h-screen bg-black p-4 text-white sm:p-6 md:p-8'>
      <div className='rounded-xl border border-gray-900 p-4 sm:p-6 md:p-8'>
        <div className='grid w-full grid-cols-2 gap-4 text-gray-500 md:flex md:grid-cols-4 md:justify-between md:gap-0'>
          <div className='flex flex-col'>
            <span className='text-xs'>Participants</span>
            <span className='text-sm font-medium'>100</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-xs'>Submissions</span>
            <span className='text-sm font-medium'>100</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-xs'>Submissions</span>
            <span className='text-sm font-medium'>100</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-xs'>Submissions</span>
            <span className='text-sm font-medium'>100</span>
          </div>
        </div>
        <div className='mt-6 flex w-full flex-col justify-between gap-4 text-gray-500 md:mt-8 lg:flex-row lg:gap-6'>
          <div className='flex min-w-0 flex-1 flex-col gap-3 rounded-[6px] bg-[#101010] p-3 sm:p-4'>
            <div className='text-xs font-medium text-white uppercase'>
              Submissions <span className='text-gray-500'>over</span> time
            </div>
            <ChartContainer
              config={chartConfig}
              className='h-[200px] sm:h-[250px] lg:h-[300px]'
            >
              <LineChart
                accessibilityLayer
                data={chartData}
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
          </div>
          <div className='flex min-w-0 flex-1 flex-col gap-3 rounded-[6px] bg-[#101010] p-3 sm:p-4'>
            <div className='text-xs font-medium text-white uppercase'>
              Participants sign-ups trend
            </div>
            <ChartContainer
              config={chartConfig}
              className='h-[200px] sm:h-[250px] lg:h-[300px]'
            >
              <LineChart
                accessibilityLayer
                data={chartData}
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
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className='mt-6 rounded-xl border border-gray-900 p-4 sm:p-6 md:mt-8 md:p-8'>
        <h2 className='mb-6 text-lg font-medium text-white'>Timeline</h2>

        <div className='relative'>
          {/* Timeline Items */}
          <div className='space-y-0'>
            {/* Winner Announcement - Active */}
            <div className='relative flex items-start gap-3 pb-6 sm:gap-4'>
              <div className='relative flex flex-col items-center'>
                <div className='bg-active-bg z-10 flex flex-shrink-0 items-center justify-center rounded-full p-1'>
                  <div className='bg-primary z-10 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full' />
                </div>
                <div className='absolute top-6 left-1/2 h-6 w-0.5 -translate-x-1/2'>
                  <div className='h-full border-l-2 border-dashed border-gray-600' />
                </div>
              </div>
              <div className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                <div className='min-w-0 flex-1'>
                  <h3 className='mb-1 text-sm font-medium text-white sm:text-base'>
                    Winner Announcement
                  </h3>
                  <p className='text-xs text-white/60 sm:text-sm'>
                    Final results published and prizes distributed to winners.
                  </p>
                </div>
                <div className='flex-shrink-0 text-xs whitespace-nowrap text-white/60 sm:text-sm'>
                  20 Aug, 2025
                </div>
              </div>
            </div>

            {/* Judging - Completed */}
            <div className='relative flex items-start gap-3 pb-6 sm:gap-4'>
              <div className='relative flex flex-col items-center'>
                <div className='z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#1C1C1C] bg-[#171717]'>
                  <Check className='h-4 w-4 text-gray-800' />
                </div>
                <div className='absolute top-6 left-1/2 h-6 w-0.5 -translate-x-1/2'>
                  <div className='h-full border-l-2 border-dashed border-gray-600' />
                </div>
              </div>
              <div className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                <div className='min-w-0 flex-1'>
                  <h3 className='mb-1 text-sm font-medium text-white sm:text-base'>
                    Judging
                  </h3>
                  <p className='text-xs text-gray-400 sm:text-sm'>
                    Judges are currently reviewing and scoring all submitted
                    projects.
                  </p>
                </div>
                <div className='flex-shrink-0 text-xs whitespace-nowrap text-white/60 sm:text-sm'>
                  20 Aug, 2025
                </div>
              </div>
            </div>

            {/* Submission - Completed */}
            <div className='relative flex items-start gap-3 pb-6 sm:gap-4'>
              <div className='relative flex flex-col items-center'>
                <div className='z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#1C1C1C] bg-[#171717]'>
                  <Check className='h-4 w-4 text-gray-800' />
                </div>
                <div className='absolute top-6 left-1/2 h-6 w-0.5 -translate-x-1/2'>
                  <div className='h-full border-l-2 border-dashed border-gray-600' />
                </div>
              </div>
              <div className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                <div className='min-w-0 flex-1'>
                  <h3 className='mb-1 text-sm font-medium text-white sm:text-base'>
                    Submission
                  </h3>
                  <p className='text-xs text-white/60 sm:text-sm'>
                    Participants are submitting their projects for review before
                    the deadline.
                  </p>
                </div>
                <div className='flex-shrink-0 text-xs whitespace-nowrap text-white/60 sm:text-sm'>
                  20 Aug, 2025
                </div>
              </div>
            </div>

            {/* Register - Completed */}
            <div className='relative flex items-start gap-3 sm:gap-4'>
              <div className='relative flex flex-col items-center'>
                <div className='z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#1C1C1C] bg-[#171717]'>
                  <Check className='h-4 w-4 text-gray-800' />
                </div>
              </div>
              <div className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                <div className='min-w-0 flex-1'>
                  <h3 className='mb-1 text-sm font-medium text-white sm:text-base'>
                    Register
                  </h3>
                  <p className='text-xs text-white/60 sm:text-sm'>
                    Individuals and teams are signing up to participate in the
                    hackathon.
                  </p>
                </div>
                <div className='flex-shrink-0 text-xs whitespace-nowrap text-white/60 sm:text-sm'>
                  20 Aug, 2025
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
