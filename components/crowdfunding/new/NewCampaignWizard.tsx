'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { fetchCampaignById, reviseAndResubmit } from '@/features/crowdfunding';
import type { CrowdfundingCampaign } from '@/features/crowdfunding';
import { WIZARD_STEPS, TOTAL_STEPS } from './constants';
import NewCampaignSidebar from './NewCampaignSidebar';
import WizardHelpButton from './WizardHelpButton';
import { equalSplit } from './fee';
import BasicsStep from './steps/BasicsStep';
import StoryStep from './steps/StoryStep';
import FundingStep from './steps/FundingStep';
import MilestonesStep from './steps/MilestonesStep';
import TeamStep from './steps/TeamStep';
import LinksStep from './steps/LinksStep';
import ReviewStep from './steps/ReviewStep';
import {
  createCampaignDraft,
  updateCrowdfundingProject,
  submitCampaignForReview,
} from '@/features/projects/api';
import { extractApiErrorMessage } from '@/lib/api/api';

export interface WizardMilestone {
  title: string;
  description: string;
  deliverable: string;
  expectedDeliveryDate: string;
  successCriteria?: string;
}

export interface WizardTeamMember {
  name: string;
  role: string;
  email?: string;
}

export interface CampaignWizardData {
  title: string;
  tagline: string;
  category: string;
  logoUrl: string;
  bannerUrl: string;
  vision: string;
  fundingGoal: number;
  milestones: WizardMilestone[];
  teamMembers: WizardTeamMember[];
  contactPrimary: string;
  contactBackup: string;
  githubUrl: string;
  gitlabUrl: string;
  websiteUrl: string;
  demoVideoUrl: string;
  socialLinks: Array<{ platform: string; url: string }>;
}

const EMPTY_DATA: CampaignWizardData = {
  title: '',
  tagline: '',
  category: '',
  logoUrl: '',
  bannerUrl: '',
  vision: '',
  fundingGoal: 0,
  milestones: [],
  teamMembers: [],
  contactPrimary: '',
  contactBackup: '',
  githubUrl: '',
  gitlabUrl: '',
  websiteUrl: '',
  demoVideoUrl: '',
  socialLinks: [],
};

const TELEGRAM_PATTERN = /^@?[a-zA-Z0-9_]{5,32}$/;

function validateStep(step: number, d: CampaignWizardData): string | null {
  switch (step) {
    case 1:
      if (!d.title.trim() || d.title.length < 3)
        return 'Campaign title is required (min 3 characters)';
      if (!d.category) return 'Please select a category';
      if (!d.logoUrl) return 'Please upload a campaign logo before continuing';
      return null;
    case 2:
      if (!d.tagline.trim() || d.tagline.length < 10)
        return 'Vision is required (min 10 characters)';
      if (!d.vision.trim() || d.vision.length < 50)
        return 'Project description must be at least 50 characters';
      return null;
    case 3:
      if (!d.fundingGoal || d.fundingGoal < 1)
        return 'Funding goal must be at least $1 USDC';
      return null;
    case 4:
      if (d.milestones.length === 0)
        return 'Add at least one milestone before continuing';
      for (const [i, m] of d.milestones.entries()) {
        const n = i + 1;
        if (!m.title.trim() || m.title.trim().length < 3)
          return `Milestone ${n} needs a title (min 3 characters)`;
        if (!m.description.trim() || m.description.trim().length < 10)
          return `Milestone ${n} description must be at least 10 characters`;
        if (!m.deliverable.trim() || m.deliverable.trim().length < 10)
          return `Milestone ${n} needs a deliverable (min 10 characters)`;
        if (!m.expectedDeliveryDate)
          return `Milestone ${n} needs an expected delivery date`;
      }
      return null;
    case 5:
      // Team is optional (most builders are solo). Only validate members that
      // were actually added.
      for (const [i, m] of d.teamMembers.entries()) {
        if (m.name.trim() && m.name.trim().length < 2)
          return `Team member ${i + 1} needs a name with at least 2 characters`;
      }
      if (!d.contactPrimary.trim())
        return 'A Telegram handle is required so the team can reach you';
      if (!TELEGRAM_PATTERN.test(d.contactPrimary.trim()))
        return 'Telegram handle must be 5-32 characters (letters, numbers, underscores)';
      return null;
    default:
      return null;
  }
}

