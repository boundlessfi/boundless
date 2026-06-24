'use client';

import { GetMeResponse } from '@/lib/api/types';
import { SectionCards } from '@/components/section-cards';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { RecentProjects } from '@/components/recent-projects';
import { useAuthStatus } from '@/hooks/use-auth';

export function MeDashboard() {
  const { user, isLoading } = useAuthStatus();
  // user.profile is typed as any in use-auth, so we cast it here for safety
  // or checks if it matches GetMeResponse.
  // Since useAuthStatus fetches getMe(), we assume it is the correct shape.
  const meData = user?.profile as GetMeResponse | undefined;

  if (isLoading) {
    return <div className='p-8 text-center'>Loading...</div>;
  }

  if (!meData) {
    // If we have a user but no profile yet (shouldn't happen if isLoading is accurate, but possible)
    // we might want to return loading or failure.
    // Given useAuthStatus implementation, isLoading covers profile fetching.
    return <div className='p-8 text-center'>Failed to load data</div>;
  }

  const chartData =
    meData.chart?.map(item => ({
      date: item.date,
      projects: item.count,
    })) || [];

  return (
    <div className='@container/main flex flex-1 flex-col gap-2'>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <SectionCards stats={meData.stats} />
        <div className='px-4 lg:px-6'>
          {' '}
          <RecentProjects projects={meData.user?.projects || []} />
        </div>
        <div className='px-4 lg:px-6'>
          {' '}
          <ChartAreaInteractive
            chartData={chartData}
            title='Activity Overview'
            description='Your activity over time'
          />
        </div>
      </div>
    </div>
  );
}
