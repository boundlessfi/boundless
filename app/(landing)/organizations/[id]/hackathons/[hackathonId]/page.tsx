'use client';

import { useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { useHackathons } from '@/hooks/use-hackathons';
import { useEffect } from 'react';
import { useHackathonAnalytics } from '@/hooks/use-hackathon-analytics';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HackathonStatistics } from '@/components/organization/hackathons/details/HackathonStatistics';
import { HackathonCharts } from '@/components/organization/hackathons/details/HackathonCharts';
import { HackathonTimeline } from '@/components/organization/hackathons/details/HackathonTimeline';

export default function HackathonPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const hackathonId = params.hackathonId as string;

  const { currentHackathon, currentLoading, currentError, fetchHackathon } =
    useHackathons({
      organizationId,
      autoFetch: false,
    });

  const { statistics, statisticsLoading, timeSeriesData, timeSeriesLoading } =
    useHackathonAnalytics(organizationId, hackathonId);

  useEffect(() => {
    if (organizationId && hackathonId) {
      void fetchHackathon(hackathonId);
    }
  }, [organizationId, hackathonId, fetchHackathon]);

  if (currentLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black p-4 text-white sm:p-6 md:p-8'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='h-8 w-8 animate-spin' />
          <p className='text-sm text-gray-400'>Loading hackathon data...</p>
        </div>
      </div>
    );
  }

  if (currentError || !currentHackathon) {
    return (
      <div className='min-h-screen bg-black p-4 text-white sm:p-6 md:p-8'>
        <Alert variant='destructive' className='border-red-500 bg-red-500/10'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {currentError ||
              'Failed to load hackathon. Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black p-4 text-white sm:p-6 md:p-8'>
      <div className='rounded-xl border border-gray-900 p-4 sm:p-6 md:p-8'>
        <HackathonStatistics
          statistics={statistics}
          loading={statisticsLoading}
        />
        <HackathonCharts
          timeSeriesData={timeSeriesData}
          loading={timeSeriesLoading}
        />
      </div>

      <div className='mt-6 rounded-xl border border-gray-900 p-4 sm:p-6 md:mt-8 md:p-8'>
        <h2 className='mb-6 text-lg font-medium text-white'>Timeline</h2>
        <HackathonTimeline timeline={currentHackathon?.timeline} />
      </div>
    </div>
  );
}
