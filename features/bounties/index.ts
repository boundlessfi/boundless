/**
 * Bounties feature public surface. Import from `@/features/bounties` rather than
 * reaching into the api/ internals.
 */

// Types (aliased from the backend-generated schema).
export type {
  BountyDraft,
  BountyDraftData,
  UpdateBountyDraftBody,
  BountyDraftPrizeTier,
  BountyScopeSection,
  BountyModeSection,
  BountySubmissionSection,
  BountyRewardSection,
  BountyClaimType,
  BountyEntryType,
  BountySubmissionVisibility,
  DraftSection,
  BountyEscrowOpResponse,
  EscrowOpStatus,
  EscrowOpKind,
  PublishBountyEscrowRequest,
  CancelBountyEscrowRequest,
  SelectBountyWinnersRequest,
  SubmitSignedXdrRequest,
  BountyWinnerSelection,
  BountyWinnerDistributionEntry,
  FundingMode,
} from './types';
export {
  DRAFT_SECTIONS,
  TERMINAL_ESCROW_STATUSES,
  isTerminalEscrowStatus,
} from './types';

// Query keys.
export { bountyKeys } from './api/keys';

// Published bounty list (client + hook).
export { listOrganizationBounties } from './api/core';
export type { OrganizationBountyListItem } from './api/core';
export { useOrganizationBounties } from './api/use-bounties';

// Draft client (imperative helpers).
export {
  createBountyDraft,
  updateBountyDraft,
  getBountyDraft,
  listBountyDrafts,
  deleteBountyDraft,
} from './api/draft-client';
export type { DeleteBountyDraftResult } from './api/draft-client';

// Draft hooks (React Query).
export {
  useDraft,
  useDraftList,
  useCreateDraft,
  useUpdateDraft,
  useDeleteDraft,
} from './api/use-draft';

// Organizer Assist (AI drafting) — types, client, hooks.
export type {
  BountyDraftAiGeneration,
  BountyDraftAssumption,
  BountyDraftGeneratedMode,
  BountyDraftWithAi,
  BountyAiGenerationMeta,
  GenerateBountyDraftFromBriefBody,
  GenerateBountyDraftFromBriefResponse,
  BountyDraftRegenSection,
  RegenerateBountyDraftSectionBody,
  RegenerateBountyDraftSectionResponse,
  ClarifyOption,
  ClarifyQuestion,
  ClarifyBountyDraftResult,
} from './types';
export { BOUNTY_DRAFT_REGEN_SECTIONS } from './types';
export {
  clarifyBountyDraft,
  generateBountyDraftFromBrief,
  regenerateBountyDraftSection,
} from './api/draft-ai-client';
export {
  useClarifyBountyDraft,
  useGenerateBountyDraftFromBrief,
  useRegenerateBountyDraftSection,
} from './api/use-draft-ai';

// Escrow client (typed openapi-fetch).
export {
  publishBountyEscrow,
  cancelBountyEscrow,
  selectBountyWinners,
  submitSignedBountyEscrow,
  getBountyEscrowOp,
  requestBountyFundingOtp,
  verifyBountyFundingOtp,
  resetBountyEscrowToDraft,
} from './api/escrow-client';
export type {
  BountyFundingOtpRequestResult,
  BountyFundingOtpVerifyResult,
} from './types';

// Escrow hooks (React Query: polling primitive, mutation wrappers, op runner).
export {
  useEscrowOp,
  useEscrowOpRunner,
  usePublishBountyEscrow,
  useSelectBountyWinners,
  useCancelBountyEscrow,
} from './api/use-escrow';
export type {
  EscrowOpScope,
  SignXdrFn,
  EscrowRunPhase,
  UseEscrowOpOptions,
  UseEscrowOpRunnerOptions,
  EscrowOpRunner,
} from './api/use-escrow';

// ── Builder / participant data layer (#621) ──────────────────────────────────

// Participant types (all aliased from the generated schema).
export type {
  BountyPublic,
  BountyPublicList,
  MyBountyApplication,
  BountyApplicationStatus,
  ApplyBountyRequest,
  SubmitBountyRequest,
  WithdrawApplicationRequest,
  WithdrawSubmissionRequest,
  ContributeBountyRequest,
  CreateBountyApplicationRequest,
  EditBountyApplicationRequest,
  JoinCompetitionRequest,
} from './types';

// Participant REST client (public reads + v2 application records + competition).
export {
  listBounties,
  getBounty,
  getMyBountyApplication,
  applyToBounty,
  editBountyApplication,
  withdrawBountyApplication,
  joinCompetition,
  leaveCompetition,
} from './api/participant-client';
export type { BountiesListParams } from './api/participant-client';

// Participant escrow client (on-chain apply/submit/withdraw/contribute).
export {
  applyToBountyEscrow,
  withdrawBountyApplicationEscrow,
  submitBountyWorkEscrow,
  withdrawBountySubmissionEscrow,
  contributeToBountyEscrow,
  getParticipantBountyOp,
  submitSignedParticipantBounty,
} from './api/participant-escrow-client';

// Builder "my bounties" dashboard (#332 reads; hand-typed until codegen).
export type {
  BountyActivitySummary,
  MyBountyApplicationRow,
  MyBountySubmissionRow,
  BountyActivityPage,
} from './types';
export {
  listMyBountyApplications,
  listMyBountySubmissions,
  getMyBountySubmission,
} from './api/participant-dashboard-client';
export type { MyActivityParams } from './api/participant-dashboard-client';
export {
  useMyBountyApplications,
  useMyBountySubmissions,
  useMyBountySubmission,
} from './api/use-participant-dashboard';

// Participant hooks (React Query).
export {
  useBountiesList,
  useBounty,
  useMyBountyApplication,
  useApplyToBounty,
  useEditApplication,
  useWithdrawApplication,
  useJoinCompetition,
  useLeaveCompetition,
  useSubmitBounty,
  useWithdrawSubmission,
  useApplyToBountyEscrow,
  useWithdrawApplicationEscrow,
  useContributeToBounty,
} from './api/use-participant';
