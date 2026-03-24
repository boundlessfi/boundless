'use client';

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GetMeResponse } from '@/lib/api/types';
import {
  transformChartData,
  filterChartByRange,
} from '@/lib/utils/calculateTrend';

type Range = '7D' | '30D' | '90D' | 'ALL';
const RANGE_DAYS: Record<Range, number | 'ALL'> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
  ALL: 'ALL',
};

interface Props {
  chart: GetMeResponse['chart'];
}

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className='border-border bg-card rounded-xl border px-4 py-3 shadow-xl'>
      <p className='text-muted-foreground mb-1 text-xs'>{label}</p>
      <p className='text-sm font-semibold'>
        {payload[0].value}{' '}
        <span className='text-muted-foreground font-normal'>activities</span>
      </p>
    </div>
  );
}

export function AnalyticsChart({ chart }: Props) {
  const [range, setRange] = useState<Range>('30D');
  const ranges: Range[] = ['7D', '30D', '90D', 'ALL'];

  const allTransformed = useMemo(() => transformChartData(chart), [chart]);

  const filtered = useMemo(
    () => filterChartByRange(allTransformed, RANGE_DAYS[range]),
    [allTransformed, range]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
    >
      <Card>
        <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>Your platform activity trend</CardDescription>
          </div>

          <div
            role='group'
            aria-label='Chart time range'
            className='border-border bg-muted flex gap-1 rounded-xl border p-1'
          >
            {ranges.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  range === r
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {filtered.length === 0 ? (
            <div className='text-muted-foreground flex h-48 items-center justify-center text-sm'>
              No activity data available for this period.
            </div>
          ) : (
            <>
              {/* Screen reader fallback */}
              <table className='sr-only' aria-label='Activity over time data'>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Activity Count</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.date}>
                      <td>{d.label}</td>
                      <td>{d.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div aria-hidden='true'>
                <ResponsiveContainer width='100%' height={240}>
                  <LineChart
                    data={filtered}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id='primaryGradient'
                        x1='0'
                        y1='0'
                        x2='1'
                        y2='0'
                      >
                        <stop offset='0%' stopColor='#2EEDAA' />
                        <stop offset='100%' stopColor='#2EEDAA' />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='rgba(255,255,255,0.04)'
                    />
                    <XAxis
                      dataKey='label'
                      tick={{ fill: '#71717a', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval='preserveStartEnd'
                    />
                    <YAxis
                      tick={{ fill: '#71717a', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type='monotone'
                      dataKey='count'
                      stroke='url(#primaryGradient)'
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: '#2EEDAA', strokeWidth: 0 }}
                      isAnimationActive
                      animationDuration={600}
                      animationEasing='ease-out'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
