'use client';

import { useMutation } from '@tanstack/react-query';

import { apiClient, unwrapData } from '@/lib/api';

import type { ClarifyHackathonDraftResult } from '../types';

/**
 * Adaptive clarify gate for the hackathon generate dialog. New endpoint
 * (OrganizationHackathonsAiController `draft/clarify`) not yet in the generated
 * `paths`, so it goes through a narrow loosely-typed view of `apiClient` until
 * `npm run codegen` runs against the updated backend.
 */
type LooseApiClient = {
  POST: (
    path: string,
    init: { params: { path: Record<string, string> }; body?: unknown }
  ) => Promise<{ data?: unknown; error?: unknown; response: Response }>;
};

const loose = apiClient as unknown as LooseApiClient;

export function useClarifyDraft(organizationId: string) {
  return useMutation({
    mutationFn: async (brief: string): Promise<ClarifyHackathonDraftResult> =>
      unwrapData(
        await loose.POST(
          '/api/organizations/{organizationId}/hackathons/draft/clarify',
          { params: { path: { organizationId } }, body: { brief } }
        )
      ) as ClarifyHackathonDraftResult,
  });
}
