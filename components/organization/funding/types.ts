/**
 * Shared types for the organizer funding modals (used by both the hackathon and
 * bounty publish flows). Structurally identical to the per-feature escrow types
 * (features/hackathons, features/bounties), so either feature's values pass
 * here without coupling the shared modals to a specific feature.
 */

/** Escrow op lifecycle phase, as surfaced by useEscrowOpRunner. */
export type EscrowRunPhase =
  | 'idle'
  | 'starting'
  | 'signing'
  | 'submitting'
  | 'polling'
  | 'completed'
  | 'failed';

/** How the escrow is funded: managed (server-signed) or external (wallet-signed). */
export type FundingMode = 'MANAGED' | 'EXTERNAL';
