'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useProjectCreation } from '@/features/projects/hooks/use-project-creation';
import { CreationNavigation } from './CreationNavigation';
import CreationSidebar from './CreationSidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import BasicInfo from './Steps/BasicInfo';
import ProjectDetails from './Steps/ProjectDetails';
import TeamInfo from './Steps/TeamInfo';
import SocialLinks from './Steps/SocialLinks';
import CampaignDetails from './Steps/CampaignDetails';
import {
  ArrowRight,
  ArrowLeft,
  X,
  Rocket,
  Loader2,
  CheckCircle2,
  Send,
  Wallet,
} from 'lucide-react';
import ReviewStep from './Steps/ReviewStep';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  CreationStep,
  PublishPhase,
} from '@/features/projects/hooks/use-project-creation';
import DevPrefillButton from './DevPrefill';

export default function CreationLayout() {
  const {
    currentStep,
    steps,
    formData,
    isCampaign,
    setIsCampaign,
    updateFormData,
    goToStep,
    nextStep,
    prevStep,
    lastSaved,
    recentDrafts,
    draftId,
    isPersisting,
    persistError,
    isPublishing,
    publishError,
    publishValidationError,
    publishPhase,
    handlePublish,
    isLoadingDraft,
    onDeleteDraft,
  } = useProjectCreation();

  const PHASE_CONFIG: Record<
    PublishPhase,
    { label: string; sub: string; icon: React.ReactNode } | null
  > = {
    idle: null,
    validating: {
      label: 'Validating...',
      sub: 'Checking required fields',
      icon: <Loader2 className='text-primary h-8 w-8 animate-spin' />,
    },
    flushing: {
      label: 'Saving draft...',
      sub: 'Flushing latest changes',
      icon: <Loader2 className='text-primary h-8 w-8 animate-spin' />,
    },
    deploying: {
      label: 'Deploying to Stellar',
      sub: 'Please approve the transaction in your wallet',
      icon: <Wallet className='text-primary h-8 w-8 animate-pulse' />,
    },
    submitting: {
      label: 'Submitting for review',
      sub: 'Almost there...',
      icon: <Send className='text-primary h-8 w-8 animate-pulse' />,
    },
    done: {
      label: 'Published!',
      sub: 'Redirecting...',
      icon: <CheckCircle2 className='text-primary h-8 w-8' />,
    },
  };

  const activePhaseConfig =
    isPublishing && isCampaign ? PHASE_CONFIG[publishPhase] : null;

  const [visitedSteps, setVisitedSteps] = useState<Set<CreationStep>>(
    new Set([currentStep])
  );
  const [completedSteps, setCompletedSteps] = useState<Set<CreationStep>>(
    new Set()
  );

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const prevStepRef = useRef<CreationStep>(currentStep);
  useEffect(() => {
    const s = stepsRef.current;
    if (prevStepRef.current !== currentStep) {
      const prevIdx = s.findIndex(st => st.key === prevStepRef.current);
      const newIdx = s.findIndex(st => st.key === currentStep);
      if (newIdx > prevIdx) {
        setCompletedSteps(prev => new Set([...prev, prevStepRef.current]));
      }
      prevStepRef.current = currentStep;
    }
    setVisitedSteps(prev => {
      if (prev.has(currentStep)) return prev;
      return new Set([...prev, currentStep]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const handleNavigateToStep = (stepKey: CreationStep) => {
    setVisitedSteps(prev => new Set([...prev, currentStep]));
    goToStep(stepKey);
  };

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    nextStep();
  };

  return (
    <div className='flex h-screen w-full overflow-hidden bg-[#0a0a0a] text-white'>
      <CreationSidebar
        recentDrafts={recentDrafts}
        activeDraftId={draftId}
        onDeleteDraft={onDeleteDraft}
      />

      {/* Loading overlay */}
      {(isLoadingDraft || isPublishing) && (
        <div className='absolute inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm'>
          {isLoadingDraft ? (
            <div className='flex flex-col items-center gap-3'>
              <Loader2 className='text-primary h-8 w-8 animate-spin' />
              <p className='text-sm font-medium text-white/40'>
                Loading draft...
              </p>
            </div>
          ) : activePhaseConfig ? (
            <div className='flex w-72 flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[#111] p-6 text-center shadow-2xl'>
              {activePhaseConfig.icon}
              <div className='flex flex-col gap-1'>
                <p className='text-sm font-semibold text-white'>
                  {activePhaseConfig.label}
                </p>
                <p className='text-xs text-white/40'>{activePhaseConfig.sub}</p>
              </div>
              {/* Phase progress dots */}
              <div className='flex items-center gap-1.5'>
                {(
                  [
                    'flushing',
                    'deploying',
                    'submitting',
                    'done',
                  ] as PublishPhase[]
                ).map(p => (
                  <div
                    key={p}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      p === publishPhase
                        ? 'bg-primary w-4'
                        : [
                              'flushing',
                              'deploying',
                              'submitting',
                              'done',
                            ].indexOf(p) <
                            [
                              'flushing',
                              'deploying',
                              'submitting',
                              'done',
                            ].indexOf(publishPhase)
                          ? 'w-1.5 bg-white/40'
                          : 'w-1.5 bg-white/10'
                    )}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-3'>
              <Loader2 className='text-primary h-8 w-8 animate-spin' />
              <p className='text-sm font-medium text-white/40'>
                Publishing your project...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      <div className='relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
        {/* Header */}
        <header className='z-20 flex shrink-0 items-center justify-between border-b border-white/6 px-3 py-2.5 sm:px-6 sm:py-3'>
          <div className='flex items-center gap-3'>
            <span className='hidden text-xs font-medium text-white/30 sm:inline'>
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <div className='hidden h-3.5 w-px bg-white/10 sm:block' />
            <div className='flex items-center gap-1'>
              {steps.map(s => (
                <div
                  key={s.key}
                  className={cn(
                    'h-1 rounded-full transition-all duration-300',
                    s.key === currentStep
                      ? 'bg-primary w-5'
                      : completedSteps.has(s.key)
                        ? 'w-1.5 bg-white/30'
                        : 'w-1.5 bg-white/10'
                  )}
                />
              ))}
            </div>
          </div>

          <div className='flex items-center gap-3'>
            {isPersisting && (
              <div className='hidden items-center gap-1.5 text-xs text-white/30 sm:flex'>
                <Loader2 className='h-3 w-3 animate-spin' />
                Saving...
              </div>
            )}
            {!isPersisting && lastSaved && (
              <div className='hidden items-center gap-1.5 text-xs text-white/25 sm:flex'>
                <CheckCircle2 className='text-primary h-3 w-3' />
                Saved{' '}
                {new Date(lastSaved).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
            <DevPrefillButton onPrefill={updateFormData} />
            <Link
              href='/projects'
              className='flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/40 transition-colors hover:border-white/20 hover:text-white/60'
            >
              <X className='h-3.5 w-3.5' />
            </Link>
          </div>
        </header>

        {/* Tabs wrapper */}
        <Tabs
          value={currentStep}
          onValueChange={val => handleNavigateToStep(val as CreationStep)}
          className='flex min-h-0 min-w-0 flex-1 flex-col'
        >
          <CreationNavigation
            activeTab={currentStep}
            steps={steps}
            navigateToStep={handleNavigateToStep}
            visitedSteps={visitedSteps}
            completedSteps={completedSteps}
          />

          {/* Scrollable content */}
          <div className='flex-1 overflow-x-hidden overflow-y-auto'>
            <div className='mx-auto w-full px-4 py-6 pb-20 sm:px-6 sm:py-10 sm:pb-32'>
              <TabsContent value='basic' className='mt-0 outline-none'>
                <BasicInfo
                  formData={formData}
                  updateFormData={updateFormData}
                  isCampaign={isCampaign}
                  setIsCampaign={setIsCampaign}
                />
              </TabsContent>

              <TabsContent value='details' className='mt-0 outline-none'>
                <ProjectDetails
                  formData={formData}
                  updateFormData={updateFormData}
                />
              </TabsContent>

              <TabsContent value='team' className='mt-0 outline-none'>
                <TeamInfo formData={formData} updateFormData={updateFormData} />
              </TabsContent>

              <TabsContent value='social' className='mt-0 outline-none'>
                <SocialLinks
                  formData={formData}
                  updateFormData={updateFormData}
                />
              </TabsContent>

              <TabsContent value='funding' className='mt-0 outline-none'>
                <CampaignDetails
                  formData={formData}
                  updateFormData={updateFormData}
                />
              </TabsContent>

              <TabsContent value='review' className='mt-0 outline-none'>
                <ReviewStep
                  formData={formData}
                  onNavigate={handleNavigateToStep}
                />
              </TabsContent>
            </div>
          </div>

          {/* Publish validation / API error */}
          {(publishValidationError || publishError) && (
            <div className='shrink-0 border-t border-red-500/20 bg-red-500/5 px-4 py-2 text-xs text-red-400 sm:px-6'>
              {publishValidationError || publishError}
            </div>
          )}

          {/* Footer */}
          <footer className='z-20 flex shrink-0 items-center justify-between border-t border-white/6 bg-[#0a0a0a]/95 px-3 py-2.5 backdrop-blur-sm sm:px-6 sm:py-3'>
            <div className='flex items-center gap-2'>
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  disabled={isPublishing}
                  className='flex h-9 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white disabled:pointer-events-none disabled:opacity-40'
                >
                  <ArrowLeft className='h-3.5 w-3.5' />
                  <span className='hidden sm:inline'>Back</span>
                </button>
              )}
            </div>

            {/* Center label */}
            <span className='hidden text-xs font-medium text-white/25 md:block'>
              {steps[currentStepIndex]?.label}
            </span>

            {/* Continue / Publish */}
            <button
              onClick={isLastStep ? handlePublish : handleNext}
              disabled={isLastStep ? isPublishing || !draftId : false}
              className={cn(
                'flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all active:scale-[0.98] sm:gap-2 sm:px-5 sm:text-sm',
                isLastStep
                  ? 'bg-primary hover:bg-primary/90 text-black disabled:opacity-50'
                  : 'bg-primary hover:bg-primary/90 text-black',
                'disabled:pointer-events-none disabled:cursor-not-allowed'
              )}
            >
              {isLastStep ? (
                isPublishing ? (
                  <>
                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Rocket className='h-3.5 w-3.5' />
                    {draftId ? 'Publish' : 'Save first'}
                  </>
                )
              ) : (
                <>
                  Continue
                  <ArrowRight className='h-3.5 w-3.5' />
                </>
              )}
            </button>
          </footer>
        </Tabs>
      </div>
    </div>
  );
}
