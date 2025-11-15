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

  // Convert form category array to API format
  const categoriesArray: HackathonCategory[] = Array.isArray(info?.category)
    ? (info.category as HackathonCategory[]).filter(cat =>
        Object.values(HackathonCategory).includes(cat)
      )
    : info?.category && typeof info.category === 'string'
      ? [info.category as HackathonCategory]
      : [];

  return {
    information: {
      title: info?.name || '',
      banner: info?.banner || '',
      description: info?.description || '',
      // Send categories array (new format, recommended)
      categories:
        categoriesArray.length > 0
          ? categoriesArray
          : [HackathonCategory.OTHER],
      // Also include legacy category for backward compatibility (first category)
      category:
        categoriesArray.length > 0
          ? categoriesArray[0]
          : HackathonCategory.OTHER,
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

export const transformFromApiFormat = (draft: HackathonDraft) => {
  const info = draft.information;
  const timeline = draft.timeline;
  const participation = draft.participation;
  const rewards = draft.rewards;
  const judging = draft.judging;
  const collaboration = draft.collaboration;

  // Handle both new format (categories array) and legacy format (category string)
  const categoriesArray: string[] = info?.categories
    ? info.categories
    : info?.category
      ? [info.category]
      : [];

  return {
    information: {
      name: info?.title || '',
      banner: info?.banner || '',
      description: info?.description || '',
      category: categoriesArray,
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
