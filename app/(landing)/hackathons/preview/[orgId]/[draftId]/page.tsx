'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  previewDraft,
  PrizeTier,
  transformPublicHackathonToHackathon,
} from '@/lib/api/hackathons';
import { HackathonBanner } from '@/components/hackathons/hackathonBanner';
import { HackathonNavTabs } from '@/components/hackathons/hackathonNavTabs';
import { HackathonOverview } from '@/components/hackathons/overview/hackathonOverview';
import { HackathonResources } from '@/components/hackathons/resources/resources';
import LoadingScreen from '@/components/landing-page/project/CreateProjectModal/LoadingScreen';
import { Badge } from '@/components/ui/badge';
import { BoundlessButton } from '@/components/buttons';
import type { Hackathon } from '@/types/hackathon';

// Mock data for preview (since drafts don't have participants/submissions yet)
const mockContent = `
  <p>This is a preview of your hackathon. Once published, participants will be able to see the full details here.</p>
`;

const mockTimelineEvents = [
  { event: 'Registration Opens', date: new Date().toISOString() },
  { event: 'Submission Deadline', date: new Date().toISOString() },
  { event: 'Judging Period', date: new Date().toISOString() },
  { event: 'Winners Announced', date: new Date().toISOString() },
];

const mockPrizes: PrizeTier[] = [
  {
    position: '1st',
    amount: 5000,
    currency: 'USD',
    description: 'Cash prize, Certificate, Featured on homepage',
  },
  {
    position: '2nd',
    amount: 3000,
    currency: 'USD',
    description: 'Cash prize, Certificate',
  },
  {
    position: '3rd',
    amount: 2000,
    currency: 'USD',
    description: 'Cash prize, Certificate',
  },
];

const totalPrizePool = mockPrizes.reduce((sum, prize) => sum + prize.amount, 0);

interface PreviewPageProps {
  params: Promise<{
    orgId: string;
    draftId: string;
  }>;
}

