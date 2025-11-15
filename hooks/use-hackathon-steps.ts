import { useState, useCallback } from 'react';
import type {
  StepKey,
  StepData,
  StepStatus,
} from '@/components/organization/hackathons/new/constants';
import { STEP_ORDER } from '@/components/organization/hackathons/new/constants';

interface UseHackathonStepsReturn {
  activeTab: StepKey;
  steps: Record<StepKey, StepData>;
  setActiveTab: (tab: StepKey) => void;
  navigateToStep: (stepKey: StepKey, skipAccessCheck?: boolean) => void;
  canAccessStep: (stepKey: StepKey) => boolean;
  updateStepCompletion: (
    stepKey: StepKey,
    isCompleted: boolean,
    nextStep?: StepKey
  ) => void;
}

export const useHackathonSteps = (
  initialActiveTab: StepKey = 'information'
): UseHackathonStepsReturn => {
  const [activeTab, setActiveTab] = useState<StepKey>(initialActiveTab);
  const [steps, setSteps] = useState<Record<StepKey, StepData>>({
    information: { status: 'active', isCompleted: false },
    timeline: { status: 'pending', isCompleted: false },
    participation: { status: 'pending', isCompleted: false },
    rewards: { status: 'pending', isCompleted: false },
    judging: { status: 'pending', isCompleted: false },
    collaboration: { status: 'pending', isCompleted: false },
    review: { status: 'pending', isCompleted: false },
  });

  const getCurrentStepIndex = useCallback(() => {
    return STEP_ORDER.indexOf(activeTab);
  }, [activeTab]);

  const canAccessStep = useCallback(
    (stepKey: StepKey) => {
      if (stepKey === 'review') {
        return steps.collaboration?.isCompleted === true;
      }

      const stepIndex = STEP_ORDER.indexOf(stepKey);
      const currentIndex = getCurrentStepIndex();

      if (stepIndex <= currentIndex) return true;

      if (stepIndex === currentIndex + 1 && steps[activeTab].isCompleted) {
        return true;
      }

      return false;
    },
    [steps, activeTab, getCurrentStepIndex]
  );

  const navigateToStep = useCallback(
    (stepKey: StepKey, skipAccessCheck = false) => {
      if (skipAccessCheck || canAccessStep(stepKey)) {
        const stepIndex = STEP_ORDER.indexOf(stepKey);
        const currentIndex = getCurrentStepIndex();

        if (stepIndex > currentIndex) {
          setSteps(prev => {
            const newSteps = { ...prev };

            STEP_ORDER.forEach((step, index) => {
              if (index > stepIndex) {
                newSteps[step] = { status: 'pending', isCompleted: false };
              }
            });

            newSteps[stepKey] = { ...newSteps[stepKey], status: 'active' };

            return newSteps;
          });
        } else {
          setSteps(prev => ({
            ...prev,
            [stepKey]: { ...prev[stepKey], status: 'active' },
          }));
        }

        setActiveTab(stepKey);
      }
    },
    [canAccessStep, getCurrentStepIndex]
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

      if (nextStep) {
        setActiveTab(nextStep);
      }
    },
    []
  );

  return {
    activeTab,
    steps,
    setActiveTab,
    navigateToStep,
    canAccessStep,
    updateStepCompletion,
  };
};
