'use client';

import { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useHackathonSteps } from '@/hooks/use-hackathon-steps';
import { useHackathonDraft } from '@/hooks/use-hackathon-draft';
import { useHackathonPublish } from '@/hooks/use-hackathon-publish';
import { useHackathonStepSave } from '@/hooks/use-hackathon-step-save';
import InfoTab from './tabs/InfoTab';
import TimelineTab from './tabs/TimelineTab';
import ParticipantTab from './tabs/ParticipantTab';
import TracksTab from './tabs/TracksTab';
import RewardsTab from './tabs/RewardsTab';
import CustomQuestionsTab from './tabs/CustomQuestionsTab';
import ResourcesTab from './tabs/ResourcesTab';
import JudgingTab from './tabs/JudgingTab';
import CollaborationTab from './tabs/CollaborationTab';
import ReviewTab from './tabs/ReviewTab';
import FundingConfirmationModal from '@/components/organization/funding/FundingConfirmationModal';
import type { FundingSourceItem } from '@/components/organization/funding/FundingConfirmationModal';
import FundingProgressModal from '@/components/organization/funding/FundingProgressModal';
import type { StepKey } from './constants';
import { isStepDataValid } from '@/lib/utils/hackathon-step-validation';
import { usePrizePoolCalculations } from '@/hooks/use-prize-pool-calculations';
import {
  requestHackathonFundingOtp,
  verifyHackathonFundingOtp,
  useDraft,
  type FundingMode,
  type HackathonDraftAssumption,
} from '@/features/hackathons';
import AiAssumptionsBanner from '@/components/ai/AiAssumptionsBanner';
import AiBriefPanel from '@/components/ai/AiBriefPanel';
import { connectWallet } from '@/lib/wallet/wallet-kit';
import { useTreasuryWallets } from '@/features/treasury';
import { useQuery } from '@tanstack/react-query';
import { getWalletBalanceByAddress } from '@/lib/api/wallet';
import { formatAddress } from '@/lib/wallet-utils';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';
import GenerateWithAiDialog from './GenerateWithAiDialog';

/** Surface the backend's specific funding-OTP message (expired / wrong / rate
 * limited) instead of a generic axios error string. */
function fundingOtpErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: unknown } } })
    ?.response?.data?.message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message) && message.length > 0) return String(message[0]);
  return err instanceof Error ? err.message : fallback;
}

interface NewHackathonTabProps {
  organizationId?: string;
  draftId?: string;
}

