/**
 * Crowdfunding feature public surface.
 * Import from `@/features/crowdfunding` rather than reaching into the api/ internals.
 */

// Types
export type {
  CrowdfundingCampaign,
  CrowdfundingMilestone,
  CrowdfundingContributor,
  TeamMember,
  CrowdfundingProject,
  CrowdfundingV2Status,
  CrowdfundingReview,
  SocialLink,
  Contact,
  ApproveCampaignBody,
  RejectCampaignBody,
  PauseCampaignBody,
  ContributeV2Body,
  ApproveMilestoneBody,
  RejectMilestoneBody,
  CampaignPagination,
  PaginatedCampaigns,
  CampaignListFilters,
} from './types';

// Query keys
export { crowdfundingKeys } from './api/keys';

// Campaign hooks (React Query)
export {
  useCampaigns,
  useMyCampaigns,
  useCampaign,
  useSubmitForReview,
  useWithdrawSubmission,
  useReviseAndResubmit,
  usePublishCampaign,
  useContributeV2,
  useCastVote,
  useMyVote,
} from './api/use-campaign';

// Milestone hooks (React Query)
export {
  useMilestones,
  useMilestone,
  useSubmitMilestoneEvidence,
} from './api/use-milestone';

// Imperative clients (for wizard saves and other non-React contexts)
export {
  fetchCampaigns,
  fetchMyCampaigns,
  fetchCampaignBySlug,
  fetchCampaignById,
  submitForReview,
  withdrawSubmission,
  reviseAndResubmit,
  publishCampaign,
  contributeV2,
  submitSignedContribution,
  getContributionOp,
} from './api/campaign-client';

export {
  fetchMilestones,
  fetchMilestone,
  validateMilestoneSubmission,
  updateMilestone,
} from './api/milestone-client';
