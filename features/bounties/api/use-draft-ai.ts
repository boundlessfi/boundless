'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  clarifyBountyDraft,
  generateBountyDraftFromBrief,
  regenerateBountyDraftSection,
} from './draft-ai-client';
import type {
  ClarifyBountyDraftResult,
  GenerateBountyDraftFromBriefBody,
  GenerateBountyDraftFromBriefResponse,
  RegenerateBountyDraftSectionBody,
  RegenerateBountyDraftSectionResponse,
} from '../types';
import { bountyKeys } from './keys';

/** Organizer Assist: adaptive clarify gate before drafting a bounty. */
export function useClarifyBountyDraft(organizationId: string) {
  return useMutation({
    mutationFn: (brief: string): Promise<ClarifyBountyDraftResult> =>
      clarifyBountyDraft(organizationId, brief),
  });
}

/**
 * Organizer Assist: generate a bounty draft from a brief. The backend calls the
 * AI service, creates + pre-fills a real draft (scope, mode, submission, reward),
 * persists the server-owned suggestion, and returns the draft. We seed the draft
 * cache so navigating into the wizard resumes it without a refetch flicker.
 */
export function useGenerateBountyDraftFromBrief(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      body: GenerateBountyDraftFromBriefBody
    ): Promise<GenerateBountyDraftFromBriefResponse> =>
      generateBountyDraftFromBrief(organizationId, body),
    onSuccess: result => {
      queryClient.setQueryData(
        bountyKeys.draft(organizationId, result.draftId),
        result.draft
      );
      queryClient.invalidateQueries({
        queryKey: bountyKeys.drafts(organizationId),
      });
    },
  });
}

/**
 * Organizer Assist: regenerate one section of an AI-generated draft. The server
 * owns the suggestion + generationId (persisted on the draft), so the client only
 * names the section plus optional steering. The response carries the regenerated
 * values already in the wizard section shape. The draft cache is invalidated so a
 * resume reflects the persisted change.
 */
export function useRegenerateBountyDraftSection(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      draftId,
      body,
    }: {
      draftId: string;
      body: RegenerateBountyDraftSectionBody;
    }): Promise<RegenerateBountyDraftSectionResponse> =>
      regenerateBountyDraftSection(organizationId, draftId, body),
    onSuccess: (_result, { draftId }) => {
      queryClient.invalidateQueries({
        queryKey: bountyKeys.draft(organizationId, draftId),
      });
    },
  });
}
