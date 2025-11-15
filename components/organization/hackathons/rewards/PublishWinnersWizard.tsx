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
import { useWalletAddresses } from '@/hooks/use-wallet-addresses';
import { usePublishWinners } from '@/hooks/use-publish-winners';
import { WalletsStep } from './WalletsStep';
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
  const [milestonesCreated, setMilestonesCreated] = useState(false);

  const {
    currentStep,
    setCurrentStep,
    stepsToShow,
    currentStepIndex,
    handleNext,
    handleBack,
  } = useWizardSteps({ open, escrow });

  const { walletAddresses, handleWalletAddressChange } = useWalletAddresses({
    isOpen: open,
    winners,
  });

  const { isPublishing, publishWinners } = usePublishWinners({
    winners,
    prizeTiers,
    escrow,
    organizationId,
    hackathonId,
    walletAddresses,
    announcement,
    milestonesCreated,
    setMilestonesCreated,
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
      prizeTiers.map((tier, index) => ({
        rank: index + 1,
        prizeAmount: tier.prizeAmount,
        currency: tier.currency,
      })),
    [prizeTiers]
  );

  const getPrizeForRank = (rank: number) => {
    const tier = mappedPrizeTiers.find(t => t.rank === rank);
    if (tier) {
      const amount = parseFloat(tier.prizeAmount).toLocaleString('en-US');
      return `${amount} ${tier.currency}`;
    }
    return rank === 1
      ? '10,000 USDC'
      : rank === 2
        ? '5,000 USDC'
        : '8,000 USDC';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='bg-background-card !max-w-7xl border-gray-900 p-0'
        showCloseButton={false}
      >
        <DialogHeader className='flex flex-row items-center gap-3 border-b border-gray-900 p-6'>
          <Megaphone className='h-5 w-5 text-white' />
          <DialogTitle className='text-white'>Publish Winners</DialogTitle>
          <DialogClose asChild>
            <button className='ml-auto text-gray-400 transition-colors hover:text-white'>
              <X className='h-5 w-5' />
            </button>
          </DialogClose>
        </DialogHeader>

        <WizardStepIndicator
          steps={stepsToShow}
          currentStep={currentStep}
          currentStepIndex={currentStepIndex}
        />

        <div className='max-h-[60vh] overflow-y-auto p-6'>
          {currentStep === 'wallets' && (
            <WalletsStep
              winners={winners}
              prizeTiers={prizeTiers}
              escrow={escrow}
              walletAddresses={walletAddresses}
              isPublishing={isPublishing}
              onWalletAddressChange={handleWalletAddressChange}
            />
          )}

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
