import { useState, useEffect, useMemo, useRef } from 'react';
import type { HackathonEscrowData } from '@/lib/api/hackathons';

export type WizardStep = 'wallets' | 'announcement' | 'preview';

const STEPS: Array<{ id: WizardStep; name: string; description: string }> = [
  {
    id: 'wallets',
    name: 'Wallet Addresses',
    description: 'Enter Stellar wallet addresses for each winner',
  },
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
  const [currentStep, setCurrentStep] = useState<WizardStep>('wallets');
  const initializedRef = useRef(false);

  const needsMilestones = useMemo(
    () => escrow?.canUpdate && escrow?.isFunded,
    [escrow?.canUpdate, escrow?.isFunded]
  );

  const stepsToShow = useMemo(
    () =>
      needsMilestones ? STEPS : STEPS.filter(step => step.id !== 'wallets'),
    [needsMilestones]
  );

  useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      return;
    }

    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    const currentNeedsMilestones = escrow?.canUpdate && escrow?.isFunded;
    setCurrentStep(currentNeedsMilestones ? 'wallets' : 'announcement');
  }, [open, escrow?.canUpdate, escrow?.isFunded]);

  const currentStepIndex = stepsToShow.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStep === 'wallets') {
      setCurrentStep('announcement');
    } else if (currentStep === 'announcement') {
      setCurrentStep('preview');
    }
  };

  const handleBack = () => {
    if (currentStep === 'preview') {
      setCurrentStep('announcement');
    } else if (currentStep === 'announcement') {
      if (needsMilestones) {
        setCurrentStep('wallets');
      }
    }
  };

  return {
    currentStep,
    setCurrentStep,
    stepsToShow,
    currentStepIndex,
    needsMilestones,
    handleNext,
    handleBack,
  };
};
