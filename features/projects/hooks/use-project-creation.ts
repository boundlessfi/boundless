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
import { Project } from '@/features/projects/types';
import crowdfundRegistry from '@/lib/stellar/clients/crowdfundRegistry';
import {
  getConnectedKit,
  getSmartAccountKit,
  connectSmartWallet,
} from '@/lib/smart-wallet/client';
import { useWalletInfo } from '@/hooks/use-wallet';

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

export interface SocialLink {
  platform: string;
  url: string;
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

function toApiPayload(
  data: Partial<ProjectDraft>,
  isCampaign: boolean
): Record<string, unknown> {
  const socialLinksMap: Record<string, string> = {};
  if (Array.isArray(data.socialLinks)) {
    data.socialLinks.forEach(url => {
      if (!url?.trim()) return;
      const key = detectPlatformFromUrl(url);
      socialLinksMap[key] = url;
    });
  }

  const payload: Record<string, unknown> = {
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
    socialLinks: Object.keys(socialLinksMap).length
      ? socialLinksMap
      : undefined,
    contact:
      data.contact?.telegram ||
      data.contact?.primary ||
      data.contact?.discord ||
      data.contact?.backup
        ? {
            primary: data.contact.telegram || data.contact.primary || undefined,
            backup: data.contact.discord || data.contact.backup || undefined,
          }
        : undefined,
    tags: Array.isArray(data.tags) && data.tags.length ? data.tags : undefined,
  };

  if (isCampaign) {
    const team = (Array.isArray(data.team) ? data.team : []) as TeamMember[];
    const milestones = Array.isArray(data.milestones) ? data.milestones : [];

    payload.draftData = {
      isCampaign: true,
      campaign: {
        title: data.title || data.projectName,
        logo: data.logoUrl,
        banner: data.bannerUrl,
        vision: data.vision,
        category: data.category,
        details: data.details,
        fundingAmount: data.fundingAmount || 0,
        githubUrl: data.githubUrl,
        gitlabUrl: data.gitlabUrl,
        bitbucketUrl: data.bitbucketUrl,
        projectWebsite: data.websiteUrl,
        demoVideo: data.demoVideoUrl,
        milestones: milestones.map((m, idx) => ({
          title: m.title,
          description: m.description,
          deliverable: m.deliverable || m.title,
          fundingPercentage:
            m.fundingPercentage || Math.floor(100 / (milestones.length || 1)),
          amount: (data.fundingAmount || 0) / (milestones.length || 1),
          expectedDeliveryDate: m.endDate || new Date().toISOString(),
          successCriteria: m.successCriteria || m.description,
          orderIndex: idx,
        })),
        team: team.map(t => ({
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
      },
    };
  } else {
    payload.draftData = { isCampaign: false };
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined)
  );
}

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

export const useProjectCreation = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get('mode') === 'campaign';
  const editingId = searchParams.get('id');
  const { address } = useWalletInfo();

  const [currentStep, setCurrentStep] = useState<CreationStep>('basic');
  const [isCampaign, setIsCampaignState] = useState(initialMode);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isPublishInProgress, setIsPublishInProgress] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(editingId);
  const [formData, setFormData] = useState<Partial<ProjectDraft>>({
    ...INITIAL_FORM_DATA,
    isCampaign: initialMode,
  });

  const hasLoadedInitial = useRef<string | null>(null);

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

  useEffect(() => {
    if (loadedProject && hasLoadedInitial.current !== loadedProject.id) {
      const draft = loadedProject.draftData?.campaign;
      const socialValues = loadedProject.socialLinks
        ? Object.values(loadedProject.socialLinks)
        : [];
      const socialLinks = [
        socialValues[0] ?? '',
        socialValues[1] ?? '',
        socialValues[2] ?? '',
      ];

      setFormData(prev => ({
        ...prev,
        id: loadedProject.id,
        title: loadedProject.title,
        projectName: loadedProject.title,
        tagline: loadedProject.tagline ?? '',
        category: loadedProject.category,
        description: loadedProject.description,
        summary: loadedProject.summary ?? '',
        vision: loadedProject.vision ?? '',
        details: loadedProject.details ?? '',
        logoUrl: loadedProject.logo ?? '',
        bannerUrl: loadedProject.banner ?? '',
        githubUrl: loadedProject.githubUrl ?? '',
        websiteUrl: loadedProject.projectWebsite ?? '',
        demoVideoUrl: loadedProject.demoVideo ?? '',
        socialLinks,
        contact: {
          email: (draft as any)?.email || '',
          telegram: loadedProject.contact?.primary ?? '',
          discord: loadedProject.contact?.backup ?? '',
          primary: loadedProject.contact?.primary ?? '',
          backup: loadedProject.contact?.backup ?? '',
        },
        isCampaign: loadedProject.draftData?.isCampaign ?? false,
        fundingAmount: draft?.fundingAmount ?? 0,
        milestones: (draft?.milestones ?? []).map((m: any) => ({
          id: m.id || `m-${Math.random().toString(36).substring(2, 11)}`,
          title: m.title || '',
          description: m.description || '',
          deliverable: m.deliverable || m.title || '',
          successCriteria: m.successCriteria || m.description || '',
          fundingPercentage: m.fundingPercentage || 0,
          startDate: m.startDate || '',
          endDate: m.expectedDeliveryDate || m.endDate || '',
        })),
        team: (draft?.team ?? []).map((t: any) => ({
          id: t.id || `tm-${Math.random().toString(36).substring(2, 11)}`,
          name: t.name || '',
          email: t.email || '',
          role: t.role || 'MEMBER',
          linkedin: t.linkedin || '',
          twitter: t.twitter || '',
        })),
      }));
      setIsCampaignState(loadedProject.draftData?.isCampaign ?? false);
      hasLoadedInitial.current = loadedProject.id;
    }
  }, [loadedProject]);

  const createDraftMutation = useCreateProjectDraft();
  const updateDraftMutation = useUpdateProjectDraft(draftId ?? '');
  const publishMutation = usePublishProject(draftId ?? '');
  const deleteMutation = useDeleteProject();

  const formatError = useCallback((error: any): string | null => {
    if (!error) return null;
    if (Array.isArray(error.errors) && error.errors.length > 0) {
      return error.errors.map((e: any) => e.message).join('\n');
    }
    const msg = error.message;
    if (Array.isArray(msg)) return msg.join('\n');
    if (typeof msg === 'string') return msg;
    return 'An unexpected error occurred';
  }, []);

  const isPersisting =
    createDraftMutation.isPending || updateDraftMutation.isPending;
  const persistError =
    formatError(createDraftMutation.error) ||
    formatError(updateDraftMutation.error);
  const isPublishing = publishMutation.isPending;
  const publishError = formatError(publishMutation.error);

  const autosaveRef = useRef({ formData, isCampaign, draftId });
  autosaveRef.current = { formData, isCampaign, draftId };

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { formData: fd, isCampaign: ic, draftId: id } = autosaveRef.current;
      const title = (fd.title || fd.projectName || '').trim();
      if (title.length < 3) return;

      const payload = toApiPayload(fd, ic);
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
        // surfaces through persistError
      }
    }, 5000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

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
    const currentIndex = activeSteps.findIndex(s => s.key === currentStep);
    if (currentIndex < activeSteps.length - 1) {
      setCurrentStep(activeSteps[currentIndex + 1].key);
    }
  };

  const prevStep = () => {
    const currentIndex = activeSteps.findIndex(s => s.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(activeSteps[currentIndex - 1].key);
    }
  };

  const [publishValidationError, setPublishValidationError] = useState<
    string | null
  >(null);
  const [publishPhase, setPublishPhase] = useState<PublishPhase>('idle');

  const handlePublish = useCallback(async () => {
    if (!draftId) return;

    setPublishPhase('validating');
    const fd = autosaveRef.current.formData;
    const missing: string[] = [];

    if (!fd.title && !fd.projectName) missing.push('Project Name');
    if (!fd.description || fd.description.trim().length < 10)
      missing.push('Description (min 10 characters)');
    if (!fd.category) missing.push('Category');
    if (!fd.contact?.telegram && !fd.contact?.primary)
      missing.push('Telegram (contact)');
    if (!fd.contact?.email) missing.push('Email (contact)');

    if (autosaveRef.current.isCampaign) {
      if (!fd.fundingAmount || fd.fundingAmount <= 0)
        missing.push('Funding Amount');
      if (!fd.milestones || fd.milestones.length === 0) {
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
      const isCampaignToPublish = autosaveRef.current.isCampaign;
      await updateDraftMutation.mutateAsync(
        toApiPayload(fd, isCampaignToPublish)
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

        const rawKit = await getSmartAccountKit();
        if (!rawKit.isConnected) {
          const connected = await connectSmartWallet();
          if (!connected) {
            throw new Error(
              'Wallet connection was cancelled. Please connect your wallet and try again.'
            );
          }
        }
        const kit = await getConnectedKit();

        const funding_goal = BigInt(
          Math.floor((fd.fundingAmount || 0) * 10_000_000)
        );
        const asset =
          process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet'
            ? 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75'
            : 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA';
        const deadline = BigInt(
          Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60
        );
        const min_pledge = BigInt(10_000_000);
        const milestones = fd.milestones || [];
        const milestone_descs = milestones.map(
          m =>
            [
              m.title || m.description || 'Milestone',
              Math.floor((m.fundingPercentage || 0) * 100),
            ] as [string, number]
        );

        const tx = await crowdfundRegistry.create_campaign({
          owner: address,
          metadata_cid: draftId,
          funding_goal,
          asset,
          deadline,
          milestone_descs,
          min_pledge,
          submit: true,
        });

        const simResult = tx.result as
          | {
              isOk(): boolean;
              isErr(): boolean;
              unwrap(): bigint;
              unwrapErr(): { message: string };
            }
          | bigint
          | null
          | undefined;

        if (simResult === null || simResult === undefined) {
          throw new Error(
            'Contract simulation returned no campaign ID. Please try again.'
          );
        }

        if (typeof simResult === 'bigint') {
          onChainId = simResult.toString();
        } else if (typeof simResult === 'object') {
          if (simResult.isErr()) {
            throw new Error(
              `Contract simulation error: ${simResult.unwrapErr()?.message ?? 'unknown'}`
            );
          }
          if (simResult.isOk()) {
            const val = simResult.unwrap();
            if (val !== undefined && val !== null) onChainId = val.toString();
          }
        }

        if (!onChainId) {
          throw new Error(
            'Contract simulation returned no campaign ID. Please try again.'
          );
        }

        const result = await kit.signAndSubmit(tx);
        transactionHash = result.hash;

        if (!result.success) {
          throw new Error(
            `Contract transaction failed: ${result.error || 'Unknown error'}`
          );
        }

        if (result.hash) {
          const rpcUrl =
            process.env.NEXT_PUBLIC_STELLAR_RPC_URL ||
            'https://soroban-testnet.stellar.org';

          let status: string | undefined;
          for (let attempt = 0; attempt < 12; attempt++) {
            const resp = await fetch(rpcUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTransaction',
                params: { hash: result.hash },
              }),
            });
            const json = await resp.json();
            status = json?.result?.status as string | undefined;
            if (status === 'SUCCESS' || status === 'FAILED') break;
            await new Promise(r => setTimeout(r, 2000));
          }

          if (status === 'FAILED') {
            throw new Error(
              'On-chain campaign creation transaction failed. Please try again.'
            );
          }
          if (status !== 'SUCCESS') {
            throw new Error(
              `On-chain transaction timed out. Verify transaction ${result.hash} and try again.`
            );
          }
        }
      }

      setPublishPhase('submitting');
      await publishMutation.mutateAsync({
        projectId: draftId,
        isCampaign: isCampaignToPublish,
        onChainId,
        transactionHash,
      });

      setPublishPhase('done');
      setIsPublishInProgress(false);
      router.replace(isCampaignToPublish ? '/me/crowdfunding' : '/me/projects');
    } catch (err: any) {
      console.error('Publishing failed:', err);
      setIsPublishInProgress(false);
      setPublishPhase('idle');
      setPublishValidationError(
        err.message || 'An error occurred during publishing'
      );
    }
  }, [draftId, address, publishMutation, updateDraftMutation, router]);

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
        // surfaces via deleteMutation.error
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
