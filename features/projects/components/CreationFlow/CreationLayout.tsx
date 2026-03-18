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
import { ArrowRight, ArrowLeft, Save, Sparkles, X, Rocket } from 'lucide-react';
import ReviewStep from './Steps/ReviewStep';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CreationStep } from '@/features/projects/hooks/use-project-creation';

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
  } = useProjectCreation();

  // Track which steps have been visited
  const [visitedSteps, setVisitedSteps] = useState<Set<CreationStep>>(
    new Set([currentStep])
  );
  // Track which steps are considered "completed" (user moved past them)
  const [completedSteps, setCompletedSteps] = useState<Set<CreationStep>>(
    new Set()
  );

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Keep a stable ref to steps so useEffect can read it without it being a dependency
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  // When the step changes, mark previous as completed and new one as visited.
  // IMPORTANT: `steps` is intentionally excluded from deps — it's a new array ref
  // every render, which would cause an infinite loop via setVisitedSteps.
  // We use stepsRef.current for stable reads inside the effect.
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
      if (prev.has(currentStep)) return prev; // avoid new Set allocation when unchanged
      return new Set([...prev, currentStep]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]); // `steps` intentionally omitted — use stepsRef

  const handleNavigateToStep = (stepKey: CreationStep) => {
    // Mark current step as visited before leaving
    setVisitedSteps(prev => new Set([...prev, currentStep]));
    goToStep(stepKey);
  };

  const handleNext = () => {
    // Mark the current step as completed when moving forward
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    nextStep();
  };

  return (
    <div className='flex h-screen w-full overflow-hidden bg-[#050505] text-white'>
      {/* Sidebar */}
      <CreationSidebar recentDrafts={recentDrafts} />

      {/* Main Content Column — flex column, full height, NO overflow on the column itself */}
      <div className='relative flex min-h-0 flex-1 flex-col bg-[#060606]'>
        {/* ── TOP HEADER ── */}
        <header className='z-20 flex shrink-0 items-center justify-between border-b border-white/5 bg-[#060606]/80 px-8 py-4 backdrop-blur-md'>
          <div className='flex items-center gap-3'>
            <span className='text-[10px] font-black tracking-[0.2em] text-white/20 uppercase'>
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <div className='h-3 w-px bg-white/10' />
            <div className='flex items-center gap-1.5'>
              {steps.map((s, i) => (
                <div
                  key={s.key}
                  className={cn(
                    'h-1 rounded-full transition-all duration-500',
                    s.key === currentStep
                      ? 'bg-primary w-6'
                      : completedSteps.has(s.key)
                        ? 'w-2 bg-white/30'
                        : 'w-2 bg-white/10'
                  )}
                />
              ))}
            </div>
          </div>

          <div className='flex items-center gap-4'>
            {lastSaved && (
              <div className='animate-in fade-in flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-white/20 uppercase'>
                <Sparkles className='text-primary h-3 w-3' />
                Saved{' '}
                {new Date(lastSaved).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
            <Link
              href='/projects'
              className='flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-500'
            >
              <X className='h-4 w-4' />
            </Link>
          </div>
        </header>

        {/* ── STEP TAB NAVIGATION ── (sticky below header) */}
        <Tabs
          value={currentStep}
          onValueChange={val => handleNavigateToStep(val as CreationStep)}
          className='flex min-h-0 flex-1 flex-col'
        >
          <CreationNavigation
            activeTab={currentStep}
            steps={steps}
            navigateToStep={handleNavigateToStep}
            visitedSteps={visitedSteps}
            completedSteps={completedSteps}
          />

          {/* ── SCROLLABLE CONTENT AREA — flex-1, overflow here ── */}
          <div className='flex-1 overflow-y-auto'>
            <div className='flex justify-center px-8 py-12 pb-40 md:py-16'>
              <div className='w-full'>
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
                  <TeamInfo
                    formData={formData}
                    updateFormData={updateFormData}
                  />
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
          </div>

          {/* ── FIXED FOOTER — always visible at the bottom ── */}
          <footer className='z-20 flex shrink-0 items-center justify-between border-t border-white/5 bg-[#060606]/90 px-8 py-5 backdrop-blur-xl'>
            {/* Left group — Back + Save */}
            <div className='flex items-center gap-3'>
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className='flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-[11px] font-black tracking-[0.15em] text-white/60 uppercase transition-all hover:bg-white/10 hover:text-white active:scale-95'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Back
                </button>
              )}

              <button className='hidden items-center gap-2 rounded-xl border border-white/5 px-5 py-3.5 text-[11px] font-black tracking-[0.15em] text-white/30 uppercase transition-all hover:bg-white/5 hover:text-white/60 active:scale-95 md:flex'>
                <Save className='h-3.5 w-3.5' />
                Save Draft
              </button>
            </div>

            {/* Right — Next / Publish */}
            <button
              onClick={isLastStep ? undefined : handleNext}
              className={cn(
                'flex items-center gap-2 rounded-xl px-8 py-3.5 text-[11px] font-black tracking-[0.2em] uppercase transition-all active:scale-[0.98]',
                isLastStep
                  ? 'bg-primary shadow-primary/20 hover:bg-primary/90 text-black shadow-lg'
                  : 'bg-primary shadow-primary/10 hover:bg-primary/90 text-black shadow-lg'
              )}
            >
              {isLastStep ? (
                <>
                  <Rocket className='h-4 w-4' />
                  Publish Project
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className='h-4 w-4' />
                </>
              )}
            </button>
          </footer>
        </Tabs>
      </div>
    </div>
  );
}
