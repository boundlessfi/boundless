import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useHackathons } from '@/hooks/use-hackathons';
import {
  transformFromApiFormat,
  transformToApiFormat,
} from '@/lib/utils/hackathon-form-transforms';
import type { InfoFormData } from '@/components/organization/hackathons/new/tabs/schemas/infoSchema';
import type { TimelineFormData } from '@/components/organization/hackathons/new/tabs/schemas/timelineSchema';
import type { ParticipantFormData } from '@/components/organization/hackathons/new/tabs/schemas/participantSchema';
import type { RewardsFormData } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import type { JudgingFormData } from '@/components/organization/hackathons/new/tabs/schemas/judgingSchema';
import type { CollaborationFormData } from '@/components/organization/hackathons/new/tabs/schemas/collaborationSchema';
import type { StepKey } from '@/components/organization/hackathons/new/constants';
import { STEP_ORDER } from '@/components/organization/hackathons/new/constants';
import { isStepSavedInDraft } from '@/lib/utils/hackathon-step-validation';

interface StepData {
  information?: InfoFormData;
  timeline?: TimelineFormData;
  participation?: ParticipantFormData;
  rewards?: RewardsFormData;
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
    createDraftAction,
    updateDraftAction,
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
      currentDraft._id === initialDraftId &&
      draftInitializedRef.current !== currentDraft._id
    ) {
      try {
        const formData = transformFromApiFormat(currentDraft);
        setStepData(formData);

        // Find the first incomplete step by checking the original draft object
        // This is more reliable than checking transformed data since transformFromApiFormat
        // always returns objects with default values
        const firstIncompleteStep =
          STEP_ORDER.find(step => {
            if (step === 'review') return false; // Review is not a data step
            return !isStepSavedInDraft(step, currentDraft);
          }) || ('information' as StepKey);

        draftInitializedRef.current = currentDraft._id;

        if (onDraftLoaded) {
          onDraftLoaded(formData, firstIncompleteStep);
        }
      } catch {
        toast.error('Failed to load draft data');
      }
    }
  }, [currentDraft, initialDraftId, onDraftLoaded]);

  const saveDraft = async () => {
    if (!organizationId) {
      toast.error('Organization ID is required');
      return;
    }

    setIsSavingDraft(true);
    try {
      const apiData = transformToApiFormat(stepData);

      if (draftId) {
        await updateDraftAction(draftId, apiData);
        toast.success('Draft saved successfully');
      } else {
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

  const saveStep = async (
    stepKey: StepKey,
    data:
      | InfoFormData
      | TimelineFormData
      | ParticipantFormData
      | RewardsFormData
      | JudgingFormData
      | CollaborationFormData
  ) => {
    if (!organizationId) {
      toast.error('Organization ID is required');
      return;
    }

    const updatedStepData = { ...stepData, [stepKey]: data };
    const apiData = transformToApiFormat(updatedStepData);

    if (draftId) {
      await updateDraftAction(draftId, {
        [stepKey]: apiData[stepKey as keyof typeof apiData],
      });
    } else {
      const draft = await createDraftAction({
        [stepKey]: apiData[stepKey as keyof typeof apiData],
      });
      setDraftId(draft._id);
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
