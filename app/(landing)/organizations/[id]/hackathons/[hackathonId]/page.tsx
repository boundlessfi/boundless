'use client';

import { useParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  Calendar,
  TrendingUp,
  Check,
} from 'lucide-react';
import { useHackathons } from '@/hooks/use-hackathons';
import { useEffect, useState } from 'react';
import { useHackathonAnalytics } from '@/hooks/use-hackathon-analytics';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HackathonStatistics } from '@/components/organization/hackathons/details/HackathonStatistics';
import { HackathonCharts } from '@/components/organization/hackathons/details/HackathonCharts';
import { HackathonTimeline } from '@/components/organization/hackathons/details/HackathonTimeline';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import HackathonPublishedModal from '@/components/organization/hackathons/new/tabs/components/review/HackathonPublishedModal';
import type { PublishResponseData } from '@/hooks/use-hackathon-publish';

const STORAGE_KEY = 'boundless_hackathon_published';

export default function HackathonPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const hackathonId = params.hackathonId as string;

  const [publishedModalData, setPublishedModalData] = useState<{
    publishResponse: PublishResponseData;
    organizationId: string;
  } | null>(null);

  const { currentHackathon, currentLoading, currentError, fetchHackathon } =
    useHackathons({
      organizationId,
      autoFetch: false,
    });

  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useHackathonAnalytics(organizationId, hackathonId);

  useEffect(() => {
    if (organizationId && hackathonId) {
      void fetchHackathon(hackathonId);
    }
  }, [organizationId, hackathonId, fetchHackathon]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const payload = JSON.parse(raw) as {
        organizationId: string;
        id: string;
        slug: string;
        publishedAt: string;
        message: string;
        escrowAddress: string;
        transactionHash: string | null;
      };
      if (payload.id !== hackathonId) return;
      sessionStorage.removeItem(STORAGE_KEY);
      setPublishedModalData({
        publishResponse: {
          id: payload.id,
          slug: payload.slug,
          publishedAt: payload.publishedAt,
          message: payload.message,
          escrowAddress: payload.escrowAddress,
          transactionHash: payload.transactionHash,
        },
        organizationId: payload.organizationId,
      });
    } catch {
      // ignore
    }
  }, [hackathonId]);

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

  // Adapt key metrics
  const statistics = analytics?.summary || null;

  // Adapt charts data
  const timeSeriesData = analytics?.trends
    ? {
        submissions: {
          daily: analytics.trends.submissionsOverTime.map(p => ({
            date: p.date,
            count: p.count,
          })),
          weekly: [],
        },
        participants: {
          daily: analytics.trends.participantSignupsOverTime.map(p => ({
            date: p.date,
            count: p.count,
          })),
          weekly: [],
        },
      }
    : null;

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='min-h-screen bg-black'>
        <HackathonPublishedModal
          open={!!publishedModalData}
          onOpenChange={open => {
            if (!open) setPublishedModalData(null);
          }}
          publishResponse={publishedModalData?.publishResponse ?? null}
          organizationId={publishedModalData?.organizationId}
        />

        {/* Hero Section with Hackathon Name */}
        <div className='border-b border-gray-900 p-4'>
          <div className='mx-auto max-w-7xl'>
            <h1 className='text-3xl font-light tracking-tight text-white sm:text-4xl'>
              {currentHackathon?.name || 'Hackathon Dashboard'}
            </h1>
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
            {analyticsError && (
              <Alert
                variant='destructive'
                className='mb-6 border-red-900/20 bg-red-950/20'
              >
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Unable to load analytics</AlertTitle>
                <AlertDescription className='text-sm text-gray-400'>
                  {analyticsError}
                </AlertDescription>
              </Alert>
            )}
            <HackathonStatistics
              statistics={statistics}
              loading={analyticsLoading}
            />
          </section>

          {/* Charts Section */}
          <section className='mb-16'>
            <HackathonCharts
              timeSeriesData={timeSeriesData}
              loading={analyticsLoading}
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

            {/* Render new timeline from analytics */}
            <div className='relative'>
              <div className='space-y-0'>
                {(() => {
                  const timelineEvents = analytics?.timeline || [];
                  const hasWinnerAnnouncement = timelineEvents.some(
                    e => e.phase === 'Winner Announcement'
                  );

                  const fullTimeline = [...timelineEvents];

                  return fullTimeline.map((phase, index) => {
                    const isLast = index === fullTimeline.length - 1;
                    const isActive = phase.status === 'ongoing';
                    const isCompleted = phase.status === 'completed';

                    return (
                      <div
                        key={`${phase.phase}-${index}`}
                        className={`relative flex items-start gap-3 sm:gap-4 ${!isLast ? 'pb-6' : ''}`}
                      >
                        <div className='relative flex flex-col items-center'>
                          {isActive ? (
                            <div className='bg-active-bg z-10 flex shrink-0 items-center justify-center rounded-full p-1'>
                              <div className='bg-primary z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full' />
                            </div>
                          ) : isCompleted ? (
                            <div className='z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10'>
                              <Check className='h-3 w-3 text-green-500' />
                            </div>
                          ) : (
                            <div className='bg-inactive z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#1C1C1C] opacity-50' />
                          )}
                          {!isLast && (
                            <div className='absolute top-6 left-1/2 h-6 w-0.5 -translate-x-1/2'>
                              <div className='h-full border-l-2 border-dashed border-gray-600' />
                            </div>
                          )}
                        </div>
                        <div className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
                          <div className='min-w-0 flex-1'>
                            <h3 className='mb-1 text-sm font-medium text-white sm:text-base'>
                              {phase.phase}
                            </h3>
                            <p
                              className={`text-xs sm:text-sm ${
                                isCompleted
                                  ? 'text-gray-400'
                                  : isActive
                                    ? 'text-white/60'
                                    : 'text-white/40'
                              }`}
                            >
                              {phase.description}
                            </p>
                          </div>
                          <div className='shrink-0 text-xs whitespace-nowrap text-white/60 sm:text-sm'>
                            {new Date(phase.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