// Build a partial update payload for draft autosave. Each field is included
// only once it satisfies the backend's validators, so a half-finished step
// never fails the PUT. Full validation runs at submit-for-review.
function buildDraftPayload(data: CampaignWizardData): Record<string, unknown> {
  const split = equalSplit(data.fundingGoal, data.milestones.length || 1);
  const payload: Record<string, unknown> = {};

  if (data.title.trim().length >= 3) payload.title = data.title.trim();
  if (data.logoUrl) payload.logo = data.logoUrl;
  if (data.bannerUrl) payload.banner = data.bannerUrl;
  if (data.tagline.trim().length >= 10) payload.vision = data.tagline.trim();
  if (data.vision.trim().length >= 50) payload.details = data.vision.trim();
  if (data.category) payload.category = data.category;
  if (data.fundingGoal >= 1) payload.fundingAmount = data.fundingGoal;
  if (data.githubUrl) payload.githubUrl = data.githubUrl;
  if (data.gitlabUrl) payload.gitlabUrl = data.gitlabUrl;
  if (data.websiteUrl) payload.projectWebsite = data.websiteUrl;
  if (data.demoVideoUrl) payload.demoVideo = data.demoVideoUrl;

  // Deduplicate by platform so @ArrayUnique never fires.
  const seen = new Set<string>();
  const socialLinks = data.socialLinks
    .filter(s => s.platform && s.url)
    .filter(s => {
      if (seen.has(s.platform)) return false;
      seen.add(s.platform);
      return true;
    });
  if (socialLinks.length) payload.socialLinks = socialLinks;

  const team = data.teamMembers
    .filter(m => m.name.trim().length >= 2)
    .map(m => ({
      name: m.name.trim(),
      role: m.role.trim() || 'Contributor',
      ...(m.email?.trim() ? { email: m.email.trim() } : {}),
    }));
  if (team.length) payload.team = team;

  // Only send milestones once every row is valid and the funding goal is set
  // (so the even-split amount is positive).
  const milestonesReady =
    data.fundingGoal >= 1 &&
    data.milestones.length > 0 &&
    data.milestones.every(
      m =>
        m.title.trim().length >= 3 &&
        m.description.trim().length >= 10 &&
        (m.deliverable.trim() || m.description.trim()).length >= 10 &&
        Boolean(m.expectedDeliveryDate)
    );
  if (milestonesReady) {
    payload.milestones = data.milestones.map((m, i) => ({
      title: m.title.trim(),
      description: m.description.trim(),
      deliverable: (m.deliverable.trim() || m.description.trim()).slice(0, 500),
      fundingPercentage: split.percentage,
      expectedDeliveryDate: m.expectedDeliveryDate,
      ...(m.successCriteria && m.successCriteria.trim().length >= 10
        ? { successCriteria: m.successCriteria.trim() }
        : {}),
      orderIndex: i,
      amount: split.amount,
    }));
  }

  if (TELEGRAM_PATTERN.test(data.contactPrimary.trim())) {
    payload.contact = {
      primary: data.contactPrimary.trim(),
      ...(data.contactBackup.trim()
        ? { backup: data.contactBackup.trim() }
        : {}),
    };
  }

  return payload;
}

