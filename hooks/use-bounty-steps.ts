'use client';

import { useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type {
  StepKey,
  StepData,
  StepStatus,
} from '@/components/organization/bounties/new/constants';
import { STEP_ORDER } from '@/components/organization/bounties/new/constants';

interface UseBountyStepsReturn {
  activeTab: StepKey;
  steps: Record<StepKey, StepData>;
  setActiveTab: (tab: StepKey) => void;
  setStepsFromDraft: (
    steps: Record<StepKey, StepData>,
    activeStep: StepKey
  ) => void;
  navigateToStep: (stepKey: StepKey) => void;
  updateStepCompletion: (
    stepKey: StepKey,
    isCompleted: boolean,
    nextStep?: StepKey
  ) => void;
}

function isStepKey(value: string | null | undefined): value is StepKey {
  return !!value && (STEP_ORDER as readonly string[]).includes(value);
}

/**
 * Wizard step state for the bounty Configure flow. The active step is URL-driven
 * via the `?step=` query param, so refresh, back/forward, and bookmarking resume
 * the right step. Navigation is free-roam: any step is reachable at any time;
 * the per-step status map is purely presentational. Mirrors useHackathonSteps.
 */
export const useBountySteps = (
  initialActiveTab: StepKey = 'scope'
): UseBountyStepsReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlStep = searchParams.get('step');
  const activeTab: StepKey = isStepKey(urlStep) ? urlStep : initialActiveTab;

  const [steps, setSteps] = useState<Record<StepKey, StepData>>({
    scope: { status: 'active', isCompleted: false },
    mode: { status: 'pending', isCompleted: false },
    submission: { status: 'pending', isCompleted: false },
    reward: { status: 'pending', isCompleted: false },
    resources: { status: 'pending', isCompleted: false },
    review: { status: 'pending', isCompleted: false },
  });

  // Write the active step to the URL. `push` for explicit navigation (so back
  // steps through), `replace` for programmatic syncs (auto-resume).
  const writeStep = useCallback(
    (stepKey: StepKey, mode: 'push' | 'replace' = 'push') => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('step', stepKey);
      const url = `${pathname}?${params.toString()}`;
      if (mode === 'replace') router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const setActiveTab = useCallback(
    (tab: StepKey) => writeStep(tab, 'push'),
    [writeStep]
  );

  const navigateToStep = useCallback(
    (stepKey: StepKey) => {
      setSteps(prev => ({
        ...prev,
        [stepKey]: { ...prev[stepKey], status: 'active' as StepStatus },
      }));
      writeStep(stepKey, 'push');
    },
    [writeStep]
  );

  const setStepsFromDraft = useCallback(
    (stepsState: Record<StepKey, StepData>, activeStep: StepKey) => {
      setSteps(stepsState);
      // Respect an explicit ?step= (refresh / bookmark); otherwise fall back to
      // the computed first-incomplete step as a replace (no extra history entry).
      if (!isStepKey(searchParams.get('step'))) {
        writeStep(activeStep, 'replace');
      }
    },
    [searchParams, writeStep]
  );

  const updateStepCompletion = useCallback(
    (stepKey: StepKey, isCompleted: boolean, nextStep?: StepKey) => {
      setSteps(prev => {
        const newSteps: Record<StepKey, StepData> = {
          ...prev,
          [stepKey]: {
            ...prev[stepKey],
            status: 'completed' as StepStatus,
            isCompleted,
          },
        };
        if (nextStep) {
          newSteps[nextStep] = {
            ...prev[nextStep],
            status: 'active' as StepStatus,
          };
        }
        return newSteps;
      });
      if (nextStep) writeStep(nextStep, 'push');
    },
    [writeStep]
  );

  return {
    activeTab,
    steps,
    setActiveTab,
    setStepsFromDraft,
    navigateToStep,
    updateStepCompletion,
  };
};
