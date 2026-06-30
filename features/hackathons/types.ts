/**
 * Hackathon feature types.
 *
 * Every server shape is aliased from the backend-generated OpenAPI schema
 * (lib/api/generated/schema.d.ts), so they never drift from boundless-nestjs.
 * Run `npm run codegen` after a backend DTO change to refresh them. Do not
 * hand-write server DTOs here.
 */
import type { Schemas } from '@/lib/api';

// ── Draft ────────────────────────────────────────────────────────────────────

/** Full draft as returned by GET/PATCH /draft/:id. */
export type HackathonDraft = Schemas['HackathonDraftResponseDto'];
/** Section-keyed draft payload (information, timeline, ...). */
export type HackathonDraftData = Schemas['HackathonDraftDataDto'];
/** Flat draft-update body: send any subset of sections in one PATCH. */
export type UpdateHackathonDraftBody = Schemas['UpdateHackathonDraftDto'];

/** Prize entity exposed on the draft response (read path): named prizes with
 * linked tracks + one-or-more placements. The wizard still writes via
 * RewardsSection (prizeTiers); the backend syncs the entity from that. */
export type HackathonDraftPrize = Schemas['HackathonDraftPrizeDto'];
export type HackathonDraftPrizePlacement =
  Schemas['HackathonDraftPrizePlacementDto'];

// Section DTOs (the wire shape the backend persists + returns).
export type InfoSection = Schemas['InfoFormData'];
export type TimelineSection = Schemas['TimelineFormData'];
export type ParticipationSection = Schemas['ParticipantFormData'];
export type RewardsSection = Schemas['RewardsFormData'];
export type ResourcesSection = Schemas['ResourcesFormData'];
export type JudgingSection = Schemas['JudgingFormData'];
export type CollaborationSection = Schemas['CollaborationFormData'];

/** The seven editable wizard sections, in order. */
export const DRAFT_SECTIONS = [
  'information',
  'timeline',
  'participation',
  'rewards',
  'resources',
  'judging',
  'collaboration',
] as const;
export type DraftSection = (typeof DRAFT_SECTIONS)[number];

// ── Organizer Assist (AI) ────────────────────────────────────────────────────

/** Brief inputs for "generate draft from brief" (brief + budget + start). */
export type GenerateDraftFromBriefBody = Schemas['GenerateDraftFromBriefDto'];
/** Result: a created + pre-filled draft, plus generation metadata. */
export type GenerateDraftFromBriefResponse =
  Schemas['GenerateDraftFromBriefResponseDto'];
/** Body to regenerate one section of an AI-generated draft (server owns the suggestion). */
export type RegenerateDraftSectionBody = Schemas['RegenerateDraftSectionDto'];
/** Result: the regenerated section in the wizard shape + generation metadata. */
export type RegenerateDraftSectionResponse =
  Schemas['RegenerateDraftSectionResponseDto'];
/** Cost/trace metadata returned with every Organizer Assist response. */
export type AiGenerationMeta = Schemas['AiGenerationMetaDto'];
/** The sections the AI can regenerate (criteria | prizes | tracks | timeline | description). */
export type DraftRegenSection = RegenerateDraftSectionBody['section'];

// Hand-typed until `npm run codegen` surfaces the clarify DTOs + the
// `aiGeneration.assumptions` field on the draft response.

/** A non-obvious choice the AI made, surfaced for organizer review. */
export interface HackathonDraftAssumption {
  section: string;
  field: string;
  note: string;
}

export interface HackathonClarifyOption {
  value: string;
  label: string;
}
export interface HackathonClarifyQuestion {
  id: string;
  question: string;
  options: HackathonClarifyOption[];
}
export interface ClarifyHackathonDraftResult {
  ready: boolean;
  questions: HackathonClarifyQuestion[];
}

// ── Escrow ─────────────────────────────────────────────────────────────────

/** The EscrowOp row returned by every hackathon escrow endpoint. */
export type EscrowOpResponse = Schemas['HackathonEscrowOpResponseDto'];
/** Op lifecycle status (derived from the generated union). */
export type EscrowOpStatus = EscrowOpResponse['status'];
/** Contract operation kind (derived from the generated union). */
export type EscrowOpKind = EscrowOpResponse['kind'];

export type PublishHackathonEscrowRequest =
  Schemas['PublishHackathonEscrowDto'];
export type SelectHackathonWinnersRequest =
  Schemas['SelectHackathonWinnersDto'];
export type CancelHackathonEscrowRequest = Schemas['CancelHackathonEscrowDto'];
export type SubmitSignedXdrRequest = Schemas['HackathonSubmitSignedXdrDto'];
export type AnchorHackathonSubmissionRequest = Schemas['SubmitHackathonDto'];
export type WithdrawHackathonSubmissionRequest =
  Schemas['WithdrawHackathonSubmissionDto'];
export type WinnerDistributionEntry = Schemas['WinnerDistributionEntryDto'];
export type HackathonWinnerSelection = Schemas['HackathonWinnerSelectionDto'];
export type RequestFundingOtpResponse = Schemas['RequestFundingOtpResponseDto'];
export type VerifyFundingOtpResponse = Schemas['VerifyFundingOtpResponseDto'];

/** Signing path for an escrow op. */
export type FundingMode = NonNullable<
  PublishHackathonEscrowRequest['fundingMode']
>;

/** Terminal op states. Polling should stop once one is reached. */
export const TERMINAL_ESCROW_STATUSES: readonly EscrowOpStatus[] = [
  'COMPLETED',
  'FAILED',
  'CANCELLED',
];

export const isTerminalEscrowStatus = (status: EscrowOpStatus): boolean =>
  TERMINAL_ESCROW_STATUSES.includes(status);