export default function DraftPreviewPage({ params }: PreviewPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resolvedParams, setResolvedParams] = useState<{
    orgId: string;
    draftId: string;
  } | null>(null);
  const [previewHackathon, setPreviewHackathon] = useState<Hackathon | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<
    'unauthorized' | 'forbidden' | 'not_found' | 'other' | null
  >(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Resolve params (Next.js 15 async params)
  useEffect(() => {
    params.then(p => setResolvedParams(p));
  }, [params]);

  // Fetch preview data
  useEffect(() => {
    const fetchPreview = async () => {
      if (!resolvedParams) return;

      try {
        setLoading(true);
        setError(null);

        const response = await previewDraft(
          resolvedParams.orgId,
          resolvedParams.draftId
        );

        if (response.success && response.data) {
          // Transform PublicHackathon to Hackathon type
          const transformed = transformPublicHackathonToHackathon(
            response.data,
            response.data.organizer
          );

          // Map to the Hackathon type expected by components
          const hackathon: Hackathon = {
            id: transformed._id,
            title: transformed.information.title,
            tagline: transformed.participation?.about || '',
            description: transformed.information.description,
            slug: transformed.information.slug || '',
            imageUrl: transformed.information.banner,
            status:
              transformed.status === 'ongoing'
                ? 'ongoing'
                : transformed.status === 'completed'
                  ? 'ended'
                  : 'upcoming',
            participants: 0, // Always 0 for drafts
            totalPrizePool: response.data.totalPrizePool,
            deadline: transformed.timeline.submissionDeadline,
            categories: transformed.information.categories.map(cat =>
              cat.toString()
            ),
            startDate: transformed.timeline.startDate,
            endDate: transformed.timeline.winnerAnnouncementDate,
            organizer: response.data.organizer,
            featured: transformed.featured || false,
            resources: transformed.collaboration.socialLinks || [],
          };

          setPreviewHackathon(hackathon);
        } else {
          throw new Error(response.message || 'Failed to load preview');
        }
      } catch (err) {
        // Check if it's an axios error with status code
        let errorMessage = 'Failed to load preview';
        let errorType: 'unauthorized' | 'forbidden' | 'not_found' | 'other' =
          'other';

        // Check for axios error structure (has response property)
        if (
          err &&
          typeof err === 'object' &&
          'response' in err &&
          (
            err as {
              response?: { status?: number; data?: { message?: string } };
            }
          ).response
        ) {
          const response = (
            err as {
              response?: { status?: number; data?: { message?: string } };
            }
          ).response;
          const status = response?.status;

          if (status === 401) {
            errorMessage =
              'Authentication required. Please log in to view this preview.';
            errorType = 'unauthorized';
          } else if (status === 403) {
            errorMessage =
              'Access denied. Only owners and admins of this organization can preview hackathon drafts.';
            errorType = 'forbidden';
          } else if (status === 404) {
            errorMessage =
              "Draft not found. The hackathon draft you're looking for doesn't exist.";
            errorType = 'not_found';
          } else if (response?.data?.message) {
            errorMessage = response.data.message;
          }
        }
        // Check for transformed ApiError structure (has status property directly)
        else if (err && typeof err === 'object' && 'status' in err) {
          const status = (err as { status?: number }).status;
          if (status === 401) {
            errorMessage =
              'Authentication required. Please log in to view this preview.';
            errorType = 'unauthorized';
          } else if (status === 403) {
            errorMessage =
              'Access denied. Only owners and admins of this organization can preview hackathon drafts.';
            errorType = 'forbidden';
          } else if (status === 404) {
            errorMessage =
              "Draft not found. The hackathon draft you're looking for doesn't exist.";
            errorType = 'not_found';
          } else if (
            'message' in err &&
            typeof (err as { message: string }).message === 'string'
          ) {
            errorMessage = (err as { message: string }).message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setErrorType(errorType);
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams) {
      fetchPreview();
    }
  }, [resolvedParams]);

  const hackathonTabs = useMemo(
    () => [
      { id: 'overview', label: 'Overview' },
      { id: 'participants', label: 'Participants', badge: 0 },
      { id: 'resources', label: 'Resources' },
      { id: 'submission', label: 'Submissions', badge: 0 },
      { id: 'discussions', label: 'Discussions' },
    ],
    []
  );

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && hackathonTabs.some(tab => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, hackathonTabs]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center px-4'>
        <div className='max-w-md text-center'>
          <div className='mb-6'>
            {errorType === 'unauthorized' && (
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20'>
                <svg
                  className='h-8 w-8 text-yellow-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  />
                </svg>
              </div>
            )}
            {errorType === 'forbidden' && (
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20'>
                <svg
                  className='h-8 w-8 text-red-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                  />
                </svg>
              </div>
            )}
            {(errorType === 'not_found' || errorType === 'other') && (
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-500/20'>
                <svg
                  className='h-8 w-8 text-gray-400'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
            )}
          </div>
          <h1 className='mb-4 text-2xl font-bold text-white'>
            {errorType === 'unauthorized'
              ? 'Authentication Required'
              : errorType === 'forbidden'
                ? 'Access Denied'
                : errorType === 'not_found'
                  ? 'Preview Not Found'
                  : 'Error Loading Preview'}
          </h1>
          <p className='mb-6 text-gray-400'>{error}</p>
          <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
            {errorType === 'unauthorized' && (
              <BoundlessButton
                onClick={() => router.push('/auth?mode=signin')}
                className='w-full sm:w-auto'
              >
                Sign In
              </BoundlessButton>
            )}
            {resolvedParams && (
              <BoundlessButton
                onClick={() =>
                  router.push(
                    `/organizations/${resolvedParams.orgId}/hackathons`
                  )
                }
                variant='outline'
                className='w-full border-gray-700 hover:border-gray-600 hover:bg-gray-800 sm:w-auto'
              >
                Back to Hackathons
              </BoundlessButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!previewHackathon) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='mb-4 text-2xl font-bold text-white'>
            Preview not found
          </h1>
          <p className='text-gray-400'>
            The draft preview you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const handleBackToEdit = () => {
    if (resolvedParams) {
      router.push(
        `/organizations/${resolvedParams.orgId}/hackathons/drafts/${resolvedParams.draftId}`
      );
    }
  };

  return (
    <div className='mx-auto mt-10 max-w-[1440px] px-5 py-5 text-center text-4xl font-bold text-white md:px-[50px] lg:px-[100px]'>
      {/* Preview Banner */}
      <div className='mb-4 flex items-center justify-between gap-4'>
        <BoundlessButton
          onClick={handleBackToEdit}
          variant='outline'
          size='sm'
          className='border-gray-700 hover:border-gray-600 hover:bg-gray-800'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Edit
        </BoundlessButton>
        <Badge className='border-yellow-500/50 bg-yellow-500/20 px-4 py-2 text-sm font-semibold text-yellow-400'>
          ⚠️ PREVIEW MODE - This is how your hackathon will appear to users
        </Badge>
      </div>

      {/* Banner */}
      <HackathonBanner
        title={previewHackathon.title}
        tagline={previewHackathon.tagline}
        deadline={previewHackathon.deadline}
        categories={previewHackathon.categories}
        status={previewHackathon.status}
        participants={previewHackathon.participants}
        totalPrizePool={previewHackathon.totalPrizePool}
        imageUrl={previewHackathon.imageUrl}
        startDate={previewHackathon.startDate}
        endDate={previewHackathon.endDate}
      />

      {/* Tabs */}
      <HackathonNavTabs
        tabs={hackathonTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Content */}
      <div className='mx-auto max-w-7xl px-6 py-12 text-white'>
        {activeTab === 'overview' && (
          <HackathonOverview
            totalPrizePool={totalPrizePool.toString()}
            content={mockContent}
            timelineEvents={mockTimelineEvents}
            prizes={mockPrizes}
          />
        )}

        {activeTab === 'participants' && (
          <div className='py-12 text-center'>
            <p className='text-gray-400'>
              Participants will appear here once the hackathon is published and
              people start registering.
            </p>
          </div>
        )}

        {activeTab === 'resources' && <HackathonResources />}

        {activeTab === 'submission' && (
          <div className='py-12 text-center'>
            <p className='text-gray-400'>
              Submissions will appear here once the hackathon is published and
              participants start submitting their projects.
            </p>
          </div>
        )}

        {activeTab === 'discussions' && (
          <div className='py-12 text-center'>
            <p className='text-gray-400'>
              Discussions will appear here once the hackathon is published and
              participants start engaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
