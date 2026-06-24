/**
 * Crowdfunding feature types.
 *
 * Entity shapes (Campaign, Milestone, Contribution) are hand-written because
 * the backend does not generate OpenAPI response DTOs for those entities.
 * Request/body DTOs that appear in the generated schema are aliased from there
 * so they never drift from boundless-nestjs.
 *
 * Run `npm run codegen` after a backend DTO change.
 */
import type { Schemas } from '@/lib/api';

// ── Entity types (hand-written, kept in sync with Prisma schema) ─────────────

export type {
  Crowdfunding as CrowdfundingCampaign,
  Milestone as CrowdfundingMilestone,
  Contributor as CrowdfundingContributor,
  TeamMember,
  CrowdfundingProject,
  CrowdfundingV2Status,
  CrowdfundingReview,
  SocialLink,
  Contact,
} from '@/features/projects/types';

// ── Request DTOs from generated schema ───────────────────────────────────────

export type ApproveCampaignBody = Schemas['ApproveCrowdfundingCampaignDto'];
export type RejectCampaignBody = Schemas['RejectCrowdfundingCampaignDto'];
export type PauseCampaignBody = Schemas['PauseCrowdfundingCampaignDto'];

// ── Backer contribution body (not yet in generated schema) ────────────────────

export interface ContributeV2Body {
  amount: number;
  walletOrigin: 'BOUNDLESS' | 'EXTERNAL';
  contributorAddress: string;
  message?: string;
  anonymous?: boolean;
}

// ── Launch (publish escrow) body ──────────────────────────────────────────────

export interface PublishCampaignBody {
  /** Builder's Boundless managed-wallet G-address (must match the caller). */
  builderAddress: string;
  /** USDC SAC (C-address) whitelisted on the events contract. */
  tokenAddress: string;
  /** Funding goal in token units, as a string. */
  fundingGoal: string;
  nMilestones: number;
  /** Funding deadline as a Unix timestamp in seconds (must be future). */
  fundingDeadline: number;
  contentUri?: string;
}

/**
 * Escrow op envelope returned by publish/contribute. Field names mirror the
 * backend EscrowOpResponseDto exactly: `opRowId` is the DB row id used to
 * submit a wallet-signed XDR (NOT `id`); `opId` is the on-chain op hash.
 */
export interface EscrowOpResult {
  opRowId: string;
  opId?: string;
  status?: string;
  unsignedXdr?: string | null;
  txHash?: string | null;
}

// ── Milestone review body (new admin endpoints, not yet in schema) ────────────

export interface ApproveMilestoneBody {}

export interface RejectMilestoneBody {
  rejectionFeedback: string;
  resubmissionDeadline?: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface CampaignPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaginatedCampaigns {
  data: import('@/features/projects/types').Crowdfunding[];
  pagination: CampaignPagination;
}

// ── List filters ──────────────────────────────────────────────────────────────

export interface CampaignListFilters {
  category?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minFundingGoal?: number;
  maxFundingGoal?: number;
}
