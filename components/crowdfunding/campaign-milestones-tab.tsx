'use client';

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Calendar } from 'lucide-react';

interface Milestone {
  name: string;
  description: string;
  amount: number;
  reviewStatus: string;
  endDate: string;
  progress?: number;
}

interface CampaignMilestonesTabProps {
  milestones: Milestone[];
  fundingRaised: number;
  fundingCurrency: string;
}

export function CampaignMilestonesTab({
  milestones,
  fundingRaised,
  fundingCurrency,
}: CampaignMilestonesTabProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'active':
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getMilestoneProgress = (milestone: Milestone) => {
    if (milestone.reviewStatus?.toLowerCase() === 'completed') return 100;
    if (fundingRaised >= milestone.amount) return 100;
    return Math.min((fundingRaised / milestone.amount) * 100, 100);
  };

  if (!milestones || milestones.length === 0) {
    return (
      <Card className='bg-background border-border/10'>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Target className='text-muted-foreground mb-4 h-12 w-12' />
          <h3 className='mb-2 text-lg font-semibold text-white'>
            No Milestones
          </h3>
          <p className='text-center text-white/60'>
            Campaign milestones will be displayed here once they are added.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-background border-border/10'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-white'>
          <Target className='h-5 w-5' />
          Milestones ({milestones.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {milestones.map((milestone, index) => {
            const progress = getMilestoneProgress(milestone);
            const isCompleted =
              milestone.reviewStatus?.toLowerCase() === 'completed';
            const isOverdue =
              milestone.endDate &&
              new Date(milestone.endDate) < new Date() &&
              !isCompleted;

            return (
              <div
                key={index}
                className='bg-muted/10 hover:bg-muted/20 rounded-lg p-6 transition-colors'
              >
                <div className='mb-4 flex items-start justify-between'>
                  <div className='flex-1'>
                    <h4 className='mb-2 text-lg font-semibold text-white'>
                      {milestone.name}
                    </h4>
                    <p className='mb-3 text-white/80'>
                      {milestone.description}
                    </p>
                  </div>
                  <Badge
                    variant='outline'
                    className={getStatusColor(milestone.reviewStatus)}
                  >
                    {milestone.reviewStatus || 'Pending'}
                  </Badge>
                </div>

                <div className='space-y-3'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-white/60'>Target Amount</span>
                    <span className='font-medium text-white'>
                      {fundingCurrency} {milestone.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-white/60'>Current Progress</span>
                    <span className='font-medium text-white'>
                      {fundingCurrency}{' '}
                      {Math.min(
                        fundingRaised,
                        milestone.amount
                      ).toLocaleString()}
                    </span>
                  </div>

                  <Progress value={progress} className='h-2' />

                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-white/60'>
                      {progress.toFixed(1)}% Complete
                    </span>
                    <div className='flex items-center gap-1 text-white/60'>
                      <Calendar className='h-4 w-4' />
                      <span>
                        {milestone.endDate
                          ? format(new Date(milestone.endDate), 'MMM dd, yyyy')
                          : 'TBD'}
                        {isOverdue && (
                          <span className='ml-2 text-red-400'>(Overdue)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