// Reverse of buildDraftPayload: hydrate the wizard from a saved draft so the
// builder can resume after a refresh / from a bookmarked URL.
function mapCampaignToWizard(c: CrowdfundingCampaign): CampaignWizardData {
  const p = c.project;
  const milestones: WizardMilestone[] = (c.milestones ?? []).map(m => {
    // The hand-written Milestone type omits a few v2 fields the API returns.
    const mm = m as unknown as {
      title?: string;
      description?: string;
      deliverable?: string;
      expectedDeliveryDate?: string;
      successCriteria?: string;
    };
    return {
      title: mm.title ?? '',
      description: mm.description ?? '',
      deliverable: mm.deliverable ?? '',
      expectedDeliveryDate: mm.expectedDeliveryDate
        ? String(mm.expectedDeliveryDate).split('T')[0]
        : '',
      successCriteria: mm.successCriteria ?? '',
    };
  });
  const teamMembers: WizardTeamMember[] = (c.team ?? []).map(t => ({
    name: t.name ?? '',
    role: t.role ?? '',
    email: t.email ?? '',
  }));
  const socialLinks = (c.socialLinks ?? p?.socialLinks ?? [])
    .filter(s => s && s.platform && s.url)
    .map(s => ({ platform: s.platform, url: s.url }));

  return {
    title: p?.title ?? '',
    tagline: p?.vision ?? '', // tagline <-> project.vision
    category: p?.category ?? '',
    logoUrl: p?.logo ?? '',
    bannerUrl: p?.banner ?? '',
    vision: p?.details ?? '', // story <-> project.details
    fundingGoal: c.fundingGoal ?? 0,
    milestones,
    teamMembers,
    contactPrimary: c.contact?.primary ?? '',
    contactBackup: c.contact?.backup ?? '',
    githubUrl: p?.githubUrl ?? '',
    gitlabUrl: p?.gitlabUrl ?? '',
    websiteUrl: p?.projectWebsite ?? '',
    demoVideoUrl: p?.demoVideo ?? '',
    socialLinks,
  };
}

