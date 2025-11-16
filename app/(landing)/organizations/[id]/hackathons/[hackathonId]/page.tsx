'use client';

import { useParams } from 'next/navigation';
import { Loader2, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
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
      <div className='flex min-h-screen items-center justify-center bg-black'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
          <p className='text-sm text-gray-500'>Loading...</p>
        </div>
      </div>
    );
  }

  if (currentError || !currentHackathon) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black p-6'>
        <Alert
          variant='destructive'
          className='max-w-md border-red-900/20 bg-red-950/20'
        >
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Unable to load hackathon</AlertTitle>
          <AlertDescription className='text-sm text-gray-400'>
            {currentError || 'Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black'>
      {/* Hero Section with Hackathon Name */}
      <div className='border-b border-gray-900 p-4'>
        <div className='mx-auto max-w-7xl'>
          <h1 className='text-3xl font-light tracking-tight text-white sm:text-4xl'>
            {currentHackathon?.title || 'Hackathon Dashboard'}
          </h1>
          {currentHackathon?.information?.description && (
            <p className='mt-3 max-w-2xl text-sm text-gray-400'>
              {currentHackathon.information.description}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className='mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12'>
        {/* Statistics Section */}
        <section className='mb-16'>
          <div className='mb-8 flex items-center gap-2'>
            <TrendingUp className='h-4 w-4 text-gray-500' />
            <h2 className='text-sm font-medium tracking-wider text-gray-500 uppercase'>
              Analytics
            </h2>
          </div>
          <HackathonStatistics
            statistics={statistics}
            loading={statisticsLoading}
          />
        </section>

        {/* Charts Section */}
        <section className='mb-16'>
          <HackathonCharts
            timeSeriesData={timeSeriesData}
            loading={timeSeriesLoading}
          />
        </section>

        {/* Timeline Section */}
        <section>
          <div className='mb-8 flex items-center gap-2 border-t border-gray-900 pt-16'>
            <Calendar className='h-4 w-4 text-gray-500' />
            <h2 className='text-sm font-medium tracking-wider text-gray-500 uppercase'>
              Timeline
            </h2>
          </div>
          <HackathonTimeline timeline={currentHackathon?.timeline} />
        </section>
      </div>
    </div>
  );
}
