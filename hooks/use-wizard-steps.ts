import { useState, useEffect, useMemo, useRef } from 'react';
import type { HackathonEscrowData } from '@/lib/api/hackathons';

export type WizardStep = 'announcement' | 'preview';

const STEPS: Array<{ id: WizardStep; name: string; description: string }> = [
  {
    id: 'announcement',
    name: 'Announcement',
    description: 'Write a message for winners and community',
  },
  {
    id: 'preview',
    name: 'Preview',
    description: 'Review before publishing',
  },
];

interface UseWizardStepsProps {
  open: boolean;
  escrow: HackathonEscrowData | null;
}

export const useWizardSteps = ({ open, escrow }: UseWizardStepsProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('announcement');
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      return;
    }

    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    setCurrentStep('announcement');
  }, [open]);

  const stepsToShow = STEPS;
  const currentStepIndex = stepsToShow.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStep === 'announcement') {
      setCurrentStep('preview');
    }
  };

  const handleBack = () => {
    if (currentStep === 'preview') {
      setCurrentStep('announcement');
    }
  };

  return {
    currentStep,
    setCurrentStep,
    stepsToShow,
    currentStepIndex,
    handleNext,
    handleBack,
  };
};
