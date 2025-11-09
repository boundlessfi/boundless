'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InfoFormData } from './tabs/schemas/infoSchema';
import { TimelineFormData } from './tabs/schemas/timelineSchema';
import { ParticipantFormData } from './tabs/schemas/participantSchema';
import { RewardsFormData } from './tabs/schemas/rewardsSchema';
import { JudgingFormData } from './tabs/schemas/judgingSchema';
import { CollaborationFormData } from './tabs/schemas/collaborationSchema';
import { useHackathons } from '@/hooks/use-hackathons';
import type {
  CreateDraftRequest,
  PublishHackathonRequest,
  HackathonDraft,
} from '@/lib/api/hackathons';
import {
  HackathonCategory,
  ParticipantType,
  VenueType,
} from '@/lib/api/hackathons';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import InfoTab from './tabs/InfoTab';
import TimelineTab from './tabs/TimelineTab';
import ParticipantTab from './tabs/ParticipantTab';
import RewardsTab from './tabs/RewardsTab';
import JudgingTab from './tabs/JudgingTab';
import CollaborationTab from './tabs/CollaborationTab';
import ReviewTab from './tabs/ReviewTab';

type StepStatus = 'pending' | 'active' | 'completed';
type StepKey =
  | 'information'
  | 'timeline'
  | 'participation'
  | 'rewards'
  | 'judging'
  | 'collaboration'
  | 'review';

interface StepData {
  status: StepStatus;
  isCompleted: boolean;
  data?: Record<string, unknown>;
}
interface NewHackathonTabProps {
  organizationId?: string;
  draftId?: string;
}

// Step order constant - defined outside component to avoid recreation on every render
const STEP_ORDER: StepKey[] = [
  'information',
  'timeline',
  'participation',
  'rewards',
  'judging',
  'collaboration',
  'review',
];

// Transform form data to API format
const transformToApiFormat = (stepData: {
  information?: InfoFormData;
  timeline?: TimelineFormData;
  participation?: ParticipantFormData;
  rewards?: RewardsFormData;
  judging?: JudgingFormData;
  collaboration?: CollaborationFormData;
}): CreateDraftRequest | PublishHackathonRequest => {
  const info = stepData.information;
  const timeline = stepData.timeline;
  const participation = stepData.participation;
  const rewards = stepData.rewards;
  const judging = stepData.judging;
  const collaboration = stepData.collaboration;

  return {
    information: {
      title: info?.name || '',
      banner: info?.banner || '',
      description: info?.description || '',
      category:
        (info?.category as HackathonCategory) || HackathonCategory.OTHER,
      venue: {
        type: (info?.venueType as VenueType) || VenueType.VIRTUAL,
        country: info?.country,
        state: info?.state,
        city: info?.city,
        venueName: info?.venueName,
        venueAddress: info?.venueAddress,
      },
    },
    timeline: {
      startDate: timeline?.startDate?.toISOString() || '',
      submissionDeadline: timeline?.submissionDeadline?.toISOString() || '',
      judgingDate: timeline?.endDate?.toISOString() || '',
      winnerAnnouncementDate:
        timeline?.registrationDeadline?.toISOString() || '',
      timezone: timeline?.timezone || 'UTC',
      phases: timeline?.phases?.map(phase => ({
        name: phase.name,
        startDate: phase.startDate.toISOString(),
        endDate: phase.endDate.toISOString(),
        description: phase.description,
      })),
    },
    participation: {
      participantType:
        (participation?.participantType as ParticipantType) ||
        ParticipantType.INDIVIDUAL,
      teamMin: participation?.teamMin,
      teamMax: participation?.teamMax,
      about: participation?.about,
      submissionRequirements: {
        requireGithub: participation?.require_github,
        requireDemoVideo: participation?.require_demo_video,
        requireOtherLinks: participation?.require_other_links,
      },
      tabVisibility: {
        detailsTab: participation?.details_tab,
        scheduleTab: participation?.schedule_tab,
        rulesTab: participation?.rules_tab,
        rewardTab: participation?.reward_tab,
        announcementsTab: participation?.announcements_tab,
        partnersTab: participation?.partners_tab,
        joinATeamTab: participation?.join_a_team_tab,
        projectsTab: participation?.projects_tab,
        participantsTab: participation?.participants_tab,
      },
    },
    rewards: {
      prizeTiers:
        rewards?.prizeTiers?.map(tier => ({
          position: tier.place,
          amount: parseFloat(tier.prizeAmount) || 0,
          currency: tier.currency || 'USDC',
          description: tier.description,
          passMark: tier.passMark,
        })) || [],
    },
    judging: {
      criteria:
        judging?.criteria?.map(criterion => ({
          title: criterion.name,
          weight: criterion.weight,
          description: criterion.description,
        })) || [],
    },
    collaboration: {
      contactEmail: collaboration?.contactEmail || '',
      telegram: collaboration?.telegram,
      discord: collaboration?.discord,
      socialLinks:
        collaboration?.socialLinks?.filter(
          link => link && link.trim() !== ''
        ) || [],
      sponsorsPartners:
        collaboration?.sponsorsPartners?.map(sp => ({
          sponsorName: sp.name,
          sponsorLogo: sp.logo || '',
          partnerLink: sp.link || '',
        })) || [],
    },
  };
};

