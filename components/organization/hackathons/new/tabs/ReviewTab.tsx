import React, { useState } from 'react';
import { InfoFormData } from './schemas/infoSchema';
import { TimelineFormData } from './schemas/timelineSchema';
import { ParticipantFormData } from './schemas/participantSchema';
import { RewardsFormData } from './schemas/rewardsSchema';
import { JudgingFormData } from './schemas/judgingSchema';
import { CollaborationFormData } from './schemas/collaborationSchema';
import { BoundlessButton } from '@/components/buttons';
import {
  CheckCircle2,
  FileText,
  Calendar,
  Users,
  Trophy,
  Scale,
  Handshake,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import InformationSection from './components/review/InformationSection';
import TimelineSection from './components/review/TimelineSection';
import ParticipationSection from './components/review/ParticipationSection';
import RewardsSection from './components/review/RewardsSection';
import JudgingSection from './components/review/JudgingSection';
import CollaborationSection from './components/review/CollaborationSection';
import DraftSavedModal from './components/review/DraftSavedModal';
import HackathonPublishedModal from './components/review/HackathonPublishedModal';

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

const sectionConfig = [
  {
    id: 'information',
    title: 'Information',
    icon: FileText,
    key: 'information' as const,
  },
  {
    id: 'timeline',
    title: 'Timeline',
    icon: Calendar,
    key: 'timeline' as const,
  },
  {
    id: 'participation',
    title: 'Participation',
    icon: Users,
    key: 'participation' as const,
  },
  {
    id: 'rewards',
    title: 'Rewards',
    icon: Trophy,
    key: 'rewards' as const,
  },
  {
    id: 'judging',
    title: 'Judging Criteria',
    icon: Scale,
    key: 'judging' as const,
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    icon: Handshake,
    key: 'collaboration' as const,
  },
];

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
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Not set';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePublish = async () => {
    try {
      if (onPublish) {
        await onPublish();
        setShowPublishedModal(true);
      }
    } catch {
      // Error handling is done in parent component
    }
  };

  const handleSaveDraft = async () => {
    try {
      if (onSaveDraft) {
        await onSaveDraft();
        setShowDraftModal(true);
      }
    } catch {
      // Error handling is done in parent component
    }
  };

  const renderSectionContent = (config: (typeof sectionConfig)[0]) => {
    const data = allData[config.key];
    if (!data) return null;

    switch (config.key) {
      case 'information':
        return (
          <InformationSection
            data={data as InfoFormData}
            onEdit={onEdit ? () => onEdit('information') : undefined}
          />
        );
      case 'timeline':
        return (
          <TimelineSection
            data={data as TimelineFormData}
            onEdit={onEdit ? () => onEdit('timeline') : undefined}
            formatDate={formatDate}
          />
        );
      case 'participation':
        return (
          <ParticipationSection
            data={data as ParticipantFormData}
            onEdit={onEdit ? () => onEdit('participation') : undefined}
          />
        );
      case 'rewards':
        return (
          <RewardsSection
            data={data as RewardsFormData}
            onEdit={onEdit ? () => onEdit('rewards') : undefined}
          />
        );
      case 'judging':
        return (
          <JudgingSection
            data={data as JudgingFormData}
            onEdit={onEdit ? () => onEdit('judging') : undefined}
          />
        );
      case 'collaboration':
        return (
          <CollaborationSection
            data={data as CollaborationFormData}
            onEdit={onEdit ? () => onEdit('collaboration') : undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-white'>Review & Publish</h2>
          <p className='mt-1 text-sm text-gray-400'>
            Review all your hackathon details before publishing
          </p>
        </div>
        <div className='flex items-center gap-2 text-sm text-green-400'>
          <CheckCircle2 className='h-5 w-5' />
          <span>All sections complete</span>
        </div>
      </div>

      {/* Accordion Sections */}
      <Accordion
        type='multiple'
        defaultValue={sectionConfig.map(s => s.id)}
        className='space-y-4'
      >
        {sectionConfig.map(config => {
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
                {renderSectionContent(config)}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Publish Section */}
      <div className='from-primary/10 to-primary/5 border-primary/20 rounded-xl border bg-gradient-to-br p-6'>
        <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div className='flex-1'>
            <h3 className='mb-1 text-lg font-semibold text-white'>
              Ready to Publish?
            </h3>
            <p className='text-sm text-gray-400'>
              Review all sections above and publish your hackathon when ready
            </p>
          </div>
          <div className='flex w-full items-center gap-3 sm:w-auto'>
            {onSaveDraft && (
              <BoundlessButton
                onClick={handleSaveDraft}
                size='xl'
                disabled={isSavingDraft || isLoading}
                variant='outline'
                className='flex-1 border-gray-700 hover:border-gray-600 hover:bg-gray-800 sm:flex-none'
              >
                {isSavingDraft ? 'Saving...' : 'Save as Draft'}
              </BoundlessButton>
            )}
            <BoundlessButton
              onClick={handlePublish}
              size='xl'
              disabled={isLoading || isSavingDraft}
              className='flex-1 sm:flex-none'
            >
              {isLoading ? 'Publishing...' : 'Publish Hackathon'}
            </BoundlessButton>
          </div>
        </div>
      </div>

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
