'use client';

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';

interface Contributor {
  name: string;
  amount: number;
  date: string;
  image?: string;
  anonymous?: boolean;
}

interface CampaignFundingTabProps {
  contributors: Contributor[];
  fundingRaised: number;
  fundingGoal: number;
  fundingCurrency: string;
  fundingEndDate: string;
}

export function CampaignFundingTab({
  contributors,
  fundingRaised,
  fundingGoal,
  fundingCurrency,
  fundingEndDate,
}: CampaignFundingTabProps) {
  const fundingProgress =
    fundingGoal > 0 ? (fundingRaised / fundingGoal) * 100 : 0;
  const daysLeft = Math.ceil(
    (new Date(fundingEndDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const totalContributors = contributors?.length || 0;
  const averageContribution =
    totalContributors > 0 ? fundingRaised / totalContributors : 0;
  const largestContribution =
    contributors?.length > 0 ? Math.max(...contributors.map(c => c.amount)) : 0;

  if (!contributors || contributors.length === 0) {
    return (
      <Card className='bg-background border-border/10'>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <DollarSign className='text-muted-foreground mb-4 h-12 w-12' />
          <h3 className='mb-2 text-lg font-semibold text-white'>
            No Contributions Yet
          </h3>
          <p className='text-center text-white/60'>
            Contributions will be displayed here once supporters start funding
            this campaign.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Funding Overview */}
      <Card className='bg-background border-border/10'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-white'>
            <TrendingUp className='h-5 w-5' />
            Funding Overview
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='text-center'>
            <div className='mb-2 text-3xl font-bold text-white'>
              {fundingCurrency} {fundingRaised.toLocaleString()}
            </div>
            <div className='text-white/60'>
              of {fundingCurrency} {fundingGoal.toLocaleString()} goal
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

          <div className='grid grid-cols-3 gap-4 text-center'>
            <div>
              <div className='text-lg font-semibold text-white'>
                {totalContributors}
              </div>
              <div className='flex items-center justify-center gap-1 text-sm text-white/60'>
                <Users className='h-3 w-3' />
                Contributors
              </div>
            </div>
            <div>
              <div className='text-lg font-semibold text-white'>
                {fundingCurrency} {averageContribution.toFixed(0)}
              </div>
              <div className='text-sm text-white/60'>Avg. Contribution</div>
            </div>
            <div>
              <div className='text-lg font-semibold text-white'>
                {fundingCurrency} {largestContribution.toLocaleString()}
              </div>
              <div className='text-sm text-white/60'>Largest Contribution</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Contributors */}
      <Card className='bg-background border-border/10'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-white'>
            <DollarSign className='h-5 w-5' />
            Recent Contributors ({totalContributors})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {contributors.map((contributor, index) => (
              <div
                key={index}
                className='bg-muted/10 hover:bg-muted/20 flex items-center justify-between rounded-lg p-4 transition-colors'
              >
                <div className='flex items-center gap-3'>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage
                      src={contributor.image}
                      alt={contributor.name}
                    />
                    <AvatarFallback className='bg-primary/10 text-primary'>
                      {contributor.anonymous
                        ? '?'
                        : contributor.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium text-white'>
                      {contributor.anonymous ? 'Anonymous' : contributor.name}
                    </p>
                    <p className='flex items-center gap-1 text-sm text-white/60'>
                      <Calendar className='h-3 w-3' />
                      {format(new Date(contributor.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-lg font-semibold text-white'>
                    {fundingCurrency} {contributor.amount.toLocaleString()}
                  </div>
                  {contributor.amount === largestContribution &&
                    totalContributors > 1 && (
                      <Badge variant='secondary' className='mt-1 text-xs'>
                        Top Contributor
                      </Badge>
                    )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