// Transform API draft data to form data format
const transformFromApiFormat = (draft: HackathonDraft) => {
  const info = draft.information;
  const timeline = draft.timeline;
  const participation = draft.participation;
  const rewards = draft.rewards;
  const judging = draft.judging;
  const collaboration = draft.collaboration;

  return {
    information: {
      name: info?.title || '',
      banner: info?.banner || '',
      description: info?.description || '',
      category: info?.category || '',
      venueType: info?.venue?.type || 'physical',
      country: info?.venue?.country || '',
      state: info?.venue?.state || '',
      city: info?.venue?.city || '',
      venueName: info?.venue?.venueName || '',
      venueAddress: info?.venue?.venueAddress || '',
    } as InfoFormData,
    timeline: {
      startDate: timeline?.startDate ? new Date(timeline.startDate) : undefined,
      endDate: timeline?.judgingDate
        ? new Date(timeline.judgingDate)
        : undefined,
      registrationDeadline: timeline?.winnerAnnouncementDate
        ? new Date(timeline.winnerAnnouncementDate)
        : undefined,
      submissionDeadline: timeline?.submissionDeadline
        ? new Date(timeline.submissionDeadline)
        : undefined,
      timezone: timeline?.timezone || 'UTC',
      phases:
        timeline?.phases?.map(phase => ({
          name: phase.name,
          startDate: new Date(phase.startDate),
          endDate: new Date(phase.endDate),
          description: phase.description || '',
        })) || [],
    } as TimelineFormData,
    participation: {
      participantType: participation?.participantType || 'individual',
      teamMin: participation?.teamMin,
      teamMax: participation?.teamMax,
      about: participation?.about || '',
      require_github:
        participation?.submissionRequirements?.requireGithub || false,
      require_demo_video:
        participation?.submissionRequirements?.requireDemoVideo || false,
      require_other_links:
        participation?.submissionRequirements?.requireOtherLinks || false,
      details_tab: participation?.tabVisibility?.detailsTab || true,
      schedule_tab: participation?.tabVisibility?.scheduleTab || true,
      rules_tab: participation?.tabVisibility?.rulesTab || true,
      reward_tab: participation?.tabVisibility?.rewardTab || true,
      announcements_tab: participation?.tabVisibility?.announcementsTab || true,
      partners_tab: participation?.tabVisibility?.partnersTab || true,
      join_a_team_tab: participation?.tabVisibility?.joinATeamTab || true,
      projects_tab: participation?.tabVisibility?.projectsTab || true,
      participants_tab: participation?.tabVisibility?.participantsTab || true,
    } as ParticipantFormData,
    rewards: {
      prizeTiers:
        rewards?.prizeTiers?.map((tier, index) => ({
          id: `tier-${index}`,
          place: tier.position,
          prizeAmount: tier.amount.toString(),
          currency: tier.currency || 'USDC',
          description: tier.description || '',
          passMark: tier.passMark,
        })) || [],
    } as RewardsFormData,
    judging: {
      criteria:
        judging?.criteria?.map((criterion, index) => ({
          id: `criterion-${index}`,
          name: criterion.title,
          weight: criterion.weight,
          description: criterion.description || '',
        })) || [],
    } as JudgingFormData,
    collaboration: {
      contactEmail: collaboration?.contactEmail || '',
      telegram: collaboration?.telegram || '',
      discord: collaboration?.discord || '',
      socialLinks: collaboration?.socialLinks || [],
      sponsorsPartners:
        collaboration?.sponsorsPartners?.map(sp => ({
          name: sp.sponsorName,
          logo: sp.sponsorLogo,
          link: sp.partnerLink,
        })) || [],
    } as CollaborationFormData,
  };
};

