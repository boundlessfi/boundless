import React, { useState } from 'react';
import { InfoFormData } from './schemas/infoSchema';
import { TimelineFormData } from './schemas/timelineSchema';
import { ParticipantFormData } from './schemas/participantSchema';
import { RewardsFormData } from './schemas/rewardsSchema';
import { JudgingFormData } from './schemas/judgingSchema';
import { CollaborationFormData } from './schemas/collaborationSchema';
import { useWalletContext } from '@/components/providers/wallet-provider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import DraftSavedModal from './components/review/DraftSavedModal';
import HackathonPublishedModal from './components/review/HackathonPublishedModal';
import { ReviewHeader } from './components/review/ReviewHeader';
import { EscrowSummary } from './components/review/EscrowSummary';
import { WalletConnectionWarning } from './components/review/WalletConnectionWarning';
import { PublishSection } from './components/review/PublishSection';
import { SectionRenderer } from './components/review/SectionRenderer';
import { usePrizePoolCalculations } from '@/hooks/use-prize-pool-calculations';
import { REVIEW_SECTION_CONFIG } from './constants/review-sections';
import { toast } from 'sonner';

interface ReviewTabProps {
  allData: {
    information?: InfoFormData;
    timeline?: TimelineFormData;
    participation?: ParticipantFormData;
    rewards?: RewardsFormData;
    judging?: JudgingFormData;
    collaboration?: CollaborationFormData;
  };
  onEdit?: (tab: string) => void;
  onPublish?: () => Promise<void>;
  onSaveDraft?: () => Promise<void>;
  isLoading?: boolean;
  isSavingDraft?: boolean;
  hackathonUrl?: string;
}

export default function ReviewTab({
  allData,
  onEdit,
  onPublish,
  onSaveDraft,
  isLoading = false,
  isSavingDraft = false,
  hackathonUrl,
}: ReviewTabProps) {
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showPublishedModal, setShowPublishedModal] = useState(false);
  const { walletAddress } = useWalletContext();

  const { totalPrizePool, platformFee, totalFunding } =
    usePrizePoolCalculations(allData.rewards);

  const handlePublish = async () => {
    try {
      if (onPublish) {
        await onPublish();
        setShowPublishedModal(true);
      }
    } catch {
      toast.error('Failed to publish hackathon. Please try again.');
    }
  };

  const handleSaveDraft = async () => {
    try {
      if (onSaveDraft) {
        await onSaveDraft();
        setShowDraftModal(true);
      }
    } catch {
      toast.error('Failed to save draft. Please try again.');
    }
  };

  return (
    <div className='space-y-6'>
      <ReviewHeader />

      <Accordion
        type='multiple'
        defaultValue={REVIEW_SECTION_CONFIG.map(s => s.id)}
        className='space-y-4'
      >
        {REVIEW_SECTION_CONFIG.map(config => {
          const data = allData[config.key];
          if (!data) return null;

          const Icon = config.icon;

          return (
            <AccordionItem
              key={config.id}
              value={config.id}
              className='bg-background-card rounded-xl border border-gray-900 px-6'
            >
              <AccordionTrigger className='py-6 text-white hover:no-underline [&[data-state=open]>svg]:rotate-180'>
                <div className='flex items-center gap-3'>
                  <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                    <Icon className='text-primary h-5 w-5' />
                  </div>
                  <h3 className='text-lg font-semibold text-white'>
                    {config.title}
                  </h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className='pt-0 pb-6'>
                <SectionRenderer config={config} data={data} onEdit={onEdit} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {allData.rewards && allData.rewards.prizeTiers.length > 0 && (
        <EscrowSummary
          rewards={allData.rewards}
          totalPrizePool={totalPrizePool}
          platformFee={platformFee}
          totalFunding={totalFunding}
        />
      )}

      {!walletAddress && <WalletConnectionWarning />}

      <PublishSection
        walletAddress={walletAddress}
        isLoading={isLoading}
        isSavingDraft={isSavingDraft}
        onPublish={handlePublish}
        onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
      />

      {/* Success Modals */}
      <DraftSavedModal
        open={showDraftModal}
        onOpenChange={setShowDraftModal}
        onContinueEditing={() => {
          // User can continue editing - modal will close
        }}
      />

      <HackathonPublishedModal
        open={showPublishedModal}
        onOpenChange={setShowPublishedModal}
        hackathonUrl={hackathonUrl}
      />
    </div>
  );
}
