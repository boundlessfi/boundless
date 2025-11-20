'use client';

import { useMemo } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useHackathons } from '@/hooks/use-hackathons';
import { useHackathonSteps } from '@/hooks/use-hackathon-steps';
import { useHackathonDraft } from '@/hooks/use-hackathon-draft';
import { useHackathonPublish } from '@/hooks/use-hackathon-publish';
import { useHackathonStepSave } from '@/hooks/use-hackathon-step-save';
import { HackathonTabsNavigation } from './HackathonTabsNavigation';
import InfoTab from './tabs/InfoTab';
import TimelineTab from './tabs/TimelineTab';
import ParticipantTab from './tabs/ParticipantTab';
import RewardsTab from './tabs/RewardsTab';
import JudgingTab from './tabs/JudgingTab';
import CollaborationTab from './tabs/CollaborationTab';
import ReviewTab from './tabs/ReviewTab';
import type { StepKey } from './constants';
import { isStepDataValid } from '@/lib/utils/hackathon-step-validation';

interface NewHackathonTabProps {
  organizationId?: string;
  draftId?: string;
}

export default function NewHackathonTab({
  organizationId,
  draftId: initialDraftId,
}: NewHackathonTabProps) {
  const derivedOrgId = useMemo(() => {
    if (organizationId) return organizationId;
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const parts = pathname.split('/');
      if (parts.length >= 3 && parts[1] === 'organizations') {
        return parts[2];
      }
    }
    return undefined;
  }, [organizationId]);

  const { publishHackathonAction } = useHackathons({
    organizationId: derivedOrgId,
    autoFetch: false,
  });

  const {
    activeTab,
    steps,
    navigateToStep,
    canAccessStep,
    updateStepCompletion,
    setActiveTab,
  } = useHackathonSteps('information');

  const {
    draftId,
    stepData,
    setStepData,
    isLoadingDraft,
    currentError,
    isSavingDraft,
    saveDraft,
    saveStep,
  } = useHackathonDraft({
    organizationId: derivedOrgId,
    initialDraftId,
    onDraftLoaded: (formData, firstIncompleteStep) => {
      setStepData(formData);
      setActiveTab(firstIncompleteStep);

      // Use the validation helper to determine completion status
      // This checks if the step data has meaningful values, not just empty objects
      const newSteps: Record<StepKey, (typeof steps)[StepKey]> = {
        information: {
          status: isStepDataValid('information', formData)
            ? 'completed'
            : 'active',
          isCompleted: isStepDataValid('information', formData),
        },
        timeline: {
          status: isStepDataValid('timeline', formData)
            ? 'completed'
            : 'pending',
          isCompleted: isStepDataValid('timeline', formData),
        },
        participation: {
          status: isStepDataValid('participation', formData)
            ? 'completed'
            : 'pending',
          isCompleted: isStepDataValid('participation', formData),
        },
        rewards: {
          status: isStepDataValid('rewards', formData)
            ? 'completed'
            : 'pending',
          isCompleted: isStepDataValid('rewards', formData),
        },
        judging: {
          status: isStepDataValid('judging', formData)
            ? 'completed'
            : 'pending',
          isCompleted: isStepDataValid('judging', formData),
        },
        collaboration: {
          status: isStepDataValid('collaboration', formData)
            ? 'completed'
            : 'pending',
          isCompleted: isStepDataValid('collaboration', formData),
        },
        review: {
          status: 'pending',
          isCompleted: false,
        },
      };

      // Set the first incomplete step as active
      newSteps[firstIncompleteStep] = {
        ...newSteps[firstIncompleteStep],
        status: 'active',
      };

      // Update all step completions
      Object.keys(newSteps).forEach(key => {
        updateStepCompletion(
          key as StepKey,
          newSteps[key as StepKey].isCompleted
        );
      });
    },
  });

  const { isPublishing, publish } = useHackathonPublish({
    organizationId: derivedOrgId || '',
    stepData,
    draftId,
    publishHackathonAction,
  });

  const {
    loadingStates,
    saveInformationStep,
    saveTimelineStep,
    saveParticipationStep,
    saveRewardsStep,
    saveJudgingStep,
    saveCollaborationStep,
  } = useHackathonStepSave({
    organizationId: derivedOrgId,
    draftId,
    saveStep: async (stepKey, data) => {
      await saveStep(stepKey, data);
      setStepData(prev => ({ ...prev, [stepKey]: data }));
      return {};
    },
    updateStepCompletion,
  });

  const handleEditTab = (tabKey: string) => {
    const tabMap: Record<string, StepKey> = {
      information: 'information',
      timeline: 'timeline',
      participation: 'participation',
      rewards: 'rewards',
      judging: 'judging',
      collaboration: 'collaboration',
    };
    const stepKey = tabMap[tabKey];
    if (stepKey) {
      navigateToStep(stepKey);
    }
  };

  const handlePublish = async () => {
    try {
      await publish();
      updateStepCompletion('review', true);
    } catch {
      // Error is handled in the hook
    }
  };

  if (isLoadingDraft) {
    return (
      <div className='bg-background-main-bg flex flex-1 items-center justify-center text-white'>
        <div className='flex flex-col items-center gap-4'>
          <div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
          <span className='text-sm text-gray-400'>Loading draft...</span>
        </div>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className='bg-background-main-bg flex flex-1 items-center justify-center text-white'>
        <div className='flex flex-col items-center gap-4'>
          <span className='text-sm text-red-400'>{currentError}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className='bg-background-main-bg mx-auto max-w-6xl flex-1 overflow-hidden px-6 py-8 text-white'
      id={organizationId}
    >
      <Tabs
        value={activeTab}
        onValueChange={value => navigateToStep(value as StepKey)}
        className='w-full'
      >
        <HackathonTabsNavigation
          activeTab={activeTab}
          steps={steps}
          canAccessStep={canAccessStep}
          navigateToStep={navigateToStep}
        />

        <div className='px-6 py-6 md:px-20'>
          <TabsContent value='information' className='mt-0'>
            <InfoTab
              onContinue={() => navigateToStep('timeline')}
              onSave={saveInformationStep}
              initialData={stepData.information}
              isLoading={loadingStates.information}
            />
          </TabsContent>

          <TabsContent value='timeline' className='mt-0'>
            <TimelineTab
              onContinue={() => navigateToStep('participation')}
              onSave={saveTimelineStep}
              initialData={stepData.timeline}
              isLoading={loadingStates.timeline}
            />
          </TabsContent>

          <TabsContent value='participation' className='mt-0'>
            <ParticipantTab
              onContinue={() => navigateToStep('rewards')}
              onSave={saveParticipationStep}
              initialData={stepData.participation}
              isLoading={loadingStates.participation}
            />
          </TabsContent>

          <TabsContent value='rewards' className='mt-0'>
            <RewardsTab
              onContinue={() => navigateToStep('judging')}
              onSave={saveRewardsStep}
              initialData={stepData.rewards}
              isLoading={loadingStates.rewards}
            />
          </TabsContent>

          <TabsContent value='judging' className='mt-0'>
            <JudgingTab
              onContinue={() => navigateToStep('collaboration')}
              onSave={saveJudgingStep}
              initialData={stepData.judging}
              isLoading={loadingStates.judging}
            />
          </TabsContent>

          <TabsContent value='collaboration' className='mt-0'>
            <CollaborationTab
              onContinue={() => navigateToStep('review')}
              onSave={saveCollaborationStep}
              initialData={stepData.collaboration}
              isLoading={loadingStates.collaboration}
            />
          </TabsContent>

          <TabsContent value='review' className='mt-0'>
            <ReviewTab
              allData={stepData}
              onEdit={handleEditTab}
              onPublish={handlePublish}
              onSaveDraft={saveDraft}
              isLoading={isPublishing}
              isSavingDraft={isSavingDraft}
              organizationId={derivedOrgId}
              draftId={draftId}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
