'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useWalletStore } from '@/lib/stores/walletStore';
import { fetchOrThrow, parseWalletError } from '@/lib/smartwallet/errors';
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

// ─── Types ────────────────────────────────────────────────────────────────────

const STEP_COUNT = 4;
type StepState = 'pending' | 'active' | 'completed';

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
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStepStates(current: number): StepState[] {
  return Array.from({ length: STEP_COUNT }, (_, i) => {
    if (i < current) return 'completed';
    if (i === current) return 'active';
    return 'pending';
  });
}

type SmartWalletResponse = { contractId: string | null };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { session: authSession } = useAuthContext();
  const email = authSession.data?.user?.email ?? '';
  const userName = authSession.data?.user?.name ?? '';

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(
    null
  );
  const [roles, setRoles] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  // contractId from our Zustand store — set by useCreateWallet / useConnect
  const contractId = useWalletStore(s => s.contractId);

  // ── On mount: skip step 0 if wallet already exists ──────────────────────
  // Checks local Zustand state first (same device, same session),
  // then falls back to the backend (different device scenario).

  useEffect(() => {
    // Same device — already in store from WalletBootstrap session restore
    if (contractId) {
      setSmartWalletAddress(contractId);
      setCurrentStep(1);
      return;
    }

    // Different device — ask the backend if this user already has a wallet
    let cancelled = false;

    fetchOrThrow<SmartWalletResponse>('/api/wallet/me')
      .then(result => {
        if (cancelled) return;
        if (result?.contractId) {
          setSmartWalletAddress(result.contractId);
          setCurrentStep(1);
        }
      })
      .catch(() => {
        // API failure is non-fatal — let the user go through passkey setup normally
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────

  const next = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, STEP_COUNT - 1));
  }, []);

  // ── Step handlers ─────────────────────────────────────────────────────────

  // Step 0: SecureAccountStep calls this once the wallet is created/connected
  const handleSecureComplete = useCallback(
    (contractId: string | null) => {
      setSmartWalletAddress(contractId);
      next();
    },
    [next]
  );

  const handleRolesComplete = useCallback(
    (selectedRoles: string[]) => {
      setRoles(selectedRoles);
      next();
    },
    [next]
  );

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

  // Step 3: Save onboarding data + init reputation on-chain
  const handleFinish = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        roles,
        skills: skills.length > 0 ? skills : undefined,
        smartWalletAddress: smartWalletAddress ?? undefined,
      });

      // Reputation profile is on-chain — requires passkey signing.
      // Non-fatal: user can retry from settings if this fails.
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
    } catch (err) {
      // parseWalletError handles both AppError and generic Error
      toast.error(parseWalletError(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [roles, skills, smartWalletAddress, router]);

  // ── Render ────────────────────────────────────────────────────────────────

  const stepStates = getStepStates(currentStep);
  const steps = STEP_META.map((meta, i) => ({
    ...meta,
    state: stepStates[i],
  }));

  return (
    <div className='relative flex min-h-screen items-center justify-center bg-black p-4'>
      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        <div className='bg-primary/3 absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]' />
      </div>

      <div className='relative z-10 flex w-full max-w-4xl flex-col items-start gap-10 md:flex-row'>
        <Stepper steps={steps} />

        <div className='w-full flex-1'>
          <div className='rounded-2xl border border-white/10 bg-linear-to-br from-white/5 via-transparent to-transparent p-8 backdrop-blur-sm sm:p-10'>
            {currentStep === 0 && (
              <SecureAccountStep
                email={email}
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
