/**
 * Organizer Assist (AI) bounty draft calls. Backs the React Query hooks in
 * use-draft-ai.ts.
 *
 * These two endpoints are new (boundless-nestjs OrganizationBountiesAiController)
 * and are not yet in the generated OpenAPI `paths`, so the call goes through a
 * narrow loosely-typed view of `apiClient` until `npm run codegen` runs against
 * the updated backend. `unwrapData` keeps the `ApiError` semantics the dialogs
 * rely on (503 busy / 429 quota / field errors).
 */
import { apiClient, unwrapData } from '@/lib/api';

import type {
  ClarifyBountyDraftResult,
  GenerateBountyDraftFromBriefBody,
  GenerateBountyDraftFromBriefResponse,
  RegenerateBountyDraftSectionBody,
  RegenerateBountyDraftSectionResponse,
} from '../types';

/** Loose view of apiClient.POST for paths not yet in the generated schema. */
type LooseApiClient = {
  POST: (
    path: string,
    init: {
      params: { path: Record<string, string> };
      body?: unknown;
    }
  ) => Promise<{ data?: unknown; error?: unknown; response: Response }>;
};

const loose = apiClient as unknown as LooseApiClient;

/** Generate a full bounty draft from a brief; returns the created draft + meta. */
export const generateBountyDraftFromBrief = async (
  organizationId: string,
  body: GenerateBountyDraftFromBriefBody
): Promise<GenerateBountyDraftFromBriefResponse> =>
  unwrapData(
    await loose.POST(
      '/api/organizations/{organizationId}/bounties/draft/from-brief',
      { params: { path: { organizationId } }, body }
    )
  ) as GenerateBountyDraftFromBriefResponse;

/** Adaptive clarify gate: triage a brief for follow-up questions before drafting. */
export const clarifyBountyDraft = async (
  organizationId: string,
  brief: string
): Promise<ClarifyBountyDraftResult> =>
  unwrapData(
    await loose.POST(
      '/api/organizations/{organizationId}/bounties/draft/clarify',
      { params: { path: { organizationId } }, body: { brief } }
    )
  ) as ClarifyBountyDraftResult;

/** Regenerate a single section (description | submission | reward) of a draft. */
export const regenerateBountyDraftSection = async (
  organizationId: string,
  id: string,
  body: RegenerateBountyDraftSectionBody
): Promise<RegenerateBountyDraftSectionResponse> =>
  unwrapData(
    await loose.POST(
      '/api/organizations/{organizationId}/bounties/draft/{id}/regenerate-section',
      { params: { path: { organizationId, id } }, body }
    )
  ) as RegenerateBountyDraftSectionResponse;
