import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  BountyFormData,
  STEP_ORDER,
  isBountyStepDataValid,
  type StepKey,
} from '@/components/organization/bounties/new/constants';
import {
  DRAFT_SECTIONS,
  useCreateDraft,
  useDraft,
  useUpdateDraft,
  type BountyDraft,
  type UpdateBountyDraftBody,
} from '@/features/bounties';

/** A `datetime-local` input wants `YYYY-MM-DDTHH:mm`; trim an ISO string to it. */
const toLocalInput = (iso: string | null | undefined): string =>
  iso ? iso.slice(0, 16) : '';

/**
 * Hydrate the wizard form state from a saved draft. The backend returns each
 * section flat under `draft.data` (the generated BountyDraftData shape), so most
 * fields read directly. `mode.winnerCount` is UI-only and derived from the
 * number of prize tiers; dates are trimmed for the datetime-local inputs.
 */
export const transformBountyFromApi = (draft: BountyDraft): BountyFormData => {
  const scope = draft.data?.scope;
  const mode = draft.data?.mode;
  const submission = draft.data?.submission;
  const reward = draft.data?.reward;
  // `resources` is read via a cast until `npm run codegen` runs against the
  // updated backend (the generated BountyDraftData picks it up then).
  const resources = (
    draft.data as { resources?: BountyFormData['resources'] } | undefined
  )?.resources;

  const winnerCount = reward?.prizeTiers?.length || 1;

  // category/country are read via a cast until `npm run codegen` runs against
  // the updated backend (the generated BountyScopeSection picks them up then).
  const scopeExtra = scope as
    | {
        category?: NonNullable<BountyFormData['scope']>['category'];
        country?: string | null;
      }
    | undefined;

  return {
    scope: scope
      ? ({
          title: scope.title,
          description: scope.description,
          category: scopeExtra?.category ?? undefined,
          country: scopeExtra?.country ?? null,
          githubIssueUrl: scope.githubIssueUrl ?? null,
          projectId: scope.projectId ?? null,
          bountyWindowId: scope.bountyWindowId ?? null,
        } as NonNullable<BountyFormData['scope']>)
      : undefined,
    mode:
      mode?.entryType && mode?.claimType
        ? {
            entryType: mode.entryType,
            claimType: mode.claimType,
            winnerCount,
          }
        : undefined,
    submission: submission
      ? {
          ...submission,
          submissionDeadline: toLocalInput(submission.submissionDeadline),
          applicationWindowCloseAt: submission.applicationWindowCloseAt
            ? toLocalInput(submission.applicationWindowCloseAt)
            : null,
          // Required by the form; the mode forces it when unset on the draft.
          submissionVisibility:
            submission.submissionVisibility ??
            (mode?.claimType === 'COMPETITION'
              ? 'HIDDEN_UNTIL_DEADLINE'
              : 'ORGANIZER_ONLY'),
        }
      : undefined,
    reward: reward ? { ...reward } : undefined,
    resources:
      resources && Array.isArray(resources.resources)
        ? { resources: resources.resources }
        : undefined,
  };
};

type SectionValue = NonNullable<BountyFormData[keyof BountyFormData]>;

interface UseBountyDraftProps {
  organizationId?: string;
  initialDraftId?: string;
  onDraftLoaded?: (
    formData: BountyFormData,
    firstIncompleteStep: StepKey
  ) => void;
}

/**
 * Wizard draft orchestration on React Query, mirroring useHackathonDraft. Loads
 * an existing draft (resume) via `useDraft`, creates on first save via
 * `useCreateDraft` (lazy `ensureDraftId`), and persists sections through the
 * single flat `useUpdateDraft` PATCH. Server state lives in the query cache;
 * only the in-progress form snapshot is local.
 */
