'use client';

import { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  FolderGit2,
  Trophy,
  Star,
  DollarSign,
  MessageSquare,
  ThumbsUp,
  GitBranch,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { GetMeResponse } from '@/lib/api/types';
import { calculateChartTrend, TrendResult } from '@/lib/utils/calculateTrend';
import { ReputationTierBadge } from '@/components/ui/ReputationTierBadge';

interface Props {
  stats: GetMeResponse['stats'];
  chart: GetMeResponse['chart'];
}

function TrendBadge({ trend }: { trend: TrendResult }) {
  if (trend.direction === 'up') {
    return (
      <span
        aria-label={`Up ${trend.percentage}%`}
        className='bg-primary/15 text-primary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium'
      >
        <TrendingUp className='h-3 w-3' aria-hidden='true' />
        {trend.percentage}%
      </span>
    );
  }
  if (trend.direction === 'down') {
    return (
      <span
        aria-label={`Down ${trend.percentage}%`}
        className='inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400'
      >
        <TrendingDown className='h-3 w-3' aria-hidden='true' />
        {trend.percentage}%
      </span>
    );
  }
  return (
    <span
      aria-label='No change'
      className='bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium'
    >
      <Minus className='h-3 w-3' aria-hidden='true' />
      0%
    </span>
  );
}

interface TileConfig {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend: TrendResult;
  colSpan: string;
  rowSpan: string;
  large?: boolean;
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const tileVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export function AnalyticsBentoGrid({ stats, chart }: Props) {
  const chartTrend = useMemo(() => calculateChartTrend(chart), [chart]);
  const flat: TrendResult = { percentage: 0, direction: 'flat' };

  const tiles: TileConfig[] = useMemo(
    () => [
      {
        label: 'Global Reputation',
        value: stats.reputation,
        icon: <Star className='h-5 w-5' />,
        trend: chartTrend,
        colSpan: 'col-span-2',
        rowSpan: 'row-span-2',
        large: true,
      },
      {
        label: 'Community Score',
        value: stats.communityScore,
        icon: <Users className='h-4 w-4' />,
        trend: chartTrend,
        colSpan: 'col-span-1',
        rowSpan: 'row-span-1',
      },
      {
        label: 'Projects Created',
        value: stats.projectsCreated,
        icon: <FolderGit2 className='h-4 w-4' />,
        trend: flat,
        colSpan: 'col-span-1',
        rowSpan: 'row-span-1',
      },
      {
        label: 'Hackathons Entered',
        value: stats.hackathons,
        icon: <Trophy className='h-4 w-4' />,
        trend: flat,
        colSpan: 'col-span-1',
        rowSpan: 'row-span-1',
      },
      {
        label: 'Followers',
        value: stats.followers,
        icon: <Users className='h-4 w-4' />,
        trend: flat,
        colSpan: 'col-span-1',
        rowSpan: 'row-span-1',
      },
      {
        label: 'Total Contributed',
        value: stats.totalContributed,
        icon: <DollarSign className='h-4 w-4' />,
        trend: flat,
        colSpan: 'col-span-1',
        rowSpan: 'row-span-1',
      },
      {
        label: 'Comments Posted',
        value: stats.commentsPosted,
        icon: <MessageSquare className='h-4 w-4' />,
        trend: flat,
        colSpan: 'col-span-1',
        rowSpan: 'row-span-1',
      },
      {
        label: 'Votes Cast',
        value: stats.votes,
        icon: <ThumbsUp className='h-4 w-4' />,
        trend: flat,
        colSpan: 'col-span-1',
        rowSpan: 'row-span-1',
      },
      {
        label: 'Following',
        value: stats.following,
        icon: <GitBranch className='h-4 w-4' />,
        trend: flat,
        colSpan: 'col-span-1',
        rowSpan: 'row-span-1',
      },
    ],
    [stats, chartTrend, flat]
  );

  return (
    <>
      {/* Screen reader fallback table */}
      <table className='sr-only' aria-label='Analytics statistics'>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          {tiles.map(t => (
            <tr key={t.label}>
              <td>{t.label}</td>
              <td>{t.value.toLocaleString()}</td>
              <td>
                {t.trend.direction === 'flat'
                  ? 'No change'
                  : `${t.trend.direction === 'up' ? 'Up' : 'Down'} ${t.trend.percentage}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <motion.div
        aria-hidden='true'
        variants={containerVariants}
        initial='hidden'
        animate='show'
        className='grid grid-cols-2 gap-4 sm:grid-cols-4'
      >
        {tiles.map(tile => (
          <motion.div
            key={tile.label}
            variants={tileVariants}
            className={`${tile.colSpan} ${tile.rowSpan}`}
          >
            <Card className='h-full'>
              <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
                <div className='bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl'>
                  {tile.icon}
                </div>
                <TrendBadge trend={tile.trend} />
              </CardHeader>
              <CardContent>
                <p
                  className={`font-bold tracking-tight ${tile.large ? 'text-4xl' : 'text-2xl'}`}
                >
                  {tile.value.toLocaleString()}
                </p>
                <p className='text-muted-foreground mt-1 text-sm'>
                  {tile.label}
                </p>
                {tile.large && (
                  <div className='mt-3'>
                    <ReputationTierBadge
                      reputation={stats.reputation}
                      showScore
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
