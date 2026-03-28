'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useSmartWallet } from '@/components/providers/smart-wallet-provider';
import { getSmartWallet } from '@/lib/api/wallet';
import {
  completeOnboarding,
  confirmReputationInit,
} from '@/lib/api/onboarding';
import { initReputationProfile } from '@/lib/contracts/reputation-registry';
import Stepper from '@/components/stepper/Stepper';
import SecureAccountStep from '@/components/onboarding/SecureAccountStep';
import RoleSelectionStep from '@/components/onboarding/RoleSelectionStep';
import SkillsStep from '@/components/onboarding/SkillsStep';
import WelcomeStep from '@/components/onboarding/WelcomeStep';

const STEP_COUNT = 4;

type StepState = 'pending' | 'active' | 'completed';

function getStepStates(current: number): StepState[] {
  return Array.from({ length: STEP_COUNT }, (_, i) => {
    if (i < current) return 'completed';
    if (i === current) return 'active';
    return 'pending';
  });
}

const STEP_META = [
  {
    title: 'Secure account',
    description: 'Set up biometric protection for your account',
  },
  {
    title: 'Choose your role',
    description: 'Tell us how you plan to use Boundless',
  },
  {
    title: 'Your skills',
    description: 'Help us match you with the right opportunities',
  },
  {
    title: 'Get started',
    description: "You're ready to explore Boundless",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { session: authSession } = useAuthContext();
  const smartWallet = useSmartWallet();
  const userName = authSession.data?.user?.name || '';

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Collected data
  const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(
    null
  );
  const [roles, setRoles] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  // On mount only: if user already has a smart wallet (local or backend), skip passkey step.
  // Captures smartWallet.contractId at mount time — does NOT react to later changes
  // (e.g. after the user registers a new passkey during this session).
  const initialContractId = useRef(smartWallet.contractId);
  useEffect(() => {
    // Check local state first (same device)
    if (initialContractId.current) {
      setSmartWalletAddress(initialContractId.current);
      setCurrentStep(1);
      return;
    }

    // Check backend (different device scenario)
    let cancelled = false;
    getSmartWallet()
      .then(result => {
        if (cancelled) return;
        if (result?.contractId) {
          setSmartWalletAddress(result.contractId);
          setCurrentStep(1);
        }
      })
      .catch(() => {
        // If the API fails, let the user proceed with passkey setup normally
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, STEP_COUNT - 1));
  }, []);

  // Step 1: Secure account
  const handleSecureComplete = useCallback(
    (contractId: string | null) => {
      setSmartWalletAddress(contractId);
      next();
    },
    [next]
  );

  // Step 2: Role selection
  const handleRolesComplete = useCallback(
    (selectedRoles: string[]) => {
      setRoles(selectedRoles);
      next();
    },
    [next]
  );

  // Step 3: Skills
  const handleSkillsComplete = useCallback(
    (selectedSkills: string[]) => {
      setSkills(selectedSkills);
      next();
    },
    [next]
  );

  const handleSkillsSkip = useCallback(() => {
    setSkills([]);
    next();
  }, [next]);

  // Step 4: Finish — save onboarding, then sign reputation init on-chain
  const handleFinish = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        roles,
        skills: skills.length > 0 ? skills : undefined,
        smartWalletAddress: smartWalletAddress ?? undefined,
      });

      // Initialize on-chain reputation profile via passkey signing
      if (smartWalletAddress) {
        try {
          await initReputationProfile(smartWalletAddress);
          await confirmReputationInit();
        } catch (err) {
          console.warn(
            'Reputation init failed — user can retry from settings',
            err
          );
        }
      }

      toast.success('Welcome to Boundless!');
      router.push('/');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [roles, skills, smartWalletAddress, router]);

  const stepStates = getStepStates(currentStep);
  const steps = STEP_META.map((meta, i) => ({
    ...meta,
    state: stepStates[i],
  }));

  return (
    <div className='relative flex min-h-screen items-center justify-center bg-black p-4'>
      {/* Subtle gradient background */}
      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        <div className='bg-primary/3 absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]' />
      </div>

      <div className='relative z-10 flex w-full max-w-4xl flex-col items-start gap-10 md:flex-row'>
        {/* Stepper sidebar */}
        <Stepper steps={steps} />

        {/* Step content */}
        <div className='w-full flex-1'>
          <div className='rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-transparent p-8 backdrop-blur-sm sm:p-10'>
            {currentStep === 0 && (
              <SecureAccountStep
                userName={userName}
                onComplete={handleSecureComplete}
              />
            )}
            {currentStep === 1 && (
              <RoleSelectionStep
                initialRoles={roles}
                onComplete={handleRolesComplete}
              />
            )}
            {currentStep === 2 && (
              <SkillsStep
                initialSkills={skills}
                onComplete={handleSkillsComplete}
                onSkip={handleSkillsSkip}
              />
            )}
            {currentStep === 3 && (
              <WelcomeStep
                userName={userName}
                roles={roles}
                onFinish={handleFinish}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
