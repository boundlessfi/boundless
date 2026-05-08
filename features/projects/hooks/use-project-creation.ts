'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useCreateProjectDraft,
  useUpdateProjectDraft,
  usePublishProject,
  useDeleteProject,
  useMyProjects,
  useMyProject,
} from './use-project-queries';
import type {
  Project,
  ProjectDraftPayload,
  CampaignDraftPayload,
  DraftMilestone,
  DraftTeamMember,
  SocialLinksMap,
  ProjectContact,
} from '@/features/projects/types';
import crowdfundRegistry from '@/lib/stellar/clients/crowdfundRegistry';
import { getKit } from '@/lib/smartwallet/client';
import { useWalletStore } from '@/lib/stores/walletStore';
import { parseWalletError } from '@/lib/smartwallet/errors';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreationStep =
  | 'basic'
  | 'details'
  | 'team'
  | 'social'
  | 'funding'
  | 'review';

export type PublishPhase =
  | 'idle'
  | 'validating'
  | 'flushing'
  | 'deploying'
  | 'submitting'
  | 'done';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  deliverable: string;
  successCriteria: string;
  fundingPercentage: number;
  startDate: string;
  endDate: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  linkedin?: string;
  twitter?: string;
}

export interface ProjectDraft {
  projectName: string;
  title: string;
  tagline: string;
  category: string;
  description: string;
  vision: string;
  details: string;
  summary: string;
  logo: string | File | null;
  logoUrl: string;
  banner: string | File | null;
  bannerUrl: string;
  githubUrl: string;
  gitlabUrl: string;
  bitbucketUrl: string;
  websiteUrl: string;
  projectWebsite: string;
  demoVideoUrl: string;
  demoVideo: string;
  creatorId: string;
  organizationId?: string;
  thumbnail?: string;
  whitepaperUrl?: string;
  pitchVideoUrl?: string;
  contact: {
    email: string;
    telegram?: string;
    discord?: string;
    primary?: string;
    backup?: string;
  };
  tags: string[];
  isCampaign: boolean;
  fundingAmount: number;
  milestones: Milestone[];
  team: TeamMember[];
  socialLinks: string[];
  escrowId?: string;
  transactionHash?: string;
  updatedAt: number;
  id?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STROOPS_PER_XLM = 10_000_000;
const CAMPAIGN_DEADLINE_DAYS = 90;
const MIN_PLEDGE_STROOPS = BigInt(10_000_000);
const AUTOSAVE_DEBOUNCE_MS = 5_000;
const TX_POLL_ATTEMPTS = 12;
const TX_POLL_INTERVAL_MS = 2_000;

const USDC_MAINNET = 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75';
const USDC_TESTNET = 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA';
const DEFAULT_RPC_URL = 'https://soroban-testnet.stellar.org';

const INITIAL_FORM_DATA: Partial<ProjectDraft> = {
  projectName: '',
  title: '',
  tagline: '',
  category: '',
  description: '',
  vision: '',
  details: '',
  summary: '',
  logo: '',
  logoUrl: '',
  banner: '',
  bannerUrl: '',
  githubUrl: '',
  gitlabUrl: '',
  bitbucketUrl: '',
  websiteUrl: '',
  demoVideoUrl: '',
  projectWebsite: '',
  contact: { email: '', telegram: '', discord: '', primary: '', backup: '' },
  tags: [],
  fundingAmount: 0,
  milestones: [],
  team: [],
  socialLinks: ['', '', ''],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectPlatformFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace('www.', '');
    const platforms: Record<string, string> = {
      'x.com': 'twitter',
      'twitter.com': 'twitter',
      'discord.gg': 'discord',
      'discord.com': 'discord',
      'telegram.me': 'telegram',
      't.me': 'telegram',
      'linkedin.com': 'linkedin',
      'facebook.com': 'facebook',
      'instagram.com': 'instagram',
      'youtube.com': 'youtube',
      'youtu.be': 'youtube',
      'reddit.com': 'reddit',
      'medium.com': 'medium',
      'tiktok.com': 'tiktok',
    };
    return platforms[hostname] || hostname.split('.')[0];
  } catch {
    return 'link';
  }
}

function buildSocialLinksMap(urls: string[] | undefined): SocialLinksMap {
  const map: SocialLinksMap = {};
  if (!Array.isArray(urls)) return map;
  for (const url of urls) {
    if (!url?.trim()) continue;
    map[detectPlatformFromUrl(url)] = url;
  }
  return map;
}

