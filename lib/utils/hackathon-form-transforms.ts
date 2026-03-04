import {
  HackathonCategory,
  ParticipantType,
  VenueType,
  type CreateDraftRequest,
  type PublishHackathonRequest,
  type HackathonDraft,
  type HackathonResources,
} from '@/lib/api/hackathons';
import { InfoFormData } from '@/components/organization/hackathons/new/tabs/schemas/infoSchema';
import { TimelineFormData } from '@/components/organization/hackathons/new/tabs/schemas/timelineSchema';
import { ParticipantFormData } from '@/components/organization/hackathons/new/tabs/schemas/participantSchema';
import { RewardsFormData } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import { ResourcesFormData } from '@/components/organization/hackathons/new/tabs/schemas/resourcesSchema';
import { JudgingFormData } from '@/components/organization/hackathons/new/tabs/schemas/judgingSchema';
import { CollaborationFormData } from '@/components/organization/hackathons/new/tabs/schemas/collaborationSchema';

export const transformToApiFormat = (stepData: {
  information?: InfoFormData;
  timeline?: TimelineFormData;
  participation?: ParticipantFormData;
  rewards?: RewardsFormData;
  resources?: ResourcesFormData;
  judging?: JudgingFormData;
  collaboration?: CollaborationFormData;
}): CreateDraftRequest | PublishHackathonRequest => {
  const info = stepData.information;
  const timeline = stepData.timeline;
  const participation = stepData.participation;
  const rewards = stepData.rewards;
  const resources = stepData.resources;
  const judging = stepData.judging;
  const collaboration = stepData.collaboration;

  // Convert form categories array to API format
  const categoriesArray: HackathonCategory[] = Array.isArray(info?.categories)
    ? (info.categories as HackathonCategory[]).filter(cat =>
        Object.values(HackathonCategory).includes(cat)
      )
    : [];

  return {
    information: {
      name: info?.name || '',
      banner: info?.banner || '',
      description: info?.description || '',
      tagline: info?.tagline || '',
      slug: info?.slug || '',
      // Send categories array (new format, recommended)
      categories:
        categoriesArray.length > 0
          ? categoriesArray
          : [HackathonCategory.OTHER],
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
      timezone: timeline?.timezone || 'UTC',
      ...(timeline?.registrationDeadline
        ? { registrationDeadline: timeline.registrationDeadline.toISOString() }
        : {}),
      ...(timeline?.judgingDeadline
        ? { judgingDeadline: timeline.judgingDeadline.toISOString() }
        : {}),
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
      ...(participation?.maxParticipants
        ? { maxParticipants: participation.maxParticipants }
        : {}),
      submissionRequirements: {
        requireGithub: participation?.require_github,
        requireDemoVideo: participation?.require_demo_video,
        requireOtherLinks: participation?.require_other_links,
      },
      tabVisibility: {
        detailsTab: participation?.detailsTab,
        participantsTab: participation?.participantsTab,
        resourcesTab: participation?.resourcesTab,
        submissionTab: participation?.submissionTab,
        announcementsTab: participation?.announcementsTab,
        discussionTab: participation?.discussionTab,
        winnersTab: participation?.winnersTab,
        sponsorsTab: participation?.sponsorsTab,
        joinATeamTab: participation?.joinATeamTab,
        rulesTab: participation?.rulesTab,
      },
    },
    rewards: {
      prizeTiers:
        rewards?.prizeTiers?.map(tier => ({
          place: tier.place,
          prizeAmount: tier.prizeAmount || '0',
          currency: tier.currency || 'USDC',
          description: tier.description || '',
          passMark: tier.passMark || 0,
        })) || [],
    },
    resources: {
      resources:
        resources?.resources?.map(resource => ({
          link: resource.link || undefined,
          description: resource.description,
          fileUrl: resource.file?.url || undefined,
          fileName: resource.file?.name || undefined,
        })) || [],
    } as HackathonResources,
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
        collaboration?.sponsorsPartners
          ?.filter(sp => sp.name) // Filter out sponsors without names
          .map(sp => ({
            sponsorName: sp.name || '',
            sponsorLogo: sp.logo || '',
            partnerLink: sp.link || '',
          })) || [],
    },
  };
};

