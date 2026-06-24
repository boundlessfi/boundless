'use client';

import Link from 'next/link';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Target,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

import { Milestone } from '@/features/projects/types';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/ui/metric-card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { milestoneState, TONE_PILL } from '@/lib/crowdfunding/status';
import type { StatusTone } from '@/lib/crowdfunding/status';

interface MilestoneCardProps {
  milestone: Milestone;
  index: number;
  totalAmount: number;
  campaignSlug: string;
}

const TONE_ICON: Record<StatusTone, React.ReactNode> = {
  success: <CheckCircle2 className='h-4 w-4' />,
  info: <Clock className='h-4 w-4' />,
  warning: <AlertCircle className='h-4 w-4' />,
  danger: <AlertCircle className='h-4 w-4' />,
  neutral: <Target className='h-4 w-4' />,
  live: <CheckCircle2 className='h-4 w-4' />,
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
        (new Date(milestone.endDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const st = milestoneState(milestone.reviewStatus, milestone.claimedAt);

  return (
    <Link href={`${campaignSlug}/milestones/${milestone.id}`}>
      <MetricCard
        className='group relative cursor-pointer overflow-hidden transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10'
        contentClassName='p-4'
      >
        <div className='relative'>
          {/* Header */}
          <div className='mb-4 flex items-start justify-between gap-4'>
            <div className='flex flex-1 items-start gap-4'>
              <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-sm font-semibold text-amber-600'>
                {index + 1}
              </div>
              <div className='min-w-0 flex-1'>
                <h3 className='text-foreground truncate text-base font-semibold transition-colors group-hover:text-amber-500'>
                  {milestone.title || milestone.name}
                </h3>
                {milestone.description && (
                  <p className='text-muted-foreground mt-1 line-clamp-2 text-sm'>
                    {milestone.description}
                  </p>
                )}
              </div>
            </div>
            <Badge
              variant='outline'
              className={cn(
                'flex flex-shrink-0 items-center gap-1.5 text-xs',
                TONE_PILL[st.tone]
              )}
            >
              {TONE_ICON[st.tone]}
              {st.label}
            </Badge>
          </div>

          {/* Metrics row */}
          <div className='mb-4 grid grid-cols-3 gap-4'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='text-muted-foreground h-4 w-4 shrink-0' />
              <div>
                <p className='text-muted-foreground text-xs tracking-wide uppercase'>
                  Amount
                </p>
                <p className='text-foreground text-sm font-semibold'>
                  ${amount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Calendar className='text-muted-foreground h-4 w-4 shrink-0' />
              <div>
                <p className='text-muted-foreground text-xs tracking-wide uppercase'>
                  Due
                </p>
                <p className='text-foreground text-sm font-semibold'>
                  {milestone.endDate
                    ? format(new Date(milestone.endDate), 'MMM d')
                    : 'TBD'}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <div className='flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20'>
                <div className='h-2 w-2 rounded-full bg-amber-500' />
              </div>
              <div>
                <p className='text-muted-foreground text-xs tracking-wide uppercase'>
                  Of total
                </p>
                <p className='text-foreground text-sm font-semibold'>
                  {percentOfTotal.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className='mb-3'>
            <div className='mb-1.5 flex items-center justify-between'>
              <span className='text-muted-foreground text-xs font-medium'>
                Funding allocation
              </span>
              <span className='text-xs font-semibold text-amber-600'>
                {percentOfTotal.toFixed(1)}%
              </span>
            </div>
            <Progress value={percentOfTotal} className='h-1.5' />
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground text-xs'>
              {milestone.claimedAt
                ? `Paid out ${format(new Date(milestone.claimedAt), 'MMM d, yyyy')}`
                : daysUntilEnd != null && daysUntilEnd > 0
                  ? `${daysUntilEnd} days remaining`
                  : daysUntilEnd != null && daysUntilEnd <= 0
                    ? 'Deadline passed'
                    : ''}
            </span>
            <ChevronRight className='text-muted-foreground h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-amber-500' />
          </div>
        </div>
      </MetricCard>
    </Link>
  );
}
