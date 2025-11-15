'use client';

import React from 'react';
import { Megaphone } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';
import PodiumSection from '@/components/organization/hackathons/rewards/PodiumSection';
import SubmissionsList from '@/components/organization/hackathons/rewards/SubmissionsList';
import EscrowStatusCard from '@/components/organization/hackathons/rewards/EscrowStatusCard';
import { Submission } from '@/components/organization/hackathons/rewards/types';
import type { HackathonEscrowData } from '@/lib/api/hackathons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface RewardsPageContentProps {
  submissions: Submission[];
  escrow: HackathonEscrowData | null;
  isLoadingEscrow: boolean;
  isLoadingSubmissions: boolean;
  maxRank: number;
  hasWinners: boolean;
  onPublishClick: () => void;
  onRankChange: (submissionId: string, newRank: number | null) => Promise<void>;
}

export const RewardsPageContent: React.FC<RewardsPageContentProps> = ({
  submissions,
  escrow,
  isLoadingEscrow,
  isLoadingSubmissions,
  maxRank,
  hasWinners,
  onPublishClick,
  onRankChange,
}) => {
  return (
    <div className='space-y-8'>
      {hasWinners && (
        <div className='flex justify-end'>
          <BoundlessButton
            variant='default'
            size='lg'
            onClick={onPublishClick}
            className='gap-2'
          >
            <Megaphone className='h-4 w-4' />
            Publish Winners
          </BoundlessButton>
        </div>
      )}

      <section>
        <div className='mb-4'>
          <h2 className='text-xl font-semibold text-white'>Escrow Status</h2>
          <p className='mt-1 text-sm text-gray-400'>
            View escrow balance, milestones, and funding status
          </p>
        </div>
        <EscrowStatusCard escrow={escrow} isLoading={isLoadingEscrow} />
      </section>

      {submissions.length > 0 && (
        <section>
          <div className='mb-6'>
            <h2 className='text-xl font-semibold text-white'>
              Winners & Rankings
            </h2>
            <p className='mt-1 text-sm text-gray-400'>
              Assign ranks to submissions and view the winners podium
            </p>
          </div>
          <div className='space-y-6'>
            <PodiumSection submissions={submissions} maxRank={maxRank} />
            <div>
              <h3 className='mb-4 text-lg font-medium text-white'>
                All Submissions
              </h3>
              <SubmissionsList
                submissions={submissions}
                onRankChange={onRankChange}
                maxRank={maxRank}
              />
            </div>
          </div>
        </section>
      )}

      {submissions.length === 0 && !isLoadingSubmissions && (
        <section>
          <Alert className='border-gray-800 bg-gray-900/50'>
            <AlertCircle className='h-5 w-5 text-gray-400' />
            <AlertTitle className='text-white'>
              No Submissions Available
            </AlertTitle>
            <AlertDescription className='text-gray-300'>
              <p className='mb-2'>
                No judged submissions found. To assign winners and distribute
                prizes:
              </p>
              <ol className='ml-4 list-decimal space-y-1 text-sm'>
                <li>Ensure submissions have been shortlisted</li>
                <li>Complete the judging process</li>
                <li>Return here to assign ranks and publish winners</li>
              </ol>
            </AlertDescription>
          </Alert>
        </section>
      )}
    </div>
  );
};
