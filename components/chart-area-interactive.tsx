'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { motion } from 'framer-motion';

import { useIsMobile } from '@/hooks/use-mobile';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const chartConfig = {
  projects: {
    label: 'Projects Created',
    color: '#a7f950',
  },
} satisfies ChartConfig;

interface ChartAreaInteractiveProps {
  chartData?: Array<{ date: string; projects: number }>;
  title?: string;
  description?: string;
}

export function ChartAreaInteractive({
  chartData = [],
  title = 'Total Projects Created',
  description: desc = 'Total for the last 3 months',
}: ChartAreaInteractiveProps = {}) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('90d');

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d');
    }
  }, [isMobile]);

  const filteredData = chartData.filter(item => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === '30d') {
      daysToSubtract = 30;
    } else if (timeRange === '7d') {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className='bg-background border-border/10 hover:border-primary/30 hover:shadow-primary/10 @container/card border transition-all duration-300 hover:shadow-lg'>
        <CardHeader>
          <CardTitle className='text-white'>{title}</CardTitle>
          <CardDescription className='text-white/70'>
            <span className='hidden @[540px]/card:block'>{desc}</span>
            <span className='@[540px]/card:hidden'>{desc}</span>
          </CardDescription>
          <CardAction>
            <ToggleGroup
              type='single'
              value={timeRange}
              onValueChange={setTimeRange}
              variant='outline'
              className='*:data-[state=on]:border-primary! *:data-[state=on]:bg-primary/20! hidden *:data-[slot=toggle-group-item]:border-white/30! *:data-[slot=toggle-group-item]:px-4! *:data-[slot=toggle-group-item]:text-white/60! *:data-[slot=toggle-group-item]:hover:border-white/50! *:data-[slot=toggle-group-item]:hover:bg-white/5! *:data-[slot=toggle-group-item]:hover:text-white! *:data-[state=on]:px-4! *:data-[state=on]:text-white! @[767px]/card:flex'
            >
              <ToggleGroupItem value='90d'>Last 3 months</ToggleGroupItem>
              <ToggleGroupItem value='30d'>Last 30 days</ToggleGroupItem>
              <ToggleGroupItem value='7d'>Last 7 days</ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className='flex w-40 **:data-[slot=select-trigger]:border-white/30! **:data-[slot=select-trigger]:hover:border-white/50! **:data-[slot=select-trigger]:hover:bg-white/5! **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate **:data-[slot=select-value]:text-white/60! @[767px]/card:hidden'
                size='sm'
                aria-label='Select a value'
              >
                <SelectValue placeholder='Last 3 months' />
              </SelectTrigger>
              <SelectContent className='rounded-xl'>
                <SelectItem value='90d'>Last 3 months</SelectItem>
                <SelectItem value='30d'>Last 30 days</SelectItem>
                <SelectItem value='7d'>Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[250px] w-full'
          >
            <BarChart data={filteredData}>
              <CartesianGrid vertical={false} stroke='rgba(255,255,255,0.1)' />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
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
                    className='bg-background! border-border/20! w-[150px] text-white!'
                    labelFormatter={value => {
                      return new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                    }}
                  />
                }
              />
              <Bar
                dataKey='projects'
                fill='var(--color-projects)'
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
