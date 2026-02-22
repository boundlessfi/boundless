'use client';

import React, { useState, useMemo } from 'react';
import { X, Megaphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Submission } from './types';
import { HackathonEscrowData } from '@/lib/api/hackathons';
import { PrizeTier } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import { useWizardSteps } from '@/hooks/use-wizard-steps';
import { usePublishWinners } from '@/hooks/use-publish-winners';
import { AnnouncementStep } from './AnnouncementStep';
import { PreviewStep } from './PreviewStep';
import { WizardStepIndicator } from './WizardStepIndicator';
import { WizardFooter } from './WizardFooter';

interface PublishWinnersWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissions: Submission[];
  prizeTiers: PrizeTier[];
  escrow: HackathonEscrowData | null;
  organizationId: string;
  hackathonId: string;
  onSuccess?: () => void;
}

export default function PublishWinnersWizard({
  open,
  onOpenChange,
  submissions,
  prizeTiers,
  escrow,
  organizationId,
  hackathonId,
  onSuccess,
}: PublishWinnersWizardProps) {
  const maxRank = prizeTiers.length;

  const winners = useMemo(
    () =>
      submissions.filter(
        s => s.rank !== undefined && s.rank !== null && s.rank <= maxRank
      ),
    [submissions, maxRank]
  );

  const [announcement, setAnnouncement] = useState('');

  const {
    currentStep,
    setCurrentStep,
    stepsToShow,
    currentStepIndex,
    handleNext,
    handleBack,
  } = useWizardSteps({ open, escrow });

  const { isPublishing, publishWinners } = usePublishWinners({
    winners,
    prizeTiers,
    escrow,
    organizationId,
    hackathonId,
    announcement,
    onSuccess: () => {
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    },
  });

  const handlePublish = async () => {
    try {
      await publishWinners();
    } catch {
      // Error is handled in the hook
    }
  };

  const canGoNext = true;

  const mappedPrizeTiers = useMemo(
    () =>
      prizeTiers.map(tier => ({
        rank: tier.rank,
        prizeAmount: tier.prizeAmount,
        currency: tier.currency,
      })),
    [prizeTiers]
  );

  const getPrizeForRank = (rank: number) => {
    const tier = mappedPrizeTiers.find(t => t.rank === rank);
    if (tier) {
      const amount = parseFloat(tier.prizeAmount || '0').toLocaleString(
        'en-US'
      );
      const currency = tier.currency || 'USDC';
      return { amount, currency, label: `${amount} ${currency}` };
    }
    return { amount: '0', currency: 'USDC', label: 'No prize configured' };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='bg-background-card max-w-2xl! border-gray-900 p-0'
        showCloseButton={false}
      >
        <DialogHeader className='flex flex-row items-center gap-3 border-b border-gray-900 px-5 py-3'>
          <Megaphone className='h-4 w-4 text-white' />
          <DialogTitle className='text-sm font-semibold text-white'>
            Reward Winners
          </DialogTitle>
          <DialogClose asChild>
            <button className='ml-auto text-gray-400 transition-colors hover:text-white'>
              <X className='h-4 w-4' />
            </button>
          </DialogClose>
        </DialogHeader>

        <WizardStepIndicator
          steps={stepsToShow}
          currentStep={currentStep}
          currentStepIndex={currentStepIndex}
        />

        <div className='max-h-[65vh] overflow-y-auto px-5 py-4'>
          {currentStep === 'announcement' && (
            <AnnouncementStep
              announcement={announcement}
              onAnnouncementChange={setAnnouncement}
            />
          )}

          {currentStep === 'preview' && (
            <PreviewStep
              winners={winners}
              prizeTiers={mappedPrizeTiers}
              announcement={announcement}
              onEditAnnouncement={() => setCurrentStep('announcement')}
              getPrizeForRank={getPrizeForRank}
            />
          )}
        </div>

        <WizardFooter
          currentStepIndex={currentStepIndex}
          totalSteps={stepsToShow.length}
          isPublishing={isPublishing}
          canGoNext={canGoNext}
          onCancel={() => onOpenChange(false)}
          onBack={handleBack}
          onNext={handleNext}
          onPublish={handlePublish}
        />
      </DialogContent>
    </Dialog>
  );
}