export const useBountyDraft = ({
  organizationId,
  initialDraftId,
  onDraftLoaded,
}: UseBountyDraftProps) => {
  const [draftId, setDraftId] = useState<string | null>(initialDraftId || null);
  const [stepData, setStepData] = useState<BountyFormData>({});
  const loadedRef = useRef<string | null>(null);

  const orgId = organizationId ?? '';
  // Only fetch for the resume flow (an initial draft id). Fresh drafts keep
  // their form state locally until the first save.
  const draftQuery = useDraft(orgId, initialDraftId);
  const createDraft = useCreateDraft(orgId);
  const updateDraft = useUpdateDraft(orgId);

  useEffect(() => {
    const draft = draftQuery.data;
    if (!draft || !initialDraftId || draft.id !== initialDraftId) return;
    if (loadedRef.current === draft.id) return;
    loadedRef.current = draft.id;

    const formData = transformBountyFromApi(draft);
    setStepData(formData);
    if (!draftId) setDraftId(draft.id);

    const firstIncompleteStep =
      STEP_ORDER.find(key => !isBountyStepDataValid(key, formData)) ?? 'review';
    onDraftLoaded?.(formData, firstIncompleteStep);
  }, [draftQuery.data, initialDraftId, draftId, onDraftLoaded]);

  /** Resolve the draft id, creating an empty draft on first use. */
  const ensureDraftId = async (): Promise<string> => {
    if (draftId) return draftId;
    const draft = await createDraft.mutateAsync();
    setDraftId(draft.id);
    return draft.id;
  };

  const saveDraft = async () => {
    if (!organizationId) {
      toast.error('Organization ID is required');
      return;
    }
    try {
      const id = await ensureDraftId();
      const body: Record<string, unknown> = {};
      for (const section of DRAFT_SECTIONS) {
        const value = stepData[section];
        if (value !== undefined) body[section] = value;
      }
      if (Object.keys(body).length > 0) {
        await updateDraft.mutateAsync({
          id,
          body: body as UpdateBountyDraftBody,
        });
      }
      toast.success('Draft saved successfully');
    } catch {
      toast.error('Failed to save draft');
      throw new Error('Failed to save draft');
    }
  };

  /**
   * Persist every provided section in a single PATCH and replace the local
   * snapshot. Used by the dev-only "Fill with mock" tool to populate the whole
   * wizard at once.
   */
  const saveAllSections = async (data: BountyFormData) => {
    if (!organizationId) {
      toast.error('Organization ID is required');
      return;
    }
    const id = await ensureDraftId();
    const body: Record<string, unknown> = {};
    for (const section of DRAFT_SECTIONS) {
      const value = data[section];
      if (value !== undefined) body[section] = value;
    }
    if (Object.keys(body).length > 0) {
      await updateDraft.mutateAsync({
        id,
        body: body as UpdateBountyDraftBody,
      });
    }
    setStepData(data);
  };

  /**
   * Persist one section. `data` is the section's form snapshot; extra UI-only
   * fields (e.g. mode.winnerCount) are stripped by the backend Zod section
   * schema, so we can send the form value as-is.
   */
  const saveStep = async (stepKey: StepKey, data: SectionValue) => {
    if (!organizationId) {
      toast.error('Organization ID is required');
      return;
    }
    const id = await ensureDraftId();
    await updateDraft.mutateAsync({
      id,
      body: { [stepKey]: data } as unknown as UpdateBountyDraftBody,
    });
    const updated = { ...stepData, [stepKey]: data };
    setStepData(updated);
    return updated;
  };

  return {
    draftId,
    /** Server status ('draft' | 'draft_awaiting_funding'); undefined for an unsaved /new draft. */
    draftStatus: draftQuery.data?.status,
    stepData,
    setStepData,
    isLoadingDraft: Boolean(initialDraftId) && draftQuery.isLoading,
    currentError:
      initialDraftId && draftQuery.error
        ? draftQuery.error.message || 'Failed to load draft'
        : null,
    isSavingDraft: createDraft.isPending || updateDraft.isPending,
    saveDraft,
    saveStep,
    saveAllSections,
  };
};
