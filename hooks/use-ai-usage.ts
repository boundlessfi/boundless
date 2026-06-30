'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient, unwrapData } from '@/lib/api';

export interface AiUsage {
  tier: string;
  limit: number | null;
  used: number;
  remaining: number | null;
  resetAt: string;
  costUsdThisMonth: string;
}

/** Loose view of apiClient.GET for the usage path (not yet in generated schema). */
type LooseApiClient = {
  GET: (
    path: string,
    init: { params: { path: Record<string, string> } }
  ) => Promise<{ data?: unknown; error?: unknown; response: Response }>;
};

const loose = apiClient as unknown as LooseApiClient;

/** The org's monthly AI usage (calls used/remaining + spend). */
export function useAiUsage(organizationId: string) {
  return useQuery({
    queryKey: ['ai-usage', organizationId],
    enabled: Boolean(organizationId),
    staleTime: 30_000,
    queryFn: async (): Promise<AiUsage> =>
      unwrapData(
        await loose.GET('/api/organizations/{organizationId}/ai/usage', {
          params: { path: { organizationId } },
        })
      ) as AiUsage,
  });
}
