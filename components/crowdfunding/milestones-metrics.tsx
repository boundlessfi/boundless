'use client';

import { Milestone } from '@/features/projects/types';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, Target, TrendingUp } from 'lucide-react';

interface MilestonesMetricsProps {
  milestones: Milestone[];
}

export function MilestonesMetrics({ milestones }: MilestonesMetricsProps) {
  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const completedCount = milestones.filter(
    m => m.reviewStatus?.toLowerCase() === 'completed'
  ).length;
  const inProgressCount = milestones.filter(
    m =>
      m.reviewStatus?.toLowerCase() === 'in progress' ||
      m.reviewStatus?.toLowerCase() === 'in-progress'
  ).length;
  const completedAmount = milestones
    .filter(m => m.reviewStatus?.toLowerCase() === 'completed')
    .reduce((sum, m) => sum + m.amount, 0);
  const completionRate = milestones.length
    ? Math.round((completedCount / milestones.length) * 100)
    : 0;

  const metrics = [
    {
      label: 'Total Milestones',
      value: milestones.length,
      subtext: 'Planned goals',
      icon: Target,
    },
    {
      label: 'Completed',
      value: completedCount,
      subtext: 'Finished milestones',
      icon: CheckCircle2,
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      subtext: 'Active milestones',
      icon: Clock,
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      subtext: 'Overall progress',
      icon: TrendingUp,
    },
  ];

  return (
    <div>
      {/* Metrics Grid */}
      <div className='mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.label}
              className='bg-background border-border/10 hover:border-primary/30 shadow-primary/10 hover:shadow-primary/10 @container/card border transition-all duration-300 hover:shadow-lg'
            >
              <CardContent className='p-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <p className='text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase'>
                      {metric.label}
                    </p>
                    <p className='text-foreground text-xl font-bold'>
                      {metric.value}
                    </p>
                    <p className='text-muted-foreground mt-1 text-xs'>
                      {metric.subtext}
                    </p>
                  </div>
                  <Icon className='text-accent/60 h-5 w-5' />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Info */}
      <Card className='border-border/50 border bg-gradient-to-r from-amber-500/5 to-amber-500/0 p-5'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          <div>
            <p className='text-muted-foreground mb-1 text-sm'>
              Total Allocated
            </p>
            <p className='text-foreground text-2xl font-bold'>
              ${totalAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className='text-muted-foreground mb-1 text-sm'>
              Completed Amount
            </p>
            <p className='text-2xl font-bold text-emerald-500'>
              ${completedAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className='text-muted-foreground mb-1 text-sm'>
              Remaining Amount
            </p>
            <p className='text-2xl font-bold text-amber-500'>
              ${(totalAmount - completedAmount).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
