import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useHackathons } from '@/hooks/use-hackathons';
import { transformFromApiFormat } from '@/lib/utils/hackathon-form-transforms';
import type { InfoFormData } from '@/components/organization/hackathons/new/tabs/schemas/infoSchema';
import type { TimelineFormData } from '@/components/organization/hackathons/new/tabs/schemas/timelineSchema';
import type { ParticipantFormData } from '@/components/organization/hackathons/new/tabs/schemas/participantSchema';
import type { RewardsFormData } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import type { ResourcesFormData } from '@/components/organization/hackathons/new/tabs/schemas/resourcesSchema';
import type { JudgingFormData } from '@/components/organization/hackathons/new/tabs/schemas/judgingSchema';
import type { CollaborationFormData } from '@/components/organization/hackathons/new/tabs/schemas/collaborationSchema';
import {
  type StepKey,
  STEP_ORDER,
} from '@/components/organization/hackathons/new/constants';
import { isStepDataValid } from '@/lib/utils/hackathon-step-validation';

interface StepData {
  information?: InfoFormData;
  timeline?: TimelineFormData;
  participation?: ParticipantFormData;
  rewards?: RewardsFormData;
  resources?: ResourcesFormData;
  judging?: JudgingFormData;
  collaboration?: CollaborationFormData;
}

interface UseHackathonDraftProps {
  organizationId?: string;
  initialDraftId?: string;
  onDraftLoaded?: (formData: StepData, firstIncompleteStep: StepKey) => void;
}

export const useHackathonDraft = ({
  organizationId,
  initialDraftId,
  onDraftLoaded,
}: UseHackathonDraftProps) => {
  const [draftId, setDraftId] = useState<string | null>(initialDraftId || null);
  const [stepData, setStepData] = useState<StepData>({});
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const draftInitializedRef = useRef<string | null>(null);

  const {
    initializeDraftAction,
    updateDraftStepAction,
    fetchDraft,
    currentDraft,
    currentLoading,
    currentError,
  } = useHackathons({
    organizationId,
    autoFetch: false,
  });
  useEffect(() => {
    const loadDraft = async () => {
      if (!initialDraftId || !organizationId) return;

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
  }, [initialDraftId, organizationId, fetchDraft]);

  useEffect(() => {
    if (
      currentDraft &&
      initialDraftId &&
      currentDraft.id === initialDraftId &&
      draftInitializedRef.current !== currentDraft.id
    ) {
      const formData = transformFromApiFormat(currentDraft);
      setStepData(formData);
      draftInitializedRef.current = currentDraft.id;

      const firstIncompleteStep =
        STEP_ORDER.find(key => !isStepDataValid(key, formData)) ?? 'review';

      if (onDraftLoaded) {
        onDraftLoaded(formData, firstIncompleteStep);
      }
    } else if (currentDraft && currentDraft.id === initialDraftId) {
      console.log('⏭️ Draft already initialized, skipping'); // Debug
    }
  }, [currentDraft?.id, initialDraftId, onDraftLoaded]);

  const saveDraft = async () => {
    if (!organizationId) {
      toast.error('Organization ID is required');
      return;
    }

    setIsSavingDraft(true);
    try {
      if (draftId) {
        // Save all current steps to the draft
        if (stepData.information) {
          await updateDraftStepAction(
            draftId,
            'information',
            stepData.information,
            true
          );
        }
        if (stepData.timeline) {
          await updateDraftStepAction(
            draftId,
            'timeline',
            stepData.timeline,
            true
          );
        }
        if (stepData.participation) {
          await updateDraftStepAction(
            draftId,
            'participation',
            stepData.participation,
            true
          );
        }
        if (stepData.rewards) {
          await updateDraftStepAction(
            draftId,
            'rewards',
            stepData.rewards,
            true
          );
        }
        if (stepData.resources) {
          await updateDraftStepAction(
            draftId,
            'resources',
            stepData.resources,
            true
          );
        }
        if (stepData.judging) {
          await updateDraftStepAction(
            draftId,
            'judging',
            stepData.judging,
            true
          );
        }
        if (stepData.collaboration) {
          await updateDraftStepAction(
            draftId,
            'collaboration',
            stepData.collaboration,
            true
          );
        }
        toast.success('Draft saved successfully');
      } else {
        // Initialize new draft
        const draft = await initializeDraftAction(organizationId);
        setDraftId(draft.id);
        toast.success('Draft created successfully');
      }
    } catch {
      toast.error('Failed to save draft');
      throw new Error('Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const saveStep = async (
    stepKey: StepKey,
    data:
      | InfoFormData
      | TimelineFormData
      | ParticipantFormData
      | RewardsFormData
      | ResourcesFormData
      | JudgingFormData
      | CollaborationFormData
  ) => {
    if (!organizationId) {
      toast.error('Organization ID is required');
      return;
    }

    const updatedStepData = { ...stepData, [stepKey]: data };

    if (draftId) {
      // Update specific step using new API
      await updateDraftStepAction(draftId, stepKey, data, true);
    } else {
      // Initialize draft if it doesn't exist
      const draft = await initializeDraftAction(organizationId);

      setDraftId(draft.id);
      // Then update the step
      await updateDraftStepAction(draft.id, stepKey, data, true);
    }

    setStepData(updatedStepData);
    return updatedStepData;
  };

  return {
    draftId,
    stepData,
    setStepData,
    isLoadingDraft: isLoadingDraft || (initialDraftId && currentLoading),
    currentError:
      initialDraftId && currentError && !currentDraft ? currentError : null,
    isSavingDraft,
    saveDraft,
    saveStep,
  };
};
