/**
 * Hackathons feature public surface. Import from `@/features/hackathons` rather
 * than reaching into the api/ internals.
 */

// Types (aliased from the backend-generated schema).
export type {
  HackathonDraft,
  HackathonDraftData,
  UpdateHackathonDraftBody,
  InfoSection,
  TimelineSection,
  ParticipationSection,
  RewardsSection,
  ResourcesSection,
  JudgingSection,
  CollaborationSection,
  DraftSection,
  GenerateDraftFromBriefBody,
  GenerateDraftFromBriefResponse,
  RegenerateDraftSectionBody,
  RegenerateDraftSectionResponse,
  AiGenerationMeta,
  DraftRegenSection,
  EscrowOpResponse,
  EscrowOpStatus,
  EscrowOpKind,
  PublishHackathonEscrowRequest,
  SelectHackathonWinnersRequest,
  CancelHackathonEscrowRequest,
  SubmitSignedXdrRequest,
  AnchorHackathonSubmissionRequest,
  WithdrawHackathonSubmissionRequest,
  WinnerDistributionEntry,
  HackathonWinnerSelection,
  RequestFundingOtpResponse,
  VerifyFundingOtpResponse,
  FundingMode,
} from './types';
export {
  DRAFT_SECTIONS,
  TERMINAL_ESCROW_STATUSES,
  isTerminalEscrowStatus,
} from './types';

// Query keys.
export { hackathonKeys } from './api/keys';

// Draft hooks (React Query).
export {
  useDraft,
  useDraftList,
  useCreateDraft,
  useUpdateDraft,
  useDeleteDraft,
} from './api/use-draft';

// Organizer Assist (AI) hooks.
export { useGenerateDraftFromBrief } from './api/use-generate-from-brief';
export { useRegenerateDraftSection } from './api/use-regenerate-section';
export { useClarifyDraft } from './api/use-clarify';
export { useBriefTemplates } from './api/use-brief-templates';
export type { BriefTemplate } from './api/use-brief-templates';
export type {
  HackathonDraftAssumption,
  HackathonClarifyOption,
  HackathonClarifyQuestion,
  ClarifyHackathonDraftResult,
} from './types';

// Draft client (imperative helpers, legacy-compatible signatures).
export { deleteDraft, previewAnnouncementAudience } from './api/draft-client';
export type {
  DeleteDraftResult,
  AnnouncementAudiencePreview,
} from './api/draft-client';

// Escrow client (typed openapi-fetch).
export {
  publishHackathonEscrow,
  selectHackathonWinners,
  cancelHackathonEscrow,
  resetHackathonEscrowToDraft,
  submitSignedHackathonEscrow,
  getHackathonEscrowOp,
  requestHackathonFundingOtp,
  verifyHackathonFundingOtp,
  anchorHackathonSubmission,
  withdrawHackathonSubmission,
  submitSignedParticipantEscrow,
  getParticipantEscrowOp,
} from './api/escrow-client';

// Escrow hooks (React Query: polling primitive, mutation wrappers, op runner).
export {
  useEscrowOp,
  useEscrowOpRunner,
  usePublishHackathonEscrow,
  useSelectWinners,
  useCancelEscrow,
  useAnchorSubmission,
  useWithdrawSubmission,
} from './api/use-escrow';
export type {
  EscrowOpScope,
  SignXdrFn,
  EscrowRunPhase,
  UseEscrowOpOptions,
  UseEscrowOpRunnerOptions,
  EscrowOpRunner,
} from './api/use-escrow';

// Participant submission anchoring (MANAGED on-chain anchor via the op runner).
export {
  useSubmissionAnchor,
  buildSubmissionContentUri,
} from './api/use-submission-anchor';
export type { UseSubmissionAnchor } from './api/use-submission-anchor';

// Participant submission CRUD (my-submission query + create/update/delete).
export { useSubmission } from './api/use-submission';
export type { SubmissionFormData } from './api/use-submission';