export default function NewHackathonTab({
  organizationId,
  draftId: initialDraftId,
}: NewHackathonTabProps) {
  const derivedOrgId = useMemo(() => {
    if (organizationId) return organizationId;
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const parts = pathname.split('/');
      if (parts.length >= 3 && parts[1] === 'organizations') {
        return parts[2];
      }
    }
    return undefined;
  }, [organizationId]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  // draftId can arrive via the route path (/drafts/[draftId]) or, on the /new
  // flow, via a ?draftId= query we add after the first save. Either resumes the
  // same draft on refresh.
  const resolvedInitialDraftId =
    initialDraftId ?? searchParams.get('draftId') ?? undefined;

  const {
    activeTab,
    steps,
    navigateToStep,
    setStepsFromDraft,
    setActiveTab,
    updateStepCompletion,
  } = useHackathonSteps('information');

  // Use ref to store the callback to avoid circular dependency
  const onDraftLoadedRef = useRef<
    ((formData: any, firstIncompleteStep: StepKey) => void) | null
  >(null);

  const {
    draftId,
    draftStatus,
    stepData,
    setStepData,
    isLoadingDraft,
    currentError,
    isSavingDraft,
    saveDraft,
    saveStep,
  } = useHackathonDraft({
    organizationId: derivedOrgId,
    initialDraftId: resolvedInitialDraftId,
    onDraftLoaded: (formData, firstIncompleteStep) => {
      // Use the ref to call the callback
      if (onDraftLoadedRef.current) {
        onDraftLoadedRef.current(formData, firstIncompleteStep);
      }
    },
  });

  // Persist a freshly-created draft id into the URL so a refresh resumes the
  // same draft. The /drafts/[draftId] route already carries it in the path;
  // this covers the /new flow by adding ?draftId= after the first save.
  useEffect(() => {
    if (!draftId || initialDraftId) return;
    if (searchParams.get('draftId') === draftId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('draftId', draftId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [draftId, initialDraftId, searchParams, pathname, router]);

  // AI assumptions (from the draft response) surfaced on the review step so the
  // organizer can see and correct every guess the AI made.
  const { data: aiDraftRecord } = useDraft(derivedOrgId ?? '', draftId);
  const aiGenerationRecord = (
    aiDraftRecord as
      | {
          aiGeneration?: {
            assumptions?: HackathonDraftAssumption[];
            brief?: string | null;
          };
        }
      | undefined
  )?.aiGeneration;
  const aiAssumptions = aiGenerationRecord?.assumptions ?? [];
  const aiBrief = aiGenerationRecord?.brief ?? null;

  // Define the callback after hooks are initialized
  const onDraftLoaded = useCallback(
    (formData: any, firstIncompleteStep: StepKey) => {
      setStepData(formData);

      // Build step state: completed before active, active for firstIncomplete, pending after
      const stepOrder = [
        'information',
        'timeline',
        'participation',
        'tracks',
        'rewards',
        'custom-questions',
        'resources',
        'judging',
        'collaboration',
        'review',
      ] as StepKey[];
      const activeIndex = stepOrder.indexOf(firstIncompleteStep);
      const newSteps: Record<StepKey, (typeof steps)[StepKey]> = {} as Record<
        StepKey,
        (typeof steps)[StepKey]
      >;

      stepOrder.forEach((key, index) => {
        const isCompleted = isStepDataValid(key, formData);
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

  // Update the ref when the callback changes
  useEffect(() => {
    onDraftLoadedRef.current = onDraftLoaded;
  }, [onDraftLoaded]);

  // Funding source selection: an org treasury wallet or a connected (external)
  // wallet. Defaults to the org's canonical treasury (see below); the
  // confirmation modal lets the organizer switch before funds move.
  const [selectedSourceId, setSelectedSourceId] = useState('external');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  // EXTERNAL funding: the connected wallet (Stellar Wallets Kit) that funds + signs.
  const [externalAddress, setExternalAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const { totalPrizePool, platformFee, totalFunding } =
    usePrizePoolCalculations(stepData.rewards);

  // Build the selectable funding sources: org treasury (managed) wallets and a
  // connected (external) wallet. Personal/burner wallets are intentionally not
  // offered — org escrow funds from the treasury or a connected wallet.
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

  // Default the funding source to the org's canonical treasury wallet when one
  // exists (the contract-auth identity), unless the organizer explicitly picks
  // another. This keeps org events fundable + operable by any privileged member
  // instead of being bound to a member's personal/burner wallet.
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

  // Funding mode + owner are derived from the EXPLICIT selection id: the
  // connected-wallet option always has id 'external'; anything else is a treasury
  // walletId. We deliberately do NOT key off a resolved source with a list
  // fallback — if the wallets query is momentarily empty, that fallback could
  // flip a treasury selection to the connected wallet and silently fund from it.
  // Keying off the id guarantees a treasury selection always funds from a
  // treasury (and only an explicit 'external' selection funds externally).
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
  // The connected external wallet is the owner ONLY when external is selected.
  const externalOwnerAddress = isExternalSource ? externalAddress : null;
  // The actual on-chain funder, for the pre-flight balance check.
  const funderAddress = isExternalSource
    ? externalAddress
    : (selectedTreasury?.address ?? null);

  // Pre-flight USDC check: read the funder's on-chain USDC balance by address and
  // block publish up front when it can't cover the prize pool + fee, instead of
  // letting the escrow transfer revert on-chain. Covers managed/connected
  // treasuries and connected external wallets alike (incl. a wallet not
  // registered to this org).
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

  const { isPublishing, publish, escrowPhase, escrowError, escrowTxHash } =
    useHackathonPublish({
      organizationId: derivedOrgId || '',
      stepData,
      draftId: draftId || '',
      fundingMode,
      externalOwnerAddress,
      treasurySource,
    });

  const isFundingComplete = escrowPhase === 'completed';
  const isFundingFailed = escrowPhase === 'failed';

  // Mirror the live phase into a ref so a confirm handler can tell, right after
  // publish() resolves, whether the runner actually started (vs a pre-flight
  // bail that only toasted).
  const escrowPhaseRef = useRef(escrowPhase);
  useEffect(() => {
    escrowPhaseRef.current = escrowPhase;
  }, [escrowPhase]);

  // Publishing now spans an on-chain settle; surface the current step.
  const publishStatusLabel = !isPublishing
    ? undefined
    : escrowPhase === 'signing'
      ? 'Awaiting signature…'
      : escrowPhase === 'submitting'
        ? 'Submitting transaction…'
        : escrowPhase === 'polling'
          ? 'Setting up the prize pool…'
          : 'Publishing…';

  const {
    loadingStates,
    saveInformationStep,
    saveTimelineStep,
    saveParticipationStep,
    saveRewardsStep,
    saveResourcesStep,
    saveJudgingStep,
    saveCollaborationStep,
  } = useHackathonStepSave({
    organizationId: derivedOrgId,
    draftId,
    saveStep: async (stepKey, data) => {
      await saveStep(stepKey, data);
      setStepData(prev => ({ ...prev, [stepKey]: data }));
      return {};
    },
    updateStepCompletion,
  });

  const handleEditTab = (tabKey: string) => {
    const tabMap: Record<string, StepKey> = {
      information: 'information',
      timeline: 'timeline',
      participation: 'participation',
      tracks: 'tracks',
      rewards: 'rewards',
      'custom-questions': 'custom-questions',
      resources: 'resources',
      judging: 'judging',
      collaboration: 'collaboration',
    };
    const stepKey = tabMap[tabKey];
    if (stepKey) {
      navigateToStep(stepKey);
    }
  };

  // After publish, organizers belong on the hackathon's overview page (which
  // also resumes any in-flight escrow settle), NOT the review/publish step where
  // they could fire a second publish. replace() so Back doesn't return here.
  const goToHackathonOverview = useCallback(() => {
    if (derivedOrgId && draftId) {
      router.replace(`/organizations/${derivedOrgId}/hackathons/${draftId}`);
    }
  }, [derivedOrgId, draftId, router]);

  // A draft that has left DRAFT (publish requested -> escrow settling) or that we
  // just funded this session is already (being) published and must not be
  // re-published.
  const isAwaitingFunding = draftStatus === 'DRAFT_AWAITING_FUNDING';
  const alreadyPublishRequested = isAwaitingFunding || isFundingComplete;

  // Landing on / refreshing the review step for an already-publishing draft
  // bounces to the overview with a clear message. Fires once; suppressed during
  // an in-session publish (the cached status is still DRAFT then, and the
  // progress modal owns that redirect).
  const publishedRedirectRef = useRef(false);
  useEffect(() => {
    if (
      isAwaitingFunding &&
      !publishedRedirectRef.current &&
      !progressOpen &&
      escrowPhase === 'idle'
    ) {
      publishedRedirectRef.current = true;
      toast.info('This hackathon has already been published.');
      goToHackathonOverview();
    }
  }, [isAwaitingFunding, progressOpen, escrowPhase, goToHackathonOverview]);

  const handlePublish = async () => {
    if (alreadyPublishRequested) {
      toast.info('This hackathon has already been published.');
      goToHackathonOverview();
      return;
    }
    setConfirmOpen(true);
  };

  const runFunding = useCallback(async () => {
    try {
      await publish();
      updateStepCompletion('review', true);
    } catch {
      // Failure is reflected via escrowPhase; the progress modal offers retry.
    }
  }, [publish, updateStepCompletion]);

  const handleConfirmFunding = async () => {
    setConfirmOpen(false);
    setProgressOpen(true);
    await runFunding();
    // Pre-flight bailed before the runner started -> nothing to show here; the
    // bail already toasted the reason.
    if (escrowPhaseRef.current === 'idle') {
      setProgressOpen(false);
    }
  };

  const handleRetryFunding = () => {
    void runFunding();
  };

  const handleViewHackathon = () => {
    setProgressOpen(false);
    goToHackathonOverview();
  };

  // Funding step-up (email OTP). The backend decides whether it's required; when
  // disabled, requestOtp reports required:false and the modal funds directly.
  const requestOtp = useCallback(async () => {
    if (!derivedOrgId || !draftId) {
      return { required: false, alreadyVerified: false, sent: false };
    }
    const res = await requestHackathonFundingOtp(derivedOrgId, draftId);
    return {
      required: res.required,
      alreadyVerified: res.alreadyVerified,
      sent: res.sent,
    };
  }, [derivedOrgId, draftId]);

  const verifyOtp = useCallback(
    async (otpCode: string) => {
      if (!derivedOrgId || !draftId) return;
      try {
        await verifyHackathonFundingOtp(derivedOrgId, draftId, otpCode);
      } catch (err) {
        throw new Error(
          fundingOtpErrorMessage(err, 'That code is not right. Try again.')
        );
      }
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
        <div className='flex flex-col items-center gap-4'>
          <span className='text-sm text-red-400'>{currentError}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className='bg-background-main-bg mx-auto max-w-6xl flex-1 overflow-hidden px-6 py-8 text-white'
      id={organizationId}
    >
      {!draftId && !stepData.information && derivedOrgId && (
        <div className='border-primary/30 bg-primary/5 mb-6 flex flex-col items-start gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-start gap-3'>
            <Sparkles className='text-primary mt-0.5 h-5 w-5' />
            <div>
              <p className='text-sm font-medium text-white'>
                Start faster with AI
              </p>
              <p className='text-xs text-gray-400'>
                Describe your hackathon and we&apos;ll draft the tracks, prizes,
                judging, and timeline for you to review and edit.
              </p>
            </div>
          </div>
          <BoundlessButton
            type='button'
            variant='outline'
            size='sm'
            className='gap-2'
            onClick={() => setAiDialogOpen(true)}
          >
            <Sparkles className='h-4 w-4' />
            Generate with AI
          </BoundlessButton>
        </div>
      )}

      {/* Section nav lives in the unified HackathonSidebar (Setup group); the
          wizard just renders the active section, switched via the ?step= param. */}
      <Tabs value={activeTab} className='w-full'>
        <div className='px-6 py-6 md:px-20'>
          <TabsContent value='information' className='mt-0'>
            <InfoTab
              onContinue={() => navigateToStep('timeline')}
              onSave={saveInformationStep}
              initialData={stepData.information}
              isLoading={loadingStates.information}
            />
          </TabsContent>

          <TabsContent value='timeline' className='mt-0'>
            <TimelineTab
              onContinue={() => navigateToStep('participation')}
              onSave={saveTimelineStep}
              initialData={stepData.timeline}
              isLoading={loadingStates.timeline}
            />
          </TabsContent>

          <TabsContent value='participation' className='mt-0'>
            <ParticipantTab
              onContinue={() => navigateToStep('tracks')}
              onSave={saveParticipationStep}
              initialData={stepData.participation}
              isLoading={loadingStates.participation}
            />
          </TabsContent>

          <TabsContent value='tracks' className='mt-0'>
            <TracksTab
              organizationId={derivedOrgId}
              hackathonId={draftId ?? undefined}
              initialMaxPerSubmission={stepData.tracks?.tracksMaxPerSubmission}
              onGoToInformation={() => navigateToStep('information')}
              onContinue={() => navigateToStep('rewards')}
              onConfigSaved={maxPerSubmission =>
                setStepData(prev => ({
                  ...prev,
                  tracks: { tracksMaxPerSubmission: maxPerSubmission },
                }))
              }
            />
          </TabsContent>

          <TabsContent value='rewards' className='mt-0'>
            <RewardsTab
              onContinue={() => navigateToStep('custom-questions')}
              onSave={saveRewardsStep}
              initialData={stepData.rewards}
              isLoading={loadingStates.rewards}
              organizationId={derivedOrgId}
              hackathonId={draftId ?? undefined}
            />
          </TabsContent>

          <TabsContent value='custom-questions' className='mt-0'>
            <CustomQuestionsTab
              organizationId={derivedOrgId}
              hackathonId={draftId ?? undefined}
              onGoToInformation={() => navigateToStep('information')}
              onContinue={() => navigateToStep('resources')}
            />
          </TabsContent>

          <TabsContent value='resources' className='mt-0'>
            <ResourcesTab
              onContinue={() => navigateToStep('judging')}
              onSave={saveResourcesStep}
              initialData={stepData.resources}
              isLoading={loadingStates.resources}
            />
          </TabsContent>

          <TabsContent value='judging' className='mt-0'>
            <JudgingTab
              onContinue={() => navigateToStep('collaboration')}
              onSave={saveJudgingStep}
              initialData={stepData.judging}
              isLoading={loadingStates.judging}
            />
          </TabsContent>

          <TabsContent value='collaboration' className='mt-0'>
            <CollaborationTab
              onContinue={() => navigateToStep('review')}
              onSave={saveCollaborationStep}
              initialData={stepData.collaboration}
              isLoading={loadingStates.collaboration}
            />
          </TabsContent>

          <TabsContent value='review' className='mt-0'>
            {aiBrief && <AiBriefPanel brief={aiBrief} className='mb-4' />}
            {aiAssumptions.length > 0 && (
              <AiAssumptionsBanner
                assumptions={aiAssumptions}
                onReview={section => handleEditTab(section as StepKey)}
                className='mb-6'
              />
            )}
            <ReviewTab
              allData={stepData}
              onEdit={handleEditTab}
              onPublish={handlePublish}
              onSaveDraft={saveDraft}
              isLoading={isPublishing}
              publishStatusLabel={publishStatusLabel}
              isSavingDraft={isSavingDraft}
              organizationId={derivedOrgId}
              draftId={draftId}
            />
          </TabsContent>
        </div>
      </Tabs>

      <GenerateWithAiDialog
        organizationId={derivedOrgId ?? ''}
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
      />

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
            entityNoun='hackathon'
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
              // Closing the success modal lands organizers on the overview (not
              // back on the review step). On failure, stay to retry / save draft.
              if (isFundingComplete) goToHackathonOverview();
            }}
            onRetry={handleRetryFunding}
            onSwitchToDraft={() => setProgressOpen(false)}
            onView={handleViewHackathon}
            entityNoun='hackathon'
          />
        </>
      )}
    </div>
  );
}