function buildContactPayload(
  contact: ProjectDraft['contact'] | undefined
): ProjectContact | undefined {
  const telegram = contact?.telegram || contact?.primary;
  const backup = contact?.discord || contact?.backup;
  if (!telegram && !backup) return undefined;
  return {
    primary: telegram || '',
    backup: backup || '',
  };
}

function buildCampaignPayload(
  data: Partial<ProjectDraft>,
  socialLinksMap: SocialLinksMap
): CampaignDraftPayload & { email?: string } {
  const team = Array.isArray(data.team) ? data.team : [];
  const milestones = Array.isArray(data.milestones) ? data.milestones : [];
  const fundingAmount = data.fundingAmount || 0;
  const milestoneCount = milestones.length || 1;

  return {
    title: data.title || data.projectName || '',
    logo: data.logoUrl,
    banner: data.bannerUrl,
    vision: data.vision,
    category: data.category || '',
    details: data.details,
    fundingAmount,
    githubUrl: data.githubUrl,
    gitlabUrl: data.gitlabUrl,
    bitbucketUrl: data.bitbucketUrl,
    projectWebsite: data.websiteUrl,
    demoVideo: data.demoVideoUrl,
    milestones: milestones.map<DraftMilestone>((m, idx) => ({
      title: m.title,
      description: m.description,
      deliverable: m.deliverable || m.title,
      fundingPercentage:
        m.fundingPercentage || Math.floor(100 / milestoneCount),
      amount: fundingAmount / milestoneCount,
      expectedDeliveryDate: m.endDate || new Date().toISOString(),
      successCriteria: m.successCriteria || m.description,
      orderIndex: idx,
    })),
    team: team.map<DraftTeamMember>(t => ({
      name: t.name,
      role: t.role,
      email: t.email,
      linkedin: t.linkedin,
      twitter: t.twitter,
    })),
    contact: {
      primary: data.contact?.telegram || data.contact?.primary || '',
      backup: data.contact?.discord || data.contact?.backup || '',
    },
    email: data.contact?.email || '',
    socialLinks: Object.entries(socialLinksMap).map(([platform, url]) => ({
      platform,
      url,
    })),
  };
}

function buildDraftPayload(
  data: Partial<ProjectDraft>,
  isCampaign: boolean
): ProjectDraftPayload {
  const socialLinksMap = buildSocialLinksMap(data.socialLinks);
  const hasSocials = Object.keys(socialLinksMap).length > 0;

  const payload: ProjectDraftPayload = {
    title: data.title || data.projectName || undefined,
    tagline: data.tagline || undefined,
    category: data.category || undefined,
    description: data.description || undefined,
    summary: data.summary || undefined,
    vision: data.vision || undefined,
    details: data.details || undefined,
    banner: data.bannerUrl || undefined,
    logo: data.logoUrl || undefined,
    githubUrl: data.githubUrl || undefined,
    gitlabUrl: data.gitlabUrl || undefined,
    bitbucketUrl: data.bitbucketUrl || undefined,
    projectWebsite: data.websiteUrl || data.projectWebsite || undefined,
    demoVideo: data.demoVideoUrl || data.demoVideo || undefined,
    whitepaperUrl: data.whitepaperUrl || undefined,
    pitchVideoUrl: data.pitchVideoUrl || undefined,
    socialLinks: hasSocials ? socialLinksMap : undefined,
    contact: buildContactPayload(data.contact),
    tags: data.tags?.length ? data.tags : undefined,
    draftData: isCampaign
      ? {
          isCampaign: true,
          campaign: buildCampaignPayload(data, socialLinksMap),
        }
      : { isCampaign: false },
  };

  // Strip undefined so PATCH doesn't null-out existing fields.
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined)
  ) as ProjectDraftPayload;
}

function validatePublishFields(
  fd: Partial<ProjectDraft>,
  isCampaign: boolean
): string[] {
  const missing: string[] = [];

  if (!fd.title && !fd.projectName) missing.push('Project Name');
  if (!fd.description || fd.description.trim().length < 10) {
    missing.push('Description (min 10 characters)');
  }
  if (!fd.category) missing.push('Category');
  if (!fd.contact?.telegram && !fd.contact?.primary) {
    missing.push('Telegram (contact)');
  }
  if (!fd.contact?.email) missing.push('Email (contact)');

  if (isCampaign) {
    if (!fd.fundingAmount || fd.fundingAmount <= 0) {
      missing.push('Funding Amount');
    }
    if (!fd.milestones?.length) {
      missing.push('At least one milestone');
    } else {
      const totalPct = fd.milestones.reduce(
        (sum, m) => sum + Number(m.fundingPercentage || 0),
        0
      );
      if (totalPct !== 100) {
        missing.push(
          `Milestone percentages must sum to 100% (currently ${totalPct}%)`
        );
      }
    }
  }

  return missing;
}

