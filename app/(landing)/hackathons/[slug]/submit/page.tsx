'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHackathon } from '@/hooks/hackathon/use-hackathon-queries';
import { useAuthStatus } from '@/hooks/use-auth';
import { useSubmission } from '@/hooks/hackathon/use-submission';
import { SubmissionFormContent } from '@/components/hackathons/submissions/SubmissionForm';
import { HackathonDataProvider } from '@/lib/providers/hackathonProvider';
import LoadingScreen from '@/features/projects/components/CreateProjectModal/LoadingScreen';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function SubmitProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStatus();

  const resolvedParams = use(params);
  const hackathonSlug = resolvedParams.slug;

  // React Query fetches the hackathon — no manual setCurrentHackathon or useEffect needed.
  const { data: currentHackathon, isLoading: hackathonLoading } =
    useHackathon(hackathonSlug);

  const hackathonId = currentHackathon?.id || '';
  const orgId = currentHackathon?.organizationId || undefined;

  const {
    submission: mySubmission,
    isFetching: isLoadingMySubmission,
    fetchMySubmission,
  } = useSubmission({
    hackathonSlugOrId: hackathonId || '',
    autoFetch: isAuthenticated && !!hackathonId,
  });

  // Authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('You must be logged in to submit a project');
      router.push(
        `/auth?mode=signin&callbackUrl=/hackathons/${hackathonSlug}/submit`
      );
    }
  }, [isAuthenticated, isLoading, router, hackathonSlug]);

  // Submission window guard — block direct URL access outside the open window
  useEffect(() => {
    if (hackathonLoading || !currentHackathon) return;

    const status = currentHackathon.status;
    if (['ARCHIVED', 'CANCELLED'].includes(status)) {
      toast.error('This hackathon is no longer accepting submissions');
      router.push(`/hackathons/${hackathonSlug}`);
      return;
    }

    const now = Date.now();
    const start = currentHackathon.startDate
      ? new Date(currentHackathon.startDate).getTime()
      : null;
    const deadline = currentHackathon.submissionDeadline
      ? new Date(currentHackathon.submissionDeadline).getTime()
      : null;

    if (start && now < start) {
      toast.error('Submissions are not open until the hackathon starts');
      router.push(`/hackathons/${hackathonSlug}`);
      return;
    }

    if (deadline && now > deadline) {
      toast.error('Submission deadline has passed');
      router.push(`/hackathons/${hackathonSlug}`);
    }
  }, [currentHackathon, hackathonLoading, router, hackathonSlug]);

  const handleClose = () => {
    router.push(`/hackathons/${hackathonSlug}`);
  };

  const handleSuccess = () => {
    fetchMySubmission();
    toast.success(
      mySubmission
        ? 'Submission updated successfully!'
        : 'Project submitted successfully!'
    );
    router.push(`/hackathons/${hackathonSlug}?tab=submission`);
  };

  // Stable initialData reference so the form doesn't re-reset (and wipe
  // the user's typed-but-unsaved input) on every parent re-render. The
  // form's reset effect depends on this object identity, so it MUST only
  // change when the underlying submission actually changes.
  //
  // We also pass through the Phase A polish fields (tagline, builtWith,
  // screenshots, license, codeAttestedAt) and trackEntries — if these
  // are missing, the form initialises them to empty and any save then
  // clobbers the server values with empties.
  const initialData = useMemo(() => {
    if (!mySubmission) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = mySubmission as any;
    return {
      projectName: mySubmission.projectName,
      category: mySubmission.category,
      description: mySubmission.description,
      logo: mySubmission.logo,
      banner: mySubmission.banner,
      videoUrl: mySubmission.videoUrl,
      introduction: mySubmission.introduction,
      links: mySubmission.links,
      participationType: s.participationType,
      teamName: s.teamName,
      teamMembers: s.teamMembers,
      tagline: s.tagline,
      builtWith: s.builtWith,
      screenshots: s.screenshots,
      license: s.license,
      codeAttestedAt: s.codeAttestedAt,
      trackEntries: s.trackEntries,
    };
  }, [mySubmission]);

  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);

  useEffect(() => {
    if (!isLoading && !hackathonLoading && !isLoadingMySubmission) {
      setHasInitialLoaded(true);
    }
  }, [isLoading, hackathonLoading, isLoadingMySubmission]);

  if (!hasInitialLoaded) {
    return <LoadingScreen />;
  }

  if (!currentHackathon) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-black px-5 py-5 text-white'>
        <h1 className='mb-4 text-2xl font-bold'>Hackathon Not Found</h1>
        <Button
          onClick={handleClose}
          variant='ghost'
          className='text-gray-400 hover:text-white'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Go Back
        </Button>
      </div>
    );
  }
  return (
    // The outer `app/(landing)/hackathons/layout.tsx` wraps in
    // HackathonDataProvider with an empty slug (the [slug] param isn't in
    // scope at that layout level), so we re-wrap here with the resolved slug
    // and the just-fetched hackathon as initialData. Without this, the form's
    // `useHackathonData()` returns a null `currentHackathon`, the category
    // dropdown falls back to its empty state, and team/participation logic
    // misfires.
    <HackathonDataProvider
      hackathonSlug={hackathonSlug}
      initialData={currentHackathon}
    >
      <div className='min-h-screen bg-black px-5 py-5 text-white md:px-[50px] lg:px-[100px]'>
        <div className='mx-auto max-w-[1200px] pb-10'>
          <Button
            variant='ghost'
            className='mb-6 pl-0 text-gray-400 hover:text-white'
            onClick={handleClose}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Hackathon
          </Button>

          <div className='min-h-[700px] overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 shadow-2xl'>
            <SubmissionFormContent
              hackathonSlugOrId={hackathonId}
              organizationId={orgId}
              submissionId={mySubmission?.id}
              initialData={initialData}
              onSuccess={handleSuccess}
              onClose={handleClose}
            />
          </div>
        </div>
      </div>
    </HackathonDataProvider>
  );
}
