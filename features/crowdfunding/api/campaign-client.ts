/**
 * Crowdfunding campaign imperative client.
 * Uses the typed openapi-fetch client so path params are validated at compile time.
 * Do not use the legacy axios `api` here.
 */
import { apiClient, unwrapData, getResponseMeta } from '@/lib/api/client';

import type {
  CrowdfundingCampaign,
  PaginatedCampaigns,
  CampaignListFilters,
  ContributeV2Body,
  PublishCampaignBody,
  EscrowOpResult,
} from '../types';

// ── Queries ───────────────────────────────────────────────────────────────────

export const fetchCampaigns = async (
  page = 1,
  limit = 10,
  filters?: CampaignListFilters
): Promise<PaginatedCampaigns> => {
  // Schema codegen marks several fields as required when they are in practice optional.
  // Cast to `never` on the params so openapi-fetch accepts our partial object.
  const result = await apiClient.GET('/api/crowdfunding', {
    params: {
      query: {
        page,
        limit,
        sortBy: filters?.sortBy ?? 'createdAt',
        sortOrder: filters?.sortOrder ?? 'desc',
        ...(filters?.category ? { category: filters.category } : {}),
        ...(filters?.status ? { status: filters.status as never } : {}),
        ...(filters?.search ? { search: filters.search } : {}),
      } as never,
    },
  });
  const raw = unwrapData(result) as unknown as {
    data?: CrowdfundingCampaign[];
    campaigns?: CrowdfundingCampaign[];
    pagination?: PaginatedCampaigns['pagination'];
  };
  return {
    data: raw.data ?? raw.campaigns ?? [],
    pagination: raw.pagination ?? { page, limit, total: 0, totalPages: 1 },
  };
};

export const fetchMyCampaigns = async (
  page = 1,
  limit = 10,
  filters?: CampaignListFilters
): Promise<PaginatedCampaigns> => {
  // Schema codegen marks several fields as required when they are in practice optional.
  const result = await apiClient.GET('/api/crowdfunding/me', {
    params: {
      query: {
        page,
        limit,
        ...(filters?.category ? { category: filters.category } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.search ? { search: filters.search } : {}),
        ...(filters?.sortBy ? { sortBy: filters.sortBy } : {}),
        ...(filters?.sortOrder ? { sortOrder: filters.sortOrder } : {}),
      } as never,
    },
  });
  const inner = unwrapData(result) as unknown as {
    data?: CrowdfundingCampaign[];
  };
  const meta = getResponseMeta(result.response);
  return {
    data: inner.data ?? [],
    pagination: meta?.pagination ?? { page, limit, total: 0, totalPages: 1 },
  };
};

export const fetchCampaignBySlug = async (
  slug: string
): Promise<CrowdfundingCampaign> =>
  unwrapData(
    await apiClient.GET('/api/crowdfunding/s/{slug}', {
      params: { path: { slug } },
    })
  ) as unknown as CrowdfundingCampaign;

export const fetchCampaignById = async (
  id: string
): Promise<CrowdfundingCampaign> =>
  unwrapData(
    await apiClient.GET('/api/crowdfunding/{id}', {
      params: { path: { id } },
    })
  ) as unknown as CrowdfundingCampaign;

// ── Builder v2 mutations ──────────────────────────────────────────────────────

export const submitForReview = async (id: string): Promise<void> => {
  unwrapData(
    await apiClient.POST(
      '/api/crowdfunding/campaigns/{id}/v2/submit-for-review',
      {
        params: { path: { id } },
      }
    )
  );
};

export const withdrawSubmission = async (id: string): Promise<void> => {
  unwrapData(
    await apiClient.POST(
      '/api/crowdfunding/campaigns/{id}/v2/withdraw-submission',
      {
        params: { path: { id } },
      }
    )
  );
};

export const reviseAndResubmit = async (id: string): Promise<void> => {
  unwrapData(
    await apiClient.POST(
      '/api/crowdfunding/campaigns/{id}/v2/revise-and-resubmit',
      {
        params: { path: { id } },
      }
    )
  );
};

/**
 * Launch a VOTE_PASSED campaign on-chain (create the escrow). The builder uses
 * the managed (Boundless) wallet, so the backend signs + submits; the campaign
 * moves to PUBLISHING and the subscriber flips it to FUNDING on settle.
 */
export const publishCampaign = async (
  id: string,
  body: PublishCampaignBody
): Promise<EscrowOpResult> =>
  unwrapData(
    await apiClient.POST('/api/crowdfunding/campaigns/{id}/v2/escrow/publish', {
      params: { path: { id } },
      body: body as never,
    })
  ) as unknown as EscrowOpResult;

// ── Backer mutations ──────────────────────────────────────────────────────────

/**
 * Start a contribution. BOUNDLESS returns a settled/submitted op (backend
 * managed-signs). EXTERNAL returns the op with `unsignedXdr` for the connected
 * wallet to sign, then submit via submitSignedContribution.
 */
export const contributeV2 = async (
  id: string,
  body: ContributeV2Body
): Promise<EscrowOpResult> =>
  unwrapData(
    await apiClient.POST(
      '/api/crowdfunding/campaigns/{id}/v2/escrow/contribute',
      {
        params: { path: { id } },
        body: body as never,
      }
    )
  ) as unknown as EscrowOpResult;

/** Submit a wallet-signed contribution XDR (EXTERNAL path). */
export const submitSignedContribution = async (
  id: string,
  opRowId: string,
  signedXdr: string
): Promise<EscrowOpResult> =>
  unwrapData(
    await apiClient.POST(
      '/api/crowdfunding/campaigns/{id}/v2/escrow/ops/{opRowId}/submit-signed',
      { params: { path: { id, opRowId } }, body: { signedXdr } as never }
    )
  ) as unknown as EscrowOpResult;

/** Poll a contribution escrow op's state. */
export const getContributionOp = async (
  id: string,
  opRowId: string
): Promise<EscrowOpResult> =>
  unwrapData(
    await apiClient.GET(
      '/api/crowdfunding/campaigns/{id}/v2/escrow/ops/{opRowId}',
      { params: { path: { id, opRowId } } }
    )
  ) as unknown as EscrowOpResult;

// ── Voting ────────────────────────────────────────────────────────────────────

export const castVote = async (
  id: string,
  choice: 'UP' | 'DOWN'
): Promise<unknown> =>
  unwrapData(
    await apiClient.POST('/api/crowdfunding/campaigns/{id}/v2/vote', {
      params: { path: { id } },
      body: { choice } as never,
    })
  );

export const fetchMyVote = async (id: string): Promise<unknown> =>
  unwrapData(
    await apiClient.GET('/api/crowdfunding/campaigns/{id}/v2/vote/me', {
      params: { path: { id } },
    })
  );
