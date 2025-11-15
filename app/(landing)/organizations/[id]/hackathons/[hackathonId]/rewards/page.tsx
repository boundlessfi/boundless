'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import PublishWinnersWizard from '@/components/organization/hackathons/rewards/PublishWinnersWizard';
import { RewardsPageHeader } from '@/components/organization/hackathons/rewards/RewardsPageHeader';
import { RewardsPageContent } from '@/components/organization/hackathons/rewards/RewardsPageContent';
import { useHackathonRewards } from '@/hooks/use-hackathon-rewards';
import { useRankAssignment } from '@/hooks/use-rank-assignment';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RewardsPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const hackathonId = params.hackathonId as string;

  const {
    submissions,
    setSubmissions,
    escrow,
    prizeTiers,
    isLoading,
    isLoadingEscrow,
    isLoadingSubmissions,
    error,
    refreshEscrow,
  } = useHackathonRewards(organizationId, hackathonId);

  const { handleRankChange } = useRankAssignment();
  const [isPublishWizardOpen, setIsPublishWizardOpen] = useState(false);

  const maxRank = useMemo(() => prizeTiers.length, [prizeTiers.length]);
  const winners = useMemo(
    () => submissions.filter(s => s.rank && s.rank <= maxRank),
    [submissions, maxRank]
  );
  const hasWinners = winners.length > 0;

  const handleRankChangeWrapper = async (
    submissionId: string,
    newRank: number | null
  ) => {
    await handleRankChange(
      submissions,
      setSubmissions,
      submissionId,
      newRank,
      maxRank,
      organizationId,
      hackathonId
    );
  };

  const handlePublishSuccess = () => {
    refreshEscrow();
  };

  return (
    <div className='bg-background min-h-screen p-4 text-white sm:p-6 md:p-8'>
      <RewardsPageHeader />

      {isLoading && (
        <div className='flex items-center justify-center py-16'>
          <div className='flex flex-col items-center gap-4'>
            <Loader2 className='text-primary h-10 w-10 animate-spin' />
            <p className='text-base font-medium text-gray-300'>
              Loading rewards data...
            </p>
            <p className='text-sm text-gray-500'>
              Please wait while we fetch the information
            </p>
          </div>
        </div>
      )}

      {!isLoading && error && (
        <Alert variant='destructive' className='mb-8'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <RewardsPageContent
          submissions={submissions}
          escrow={escrow}
          isLoadingEscrow={isLoadingEscrow}
          isLoadingSubmissions={isLoadingSubmissions}
          maxRank={maxRank}
          hasWinners={hasWinners}
          onPublishClick={() => setIsPublishWizardOpen(true)}
          onRankChange={handleRankChangeWrapper}
        />
      )}

      <PublishWinnersWizard
        open={isPublishWizardOpen}
        onOpenChange={setIsPublishWizardOpen}
        submissions={submissions}
        prizeTiers={prizeTiers}
        escrow={escrow}
        organizationId={organizationId}
        hackathonId={hackathonId}
        onSuccess={handlePublishSuccess}
      />
    </div>
  );
}
