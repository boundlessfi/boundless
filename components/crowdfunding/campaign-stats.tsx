'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';
import { Crowdfunding } from '@/features/projects/types';
import Link from 'next/link';

interface CampaignStatsProps {
  campaign: Crowdfunding;
}

export function CampaignStats({ campaign }: CampaignStatsProps) {
  const fundingProgress =
    campaign.fundingGoal > 0
      ? (campaign.fundingRaised / campaign.fundingGoal) * 100
      : 0;

  const stats = [
    {
      icon: DollarSign,
      label: 'Total Raised',
      value: `${campaign.fundingCurrency} ${campaign.fundingRaised.toLocaleString()}`,
      subtext: `of ${campaign.fundingCurrency} ${campaign.fundingGoal.toLocaleString()}`,
      link: undefined, // Optional: Add a link here if needed
    },
    {
      icon: TrendingUp,
      label: 'Funding Progress',
      value: `${fundingProgress.toFixed(1)}%`,
      subtext: 'Campaign progress',
    },
    {
      icon: Users,
      label: 'Contributors',
      value: (campaign.contributors || []).length.toString(),
      subtext: 'People backed',
    },
    {
      icon: Target,
      label: 'Milestones',
      value: (campaign.milestones || []).length.toString(),
      subtext: 'Planned goals',
      link: `/me/crowdfunding/${campaign.slug}/milestones`, // Optional: Add a link here if needed
    },
  ];

  return (
    <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return stat.link ? (
          <Link
            key={index}
            href={stat.link}
            target='_blank'
            rel='noopener noreferrer'
            className='block cursor-pointer'
          >
            <Card className='bg-background border-border/10 hover:border-primary/30 shadow-primary/10 hover:shadow-primary/10 @container/card h-full border transition-all duration-300 hover:shadow-lg'>
              <CardContent className='p-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <p className='text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase'>
                      {stat.label}
                    </p>
                    <p className='text-foreground text-xl font-bold'>
                      {stat.value}
                    </p>
                    <p className='text-muted-foreground mt-1 text-xs'>
                      {stat.subtext}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Icon className='text-accent/60 h-5 w-5' />
                    {stat.link && (
                      <ArrowUpRight className='text-muted-foreground h-4 w-4' />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <div key={index}>
            <Card className='bg-background border-border/10 hover:border-primary/30 shadow-primary/10 hover:shadow-primary/10 @container/card h-full border transition-all duration-300 hover:shadow-lg'>
              <CardContent className='p-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <p className='text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase'>
                      {stat.label}
                    </p>
                    <p className='text-foreground text-xl font-bold'>
                      {stat.value}
                    </p>
                    <p className='text-muted-foreground mt-1 text-xs'>
                      {stat.subtext}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Icon className='text-accent/60 h-5 w-5' />
                    {stat.link && (
                      <ArrowUpRight className='text-muted-foreground h-4 w-4' />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );

  // <Card className='bg-background border-border/10 hover:border-primary/30 shadow-primary/10 hover:shadow-primary/10 @container/card border transition-all duration-300 hover:shadow-lg'>
  //   <CardHeader>
  //     <CardDescription className='flex items-center justify-between text-white/80'>
  //       {description || title}
  //       {Icon && <Icon size={20} />}
  //     </CardDescription>
  //     <CardTitle className='text-2xl font-semibold text-white tabular-nums @[250px]/card:text-3xl'>
  //       {formatNumber(value)}
  //     </CardTitle>
  //   </CardHeader>
  // </Card>
}
