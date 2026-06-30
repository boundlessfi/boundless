/**
 * Bounty escrow API client (boundless-events contract), on the typed
 * openapi-fetch client. Request/response shapes come from the backend-generated
 * schema; the response envelope is unwrapped by the apiClient middleware.
 *
 * Every action builds an EscrowOp the webapp drives through its lifecycle:
 *   PENDING_BUILD -> PENDING_SIGN -> PENDING_SUBMIT -> PENDING_CONFIRM
 *                 -> COMPLETED | FAILED | CANCELLED
 *
 *   MANAGED  : backend signs with the caller's platform-held wallet + submits;
 *              the op returns in PENDING_CONFIRM. The webapp only polls.
 *   EXTERNAL : backend returns `unsignedXdr`; the webapp signs with a connected
 *              wallet and POSTs to submit-signed, then polls.
 *
 * These are the organizer (org-scoped) operations the Configure / publish flow
 * needs. Builder-facing participant escrow (apply / submit / contribute) is out
 * of scope for the Configure epic.
 */
import { apiClient, unwrapData } from '@/lib/api';

import type {
  BountyEscrowOpResponse,
  BountyFundingOtpRequestResult,
  BountyFundingOtpVerifyResult,
  CancelBountyEscrowRequest,
  PublishBountyEscrowRequest,
  SelectBountyWinnersRequest,
  SubmitSignedXdrRequest,
} from '../types';

/** Loose view of apiClient.POST for funding-otp paths not yet in the generated schema. */
type LooseApiClient = {
  POST: (
    path: string,
    init: { params: { path: Record<string, string> }; body?: unknown }
  ) => Promise<{ data?: unknown; error?: unknown; response: Response }>;
};
const looseApi = apiClient as unknown as LooseApiClient;

/** Request a funding step-up code for a bounty (shared FundingOtpModule). */
export const requestBountyFundingOtp = async (
  organizationId: string,
  bountyId: string
): Promise<BountyFundingOtpRequestResult> =>
  unwrapData(
    await looseApi.POST(
      '/api/organizations/{organizationId}/bounties/{id}/escrow/funding-otp/request',
      { params: { path: { organizationId, id: bountyId } } }
    )
  ) as BountyFundingOtpRequestResult;

/** Return a bounty stuck in draft_awaiting_funding back to draft (failed publish recovery). */
export const resetBountyEscrowToDraft = async (
  organizationId: string,
  bountyId: string
): Promise<{ id: string; status: string }> =>
  unwrapData(
    await looseApi.POST(
      '/api/organizations/{organizationId}/bounties/{id}/escrow/reset-to-draft',
      { params: { path: { organizationId, id: bountyId } } }
    )
  ) as { id: string; status: string };

/** Verify a funding step-up code for a bounty. */
export const verifyBountyFundingOtp = async (
  organizationId: string,
  bountyId: string,
  code: string
): Promise<BountyFundingOtpVerifyResult> =>
  unwrapData(
    await looseApi.POST(
      '/api/organizations/{organizationId}/bounties/{id}/escrow/funding-otp/verify',
      { params: { path: { organizationId, id: bountyId } }, body: { code } }
    )
  ) as BountyFundingOtpVerifyResult;

/** Publish a bounty draft to the events contract (CREATE_EVENT). */
export const publishBountyEscrow = async (
  organizationId: string,
  bountyId: string,
  body: PublishBountyEscrowRequest
): Promise<BountyEscrowOpResponse> =>
  unwrapData(
    await apiClient.POST(
      '/api/organizations/{organizationId}/bounties/{id}/escrow/publish',
      { params: { path: { organizationId, id: bountyId } }, body }
    )
  );

/** Cancel an active bounty and refund contributors + owner. */
export const cancelBountyEscrow = async (
  organizationId: string,
  bountyId: string,
  body: CancelBountyEscrowRequest
): Promise<BountyEscrowOpResponse> =>
  unwrapData(
    await apiClient.POST(
      '/api/organizations/{organizationId}/bounties/{id}/escrow/cancel',
      { params: { path: { organizationId, id: bountyId } }, body }
    )
  );

/** Declare winners and trigger payout (SELECT_WINNERS). */
export const selectBountyWinners = async (
  organizationId: string,
  bountyId: string,
  body: SelectBountyWinnersRequest
): Promise<BountyEscrowOpResponse> =>
  unwrapData(
    await apiClient.POST(
      '/api/organizations/{organizationId}/bounties/{id}/escrow/select-winners',
      { params: { path: { organizationId, id: bountyId } }, body }
    )
  );

/** Submit a wallet-signed XDR for an organizer op (EXTERNAL path). */
export const submitSignedBountyEscrow = async (
  organizationId: string,
  bountyId: string,
  opRowId: string,
  body: SubmitSignedXdrRequest
): Promise<BountyEscrowOpResponse> =>
  unwrapData(
    await apiClient.POST(
      '/api/organizations/{organizationId}/bounties/{id}/escrow/ops/{opRowId}/submit-signed',
      { params: { path: { organizationId, id: bountyId, opRowId } }, body }
    )
  );

/** Poll the current state of an organizer escrow op. */
export const getBountyEscrowOp = async (
  organizationId: string,
  bountyId: string,
  opRowId: string
): Promise<BountyEscrowOpResponse> =>
  unwrapData(
    await apiClient.GET(
      '/api/organizations/{organizationId}/bounties/{id}/escrow/ops/{opRowId}',
      { params: { path: { organizationId, id: bountyId, opRowId } } }
    )
  );
