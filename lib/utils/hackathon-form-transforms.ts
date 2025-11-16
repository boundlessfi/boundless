import {
  HackathonCategory,
  ParticipantType,
  VenueType,
  type CreateDraftRequest,
  type PublishHackathonRequest,
  type HackathonDraft,
} from '@/lib/api/hackathons';
import { InfoFormData } from '@/components/organization/hackathons/new/tabs/schemas/infoSchema';
import { TimelineFormData } from '@/components/organization/hackathons/new/tabs/schemas/timelineSchema';
import { ParticipantFormData } from '@/components/organization/hackathons/new/tabs/schemas/participantSchema';
import { RewardsFormData } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import { JudgingFormData } from '@/components/organization/hackathons/new/tabs/schemas/judgingSchema';
import { CollaborationFormData } from '@/components/organization/hackathons/new/tabs/schemas/collaborationSchema';

export const transformToApiFormat = (stepData: {
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

  // Convert form categories array to API format
  const categoriesArray: HackathonCategory[] = Array.isArray(info?.categories)
    ? (info.categories as HackathonCategory[]).filter(cat =>
        Object.values(HackathonCategory).includes(cat)
      )
    : [];

  return {
    information: {
      title: info?.name || '',
      banner: info?.banner || '',
      description: info?.description || '',
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
  const info = draft.information;
  const timeline = draft.timeline;
  const participation = draft.participation;
  const rewards = draft.rewards;
  const judging = draft.judging;
  const collaboration = draft.collaboration;

  // Handle categories array
  const categoriesArray: string[] = info?.categories ? info.categories : [];

  return {
    information: {
      name: info?.title || '',
      banner: info?.banner || '',
      description: info?.description || '',
      categories: categoriesArray,
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
