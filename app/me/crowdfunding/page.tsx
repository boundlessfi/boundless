'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Rocket } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMyCampaigns } from '@/features/crowdfunding';
import ProjectCard from '@/features/projects/components/ProjectCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MyCrowdfundingPage() {
  const { data, isLoading } = useMyCampaigns(1, 50);
  const campaigns = data?.data ?? [];

  if (isLoading) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <LoadingSpinner size='xl' />
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6 flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-white'>My Campaigns</h1>
          <p className='mt-2 text-white/70'>
            All your crowdfunding campaigns ({campaigns.length} total)
          </p>
        </div>
        <Button asChild className='bg-primary hover:bg-primary/90'>
          <Link href='/crowdfunding/new'>
            <Plus className='mr-2 h-4 w-4' />
            Create Campaign
          </Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className='bg-background border-border/10'>
          <CardContent className='py-12 text-center'>
            <Rocket className='mx-auto mb-4 h-16 w-16 text-white/30' />
            <h3 className='mb-2 text-xl font-semibold text-white'>
              No campaigns yet
            </h3>
            <p className='mb-6 text-white/60'>
              You haven&apos;t created any crowdfunding campaigns yet. Start one
              and rally the community behind it.
            </p>
            <Button asChild>
              <Link href='/crowdfunding/new'>Create your first campaign</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {campaigns.map(c => (
            <ProjectCard
              key={c.id}
              isFullWidth
              data={c}
              basePath='/me/crowdfunding'
            />
          ))}
        </div>
      )}
    </div>
  );
}
