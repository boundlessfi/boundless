'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHackathonData } from '@/lib/providers/hackathonProvider';
import { useAuthStatus } from '@/hooks/use-auth';
import { useSubmission } from '@/hooks/hackathon/use-submission';
import { SubmissionFormContent } from '@/components/hackathons/submissions/SubmissionForm';
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

  const {
    currentHackathon,
    loading: hackathonLoading,
    setCurrentHackathon,
  } = useHackathonData();

  useEffect(() => {
    if (hackathonSlug) {
      setCurrentHackathon(hackathonSlug);
    }
  }, [hackathonSlug, setCurrentHackathon]);

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

  if (
    isLoading ||
    hackathonLoading ||
    isLoadingMySubmission ||
    !currentHackathon
  ) {
    return <LoadingScreen />;
  }

  return (
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
            initialData={
              mySubmission
                ? {
                    projectName: mySubmission.projectName,
                    category: mySubmission.category,
                    description: mySubmission.description,
                    logo: mySubmission.logo,
                    videoUrl: mySubmission.videoUrl,
                    introduction: mySubmission.introduction,
                    links: mySubmission.links,
                    participationType: (mySubmission as any).participationType,
                  }
                : undefined
            }
            onSuccess={handleSuccess}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  );
}
