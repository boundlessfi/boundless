'use client';

import { format } from 'date-fns';
import { CheckCircle2, Clock, ExternalLink, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Milestone } from '@/features/projects/types';
import { getTransactionExplorerUrl } from '@/lib/wallet-utils';

interface FundDisbursementTrackerProps {
  milestones: Milestone[];
  fundingGoal: number;
  fundingCurrency: string;
}

export function FundDisbursementTracker({
  milestones,
  fundingGoal,
  fundingCurrency,
}: FundDisbursementTrackerProps) {
  const releasedMilestones = milestones.filter(m => m.releaseTransactionHash);
  const totalReleased = releasedMilestones.reduce(
    (sum, m) => sum + m.amount,
    0
  );
  const totalLocked = Math.max(0, fundingGoal - totalReleased);
  const disbursementProgress =
    fundingGoal > 0 ? Math.min((totalReleased / fundingGoal) * 100, 100) : 0;

  if (!milestones || milestones.length === 0) {
    return (
      <Card className='bg-background border-border/10'>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Lock className='text-muted-foreground mb-4 h-12 w-12' />
          <h3 className='mb-2 text-lg font-semibold text-white'>
            No Disbursements Yet
          </h3>
          <p className='text-center text-white/60'>
            Fund releases will appear here once milestones are approved.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Summary card */}
      <Card className='bg-background border-border/10'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-white'>
            <CheckCircle2 className='h-5 w-5' />
            Disbursement Summary
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 text-center'>
            <div>
              <div className='text-2xl font-bold text-green-400'>
                {fundingCurrency} {totalReleased.toLocaleString()}
              </div>
              <div className='text-sm text-white/60'>Total Released</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-white/50'>
                {fundingCurrency} {totalLocked.toLocaleString()}
              </div>
              <div className='text-sm text-white/60'>Still Locked</div>
            </div>
          </div>

          <Progress value={disbursementProgress} className='h-3' />

          <div className='flex items-center justify-between text-sm'>
            <span className='text-white/60'>
              {releasedMilestones.length}/{milestones.length} milestones
              released
            </span>
            <span className='font-medium text-white'>
              {disbursementProgress.toFixed(1)}% disbursed
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Per-milestone waterfall */}
      <Card className='bg-background border-border/10'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-white'>
            <Clock className='h-5 w-5' />
            Release History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-1'>
            {milestones.map((milestone, index) => {
              const isReleased = !!milestone.releaseTransactionHash;
              const explorerUrl = milestone.releaseTransactionHash
                ? getTransactionExplorerUrl(milestone.releaseTransactionHash)
                : null;
              const releaseDate = milestone.completedAt ?? milestone.reviewedAt;

              return (
                <div key={milestone.id ?? index}>
                  {index > 0 && <Separator className='bg-border/20 my-3' />}
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex min-w-0 flex-1 items-start gap-3'>
                      <div
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          isReleased
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium text-white'>
                          {milestone.title}
                        </p>
                        {isReleased && releaseDate && (
                          <p className='mt-0.5 text-xs text-white/40'>
                            Released{' '}
                            {format(new Date(releaseDate), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className='flex shrink-0 items-center gap-2'>
                      <div className='text-right'>
                        <div
                          className={`text-sm font-semibold ${
                            isReleased ? 'text-green-400' : 'text-white/50'
                          }`}
                        >
                          {fundingCurrency} {milestone.amount.toLocaleString()}
                        </div>
                        {isReleased ? (
                          <Badge
                            variant='outline'
                            className='mt-1 border-green-500/30 bg-green-500/10 text-xs text-green-400'
                          >
                            Released
                          </Badge>
                        ) : (
                          <Badge
                            variant='outline'
                            className='mt-1 border-white/10 bg-white/5 text-xs text-white/40'
                          >
                            Locked
                          </Badge>
                        )}
                      </div>
                      {explorerUrl && (
                        <a
                          href={explorerUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          title='View on Stellar Explorer'
                          className='text-primary hover:text-primary/70 transition-colors'
                        >
                          <ExternalLink className='h-4 w-4' />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