export const transformFromApiFormat = (draft: HackathonDraft) => {
  const info = draft.data?.information;
  const timeline = draft.data?.timeline;
  const participation = draft.data?.participation;
  const rewards = draft.data?.rewards;
  const resources = draft.data?.resources;
  const judging = draft.data?.judging;
  const collaboration = draft.data?.collaboration;

  // Handle categories array
  const categoriesArray: string[] = info?.categories ? info.categories : [];

  return {
    information: {
      name: info?.name || '',
      banner: info?.banner || '',
      description: info?.description || '',
      tagline: info?.tagline || '',
      categories: categoriesArray,
      venueType: info?.venue?.type || 'virtual',
      country: info?.venue?.country || '',
      state: info?.venue?.state || '',
      city: info?.venue?.city || '',
      venueName: info?.venue?.venueName || '',
      venueAddress: info?.venue?.venueAddress || '',
    } as InfoFormData,
    timeline: {
      startDate: timeline?.startDate ? new Date(timeline.startDate) : undefined,
      submissionDeadline: timeline?.submissionDeadline
        ? new Date(timeline.submissionDeadline)
        : undefined,
      timezone: timeline?.timezone || 'UTC',
      registrationDeadline: timeline?.registrationDeadline
        ? new Date(timeline.registrationDeadline)
        : undefined,
      judgingDeadline: timeline?.judgingDeadline
        ? new Date(timeline.judgingDeadline)
        : undefined,
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
      maxParticipants: participation?.maxParticipants,
      require_github:
        participation?.submissionRequirements?.requireGithub || false,
      require_demo_video:
        participation?.submissionRequirements?.requireDemoVideo || false,
      require_other_links:
        participation?.submissionRequirements?.requireOtherLinks || false,
      detailsTab: participation?.tabVisibility?.detailsTab || true,
      participantsTab: participation?.tabVisibility?.participantsTab || true,
      resourcesTab: participation?.tabVisibility?.resourcesTab || true,
      submissionTab: participation?.tabVisibility?.submissionTab || true,
      announcementsTab: participation?.tabVisibility?.announcementsTab || true,
      discussionTab: participation?.tabVisibility?.discussionTab || true,
      winnersTab: participation?.tabVisibility?.winnersTab || true,
      sponsorsTab: participation?.tabVisibility?.sponsorsTab || true,
      joinATeamTab: participation?.tabVisibility?.joinATeamTab || true,
      rulesTab: participation?.tabVisibility?.rulesTab || true,
    } as ParticipantFormData,
    rewards: {
      prizeTiers:
        rewards?.prizeTiers?.map((tier, index) => {
          const defaultPassMarks = [80, 70, 50, 40, 30];
          const passMark =
            tier.passMark != null && tier.passMark >= 0 && tier.passMark <= 100
              ? tier.passMark
              : (defaultPassMarks[index] ?? 50);
          return {
            id: tier.id ?? `tier-${index}`,
            place:
              tier.place ||
              `${index + 1}${['st', 'nd', 'rd'][index] ?? 'th'} Place`,
            prizeAmount: tier.prizeAmount ?? '0',
            currency: tier.currency || 'USDC',
            description: tier.description || '',
            rank: index + 1,
            passMark,
          };
        }) || [],
    } as RewardsFormData,
    resources: {
      resources:
        resources?.resources?.map((resource, index) => ({
          id: `resource-${index}`,
          link: resource.link || '',
          description: resource.description || '',
          file: resource.file?.url
            ? {
                url: resource.file?.url || '',
                name: resource.file?.name || '',
              }
            : undefined,
        })) || [],
    } as ResourcesFormData,
    judging: {
      criteria:
        judging?.criteria?.map((criterion, index) => {
          const c = criterion as {
            title?: string;
            name?: string;
            weight?: number;
            description?: string;
          };
          const titleOrName = (c.title ?? c.name ?? '').trim();
          return {
            id: `criterion-${index}`,
            name: titleOrName || `Criterion ${index + 1}`,
            weight: typeof criterion.weight === 'number' ? criterion.weight : 0,
            description: criterion.description || '',
          };
        }) || [],
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
