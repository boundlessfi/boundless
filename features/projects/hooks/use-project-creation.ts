'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useCreateProjectDraft,
  useUpdateProjectDraft,
  usePublishProject,
  useMyProjects,
  useMyProject,
} from './use-project-queries';
import { Project } from '@/features/projects/types';

export type CreationStep =
  | 'basic'
  | 'details'
  | 'team'
  | 'social'
  | 'funding'
  | 'review';

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
  // Common Fields
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

  // Campaign-specific
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps the local `ProjectDraft` shape to the API's `ProjectDraftPayload`.
 * Only non-empty values are included — safe for both create and autosave PATCH.
 */
function toApiPayload(
  data: Partial<ProjectDraft>,
  isCampaign: boolean
): Record<string, unknown> {
  const socialLinksMap: Record<string, string> = {};
  if (Array.isArray(data.socialLinks)) {
    data.socialLinks.forEach((url, i) => {
      if (url) socialLinksMap[`link${i + 1}`] = url;
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
      data.contact?.primary || data.contact?.backup
        ? {
            primary: data.contact.primary || data.contact.telegram || undefined,
            backup: data.contact.backup || data.contact.discord || undefined,
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
          primary: data.contact?.primary || data.contact?.telegram || '',
          backup: data.contact?.backup || data.contact?.discord || '',
        },
        socialLinks: Object.entries(socialLinksMap).map(([platform, url]) => ({
          platform,
          url,
        })),
      },
    };
  } else {
    payload.draftData = { isCampaign: false };
  }

  // Strip undefined keys so PATCH only sends changed fields
  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined)
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

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

  const [currentStep, setCurrentStep] = useState<CreationStep>('basic');
  const [isCampaign, setIsCampaignState] = useState(initialMode);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  /** ID assigned after the first successful draft creation. */
  const [draftId, setDraftId] = useState<string | null>(editingId);

  const [formData, setFormData] = useState<Partial<ProjectDraft>>({
    ...INITIAL_FORM_DATA,
    isCampaign: initialMode,
  });

  // Sync draftId with URL (handles "New Project" click)
  useEffect(() => {
    setDraftId(editingId);
    if (!editingId) {
      setFormData({ ...INITIAL_FORM_DATA, isCampaign: initialMode });
      setIsCampaignState(initialMode);
    }
  }, [editingId, initialMode]);

  // ── Real data fetching ──────────────────────────────────────────────────

  // Fetch recent drafts for the sidebar
  const { data: myDrafts } = useMyProjects({ status: 'IDEA' });
  console.log('myDrafts', myDrafts);

  // Load an existing draft if ID is in the URL
  const { data: loadedProject, isLoading: isLoadingDraft } = useMyProject(
    editingId ?? '',
    !!editingId
  );

  // Sync loaded project into formData
  useEffect(() => {
    if (loadedProject) {
      const draft = loadedProject.draftData?.campaign;

      // Extract social links from top-level object
      const socialValues = loadedProject.socialLinks
        ? Object.values(loadedProject.socialLinks)
        : [];
      const socialLinks = [...socialValues, '', '', ''].slice(0, 3);

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
          email: loadedProject.contact?.primary ?? '',
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
    }
  }, [loadedProject]);

  // ── React Query mutations ──────────────────────────────────────────────────

  const createDraftMutation = useCreateProjectDraft();
  const updateDraftMutation = useUpdateProjectDraft(draftId ?? '');
  const publishMutation = usePublishProject(draftId ?? '');

  /** Helper to extract and format error messages from the API. */
  const formatError = useCallback((error: any): string | null => {
    if (!error) return null;

    // 1. If the API returned a structured 'errors' array (e.g. from a Validator), use those first.
    if (Array.isArray(error.errors) && error.errors.length > 0) {
      return error.errors.map((e: any) => e.message).join('\n');
    }

    // 2. Fallback to the 'message' field (which can be a string or array in NestJS/Express)
    const msg = error.message;
    if (Array.isArray(msg)) return msg.join('\n');
    if (typeof msg === 'string') return msg;

    return 'An unexpected error occurred';
  }, []);

  // Derived loading / error states exposed to the UI
  const isPersisting =
    createDraftMutation.isPending || updateDraftMutation.isPending;
  const persistError =
    formatError(createDraftMutation.error) ||
    formatError(updateDraftMutation.error);

  const isPublishing = publishMutation.isPending;
  const publishError = formatError(publishMutation.error);

  // ── Autosave logic ─────────────────────────────────────────────────────────

  // Keep the latest formData + isCampaign in a ref so the timer callback
  // can capture them without becoming a new function on every render.
  const autosaveRef = useRef({ formData, isCampaign, draftId });
  autosaveRef.current = { formData, isCampaign, draftId };

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { formData: fd, isCampaign: ic, draftId: id } = autosaveRef.current;
      const payload = toApiPayload(fd, ic);

      try {
        if (id) {
          // Already have a draft — patch it
          await updateDraftMutation.mutateAsync(payload);
        } else {
          // First save — create the draft and store the returned ID
          const created = await createDraftMutation.mutateAsync(payload);
          setDraftId(created.id);
        }
        setLastSaved(Date.now());
      } catch {
        // Errors surface through persistError
      }
    }, 2000); // 2-second debounce

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // ── Steps ──────────────────────────────────────────────────────────────────

  const steps: { key: CreationStep; label: string; hidden?: boolean }[] = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'details', label: 'Project Details' },
    { key: 'team', label: 'Team Info' },
    { key: 'social', label: 'Contact Info' },
    { key: 'funding', label: 'Funding & Milestones', hidden: !isCampaign },
    { key: 'review', label: 'Review & Submit' },
  ];

  const activeSteps = steps.filter(s => !s.hidden);

  // ── Form helpers ───────────────────────────────────────────────────────────

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

  // ── Publish ────────────────────────────────────────────────────────────────

  const handlePublish = useCallback(async () => {
    if (!draftId) return;
    try {
      // Flush latest data before publishing
      const payload = toApiPayload(
        autosaveRef.current.formData,
        autosaveRef.current.isCampaign
      );
      await updateDraftMutation.mutateAsync(payload);
      await publishMutation.mutateAsync({ isCampaign });
      // On success, redirect to the project page or me dashboard
      router.push('/me/projects');
    } catch {
      // Surfaces through publishError
    }
  }, [draftId, isCampaign, publishMutation, updateDraftMutation, router]);

  const recentDrafts = (myDrafts ?? []).map((p: Project) => ({
    id: p.id,
    title: p.title,
    tagline: p.tagline ?? '',
    category: p.category,
    isCampaign: p.draftData?.isCampaign ?? false,
    updatedAt: new Date(p.updatedAt).getTime(),
  }));

  const onDeleteDraft = (id: string) => {
    // We haven't built a delete mutation yet, but we can add one or invalidate.
    // Since we're lists drafts, ideally we have a DELETE hook.
    // For now, let's assume Sidebar handles it or we'll add it to queries later.
    console.log('Delete draft', id);
  };

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
    // API state
    draftId,
    isPersisting,
    persistError,
    isPublishing,
    publishError,
    handlePublish,
    isLoadingDraft,
    onDeleteDraft,
  };
};
