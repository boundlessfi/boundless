'use client';

import { useCallback } from 'react';

import { anchorHackathonSubmission } from './escrow-client';
import { useEscrowOpRunner } from './use-escrow';
import type { EscrowOpResponse } from '../types';

const SUBMISSION_CONTENT_BASE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://boundless.fi';

/**
 * Canonical, on-chain-stored content URI for a submission anchor. Deterministic
 * from the ids so a retry produces the same value (the op_id is hash-locked on
 * the backend, so re-anchoring is idempotent).
 */
export function buildSubmissionContentUri(
  hackathonId: string,
  submissionId: string
): string {
  return `${SUBMISSION_CONTENT_BASE}/hackathons/${hackathonId}/submissions/${submissionId}`;
}

export interface UseSubmissionAnchor {
  /**
   * Anchor a submission on-chain via the participant's Boundless-managed wallet.
   * Resolves to the built op (or null if the start call threw). Track progress
   * via `phase`/`isAnchoring`/`isAnchored`/`isFailed` rather than the return.
   */
  anchor: (args: {
    submissionId: string;
    applicantAddress: string;
  }) => Promise<EscrowOpResponse | null>;
  reset: () => void;
  op: EscrowOpResponse | null;
  /** Current escrow run phase (idle → starting → polling → completed/failed). */
  phase: ReturnType<typeof useEscrowOpRunner>['phase'];
  /** True while building/submitting/confirming on-chain. */
  isAnchoring: boolean;
  /** True once the anchor op reached COMPLETED (submission is prize-eligible). */
  isAnchored: boolean;
  isFailed: boolean;
  error: string | null;
  txHash: string | null;
}

/**
 * Anchor a hackathon submission on the boundless-events contract using the
 * participant's **Boundless-managed** custodial wallet (MANAGED funding mode —
 * there is never an in-browser signature for participants).
 *
 * Composes the shared {@link useEscrowOpRunner}: the backend signs + submits
 * (sponsor-paid fee-bump), so the op returns `PENDING_CONFIRM` and the runner
 * polls it to a terminal state — no `signXdr` is wired. A submission only
 * becomes prize-eligible once this reaches `COMPLETED` (the backend sets
 * `escrowAnchorStatus='active'` + `applicantAddress`, which is the exact address
 * winners are later paid to via `select_winners`).
 *
 * SOLID: this hook owns *only* the on-chain anchoring concern. The caller is
 * responsible for ensuring the managed wallet is ready and passing its address
 * (so this stays decoupled from the wallet provider and trivially testable).
 *
 * @param hackathonId the hackathon **id** (not the slug — the participant
 *   escrow endpoint resolves `:id` by primary key).
 */
export function useSubmissionAnchor(hackathonId: string): UseSubmissionAnchor {
  // MANAGED-only → no signer. On COMPLETED the runner invalidates the
  // ['hackathon'] tree, which covers the participant's my-submission query and
  // the hackathon detail so the anchored state renders.
  const runner = useEscrowOpRunner({ kind: 'participant', hackathonId });

  const anchor = useCallback(
    (args: {
      submissionId: string;
      applicantAddress: string;
    }): Promise<EscrowOpResponse | null> =>
      runner.run(() =>
        anchorHackathonSubmission(hackathonId, args.submissionId, {
          applicantAddress: args.applicantAddress,
          contentUri: buildSubmissionContentUri(hackathonId, args.submissionId),
          fundingMode: 'MANAGED',
        })
      ),
    [hackathonId, runner]
  );

  return {
    anchor,
    reset: runner.reset,
    op: runner.op,
    phase: runner.phase,
    isAnchoring: runner.isRunning,
    isAnchored: runner.isCompleted,
    isFailed: runner.isFailed,
    error: runner.error,
    txHash: runner.txHash,
  };
}