export default function NewCampaignWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Captured once: a campaignId in the URL at mount means "resume this draft".
  // We hydrate from it on mount only, NOT when persistDraft sets campaignId
  // mid-flow (which must not clobber the in-progress form).
  const initialCampaignId = useRef(searchParams.get('campaignId') ?? undefined);
  const hydratedRef = useRef(false);

  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [data, setData] = useState<CampaignWizardData>(EMPTY_DATA);
  const [campaignId, setCampaignId] = useState<string | undefined>(
    initialCampaignId.current
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHydrating, setIsHydrating] = useState<boolean>(
    Boolean(initialCampaignId.current)
  );
  // The lifecycle status of the campaign we resumed (if any). A REVIEW_REJECTED
  // campaign resubmits via revise-and-resubmit instead of submit-for-review.
  const [loadedStatus, setLoadedStatus] = useState<string | undefined>(
    undefined
  );

  // Resume an existing draft from ?campaignId= on first mount.
  useEffect(() => {
    const id = initialCampaignId.current;
    if (!id || hydratedRef.current) return;
    hydratedRef.current = true;
    fetchCampaignById(id)
      .then(campaign => {
        const mapped = mapCampaignToWizard(campaign);
        setData(mapped);
        setLoadedStatus(campaign.v2Status);
        // Mark each already-valid step done and land on the first gap.
        const done = new Set<number>();
        let landing = 1;
        for (let s = 1; s <= 5; s++) {
          if (validateStep(s, mapped) === null) {
            done.add(s);
            landing = Math.min(s + 1, TOTAL_STEPS);
          } else {
            landing = s;
            break;
          }
        }
        setCompletedSteps(done);
        setActiveStep(landing);
      })
      .catch((err: unknown) =>
        toast.error(
          extractApiErrorMessage(
            err,
            'Could not load your draft. Starting a fresh form.'
          )
        )
      )
      .finally(() => setIsHydrating(false));
  }, []);

  const updateData = useCallback((patch: Partial<CampaignWizardData>) => {
    setData(prev => ({ ...prev, ...patch }));
  }, []);

  const markStepDone = (step: number) =>
    setCompletedSteps(prev => new Set([...prev, step]));

  // Create the draft on first save, then persist the step via a partial update.
  // The draft id is pushed into the URL so the wizard is bookmarkable.
  const persistDraft = useCallback(
    async (currentData: CampaignWizardData): Promise<string> => {
      let id = campaignId;
      if (!id) {
        const res = await createCampaignDraft(currentData.title.trim());
        id = res.id;
        setCampaignId(id);
        const params = new URLSearchParams(searchParams.toString());
        params.set('campaignId', id);
        // The wizard lives at /crowdfunding/new (the /me/... path is a redirect
        // that would drop the query and remount blank).
        router.replace(`/crowdfunding/new?${params.toString()}`, {
          scroll: false,
        });
      }
      await updateCrowdfundingProject(
        id,
        buildDraftPayload(currentData) as any
      );
      return id;
    },
    [campaignId, searchParams, router]
  );

  const handleNext = async () => {
    if (activeStep === TOTAL_STEPS) return;

    const error = validateStep(activeStep, data);
    if (error) {
      toast.error(error);
      return;
    }

    // Save every step as a draft before advancing.
    setIsSaving(true);
    try {
      await persistDraft(data);
      markStepDone(activeStep);
      setActiveStep(s => s + 1);
    } catch (err) {
      toast.error(
        extractApiErrorMessage(
          err,
          'Could not save your progress. Please try again.'
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (activeStep > 1) setActiveStep(s => s - 1);
  };

  const isRevision = loadedStatus === 'REVIEW_REJECTED';

  const handleSubmitForReview = async () => {
    setIsSubmitting(true);
    try {
      const id = await persistDraft(data);
      if (isRevision) {
        await reviseAndResubmit(id);
        toast.success('Campaign resubmitted for review!');
      } else {
        await submitCampaignForReview(id);
        toast.success('Campaign submitted for review!');
      }
      router.push(`/me/crowdfunding/${id}`);
    } catch (err) {
      toast.error(
        extractApiErrorMessage(
          err,
          'Failed to submit for review. Please try again.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return <BasicsStep data={data} onChange={updateData} />;
      case 2:
        return <StoryStep data={data} onChange={updateData} />;
      case 3:
        return <FundingStep data={data} onChange={updateData} />;
      case 4:
        return <MilestonesStep data={data} onChange={updateData} />;
      case 5:
        return <TeamStep data={data} onChange={updateData} />;
      case 6:
        return <LinksStep data={data} onChange={updateData} />;
      case 7:
        return (
          <ReviewStep
            data={data}
            onEdit={setActiveStep}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmitForReview}
            isRevision={isRevision}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = activeStep === TOTAL_STEPS;
  const currentStepMeta = WIZARD_STEPS[activeStep - 1];

  if (isHydrating) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='flex items-center gap-3 text-zinc-400'>
          <Loader2 className='h-5 w-5 animate-spin' />
          Loading your draft...
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen'>
      <NewCampaignSidebar
        activeStep={activeStep}
        completedSteps={completedSteps}
        campaignId={campaignId}
        onStepClick={setActiveStep}
      />

      <WizardHelpButton activeStep={activeStep} />

      <main className='flex-1 md:ml-[280px]'>
        <div className='mx-auto max-w-2xl px-6 py-10'>
          {/* Step header */}
          <div className='mb-8'>
            <div className='mb-2 flex items-center gap-2 text-xs font-medium tracking-wider text-zinc-500 uppercase'>
              <span>
                Step {activeStep} of {TOTAL_STEPS}
              </span>
              <span className='text-zinc-700'>·</span>
              <span>{currentStepMeta.description}</span>
            </div>
            <h1 className='text-2xl font-bold text-white'>
              {currentStepMeta.title}
            </h1>
          </div>

          {/* Step content */}
          <div className='mb-10'>{renderStep()}</div>

          {/* Navigation footer (hidden on review step which has its own CTA) */}
          {!isLastStep && (
            <div className='flex items-center justify-between border-t border-zinc-800/50 pt-6'>
              <Button
                variant='ghost'
                onClick={handleBack}
                disabled={activeStep === 1 || isSaving}
                className='gap-2 text-zinc-400 hover:text-white'
              >
                <ArrowLeft className='h-4 w-4' />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={isSaving}
                className='bg-primary hover:bg-primary/90 gap-2'
              >
                {isSaving ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <ArrowRight className='h-4 w-4' />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