function rid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
}

function hydrateFromLoadedProject(loaded: Project): Partial<ProjectDraft> {
  const draft = loaded.draftData?.campaign as
    | (CampaignDraftPayload & { email?: string })
    | undefined;

  const socialValues = loaded.socialLinks
    ? Object.values(loaded.socialLinks)
    : [];

  return {
    id: loaded.id,
    title: loaded.title,
    projectName: loaded.title,
    tagline: loaded.tagline ?? '',
    category: loaded.category,
    description: loaded.description,
    summary: loaded.summary ?? '',
    vision: loaded.vision ?? '',
    details: loaded.details ?? '',
    logoUrl: loaded.logo ?? '',
    bannerUrl: loaded.banner ?? '',
    githubUrl: loaded.githubUrl ?? '',
    websiteUrl: loaded.projectWebsite ?? '',
    demoVideoUrl: loaded.demoVideo ?? '',
    socialLinks: [
      socialValues[0] ?? '',
      socialValues[1] ?? '',
      socialValues[2] ?? '',
    ],
    contact: {
      email: draft?.email ?? '',
      telegram: loaded.contact?.primary ?? '',
      discord: loaded.contact?.backup ?? '',
      primary: loaded.contact?.primary ?? '',
      backup: loaded.contact?.backup ?? '',
    },
    isCampaign: loaded.draftData?.isCampaign ?? false,
    fundingAmount: draft?.fundingAmount ?? 0,
    milestones: (draft?.milestones ?? []).map<Milestone>(m => ({
      id: rid('m'),
      title: m.title || '',
      description: m.description || '',
      deliverable: m.deliverable || m.title || '',
      successCriteria: m.successCriteria || m.description || '',
      fundingPercentage: m.fundingPercentage || 0,
      startDate: '',
      endDate: m.expectedDeliveryDate || '',
    })),
    team: (draft?.team ?? []).map<TeamMember>(t => ({
      id: rid('tm'),
      name: t.name || '',
      email: t.email || '',
      role: t.role || 'MEMBER',
      linkedin: t.linkedin || '',
      twitter: t.twitter || '',
    })),
  };
}

/**
 * Poll Stellar RPC until a tx is SUCCESS, FAILED, or we time out.
 * Returns the terminal status — callers decide what to do with each outcome.
 */
async function waitForStellarTx(
  hash: string
): Promise<'SUCCESS' | 'FAILED' | 'TIMEOUT'> {
  const rpcUrl = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || DEFAULT_RPC_URL;

  for (let attempt = 0; attempt < TX_POLL_ATTEMPTS; attempt++) {
    const resp = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: { hash },
      }),
    });
    const json = await resp.json();
    const status = json?.result?.status as string | undefined;
    if (status === 'SUCCESS' || status === 'FAILED') return status;
    await new Promise(r => setTimeout(r, TX_POLL_INTERVAL_MS));
  }

  return 'TIMEOUT';
}

async function ensureWalletConnected(): Promise<void> {
  const store = useWalletStore.getState();
  const kit = getKit();
  if (kit.isConnected && store.isConnected) return;

  await store.connect();

  const after = useWalletStore.getState();
  if (after.isConnected) return;

  throw new Error(
    after.error ||
      'Wallet connection was cancelled. Please connect your wallet and try again.'
  );
}

type MutationLikeError = {
  message?: unknown;
  errors?: Array<{ message?: unknown }>;
};

