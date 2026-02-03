'use client';

import { Milestone } from '@/features/projects/types';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/metric-card';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Clock,
  Target,
  XCircle,
  Calendar,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  totalAmount: number;
  campaignSlug: string;
}

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return <CheckCircle2 className='h-5 w-5 text-emerald-500' />;
    case 'in progress':
    case 'in-progress':
      return <Clock className='h-5 w-5 text-amber-500' />;
    case 'pending':
      return <Target className='h-5 w-5 text-blue-500' />;
    case 'cancelled':
      return <XCircle className='h-5 w-5 text-red-500' />;
    default:
      return <Target className='h-5 w-5 text-blue-500' />;
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
    case 'in progress':
    case 'in-progress':
      return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
    case 'pending':
      return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    case 'cancelled':
      return 'bg-red-500/10 text-red-700 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  }
};

export function MilestoneCard({
  milestone,
  index,
  totalAmount,
  campaignSlug,
}: MilestoneCardProps) {
  const amount = milestone.amount || 0;
  const percentOfTotal = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
  const daysUntilEnd = milestone.endDate
    ? Math.ceil(
        (new Date(milestone.endDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <Link href={`${campaignSlug}/milestones/${milestone.id}`}>
      <MetricCard
        className='group relative cursor-pointer overflow-hidden transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10'
        contentClassName='p-4'
      >
        <div className='relative'>
          {/* Header Row */}
          <div className='mb-4 flex items-start justify-between'>
            <div className='flex flex-1 items-start gap-4'>
              {/* Milestone Number */}
              <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-sm font-semibold text-amber-600'>
                {index + 1}
              </div>

              {/* Milestone Info */}
              <div className='min-w-0 flex-1'>
                <h3 className='text-foreground truncate text-lg font-semibold transition-colors group-hover:text-amber-500'>
                  {milestone.name}
                </h3>
                <p className='text-muted-foreground mt-1 line-clamp-2 text-sm'>
                  {milestone.description}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className='ml-4 flex-shrink-0'>
              <Badge
                variant='outline'
                className={`flex items-center gap-2 ${getStatusColor(milestone.reviewStatus)}`}
              >
                {getStatusIcon(milestone.reviewStatus)}
                <span className='text-xs font-medium capitalize'>
                  {milestone.reviewStatus || 'Pending'}
                </span>
              </Badge>
            </div>
          </div>

          {/* Metrics Row */}
          <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-3'>
            {/* Amount */}
            <div className='flex items-center gap-3'>
              <TrendingUp className='text-muted-foreground h-4 w-4' />
              <div>
                <p className='text-muted-foreground text-xs tracking-wide uppercase'>
                  Amount
                </p>
                <p className='text-foreground text-sm font-semibold'>
                  ${amount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className='flex items-center gap-3'>
              <Calendar className='text-muted-foreground h-4 w-4' />
              <div>
                <p className='text-muted-foreground text-xs tracking-wide uppercase'>
                  Timeline
                </p>
                <p className='text-foreground text-sm font-semibold'>
                  {milestone.startDate
                    ? format(new Date(milestone.startDate), 'MMM d')
                    : 'TBD'}{' '}
                  -{' '}
                  {milestone.endDate
                    ? format(new Date(milestone.endDate), 'MMM d')
                    : 'TBD'}
                </p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className='flex items-center gap-3'>
              <div className='flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20'>
                <div className='h-2 w-2 rounded-full bg-amber-500' />
              </div>
              <div>
                <p className='text-muted-foreground text-xs tracking-wide uppercase'>
                  Of Total
                </p>
                <p className='text-foreground text-sm font-semibold'>
                  {percentOfTotal.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className='mb-3'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-muted-foreground text-xs font-medium'>
                Funding Allocation
              </span>
              <span className='text-xs font-semibold text-amber-600'>
                {percentOfTotal.toFixed(1)}%
              </span>
            </div>
            <Progress value={percentOfTotal} className='h-2' />
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground text-xs'>
              {daysUntilEnd > 0
                ? `${daysUntilEnd} days remaining`
                : 'Timeline ended'}
            </span>
            <ChevronRight className='text-muted-foreground h-4 w-4 transition-colors group-hover:translate-x-1 group-hover:text-amber-500' />
          </div>
        </div>
      </MetricCard>
    </Link>
  );
}
