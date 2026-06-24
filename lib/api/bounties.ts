import api from './api';
import type { ApiResponse, PaginatedResponse } from './types';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type BountyStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'DECIDING'
  | 'PAYING_OUT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type BountyEntryType = 'OPEN' | 'APPLICATION_REVIEW' | 'APPLICATION_DIRECT';

export type BountyClaimType = 'SINGLE_CLAIM' | 'COMPETITION';

export type ApplicationStatus =
  | 'PENDING'
  | 'SHORTLISTED'
  | 'SELECTED'
  | 'DECLINED';

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

// ─── Core Types ───────────────────────────────────────────────────────────────

export interface Bounty {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  status: BountyStatus;
  entryType: BountyEntryType;
  claimType: BountyClaimType;
  rewardAmount: number;
  rewardToken: string;
  escrowAddress?: string;
  contractId?: string;
  maxWinners: number;
  applicationDeadline?: string;
  submissionDeadline?: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  tags?: string[];
  bannerUrl?: string;
}

export interface BountyApplication {
  id: string;
  bountyId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  status: ApplicationStatus;
  proposal: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface BountySubmission {
  id: string;
  bountyId: string;
  applicantId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  description: string;
  repoUrl?: string;
  demoUrl?: string;
  submittedAt: string;
  rank?: number | null;
}

export interface BountyWinner {
  submissionId: string;
  userId: string;
  userName: string;
  rank: number;
  rewardAmount: number;
  txHash?: string;
}

export interface BountyDispute {
  id: string;
  bountyId: string;
  raisedByUserId: string;
  raisedByUserName: string;
  status: DisputeStatus;
  description: string;
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface BountyEscrow {
  address: string;
  balance: number;
  funded: boolean;
  token: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function getBounty(
  organizationId: string,
  bountyId: string
): Promise<ApiResponse<Bounty>> {
  const res = await api.get<ApiResponse<Bounty>>(
    `/organizations/${organizationId}/bounties/${bountyId}`
  );
  return res.data;
}

export async function getBounties(
  organizationId: string,
  params?: { page?: number; limit?: number; status?: BountyStatus }
): Promise<PaginatedResponse<Bounty>> {
  const res = await api.get<PaginatedResponse<Bounty>>(
    `/organizations/${organizationId}/bounties`,
    { params }
  );
  return res.data;
}

export async function getBountyApplications(
  organizationId: string,
  bountyId: string,
  params?: { page?: number; limit?: number; status?: ApplicationStatus }
): Promise<PaginatedResponse<BountyApplication>> {
  const res = await api.get<PaginatedResponse<BountyApplication>>(
    `/organizations/${organizationId}/bounties/${bountyId}/applications`,
    { params }
  );
  return res.data;
}

export async function updateApplicationStatus(
  organizationId: string,
  bountyId: string,
  applicationId: string,
  status: ApplicationStatus
): Promise<ApiResponse<BountyApplication>> {
  const res = await api.patch<ApiResponse<BountyApplication>>(
    `/organizations/${organizationId}/bounties/${bountyId}/applications/${applicationId}`,
    { status }
  );
  return res.data;
}

export async function getBountySubmissions(
  organizationId: string,
  bountyId: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedResponse<BountySubmission>> {
  const res = await api.get<PaginatedResponse<BountySubmission>>(
    `/organizations/${organizationId}/bounties/${bountyId}/submissions`,
    { params }
  );
  return res.data;
}

export interface SelectWinnersRequest {
  winners: Array<{ submissionId: string; rank: number }>;
}

export async function selectWinners(
  organizationId: string,
  bountyId: string,
  payload: SelectWinnersRequest
): Promise<ApiResponse<{ txHash: string }>> {
  const res = await api.post<ApiResponse<{ txHash: string }>>(
    `/organizations/${organizationId}/bounties/${bountyId}/select-winners`,
    payload
  );
  return res.data;
}

export async function cancelBounty(
  organizationId: string,
  bountyId: string
): Promise<ApiResponse<{ txHash: string }>> {
  const res = await api.post<ApiResponse<{ txHash: string }>>(
    `/organizations/${organizationId}/bounties/${bountyId}/cancel`
  );
  return res.data;
}

export async function getBountyWinners(
  organizationId: string,
  bountyId: string
): Promise<ApiResponse<BountyWinner[]>> {
  const res = await api.get<ApiResponse<BountyWinner[]>>(
    `/organizations/${organizationId}/bounties/${bountyId}/winners`
  );
  return res.data;
}

export async function getBountyDisputes(
  organizationId: string,
  bountyId: string
): Promise<PaginatedResponse<BountyDispute>> {
  const res = await api.get<PaginatedResponse<BountyDispute>>(
    `/organizations/${organizationId}/bounties/${bountyId}/disputes`
  );
  return res.data;
}

export async function resolveDispute(
  organizationId: string,
  bountyId: string,
  disputeId: string,
  resolution: string
): Promise<ApiResponse<BountyDispute>> {
  const res = await api.patch<ApiResponse<BountyDispute>>(
    `/organizations/${organizationId}/bounties/${bountyId}/disputes/${disputeId}/resolve`,
    { resolution }
  );
  return res.data;
}

export async function getBountyEscrow(
  organizationId: string,
  bountyId: string
): Promise<ApiResponse<BountyEscrow>> {
  const res = await api.get<ApiResponse<BountyEscrow>>(
    `/organizations/${organizationId}/bounties/${bountyId}/escrow`
  );
  return res.data;
}

export async function archiveBounty(
  organizationId: string,
  bountyId: string
): Promise<ApiResponse<Bounty>> {
  const res = await api.post<ApiResponse<Bounty>>(
    `/organizations/${organizationId}/bounties/${bountyId}/archive`
  );
  return res.data;
}
