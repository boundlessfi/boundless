import type { StepKey } from '@/components/organization/hackathons/new/constants';
import type { HackathonDraft } from '@/lib/api/hackathons';
import type { InfoFormData } from '@/components/organization/hackathons/new/tabs/schemas/infoSchema';
import type { TimelineFormData } from '@/components/organization/hackathons/new/tabs/schemas/timelineSchema';
import type { ParticipantFormData } from '@/components/organization/hackathons/new/tabs/schemas/participantSchema';
import type { RewardsFormData } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import type { JudgingFormData } from '@/components/organization/hackathons/new/tabs/schemas/judgingSchema';
import type { CollaborationFormData } from '@/components/organization/hackathons/new/tabs/schemas/collaborationSchema';

interface StepData {
  information?: InfoFormData;
  timeline?: TimelineFormData;
  participation?: ParticipantFormData;
  rewards?: RewardsFormData;
  judging?: JudgingFormData;
  collaboration?: CollaborationFormData;
}

/**
 * Checks if a step exists in the original draft API response
 * This is more reliable than checking transformed data since transformFromApiFormat
 * always returns objects with default values
 */
export const isStepSavedInDraft = (
  stepKey: StepKey,
  draft: HackathonDraft
): boolean => {
  switch (stepKey) {
    case 'information':
      return !!(
        draft.information &&
        draft.information.title &&
        draft.information.banner &&
        draft.information.description
      );
    case 'timeline':
      return !!(
        draft.timeline &&
        draft.timeline.startDate &&
        draft.timeline.submissionDeadline
      );
    case 'participation':
      return !!(draft.participation && draft.participation.participantType);
    case 'rewards':
      return !!(
        draft.rewards &&
        draft.rewards.prizeTiers &&
        draft.rewards.prizeTiers.length > 0
      );
    case 'judging':
      return !!(
        draft.judging &&
        draft.judging.criteria &&
        draft.judging.criteria.length > 0
      );
    case 'collaboration':
      return !!(
        draft.collaboration &&
        draft.collaboration.contactEmail &&
        draft.collaboration.contactEmail.trim() !== ''
      );
    default:
      return false;
  }
};

/**
 * Checks if a step has meaningful data in the transformed form data
 * This is a fallback when we don't have access to the original draft
 */
export const isStepDataValid = (
  stepKey: StepKey,
  formData: StepData
): boolean => {
  const stepData = formData[stepKey as keyof StepData];
  if (!stepData) return false;

  switch (stepKey) {
    case 'information': {
      const info = stepData as InfoFormData;
      // Check if required fields have actual values (not empty strings)
      return !!(
        info.name?.trim() &&
        info.banner?.trim() &&
        info.description?.trim()
      );
    }
    case 'timeline': {
      const timeline = stepData as TimelineFormData;
      // Check if required date fields exist
      return !!(
        timeline.startDate &&
        timeline.submissionDeadline &&
        timeline.endDate &&
        timeline.registrationDeadline
      );
    }
    case 'participation': {
      const participation = stepData as ParticipantFormData;
      // Participation always has a default participantType from transformFromApiFormat.
      // For team types, we can check if team constraints exist.
      // For individual type, we check if participantType exists (it always will from transform).
      // Note: This is a limitation - for accurate checking, use isStepSavedInDraft with the original draft.
      if (
        participation.participantType === 'team' ||
        participation.participantType === 'team_or_individual'
      ) {
        return !!(participation.teamMin && participation.teamMax);
      }
      // For individual, we assume it's valid if participantType exists
      // (though this may not be 100% accurate due to transform defaults)
      return !!participation.participantType;
    }
    case 'rewards': {
      const rewards = stepData as RewardsFormData;
      // Check if there's at least one prize tier with actual data
      return !!(
        rewards.prizeTiers &&
        rewards.prizeTiers.length > 0 &&
        rewards.prizeTiers.some(
          tier => tier.place?.trim() && tier.prizeAmount?.trim()
        )
      );
    }
    case 'judging': {
      const judging = stepData as JudgingFormData;
      // Check if there's at least one criterion with actual data
      return !!(
        judging.criteria &&
        judging.criteria.length > 0 &&
        judging.criteria.some(criterion => criterion.name?.trim())
      );
    }
    case 'collaboration': {
      const collaboration = stepData as CollaborationFormData;
      // Check if required contact email exists and is valid
      return !!(
        collaboration.contactEmail?.trim() &&
        collaboration.contactEmail.includes('@')
      );
    }
    default:
      return false;
  }
};
