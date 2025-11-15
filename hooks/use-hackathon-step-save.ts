import { useState } from 'react';
import { toast } from 'sonner';
import type { StepKey } from '@/components/organization/hackathons/new/constants';
import type { InfoFormData } from '@/components/organization/hackathons/new/tabs/schemas/infoSchema';
import type { TimelineFormData } from '@/components/organization/hackathons/new/tabs/schemas/timelineSchema';
import type { ParticipantFormData } from '@/components/organization/hackathons/new/tabs/schemas/participantSchema';
import type { RewardsFormData } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import type { JudgingFormData } from '@/components/organization/hackathons/new/tabs/schemas/judgingSchema';
import type { CollaborationFormData } from '@/components/organization/hackathons/new/tabs/schemas/collaborationSchema';

type StepFormData =
  | InfoFormData
  | TimelineFormData
  | ParticipantFormData
  | RewardsFormData
  | JudgingFormData
  | CollaborationFormData;

interface UseHackathonStepSaveProps {
  organizationId?: string;
  draftId: string | null;
  saveStep: (stepKey: StepKey, data: StepFormData) => Promise<unknown>;
  updateStepCompletion: (
    stepKey: StepKey,
    isCompleted: boolean,
    nextStep?: StepKey
  ) => void;
}

export const useHackathonStepSave = ({
  organizationId,
  draftId,
  saveStep,
  updateStepCompletion,
}: UseHackathonStepSaveProps) => {
  const [loadingStates, setLoadingStates] = useState<Record<StepKey, boolean>>({
    information: false,
    timeline: false,
    participation: false,
    rewards: false,
    judging: false,
    collaboration: false,
    review: false,
  });

  const createSaveHandler = (
    stepKey: StepKey,
    nextStep: StepKey,
    requiresDraft: boolean = false
  ) => {
    return async (data: StepFormData) => {
      if (!organizationId) {
        toast.error('Organization ID is required');
        return;
      }

      if (requiresDraft && !draftId) {
        toast.error('Please save previous steps first');
        return;
      }

      setLoadingStates(prev => ({ ...prev, [stepKey]: true }));
      try {
        await saveStep(stepKey, data);
        updateStepCompletion(stepKey, true, nextStep);
      } catch {
        throw new Error(`Failed to save ${stepKey} step`);
      } finally {
        setLoadingStates(prev => ({ ...prev, [stepKey]: false }));
      }
    };
  };

  return {
    loadingStates,
    saveInformationStep: createSaveHandler('information', 'timeline'),
    saveTimelineStep: createSaveHandler('timeline', 'participation', true),
    saveParticipationStep: createSaveHandler('participation', 'rewards', true),
    saveRewardsStep: createSaveHandler('rewards', 'judging', true),
    saveJudgingStep: createSaveHandler('judging', 'collaboration', true),
    saveCollaborationStep: createSaveHandler('collaboration', 'review', true),
  };
};
