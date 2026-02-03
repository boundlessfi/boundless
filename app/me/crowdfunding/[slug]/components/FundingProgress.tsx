import { format } from 'date-fns';
import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Crowdfunding } from '@/features/projects/types';

interface FundingProgressProps {
  campaign: Crowdfunding;
}

export function FundingProgress({ campaign }: FundingProgressProps) {
  const fundingProgress =
    campaign.fundingGoal > 0
      ? (campaign.fundingRaised / campaign.fundingGoal) * 100
      : 0;
  const daysLeft = Math.ceil(
    (new Date(campaign.fundingEndDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <Card className='bg-background border-border/10'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-white'>
          <Target className='h-5 w-5' />
          Funding Progress
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='text-center'>
          <div className='text-3xl font-bold text-white'>
            ${campaign.fundingRaised.toLocaleString()}
          </div>
          <div className='text-white/60'>
            of ${campaign.fundingGoal.toLocaleString()} goal
          </div>
        </div>

        <Progress value={fundingProgress} className='h-3' />

        <div className='grid grid-cols-2 gap-4 text-center'>
          <div>
            <div className='text-lg font-semibold text-white'>
              {fundingProgress.toFixed(1)}%
            </div>
            <div className='text-sm text-white/60'>Funded</div>
          </div>
          <div>
            <div className='text-lg font-semibold text-white'>
              {daysLeft > 0 ? daysLeft : 0}
            </div>
            <div className='text-sm text-white/60'>
              {daysLeft > 0 ? 'Days Left' : 'Ended'}
            </div>
          </div>
        </div>

        <Separator className='bg-border' />

        <div className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-white/60'>Currency</span>
            <span className='text-white'>{campaign.fundingCurrency}</span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-white/60'>End Date</span>
            <span className='text-white'>
              {format(new Date(campaign.fundingEndDate), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