function formatMutationError(error: unknown): string | null {
  if (!error) return null;
  const e = error as MutationLikeError;

  if (Array.isArray(e.errors) && e.errors.length > 0) {
    return e.errors
      .map(x => (typeof x?.message === 'string' ? x.message : ''))
      .filter(Boolean)
      .join('\n');
  }

  if (Array.isArray(e.message)) return e.message.join('\n');
  if (typeof e.message === 'string') return e.message;
  return 'An unexpected error occurred';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useProjectCreation = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get('mode') === 'campaign';
  const editingId = searchParams.get('id');
  const address = useWalletStore(s => s.contractId);

  const [currentStep, setCurrentStep] = useState<CreationStep>('basic');
  const [isCampaign, setIsCampaignState] = useState(initialMode);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isPublishInProgress, setIsPublishInProgress] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(editingId);
  const [formData, setFormData] = useState<Partial<ProjectDraft>>({
    ...INITIAL_FORM_DATA,
    isCampaign: initialMode,
  });
  const [publishValidationError, setPublishValidationError] = useState<
    string | null
  >(null);
  const [publishPhase, setPublishPhase] = useState<PublishPhase>('idle');

  const hasLoadedInitial = useRef<string | null>(null);

  // Reset when the route's editing id changes (incl. navigating away from a draft).
  useEffect(() => {
    setDraftId(editingId);
    if (!editingId) {
      setFormData({ ...INITIAL_FORM_DATA, isCampaign: initialMode });
      setIsCampaignState(initialMode);
      hasLoadedInitial.current = null;
    }
  }, [editingId, initialMode]);

  const { data: myDrafts } = useMyProjects({ status: 'IDEA' });
  const { data: loadedProject, isLoading: isLoadingDraft } = useMyProject(
    editingId ?? '',
    !!editingId
  );

  // Hydrate form once per loaded project id.
  useEffect(() => {
    if (!loadedProject) return;
    if (hasLoadedInitial.current === loadedProject.id) return;

    setFormData(prev => ({
      ...prev,
      ...hydrateFromLoadedProject(loadedProject),
    }));
    setIsCampaignState(loadedProject.draftData?.isCampaign ?? false);
    hasLoadedInitial.current = loadedProject.id;
  }, [loadedProject]);

  const createDraftMutation = useCreateProjectDraft();
  const updateDraftMutation = useUpdateProjectDraft(draftId ?? '');
  const publishMutation = usePublishProject(draftId ?? '');
  const deleteMutation = useDeleteProject();

  const isPersisting =
    createDraftMutation.isPending || updateDraftMutation.isPending;
  const persistError =
    formatMutationError(createDraftMutation.error) ||
    formatMutationError(updateDraftMutation.error);
  const publishError = formatMutationError(publishMutation.error);

  // Autosave: run 5s after the last formData change.
  const autosaveRef = useRef({ formData, isCampaign, draftId });
  autosaveRef.current = { formData, isCampaign, draftId };

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { formData: fd, isCampaign: ic, draftId: id } = autosaveRef.current;
      const title = (fd.title || fd.projectName || '').trim();
      if (title.length < 3) return;

      const payload = buildDraftPayload(fd, ic);
      try {
        if (id) {
          await updateDraftMutation.mutateAsync(payload);
        } else {
          const created = await createDraftMutation.mutateAsync(payload);
          setDraftId(created.id);
          router.replace(
            `/projects/create?id=${created.id}${ic ? '&mode=campaign' : ''}`,
            { scroll: false }
          );
        }
        setLastSaved(Date.now());
      } catch {
        // Surfaces via persistError.
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // ─── Step Navigation ───────────────────────────────────────────────────────

  const steps: { key: CreationStep; label: string; hidden?: boolean }[] = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'details', label: 'Project Details' },
    { key: 'team', label: 'Team Info' },
    { key: 'social', label: 'Contact Info' },
    { key: 'funding', label: 'Funding & Milestones', hidden: !isCampaign },
    { key: 'review', label: 'Review & Submit' },
  ];
  const activeSteps = steps.filter(s => !s.hidden);

  const updateFormData = useCallback((updates: Partial<ProjectDraft>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const setIsCampaign = (val: boolean) => {
    setIsCampaignState(val);
    updateFormData({ isCampaign: val });
  };

  const goToStep = (step: CreationStep) => setCurrentStep(step);
  const nextStep = () => {
    const idx = activeSteps.findIndex(s => s.key === currentStep);
    if (idx < activeSteps.length - 1) setCurrentStep(activeSteps[idx + 1].key);
  };
  const prevStep = () => {
    const idx = activeSteps.findIndex(s => s.key === currentStep);
    if (idx > 0) setCurrentStep(activeSteps[idx - 1].key);
  };

  // ─── Publish (campaign path deploys on-chain first) ─────────────────────────

  const deployCampaignOnChain = useCallback(
    async (
      fd: Partial<ProjectDraft>,
      owner: string
    ): Promise<{ onChainId: string; transactionHash: string }> => {
      await ensureWalletConnected();
      const kit = getKit();

      const fundingAmount = fd.fundingAmount || 0;
      const milestonePcts = (fd.milestones || []).map(m =>
        Math.floor((m.fundingPercentage || 0) * 100)
      );

      const tx = await crowdfundRegistry.create_campaign({
        owner,
        funding_goal: BigInt(Math.floor(fundingAmount * STROOPS_PER_XLM)),
        asset:
          process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet'
            ? USDC_MAINNET
            : USDC_TESTNET,
        deadline: BigInt(
          Math.floor(Date.now() / 1000) + CAMPAIGN_DEADLINE_DAYS * 24 * 60 * 60
        ),
        milestone_pcts: milestonePcts,
        min_pledge: MIN_PLEDGE_STROOPS,
      });

      const sim = tx.result;
      if (!sim) {
        throw new Error(
          'Contract simulation returned no campaign ID. Please try again.'
        );
      }
      if (sim.isErr()) {
        throw new Error(
          `Contract simulation error: ${sim.unwrapErr()?.message ?? 'unknown'}`
        );
      }
      const onChainId = sim.unwrap().toString();

      // Cast via unknown: bindings pkg ships a nested @stellar/stellar-sdk, so TS sees two copies of AssembledTransaction.
      const submitted = await kit.signAndSubmit(
        tx as unknown as Parameters<typeof kit.signAndSubmit>[0]
      );
      if (!submitted.success) {
        throw new Error(
          `Contract transaction failed: ${submitted.error || 'Unknown error'}`
        );
      }

      const status = await waitForStellarTx(submitted.hash);
      if (status === 'FAILED') {
        throw new Error(
          'On-chain campaign creation transaction failed. Please try again.'
        );
      }
      if (status === 'TIMEOUT') {
        throw new Error(
          `On-chain transaction timed out. Verify transaction ${submitted.hash} and try again.`
        );
      }

      return { onChainId, transactionHash: submitted.hash };
    },
    []
  );

  const handlePublish = useCallback(async () => {
    if (!draftId) return;

    setPublishPhase('validating');
    const fd = autosaveRef.current.formData;
    const isCampaignToPublish = autosaveRef.current.isCampaign;

    const missing = validatePublishFields(fd, isCampaignToPublish);
    if (missing.length > 0) {
      setPublishPhase('idle');
      setPublishValidationError(
        `Missing required fields: ${missing.join(', ')}`
      );
      return;
    }
    setPublishValidationError(null);

    setIsPublishInProgress(true);
    try {
      setPublishPhase('flushing');
      await updateDraftMutation.mutateAsync(
        buildDraftPayload(fd, isCampaignToPublish)
      );

      let onChainId: string | undefined;
      let transactionHash: string | undefined;

      if (isCampaignToPublish) {
        if (!address) {
          throw new Error(
            'Wallet not connected. Please connect your wallet to publish a campaign.'
          );
        }
        setPublishPhase('deploying');
        ({ onChainId, transactionHash } = await deployCampaignOnChain(
          fd,
          address
        ));
      }

      setPublishPhase('submitting');
      await publishMutation.mutateAsync({
        projectId: draftId,
        isCampaign: isCampaignToPublish,
        onChainId,
        transactionHash,
      });

      setPublishPhase('done');
      router.replace(isCampaignToPublish ? '/me/crowdfunding' : '/me/projects');
    } catch (err) {
      console.error('Publishing failed:', err);
      setPublishPhase('idle');
      setPublishValidationError(
        parseWalletError(err) || 'An error occurred during publishing'
      );
    } finally {
      setIsPublishInProgress(false);
    }
  }, [
    draftId,
    address,
    publishMutation,
    updateDraftMutation,
    router,
    deployCampaignOnChain,
  ]);

  // ─── Drafts List / Delete ───────────────────────────────────────────────────

  const recentDrafts = (myDrafts ?? []).map((p: Project) => ({
    id: p.id,
    title: p.title,
    tagline: p.tagline ?? '',
    category: p.category,
    isCampaign: p.draftData?.isCampaign ?? false,
    updatedAt: new Date(p.updatedAt).getTime(),
  }));

  const onDeleteDraft = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        if (id === draftId) {
          setDraftId(null);
          setFormData({ ...INITIAL_FORM_DATA, isCampaign });
          setCurrentStep('basic');
          setLastSaved(null);
          router.replace('/projects/create', { scroll: false });
        }
      } catch {
        // Surfaces via deleteMutation.error.
      }
    },
    [draftId, isCampaign, deleteMutation, router]
  );

  return {
    currentStep,
    steps: activeSteps,
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
    isPublishing: isPublishInProgress || publishMutation.isPending,
    publishError,
    publishValidationError,
    publishPhase,
    handlePublish,
    isLoadingDraft,
    onDeleteDraft,
  };
};
