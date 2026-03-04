'use client';

import { useMemo, useCallback, useRef, useEffect } from 'react';
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
import ResourcesTab from './tabs/ResourcesTab';
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

  const { publishDraftAction } = useHackathons({
    organizationId: derivedOrgId,
    autoFetch: false,
  });

  const {
    activeTab,
    steps,
    navigateToStep,
    canAccessStep,
    setStepsFromDraft,
    setActiveTab,
    updateStepCompletion,
  } = useHackathonSteps('information');

  // Use ref to store the callback to avoid circular dependency
  const onDraftLoadedRef = useRef<
    ((formData: any, firstIncompleteStep: StepKey) => void) | null
  >(null);

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
      // Use the ref to call the callback
      if (onDraftLoadedRef.current) {
        onDraftLoadedRef.current(formData, firstIncompleteStep);
      }
    },
  });

  // Define the callback after hooks are initialized
  const onDraftLoaded = useCallback(
    (formData: any, firstIncompleteStep: StepKey) => {
      setStepData(formData);

      // Build step state: completed before active, active for firstIncomplete, pending after
      const stepOrder = [
        'information',
        'timeline',
        'participation',
        'rewards',
        'resources',
        'judging',
        'collaboration',
        'review',
      ] as StepKey[];
      const activeIndex = stepOrder.indexOf(firstIncompleteStep);
      const newSteps: Record<StepKey, (typeof steps)[StepKey]> = {} as Record<
        StepKey,
        (typeof steps)[StepKey]
      >;

      stepOrder.forEach((key, index) => {
        const isCompleted = isStepDataValid(key, formData);
        if (index < activeIndex) {
          newSteps[key] = { status: 'completed', isCompleted: true };
        } else if (index === activeIndex) {
          newSteps[key] = { status: 'active', isCompleted };
        } else {
          newSteps[key] = {
            status: 'pending',
            isCompleted: key === 'review' ? false : isCompleted,
          };
        }
      });

      setStepsFromDraft(newSteps, firstIncompleteStep);
    },
    [setStepData, setStepsFromDraft]
  );

  // Update the ref when the callback changes
  useEffect(() => {
    onDraftLoadedRef.current = onDraftLoaded;
  }, [onDraftLoaded]);

  const { isPublishing, publish, publishResponse } = useHackathonPublish({
    organizationId: derivedOrgId || '',
    stepData,
    draftId: draftId || '',
    publishDraftAction,
  });

  const {
    loadingStates,
    saveInformationStep,
    saveTimelineStep,
    saveParticipationStep,
    saveRewardsStep,
    saveResourcesStep,
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
      resources: 'resources',
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
    } catch (error) {
      throw error;
    }
  };

  if (isLoadingDraft) {
    return (
      <div className='bg-background-main-bg flex min-h-[60vh] flex-1 items-center justify-center text-white'>
        <div className='flex flex-col items-center gap-4'>
          <div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
          <span className='text-sm text-gray-400'>Loading draft...</span>
        </div>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className='bg-background-main-bg flex min-h-[60vh] flex-1 items-center justify-center text-white'>
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
              onContinue={() => navigateToStep('resources')}
              onSave={saveRewardsStep}
              initialData={stepData.rewards}
              isLoading={loadingStates.rewards}
            />
          </TabsContent>

          <TabsContent value='resources' className='mt-0'>
            <ResourcesTab
              onContinue={() => navigateToStep('judging')}
              onSave={saveResourcesStep}
              initialData={stepData.resources}
              isLoading={loadingStates.resources}
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
