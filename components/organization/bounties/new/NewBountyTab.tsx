'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { BoundlessButton } from '@/components/buttons';
import AiAssumptionsBanner from '@/components/ai/AiAssumptionsBanner';
import AiBriefPanel from '@/components/ai/AiBriefPanel';
import FundingConfirmationModal from '@/components/organization/funding/FundingConfirmationModal';
import type { FundingSourceItem } from '@/components/organization/funding/FundingConfirmationModal';
import FundingProgressModal from '@/components/organization/funding/FundingProgressModal';
import type { FundingMode } from '@/components/organization/funding/types';
import {
  useDraft,
  requestBountyFundingOtp,
  verifyBountyFundingOtp,
  type BountyDraftWithAi,
} from '@/features/bounties';
import { useTreasuryWallets } from '@/features/treasury';
import { connectWallet } from '@/lib/wallet/wallet-kit';
import { getWalletBalanceByAddress } from '@/lib/api/wallet';
import { formatAddress } from '@/lib/wallet-utils';
import {
  getBountyPrizePool,
  getBountyPlatformFee,
  getBountyTotalFunding,
} from '@/lib/utils/bounty-escrow';
import { useBountySteps } from '@/hooks/use-bounty-steps';
import { useBountyDraft } from '@/hooks/use-bounty-draft';
import { useBountyPublish } from '@/hooks/use-bounty-publish';
import { buildMockBountyData } from './mock-data';
import GenerateWithAiBountyDialog from './GenerateWithAiBountyDialog';
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
 * Organizer Assist (AI) entry points: a "Start faster with AI" banner on the
 * empty wizard opens GenerateWithAiBountyDialog (brief -> full draft), and each
 * AI-generated section offers a per-section "Regenerate with AI" button.
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

  // ---- Funding (publish) flow: the same modal hackathons use ----
  const [selectedSourceId, setSelectedSourceId] = useState('external');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [externalAddress, setExternalAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const rewardData = stepData.reward;
  const totalPrizePool = rewardData ? getBountyPrizePool(rewardData) : 0;
  const platformFee = rewardData ? getBountyPlatformFee(rewardData) : 0;
  const totalFunding = rewardData ? getBountyTotalFunding(rewardData) : 0;

  // Selectable funding sources: org treasury (managed) wallets + a connected
  // (external) wallet. Mirrors the hackathon picker.
  const treasuryQuery = useTreasuryWallets(derivedOrgId);
  const fundingSources = useMemo<FundingSourceItem[]>(() => {
    const items: FundingSourceItem[] = [];
    for (const w of treasuryQuery.data ?? []) {
      if (w.kind === 'MANAGED' && w.status === 'ACTIVE') {
        items.push({
          id: w.id,
          kind: 'MANAGED_TREASURY',
          label: `${w.label} (treasury)`,
          description: `Org treasury wallet · ${formatAddress(w.publicKey, 4)}`,
          address: w.publicKey,
        });
      }
    }
    items.push({
      id: 'external',
      kind: 'EXTERNAL',
      label: 'Connected wallet',
      description: 'You sign the transaction in your own wallet.',
      address: externalAddress,
    });
    return items;
  }, [treasuryQuery.data, externalAddress]);

  // Default to the org's canonical treasury wallet when one exists, unless the
  // organizer explicitly picks another.
  const sourcePickedRef = useRef(false);
  const defaultTreasuryId = useMemo(() => {
    const list = treasuryQuery.data ?? [];
    const def =
      list.find(
        w => w.kind === 'MANAGED' && w.status === 'ACTIVE' && w.isDefault
      ) ?? list.find(w => w.kind === 'MANAGED' && w.status === 'ACTIVE');
    return def?.id ?? null;
  }, [treasuryQuery.data]);
  useEffect(() => {
    if (!sourcePickedRef.current && defaultTreasuryId) {
      setSelectedSourceId(defaultTreasuryId);
    }
  }, [defaultTreasuryId]);

  const handleSelectSource = useCallback((id: string) => {
    sourcePickedRef.current = true;
    setSelectedSourceId(id);
  }, []);

  // Funding mode + owner derived from the explicit selection id (see the
  // hackathon note: never key off a list-fallback that could silently flip a
  // treasury selection to the connected wallet).
  const isExternalSource = selectedSourceId === 'external';
  const selectedTreasury = isExternalSource
    ? undefined
    : fundingSources.find(
        s => s.id === selectedSourceId && s.kind === 'MANAGED_TREASURY'
      );
  const fundingMode: FundingMode = isExternalSource ? 'EXTERNAL' : 'MANAGED';
  const treasurySource = selectedTreasury?.address
    ? { walletId: selectedTreasury.id, address: selectedTreasury.address }
    : null;
  const externalOwnerAddress = isExternalSource ? externalAddress : null;
  const funderAddress = isExternalSource
    ? externalAddress
    : (selectedTreasury?.address ?? null);

  const sourceAddress = funderAddress ?? undefined;
  const sourceBalanceQuery = useQuery({
    queryKey: ['wallet-balance', sourceAddress],
    queryFn: () => getWalletBalanceByAddress(sourceAddress as string),
    enabled: !!sourceAddress,
    staleTime: 15_000,
  });
  const selectedSourceUsdc = sourceAddress
    ? Number.parseFloat(sourceBalanceQuery.data?.usdc ?? '')
    : undefined;
  const balanceLoading = !!sourceAddress && sourceBalanceQuery.isLoading;

  const { publish, isPublishing, escrowPhase, escrowError, escrowTxHash } =
    useBountyPublish({
      organizationId: derivedOrgId || '',
      stepData,
      draftId,
      fundingMode,
      externalOwnerAddress,
      treasurySource,
    });

  const isFundingComplete = escrowPhase === 'completed';
  const isFundingFailed = escrowPhase === 'failed';
  const escrowPhaseRef = useRef(escrowPhase);
  useEffect(() => {
    escrowPhaseRef.current = escrowPhase;
  }, [escrowPhase]);

  const goToBountyList = useCallback(() => {
    if (derivedOrgId) router.replace(`/organizations/${derivedOrgId}/bounties`);
  }, [derivedOrgId, router]);

  const runFunding = useCallback(async () => {
    try {
      await publish();
      updateStepCompletion('review', true);
    } catch {
      // Failure surfaced via escrowPhase; the progress modal offers retry.
    }
  }, [publish, updateStepCompletion]);

  const handleConfirmFunding = async () => {
    setConfirmOpen(false);
    setProgressOpen(true);
    await runFunding();
    // Pre-flight bailed before the runner started -> nothing to show.
    if (escrowPhaseRef.current === 'idle') setProgressOpen(false);
  };

  // Funding step-up (email OTP). Backend decides if required; no-op when off.
  const requestOtp = useCallback(async () => {
    if (!derivedOrgId || !draftId) {
      return { required: false, alreadyVerified: false, sent: false };
    }
    const res = await requestBountyFundingOtp(derivedOrgId, draftId);
    return {
      required: res.required,
      alreadyVerified: res.alreadyVerified,
      sent: res.sent,
    };
  }, [derivedOrgId, draftId]);

  const verifyOtp = useCallback(
    async (code: string) => {
      if (!derivedOrgId || !draftId) return;
      await verifyBountyFundingOtp(derivedOrgId, draftId, code);
    },
    [derivedOrgId, draftId]
  );

  const handleConnectExternal = useCallback(async () => {
    setConnecting(true);
    try {
      const { address } = await connectWallet();
      setExternalAddress(address);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not connect a wallet.'
      );
    } finally {
      setConnecting(false);
    }
  }, []);

  // Dev-only convenience: fill every section with valid mock data, persist it
  // in one PATCH, and jump to Review. Never rendered in production builds.
  const isDev = process.env.NODE_ENV === 'development';
  const [isFillingMock, setIsFillingMock] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  // Offer AI drafting only on a fresh, empty wizard (no draft created and no
  // scope entered yet) so it never overwrites in-progress work.
  const showAiBanner = !draftId && !stepData.scope;

  // AI assumptions (from the draft response) surfaced on the review step so the
  // organizer can see and correct every guess the AI made.
  const { data: draftRecord } = useDraft(derivedOrgId ?? '', draftId);
  const aiGenerationRecord = (draftRecord as BountyDraftWithAi | undefined)
    ?.aiGeneration;
  const aiAssumptions = aiGenerationRecord?.assumptions ?? [];
  const aiBrief = aiGenerationRecord?.brief ?? null;
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
      {showAiBanner && derivedOrgId && (
        <div className='px-6 md:px-20'>
          <div className='border-primary/30 from-primary/10 flex flex-col gap-3 rounded-xl border bg-gradient-to-r to-transparent p-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-start gap-3'>
              <span className='bg-primary/15 text-primary mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg'>
                <Sparkles className='h-5 w-5' />
              </span>
              <div>
                <p className='text-sm font-semibold text-white'>
                  Start faster with AI
                </p>
                <p className='text-xs text-gray-400'>
                  Describe your bounty and we&apos;ll draft the scope,
                  submission rules, and prizes for you to review and edit.
                </p>
              </div>
            </div>
            <BoundlessButton
              type='button'
              size='sm'
              icon={<Sparkles className='h-4 w-4' />}
              iconPosition='left'
              onClick={() => setAiDialogOpen(true)}
            >
              Generate with AI
            </BoundlessButton>
          </div>
        </div>
      )}

      {derivedOrgId && (
        <GenerateWithAiBountyDialog
          organizationId={derivedOrgId}
          open={aiDialogOpen}
          onOpenChange={setAiDialogOpen}
        />
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
            {aiBrief && <AiBriefPanel brief={aiBrief} className='mb-4' />}
            {aiAssumptions.length > 0 && (
              <AiAssumptionsBanner
                assumptions={aiAssumptions}
                onReview={section => navigateToStep(section as StepKey)}
                className='mb-6'
              />
            )}
            <ReviewTab
              allData={stepData}
              onEdit={navigateToStep}
              onBack={() => navigateToStep('resources')}
              onSaveDraft={saveDraft}
              isSavingDraft={isSavingDraft}
              onPublish={() => setConfirmOpen(true)}
              isLoading={isPublishing}
            />
          </TabsContent>
        </div>
      </Tabs>

      {draftId && derivedOrgId && (
        <>
          <FundingConfirmationModal
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            totalPrizePool={totalPrizePool}
            platformFee={platformFee}
            totalFunding={totalFunding}
            sources={fundingSources}
            selectedSourceId={selectedSourceId}
            onSelectSource={handleSelectSource}
            sourceUsdc={selectedSourceUsdc}
            balanceLoading={balanceLoading}
            onConfirm={handleConfirmFunding}
            isSubmitting={isPublishing}
            connecting={connecting}
            onConnectExternal={handleConnectExternal}
            requestOtp={requestOtp}
            verifyOtp={verifyOtp}
            entityNoun='bounty'
          />
          <FundingProgressModal
            open={progressOpen}
            phase={escrowPhase}
            txHash={escrowTxHash}
            error={escrowError}
            isCompleted={isFundingComplete}
            isFailed={isFundingFailed}
            fundingMode={fundingMode}
            onClose={() => {
              setProgressOpen(false);
              if (isFundingComplete) goToBountyList();
            }}
            onRetry={() => void runFunding()}
            onSwitchToDraft={() => setProgressOpen(false)}
            onView={goToBountyList}
            entityNoun='bounty'
          />
        </>
      )}
    </div>
  );
}
