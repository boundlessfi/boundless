'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useBountySteps } from '@/hooks/use-bounty-steps';
import { useBountyDraft } from '@/hooks/use-bounty-draft';
import { useBountyPublish } from '@/hooks/use-bounty-publish';
import { buildMockBountyData } from './mock-data';
import ScopeTab from './tabs/ScopeTab';
import ModeTab from './tabs/ModeTab';
import SubmissionModelTab from './tabs/SubmissionModelTab';
import RewardTab from './tabs/RewardTab';
import ResourcesTab from './tabs/ResourcesTab';
import ReviewTab from './tabs/ReviewTab';
import type { ModeSelection } from './tabs/schemas/modeSchema';
import {
  BountyFormData,
  STEP_ORDER,
  isBountyStepDataValid,
  type StepData,
  type StepKey,
} from './constants';

interface NewBountyTabProps {
  organizationId?: string;
  draftId?: string;
}

/**
 * Bounty Configure wizard orchestrator. Wires the step navigation (URL-driven),
 * the draft state (lazy create + per-section PATCH + resume), and the section
 * tabs. The ModeTab feeds the chosen mode into the SubmissionModelTab so its
 * conditional fields render correctly.
 *
 * Scope / Reward / Review tabs arrive in #600 and the publish + funding flow in
 * #601; their wiring seams (saveSection, draftId, navigateToStep) are in place
 * here. There are intentionally no AI entry points.
 */
