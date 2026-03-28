'use client';

import { GetMeResponse } from '@/lib/api/types';
import { SectionCards } from '@/components/section-cards';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { RecentProjects } from '@/components/recent-projects';
import { useAuthStatus } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Plus, Rocket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function DashboardSkeleton() {
  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6'>
      {/* Welcome skeleton */}
      <div className='flex flex-col gap-1'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-48' />
      </div>
      {/* Cards skeleton */}
      <div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className='rounded-xl border border-white/6 bg-white/2 p-4'
          >
            <Skeleton className='mb-3 h-4 w-20' />
            <Skeleton className='h-8 w-16' />
          </div>
        ))}
      </div>
      {/* Projects skeleton */}
      <div className='rounded-xl border border-white/6 bg-white/2 p-5'>
        <Skeleton className='mb-4 h-5 w-36' />
        <div className='space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='flex items-center gap-3'>
              <Skeleton className='h-10 w-10 rounded-lg' />
              <div className='flex-1'>
                <Skeleton className='mb-1 h-4 w-40' />
                <Skeleton className='h-3 w-24' />
              </div>
              <Skeleton className='h-5 w-16 rounded-full' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MeDashboard() {
  const { user, isLoading } = useAuthStatus();
  const meData = user?.profile as GetMeResponse | undefined;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!meData) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-4 p-8'>
        <div className='rounded-2xl border border-white/6 bg-white/2 p-8 text-center'>
          <p className='mb-1 text-lg font-medium text-white'>
            Unable to load your dashboard
          </p>
          <p className='text-sm text-white/50'>
            Try refreshing the page. If the problem continues, reach out to
            support.
          </p>
        </div>
      </div>
    );
  }

  const firstName = (user?.name || '').split(' ')[0] || 'there';
  const chartData =
    meData.chart?.map(item => ({
      date: item.date,
      projects: item.count,
    })) || [];

  const hasProjects = (meData.user?.projects || []).length > 0;

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 md:p-6'>
      {/* Welcome section */}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight text-white'>
            {getGreeting()}, {firstName}
          </h1>
          <p className='mt-1 text-sm text-white/50'>
            Here&apos;s what&apos;s happening with your projects and activity.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            asChild
            size='sm'
            variant='outline'
            className='border-white/10 bg-white/3 text-white/70 hover:bg-white/6 hover:text-white'
          >
            <Link href='/me/projects'>
              <Rocket className='mr-1.5 h-3.5 w-3.5' />
              My Projects
            </Link>
          </Button>
          <Button
            asChild
            size='sm'
            className='bg-primary hover:bg-primary/90 text-black'
          >
            <Link href='/me/projects/create'>
              <Plus className='mr-1.5 h-3.5 w-3.5' />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <SectionCards stats={meData.stats} />

      {/* Projects + Chart grid */}
      <div className='grid gap-4 sm:gap-6 lg:grid-cols-5'>
        <div className='min-w-0 lg:col-span-3'>
          <RecentProjects projects={meData.user?.projects || []} />
        </div>
        <div className='min-w-0 lg:col-span-2'>
          <ChartAreaInteractive
            chartData={chartData}
            title='Activity'
            description='Project activity over time'
          />
        </div>
      </div>

      {/* Empty state CTA when no projects */}
      {!hasProjects && (
        <div className='rounded-2xl border border-dashed border-white/10 bg-white/1 p-8 text-center'>
          <div className='bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full'>
            <Rocket className='text-primary h-6 w-6' />
          </div>
          <h3 className='mb-1 text-base font-medium text-white'>
            Launch your first project
          </h3>
          <p className='mx-auto mb-4 max-w-sm text-sm text-white/40'>
            Create a project to start building, collaborating, and raising funds
            on Boundless.
          </p>
          <Button
            asChild
            size='sm'
            className='bg-primary hover:bg-primary/90 text-black'
          >
            <Link href='/me/projects/create'>
              Get Started
              <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