export default function NewHackathonTab({
  organizationId,
  draftId: initialDraftId,
}: NewHackathonTabProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StepKey>('information');
  const [draftId, setDraftId] = useState<string | null>(initialDraftId || null);

  // Get organizationId from pathname if not provided
  const derivedOrgId =
    organizationId ||
    (() => {
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const parts = pathname.split('/');
        if (parts.length >= 3 && parts[1] === 'organizations') {
          return parts[2];
        }
      }
      return undefined;
    })();

  const {
    createDraftAction,
    updateDraftAction,
    publishHackathonAction,
    fetchDraft,
    currentDraft,
    currentLoading,
    currentError,
  } = useHackathons({
    organizationId: derivedOrgId,
    autoFetch: false,
  });

  const [stepData, setStepData] = useState<{
    information?: InfoFormData;
    timeline?: TimelineFormData;
    participation?: ParticipantFormData;
    rewards?: RewardsFormData;
    judging?: JudgingFormData;
    collaboration?: CollaborationFormData;
  }>({});

  const [loadingStates, setLoadingStates] = useState<Record<StepKey, boolean>>({
    information: false,
    timeline: false,
    participation: false,
    rewards: false,
    judging: false,
    collaboration: false,
    review: false,
  });

  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const [steps, setSteps] = useState<Record<StepKey, StepData>>({
    information: { status: 'active', isCompleted: false },
    timeline: { status: 'pending', isCompleted: false },
    participation: { status: 'pending', isCompleted: false },
    rewards: { status: 'pending', isCompleted: false },
    judging: { status: 'pending', isCompleted: false },
    collaboration: { status: 'pending', isCompleted: false },
    review: { status: 'pending', isCompleted: false },
  });

  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const draftInitializedRef = useRef<string | null>(null);

  // Load draft when draftId is provided
  useEffect(() => {
    const loadDraft = async () => {
      if (!initialDraftId || !derivedOrgId) return;

      setIsLoadingDraft(true);
      try {
        await fetchDraft(initialDraftId);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load draft';
        toast.error(errorMessage);
      } finally {
        setIsLoadingDraft(false);
      }
    };

    loadDraft();
  }, [initialDraftId, derivedOrgId, fetchDraft]);

  // Initialize form data when draft is loaded (only once per draft)
  useEffect(() => {
    if (
      currentDraft &&
      initialDraftId &&
      currentDraft._id === initialDraftId &&
      draftInitializedRef.current !== currentDraft._id
    ) {
      try {
        const formData = transformFromApiFormat(currentDraft);
        setStepData(formData);

        // Update steps based on available data
        const newSteps: Record<StepKey, StepData> = {
          information: {
            status: formData.information ? 'completed' : 'active',
            isCompleted: !!formData.information,
          },
          timeline: {
            status: formData.timeline ? 'completed' : 'pending',
            isCompleted: !!formData.timeline,
          },
          participation: {
            status: formData.participation ? 'completed' : 'pending',
            isCompleted: !!formData.participation,
          },
          rewards: {
            status: formData.rewards ? 'completed' : 'pending',
            isCompleted: !!formData.rewards,
          },
          judging: {
            status: formData.judging ? 'completed' : 'pending',
            isCompleted: !!formData.judging,
          },
          collaboration: {
            status: formData.collaboration ? 'completed' : 'pending',
            isCompleted: !!formData.collaboration,
          },
          review: {
            status: formData.collaboration ? 'pending' : 'pending',
            isCompleted: false,
          },
        };

        // Set the first incomplete step as active
        const firstIncompleteStep =
          STEP_ORDER.find(step => !newSteps[step].isCompleted) || 'information';

        newSteps[firstIncompleteStep] = {
          ...newSteps[firstIncompleteStep],
          status: 'active',
        };

        setSteps(newSteps);
        setActiveTab(firstIncompleteStep as StepKey);

        // Mark this draft as initialized
        draftInitializedRef.current = currentDraft._id;
      } catch {
        toast.error('Failed to load draft data');
      }
    }
  }, [currentDraft, initialDraftId]);

  const getCurrentStepIndex = () => STEP_ORDER.indexOf(activeTab);

  const canAccessStep = (stepKey: StepKey) => {
    // Review tab is accessible only after collaboration is completed
    if (stepKey === 'review') {
      return steps.collaboration?.isCompleted === true;
    }

    const stepIndex = STEP_ORDER.indexOf(stepKey);
    const currentIndex = getCurrentStepIndex();

    if (stepIndex <= currentIndex) return true;

    if (stepIndex === currentIndex + 1 && steps[activeTab].isCompleted)
      return true;

    return false;
  };

  const navigateToStep = (stepKey: StepKey, skipAccessCheck = false) => {
    if (skipAccessCheck || canAccessStep(stepKey)) {
      const stepIndex = STEP_ORDER.indexOf(stepKey);
      const currentIndex = getCurrentStepIndex();

      if (stepIndex > currentIndex) {
        setSteps(prev => {
          const newSteps = { ...prev };

          STEP_ORDER.forEach((step, index) => {
            if (index > stepIndex) {
              newSteps[step] = { status: 'pending', isCompleted: false };
            }
          });

          newSteps[stepKey] = { ...newSteps[stepKey], status: 'active' };

          return newSteps;
        });
      } else {
        setSteps(prev => ({
          ...prev,
          [stepKey]: { ...prev[stepKey], status: 'active' },
        }));
      }

      setActiveTab(stepKey);
    }
  };

  const saveInformationStep = async (data: InfoFormData) => {
    if (!derivedOrgId) {
      toast.error('Organization ID is required');
      return;
    }

    setLoadingStates(prev => ({ ...prev, information: true }));
    try {
      const updatedStepData = { ...stepData, information: data };
      const apiData = transformToApiFormat(updatedStepData);

      if (draftId) {
        // Update existing draft
        await updateDraftAction(draftId, { information: apiData.information });
      } else {
        // Create new draft
        const draft = await createDraftAction({
          information: apiData.information,
        });
        setDraftId(draft._id);
      }

      setStepData(updatedStepData);

      // Update step completion and navigate in a single operation
      setSteps(prev => {
        const newSteps: Record<StepKey, StepData> = {
          ...prev,
          information: {
            ...prev.information,
            status: 'completed' as StepStatus,
            isCompleted: true,
          },
          timeline: {
            ...prev.timeline,
            status: 'active' as StepStatus,
          },
        };
        return newSteps;
      });
      setActiveTab('timeline');
    } catch {
      // Error toast is shown in the tab component
      throw new Error('Failed to save information step');
    } finally {
      setLoadingStates(prev => ({ ...prev, information: false }));
    }
  };

  const saveTimelineStep = async (data: TimelineFormData) => {
    if (!derivedOrgId) {
      toast.error('Organization ID is required');
      return;
    }
    if (!draftId) {
      toast.error('Please save information first');
      return;
    }

    setLoadingStates(prev => ({ ...prev, timeline: true }));
    try {
      const updatedStepData = { ...stepData, timeline: data };
      const apiData = transformToApiFormat(updatedStepData);

      await updateDraftAction(draftId, { timeline: apiData.timeline });

      setStepData(updatedStepData);

      // Update step completion and navigate in a single operation
      setSteps(prev => {
        const newSteps: Record<StepKey, StepData> = {
          ...prev,
          timeline: {
            ...prev.timeline,
            status: 'completed' as StepStatus,
            isCompleted: true,
          },
          participation: {
            ...prev.participation,
            status: 'active' as StepStatus,
          },
        };
        return newSteps;
      });
      setActiveTab('participation');
    } catch {
      // Error toast is shown in the tab component
      throw new Error('Failed to save timeline step');
    } finally {
      setLoadingStates(prev => ({ ...prev, timeline: false }));
    }
  };

  const saveParticipationStep = async (data: ParticipantFormData) => {
    if (!derivedOrgId || !draftId) {
      toast.error('Please save previous steps first');
      return;
    }

    setLoadingStates(prev => ({ ...prev, participation: true }));
    try {
      const updatedStepData = { ...stepData, participation: data };
      const apiData = transformToApiFormat(updatedStepData);

      await updateDraftAction(draftId, {
        participation: apiData.participation,
      });

      setStepData(updatedStepData);

      // Update step completion and navigate in a single operation
      setSteps(prev => {
        const newSteps: Record<StepKey, StepData> = {
          ...prev,
          participation: {
            ...prev.participation,
            status: 'completed' as StepStatus,
            isCompleted: true,
          },
          rewards: {
            ...prev.rewards,
            status: 'active' as StepStatus,
          },
        };
        return newSteps;
      });
      setActiveTab('rewards');
    } catch {
      // Error toast is shown in the tab component
      throw new Error('Failed to save participation step');
    } finally {
      setLoadingStates(prev => ({ ...prev, participation: false }));
    }
  };

  const saveRewardsStep = async (data: RewardsFormData) => {
    if (!derivedOrgId || !draftId) {
      toast.error('Please save previous steps first');
      return;
    }

    setLoadingStates(prev => ({ ...prev, rewards: true }));
    try {
      const updatedStepData = { ...stepData, rewards: data };
      const apiData = transformToApiFormat(updatedStepData);

      await updateDraftAction(draftId, { rewards: apiData.rewards });

      setStepData(updatedStepData);

      // Update step completion and navigate in a single operation
      setSteps(prev => {
        const newSteps: Record<StepKey, StepData> = {
          ...prev,
          rewards: {
            ...prev.rewards,
            status: 'completed' as StepStatus,
            isCompleted: true,
          },
          judging: {
            ...prev.judging,
            status: 'active' as StepStatus,
          },
        };
        return newSteps;
      });
      setActiveTab('judging');
    } catch {
      // Error toast is shown in the tab component
      throw new Error('Failed to save rewards step');
    } finally {
      setLoadingStates(prev => ({ ...prev, rewards: false }));
    }
  };

  const saveJudgingStep = async (data: JudgingFormData) => {
    if (!derivedOrgId || !draftId) {
      toast.error('Please save previous steps first');
      return;
    }

    setLoadingStates(prev => ({ ...prev, judging: true }));
    try {
      const updatedStepData = { ...stepData, judging: data };
      const apiData = transformToApiFormat(updatedStepData);

      await updateDraftAction(draftId, { judging: apiData.judging });

      setStepData(updatedStepData);

      // Update step completion and navigate in a single operation
      setSteps(prev => {
        const newSteps: Record<StepKey, StepData> = {
          ...prev,
          judging: {
            ...prev.judging,
            status: 'completed' as StepStatus,
            isCompleted: true,
          },
          collaboration: {
            ...prev.collaboration,
            status: 'active' as StepStatus,
          },
        };
        return newSteps;
      });
      setActiveTab('collaboration');
    } catch {
      // Error toast is shown in the tab component
      throw new Error('Failed to save judging step');
    } finally {
      setLoadingStates(prev => ({ ...prev, judging: false }));
    }
  };

  const saveCollaborationStep = async (data: CollaborationFormData) => {
    if (!derivedOrgId || !draftId) {
      toast.error('Please save previous steps first');
      return;
    }

    setLoadingStates(prev => ({ ...prev, collaboration: true }));
    try {
      const updatedStepData = { ...stepData, collaboration: data };
      const apiData = transformToApiFormat(updatedStepData);

      await updateDraftAction(draftId, {
        collaboration: apiData.collaboration,
      });

      setStepData(updatedStepData);

      // Update step completion and navigate in a single operation
      setSteps(prev => {
        const newSteps: Record<StepKey, StepData> = {
          ...prev,
          collaboration: {
            status: 'completed' as StepStatus,
            isCompleted: true,
            data: prev.collaboration?.data,
          },
          review: {
            status: 'active' as StepStatus,
            isCompleted: prev.review?.isCompleted || false,
            data: prev.review?.data,
          },
        };
        return newSteps;
      });
      setActiveTab('review');
    } catch {
      // Error toast is shown in the tab component
      throw new Error('Failed to save collaboration step');
    } finally {
      setLoadingStates(prev => ({ ...prev, collaboration: false }));
    }
  };

  const handlePublish = async () => {
    if (!derivedOrgId) {
      toast.error('Organization ID is required');
      return;
    }

    // Validate all required data is present
    if (
      !stepData.information ||
      !stepData.timeline ||
      !stepData.participation ||
      !stepData.rewards ||
      !stepData.judging ||
      !stepData.collaboration
    ) {
      toast.error('Please complete all steps before publishing');
      return;
    }

    setLoadingStates(prev => ({ ...prev, review: true }));
    try {
      const apiData = transformToApiFormat(stepData) as PublishHackathonRequest;

      const hackathon = await publishHackathonAction(apiData);
      toast.success('Hackathon published successfully!');

      setSteps(prev => ({
        ...prev,
        review: {
          ...prev.review,
          status: 'completed',
          isCompleted: true,
        },
      }));

      // Navigate to the published hackathon page
      if (derivedOrgId && hackathon._id) {
        setTimeout(() => {
          router.push(
            `/organizations/${derivedOrgId}/hackathons/${hackathon._id}`
          );
        }, 1500);
      }
    } catch {
      toast.error('Failed to publish hackathon');
      throw new Error('Failed to publish hackathon');
    } finally {
      setLoadingStates(prev => ({ ...prev, review: false }));
    }
  };

  const handleSaveDraft = async () => {
    if (!derivedOrgId) {
      toast.error('Organization ID is required');
      return;
    }

    setIsSavingDraft(true);
    try {
      const apiData = transformToApiFormat(stepData);

      if (draftId) {
        // Update existing draft with all current data
        await updateDraftAction(draftId, apiData);
        toast.success('Draft saved successfully');
      } else {
        // Create new draft if it doesn't exist
        const draft = await createDraftAction(apiData);
        setDraftId(draft._id);
        toast.success('Draft created successfully');
      }
    } catch {
      toast.error('Failed to save draft');
      throw new Error('Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleEditTab = (tabKey: string) => {
    const tabMap: Record<string, StepKey> = {
      information: 'information',
      timeline: 'timeline',
      participation: 'participation',
      rewards: 'rewards',
      judging: 'judging',
      collaboration: 'collaboration',
    };
    const stepKey = tabMap[tabKey];
    if (stepKey) {
      navigateToStep(stepKey);
    }
  };

  const handlePreview = () => {};

  // Show loading state while draft is being loaded
  if (isLoadingDraft || (initialDraftId && currentLoading)) {
    return (
      <div className='bg-background-main-bg flex flex-1 items-center justify-center text-white'>
        <div className='flex flex-col items-center gap-4'>
          <div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
          <span className='text-sm text-gray-400'>Loading draft...</span>
        </div>
      </div>
    );
  }

  // Show error state if draft failed to load
  if (initialDraftId && currentError && !currentDraft) {
    return (
      <div className='bg-background-main-bg flex flex-1 items-center justify-center text-white'>
        <div className='flex flex-col items-center gap-4'>
          <span className='text-sm text-red-400'>{currentError}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className='bg-background-main-bg flex-1 overflow-hidden text-white'
      id={organizationId}
    >
      <Tabs
        value={activeTab}
        onValueChange={value => navigateToStep(value as StepKey)}
        className='w-full'
      >
        <div className='border-b border-zinc-800 pl-6 md:pl-8'>
          <div className='flex items-center gap-4'>
            <button
              className='rounded-lg p-2 transition-colors hover:bg-zinc-800 md:hidden'
              aria-label='Open menu'
            >
              <Menu className='h-5 w-5' />
            </button>
            <div className='h-[50px] w-[0.5px] bg-gray-900 md:hidden' />

            <ScrollArea className='w-full'>
              <div className='flex w-max min-w-full items-center justify-between'>
                <TabsList className='inline-flex h-auto bg-transparent p-0'>
                  {STEP_ORDER.filter(stepKey => stepKey !== 'review') // Hide review from tabs, show it separately
                    .map(stepKey => {
                      const step = steps[stepKey];
                      const isActive = stepKey === activeTab;
                      const isCompleted = step.isCompleted;
                      const canAccess = canAccessStep(stepKey);

                      return (
                        <TabsTrigger
                          key={stepKey}
                          value={stepKey}
                          onClick={() => navigateToStep(stepKey)}
                          disabled={!canAccess}
                          className={cn(
                            'data-[state=active]:border-b-primary rounded-none border-b-2 border-transparent bg-transparent px-5 pt-4 pb-3 text-sm font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-none',
                            !canAccess && 'cursor-not-allowed opacity-50',
                            isActive && 'border-b-primary text-white',
                            isCompleted && 'border-b-primary text-white',
                            !isActive && !isCompleted && 'text-zinc-400'
                          )}
                        >
                          <div className='flex items-center space-x-2'>
                            <span>
                              {stepKey.charAt(0).toUpperCase() +
                                stepKey.slice(1)}
                            </span>
                            <div>
                              {isActive && !isCompleted && (
                                <svg
                                  width='16'
                                  height='17'
                                  viewBox='0 0 16 17'
                                  fill='none'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <path
                                    d='M15.3337 8.50002C15.3337 12.5501 12.0504 15.8334 8.00033 15.8334C3.95024 15.8334 0.666992 12.5501 0.666992 8.50002C0.666992 4.44993 3.95024 1.16669 8.00033 1.16669C12.0504 1.16669 15.3337 4.44993 15.3337 8.50002Z'
                                    fill='white'
                                  />
                                  <path
                                    d='M13.1064 12.7855C12.3645 13.6696 11.4058 14.3459 10.3241 14.7483C9.24248 15.1507 8.07488 15.2654 6.93559 15.0812C5.7963 14.897 4.72434 14.4202 3.82459 13.6974C2.92485 12.9746 2.22815 12.0307 1.80265 10.9579C1.37716 9.88511 1.23744 8.72024 1.39718 7.57726C1.55691 6.43428 2.01063 5.35234 2.71393 4.43731C3.41723 3.52227 4.34603 2.80549 5.40945 2.35709C6.47287 1.90868 7.63447 1.74402 8.78062 1.87921L7.99968 8.49998L13.1064 12.7855Z'
                                    fill='#030303'
                                  />
                                </svg>
                              )}
                              {isCompleted && (
                                <svg
                                  width='16'
                                  height='17'
                                  viewBox='0 0 16 17'
                                  fill='none'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <path
                                    d='M0.666992 8.50002C0.666992 4.44993 3.95024 1.16669 8.00033 1.16669C12.0504 1.16669 15.3337 4.44993 15.3337 8.50002C15.3337 12.5501 12.0504 15.8334 8.00033 15.8334C3.95024 15.8334 0.666992 12.5501 0.666992 8.50002Z'
                                    fill='white'
                                  />
                                  <path
                                    fillRule='evenodd'
                                    clipRule='evenodd'
                                    d='M11.5448 5.76964C11.672 5.88626 11.6806 6.08394 11.564 6.21117L6.98069 11.2112C6.92309 11.274 6.84233 11.3106 6.75711 11.3124C6.6719 11.3143 6.58962 11.2812 6.52935 11.221L4.44602 9.13764C4.32398 9.0156 4.32398 8.81774 4.44602 8.6957C4.56806 8.57366 4.76592 8.57366 4.88796 8.6957L6.74051 10.5482L11.1033 5.78884C11.2199 5.66161 11.4176 5.65302 11.5448 5.76964Z'
                                    fill='#030303'
                                    stroke='#030303'
                                    strokeWidth='0.833333'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                  />
                                </svg>
                              )}
                              {!isActive && !isCompleted && (
                                <div className='h-4 w-4 rounded-full border-2 border-zinc-400' />
                              )}
                            </div>
                          </div>
                        </TabsTrigger>
                      );
                    })}
                </TabsList>
                {steps.collaboration?.isCompleted && (
                  <Button
                    onClick={() => navigateToStep('review')}
                    className='bg-primary/10 text-primary hover:bg-primary/20 flex h-[50px] items-center gap-2 rounded-none border-l border-gray-900'
                  >
                    Review
                    <ArrowUpRight className='h-5 w-5' />
                  </Button>
                )}
                <Button
                  onClick={handlePreview}
                  className='bg-active-bg text-primary flex h-[50px] items-center gap-2 rounded-none border-l border-gray-900'
                >
                  Preview Hackathon
                  <ArrowUpRight className='h-5 w-5' />
                </Button>
              </div>
              <ScrollBar orientation='horizontal' className='h-px' />
            </ScrollArea>
          </div>
        </div>

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
              onContinue={() => navigateToStep('rewards')}
              onSave={saveParticipationStep}
              initialData={stepData.participation}
              isLoading={loadingStates.participation}
            />
          </TabsContent>

          <TabsContent value='rewards' className='mt-0'>
            <RewardsTab
              onContinue={() => navigateToStep('judging')}
              onSave={saveRewardsStep}
              initialData={stepData.rewards}
              isLoading={loadingStates.rewards}
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
            <ReviewTab
              allData={stepData}
              onEdit={handleEditTab}
              onPublish={handlePublish}
              onSaveDraft={handleSaveDraft}
              isLoading={loadingStates.review}
              isSavingDraft={isSavingDraft}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
