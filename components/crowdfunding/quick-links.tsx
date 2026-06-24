'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  Target,
  Users,
  MessageSquare,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

interface QuickLinksProps {
  slug: string;
  milestonesCount: number;
  teamCount: number;
  commentsCount: number;
  contributorsCount: number;
}

export function QuickLinks({
  slug,
  milestonesCount,
  teamCount,
  commentsCount,
  contributorsCount,
}: QuickLinksProps) {
  const links = [
    {
      icon: Target,
      label: 'Milestones',
      count: milestonesCount,
      href: `${slug}#milestones`,
    },
    {
      icon: Users,
      label: 'Team',
      count: teamCount,
      href: `${slug}#team`,
    },
    {
      icon: MessageSquare,
      label: 'Comments',
      count: commentsCount,
      href: `${slug}#comments`,
    },
    {
      icon: DollarSign,
      label: 'Funding',
      count: contributorsCount,
      href: `${slug}#funding`,
    },
  ];

  return (
    <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
      {links.map((link, index) => {
        const Icon = link.icon;
        return (
          <Link key={index} href={link.href}>
            <Card className='bg-card/40 border-border/30 hover:bg-card/60 hover:border-accent/50 h-full cursor-pointer transition-all'>
              <CardContent className='flex h-full flex-col items-start justify-between p-4'>
                <div className='flex w-full items-start justify-between'>
                  <Icon className='text-accent/70 h-4 w-4' />
                  <ArrowRight className='text-muted-foreground h-4 w-4 opacity-0 transition-transform group-hover:translate-x-1 hover:opacity-100' />
                </div>
                <div className='mt-3'>
                  <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
                    {link.label}
                  </p>
                  <p className='text-foreground mt-1 text-lg font-semibold'>
                    {link.count}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