export default function NewBountyTab({
  organizationId,
  draftId: initialDraftId,
}: NewBountyTabProps) {
  const derivedOrgId = useMemo(() => {
    if (organizationId) return organizationId;
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/');
      if (parts.length >= 3 && parts[1] === 'organizations') return parts[2];
    }
    return undefined;
  }, [organizationId]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // draftId arrives via the route path (/drafts/[draftId]) or, on /new, via a
  // ?draftId= we add after the first save. Either resumes the same draft.
  const resolvedInitialDraftId =
    initialDraftId ?? searchParams.get('draftId') ?? undefined;

  const { activeTab, navigateToStep, setStepsFromDraft, updateStepCompletion } =
    useBountySteps('scope');

  const onDraftLoadedRef = useRef<
    ((formData: BountyFormData, firstIncompleteStep: StepKey) => void) | null
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
    saveAllSections,
  } = useBountyDraft({
    organizationId: derivedOrgId,
    initialDraftId: resolvedInitialDraftId,
    onDraftLoaded: (formData, firstIncompleteStep) => {
      onDraftLoadedRef.current?.(formData, firstIncompleteStep);
    },
  });

  // Persist a freshly-created draft id into the URL so a refresh resumes it.
  useEffect(() => {
    if (!draftId || initialDraftId) return;
    if (searchParams.get('draftId') === draftId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('draftId', draftId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [draftId, initialDraftId, searchParams, pathname, router]);

  const onDraftLoaded = useCallback(
    (formData: BountyFormData, firstIncompleteStep: StepKey) => {
      setStepData(formData);
      const activeIndex = STEP_ORDER.indexOf(firstIncompleteStep);
      const newSteps = {} as Record<StepKey, StepData>;
      STEP_ORDER.forEach((key, index) => {
        const isCompleted = isBountyStepDataValid(key, formData);
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

  useEffect(() => {
    onDraftLoadedRef.current = onDraftLoaded;
  }, [onDraftLoaded]);

  // Per-step save: persist the section, mark it complete, and advance.
  const [loadingStates, setLoadingStates] = useState<Record<StepKey, boolean>>({
    scope: false,
    mode: false,
    submission: false,
    reward: false,
    resources: false,
    review: false,
  });

  const createSaveHandler = useCallback(
    <T,>(stepKey: StepKey, nextStep: StepKey) =>
      async (data: T) => {
        if (!derivedOrgId) {
          toast.error('Organization ID is required');
          return;
        }
        setLoadingStates(prev => ({ ...prev, [stepKey]: true }));
        try {
          await saveStep(
            stepKey,
            data as NonNullable<BountyFormData[keyof BountyFormData]>
          );
          updateStepCompletion(stepKey, true, nextStep);
        } catch {
          throw new Error(`Failed to save ${stepKey} step`);
        } finally {
          setLoadingStates(prev => ({ ...prev, [stepKey]: false }));
        }
      },
    [derivedOrgId, saveStep, updateStepCompletion]
  );

  const modeSelection: ModeSelection | undefined = stepData.mode
    ? { entryType: stepData.mode.entryType, claimType: stepData.mode.claimType }
    : undefined;

  // Publish via the shared escrow runner. Defaults to MANAGED (the connected
  // custodial wallet funds + the backend signs); the funding-source picker
  // (external wallet / treasury) is a follow-up.
  const { publish, isPublishing, publishResponse } = useBountyPublish({
    organizationId: derivedOrgId || '',
    stepData,
    draftId,
    fundingMode: 'MANAGED',
  });

  // Once the publish finalizes on-chain, leave the wizard for the organizer's
  // bounty list rather than lingering on the (now read-only) review.
  const hasRedirectedRef = useRef(false);
  useEffect(() => {
    if (publishResponse && derivedOrgId && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.replace(`/organizations/${derivedOrgId}/bounties`);
    }
  }, [publishResponse, derivedOrgId, router]);

  // Dev-only convenience: fill every section with valid mock data, persist it
  // in one PATCH, and jump to Review. Never rendered in production builds.
  const isDev = process.env.NODE_ENV === 'development';
  const [isFillingMock, setIsFillingMock] = useState(false);
  const handleFillMock = useCallback(async () => {
    setIsFillingMock(true);
    try {
      await saveAllSections(buildMockBountyData());
      navigateToStep('review');
      toast.success('Filled the wizard with mock data');
    } catch {
      toast.error('Failed to fill mock data');
    } finally {
      setIsFillingMock(false);
    }
  }, [saveAllSections, navigateToStep]);

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
        <span className='text-sm text-red-400'>{currentError}</span>
      </div>
    );
  }

  return (
    <div
      className='bg-background-main-bg mx-auto max-w-6xl flex-1 overflow-hidden px-6 py-8 text-white'
      id={organizationId}
    >
      {isDev && (
        <div className='flex justify-end px-6 md:px-20'>
          <button
            type='button'
            onClick={handleFillMock}
            disabled={isFillingMock}
            className='flex items-center gap-2 rounded-md border border-dashed border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-50'
          >
            {isFillingMock ? 'Filling...' : '⚡ Fill with mock (dev)'}
          </button>
        </div>
      )}
      <Tabs value={activeTab} className='w-full'>
        <div className='px-6 py-6 md:px-20'>
          <TabsContent value='scope' className='mt-0'>
            <ScopeTab
              onSave={createSaveHandler('scope', 'mode')}
              onContinue={() => navigateToStep('mode')}
              initialData={stepData.scope}
              isLoading={loadingStates.scope}
            />
          </TabsContent>

          <TabsContent value='mode' className='mt-0'>
            <ModeTab
              onSave={createSaveHandler('mode', 'submission')}
              onContinue={() => navigateToStep('submission')}
              onBack={() => navigateToStep('scope')}
              initialData={stepData.mode}
              isLoading={loadingStates.mode}
            />
          </TabsContent>

          <TabsContent value='submission' className='mt-0'>
            <SubmissionModelTab
              mode={modeSelection}
              category={stepData.scope?.category}
              onSave={createSaveHandler('submission', 'reward')}
              onContinue={() => navigateToStep('reward')}
              onBack={() => navigateToStep('mode')}
              initialData={stepData.submission}
              isLoading={loadingStates.submission}
            />
          </TabsContent>

          <TabsContent value='reward' className='mt-0'>
            <RewardTab
              mode={
                stepData.mode
                  ? {
                      claimType: stepData.mode.claimType,
                      winnerCount: stepData.mode.winnerCount,
                    }
                  : undefined
              }
              onSave={createSaveHandler('reward', 'resources')}
              onContinue={() => navigateToStep('resources')}
              onBack={() => navigateToStep('submission')}
              initialData={stepData.reward}
              isLoading={loadingStates.reward}
            />
          </TabsContent>

          <TabsContent value='resources' className='mt-0'>
            <ResourcesTab
              onSave={createSaveHandler('resources', 'review')}
              onContinue={() => navigateToStep('review')}
              onBack={() => navigateToStep('reward')}
              initialData={stepData.resources}
              isLoading={loadingStates.resources}
            />
          </TabsContent>

          <TabsContent value='review' className='mt-0'>
            <ReviewTab
              allData={stepData}
              onEdit={navigateToStep}
              onBack={() => navigateToStep('resources')}
              onSaveDraft={saveDraft}
              isSavingDraft={isSavingDraft}
              onPublish={async () => {
                await publish();
              }}
              isLoading={isPublishing}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
