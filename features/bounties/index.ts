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

// Escrow client (typed openapi-fetch).
export {
  publishBountyEscrow,
  cancelBountyEscrow,
  selectBountyWinners,
  submitSignedBountyEscrow,
  getBountyEscrowOp,
} from './api/escrow-client';

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
