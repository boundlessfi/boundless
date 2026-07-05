'use client';

/**
 * React Query hooks for the bounty escrow flow (boundless-events).
 *
 * Mirrors the hackathon escrow machinery (features/hackathons/api/use-escrow):
 *   1. useEscrowOp        — polling primitive; watches an op to a terminal state.
 *   2. mutation wrappers  — usePublishBountyEscrow / useSelectBountyWinners /
 *                           useCancelBountyEscrow.
 *   3. useEscrowOpRunner  — orchestrates start -> (sign+submit for EXTERNAL) ->
 *                           poll-to-terminal, invalidating bounty caches on
 *                           COMPLETED.
 *
 * Only the scope shape (org + bounty) and the publish wrapper differ from the
 * hackathon version. MANAGED ops come back already in PENDING_CONFIRM (backend
 * signed+submitted), so the runner just polls. EXTERNAL ops come back in
 * PENDING_SIGN with an `unsignedXdr`; the runner signs via the injected
 * `signXdr` and posts it to submit-signed before polling.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';

import {
  cancelBountyEscrow,
  getBountyEscrowOp,
  publishBountyEscrow,
  selectBountyWinners,
  submitSignedBountyEscrow,
} from './escrow-client';
import {
  getParticipantBountyOp,
  submitSignedParticipantBounty,
} from './participant-escrow-client';
import {
  isTerminalEscrowStatus,
  type BountyEscrowOpResponse,
  type CancelBountyEscrowRequest,
  type EscrowOpStatus,
  type PublishBountyEscrowRequest,
  type SelectBountyWinnersRequest,
} from '../types';

// ─── Scope: organizer (org + bounty) or participant (bounty-only) ─────────────

export type EscrowOpScope =
  | { kind: 'organizer'; organizationId: string; bountyId: string }
  | { kind: 'participant'; bountyId: string };

function getOpForScope(
  scope: EscrowOpScope,
  opRowId: string
): Promise<BountyEscrowOpResponse> {
  return scope.kind === 'participant'
    ? getParticipantBountyOp(scope.bountyId, opRowId)
    : getBountyEscrowOp(scope.organizationId, scope.bountyId, opRowId);
}

function submitSignedForScope(
  scope: EscrowOpScope,
  opRowId: string,
  signedXdr: string
): Promise<BountyEscrowOpResponse> {
  return scope.kind === 'participant'
    ? submitSignedParticipantBounty(scope.bountyId, opRowId, { signedXdr })
    : submitSignedBountyEscrow(scope.organizationId, scope.bountyId, opRowId, {
        signedXdr,
      });
}

function escrowOpKey(scope: EscrowOpScope, opRowId: string): QueryKey {
  return scope.kind === 'participant'
    ? ['bounty-escrow-op', 'participant', scope.bountyId, opRowId]
    : [
        'bounty-escrow-op',
        'organizer',
        scope.organizationId,
        scope.bountyId,
        opRowId,
      ];
}

// ─── 1. Polling primitive ────────────────────────────────────────────────────

export interface UseEscrowOpOptions {
  enabled?: boolean;
  /** Poll cadence while the op is non-terminal. Default 2500ms. */
  pollMs?: number;
}

/**
 * Poll an escrow op until it reaches a terminal state. Returns the standard
 * react-query result; `data` is the latest BountyEscrowOpResponse.
 */
export function useEscrowOp(
  scope: EscrowOpScope,
  opRowId: string | null | undefined,
  options: UseEscrowOpOptions = {}
) {
  const pollMs = options.pollMs ?? 2500;
  return useQuery({
    queryKey: opRowId
      ? escrowOpKey(scope, opRowId)
      : ['bounty-escrow-op', 'idle'],
    queryFn: () => getOpForScope(scope, opRowId as string),
    enabled: !!opRowId && (options.enabled ?? true),
    refetchInterval: query => {
      const data = query.state.data as BountyEscrowOpResponse | undefined;
      if (!data) return pollMs;
      return isTerminalEscrowStatus(data.status) ? false : pollMs;
    },
    // Pending ops change server-side; never treat a non-terminal row as fresh.
    staleTime: 0,
  });
}

// ─── 2. Mutation wrappers ────────────────────────────────────────────────────

export function usePublishBountyEscrow(
  organizationId: string,
  bountyId: string
) {
  return useMutation({
    mutationFn: (body: PublishBountyEscrowRequest) =>
      publishBountyEscrow(organizationId, bountyId, body),
  });
}

export function useSelectBountyWinners(
  organizationId: string,
  bountyId: string
) {
  return useMutation({
    mutationFn: (body: SelectBountyWinnersRequest) =>
      selectBountyWinners(organizationId, bountyId, body),
  });
}

export function useCancelBountyEscrow(
  organizationId: string,
  bountyId: string
) {
  return useMutation({
    mutationFn: (body: CancelBountyEscrowRequest) =>
      cancelBountyEscrow(organizationId, bountyId, body),
  });
}

// ─── 3. Orchestrating runner ─────────────────────────────────────────────────

/** Sign an unsigned XDR for the EXTERNAL path. */
export type SignXdrFn = (
  unsignedXdr: string,
  signerHint?: string | null
) => Promise<string>;

export type EscrowRunPhase =
  | 'idle'
  | 'starting'
  | 'signing'
  | 'submitting'
  | 'polling'
  | 'completed'
  | 'failed';

/**
 * Base user-facing labels for the runner phases. Flows spread this and
 * override the flow-specific verbs (usually `starting` and `polling`), so a
 * new phase only needs wiring here and every consumer stays exhaustive.
 */
export const ESCROW_PHASE_LABEL: Record<EscrowRunPhase, string> = {
  idle: '',
  starting: 'Preparing…',
  signing: 'Signing…',
  submitting: 'Submitting…',
  polling: 'Confirming on-chain…',
  completed: 'Confirmed',
  failed: 'Failed',
};

export interface UseEscrowOpRunnerOptions {
  /**
   * Signer for the EXTERNAL path. When the start op returns PENDING_SIGN with
   * an unsignedXdr, the runner calls this then posts to submit-signed. Omit for
   * MANAGED-only flows (the op is already PENDING_CONFIRM).
   */
  signXdr?: SignXdrFn;
  /**
   * Query keys to invalidate when the op COMPLETES. Defaults to the whole
   * `['bounties']` tree so a status transition renders.
   */
  invalidateKeys?: QueryKey[];
  pollMs?: number;
}

export interface EscrowOpRunner {
  /** Kick off an op. `start` is the mutation call returning the built op. */
  run: (
    start: () => Promise<BountyEscrowOpResponse>
  ) => Promise<BountyEscrowOpResponse | null>;
  reset: () => void;
  /** Latest op (polled if available, else the build result). */
  op: BountyEscrowOpResponse | null;
  status: EscrowOpStatus | 'IDLE';
  phase: EscrowRunPhase;
  /** True while building/signing/submitting/confirming. */
  isRunning: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isTerminal: boolean;
  /** Friendly error text (contract errorCode or thrown message). */
  error: string | null;
  txHash: string | null;
}

const DEFAULT_INVALIDATE: QueryKey[] = [['bounties']];

/**
 * Drive a single escrow op from start to terminal state, handling the
 * MANAGED-vs-EXTERNAL signing branch and cache invalidation on completion.
 */
export function useEscrowOpRunner(
  scope: EscrowOpScope,
  options: UseEscrowOpRunnerOptions = {}
): EscrowOpRunner {
  const queryClient = useQueryClient();
  const [opRowId, setOpRowId] = useState<string | null>(null);
  const [startOp, setStartOp] = useState<BountyEscrowOpResponse | null>(null);
  const [phase, setPhase] = useState<EscrowRunPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  // Guard so the terminal-side-effect (invalidate) fires once per op.
  const settledRef = useRef<string | null>(null);

  const { signXdr, pollMs } = options;
  const invalidateKeys = options.invalidateKeys ?? DEFAULT_INVALIDATE;

  const poll = useEscrowOp(scope, opRowId, { enabled: !!opRowId, pollMs });

  const op = poll.data ?? startOp;
  const status: EscrowOpStatus | 'IDLE' = op?.status ?? 'IDLE';

  // React to terminal transitions observed by the poller.
  useEffect(() => {
    if (!op || !opRowId) return;
    if (!isTerminalEscrowStatus(op.status)) return;
    if (settledRef.current === opRowId) return;
    settledRef.current = opRowId;

    if (op.status === 'COMPLETED') {
      setPhase('completed');
      invalidateKeys.forEach(key =>
        queryClient.invalidateQueries({ queryKey: key })
      );
    } else {
      setPhase('failed');
      setError(prev => prev ?? op.errorCode ?? `Escrow op ${op.status}`);
    }
    // queryClient + invalidateKeys are stable enough; op.status is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [op?.status, opRowId]);

  const reset = useCallback(() => {
    setOpRowId(null);
    setStartOp(null);
    setPhase('idle');
    setError(null);
    settledRef.current = null;
  }, []);

  const run = useCallback(
    async (
      start: () => Promise<BountyEscrowOpResponse>
    ): Promise<BountyEscrowOpResponse | null> => {
      setError(null);
      settledRef.current = null;
      setPhase('starting');
      try {
        const built = await start();
        setStartOp(built);
        setOpRowId(built.id);

        // EXTERNAL: the op needs a wallet signature before it can settle.
        if (built.status === 'PENDING_SIGN' && built.unsignedXdr && signXdr) {
          setPhase('signing');
          const signed = await signXdr(built.unsignedXdr, built.signerHint);
          setPhase('submitting');
          const submitted = await submitSignedForScope(scope, built.id, signed);
          setStartOp(submitted);
          setPhase('polling');
          return submitted;
        }

        if (built.status === 'PENDING_SIGN' && !signXdr) {
          // External op with no signer available — can't progress.
          setPhase('failed');
          setError(
            'This op needs a connected wallet signature, but no signer is ' +
              'configured. Use the managed wallet or connect a wallet.'
          );
          return built;
        }

        // MANAGED (already PENDING_CONFIRM) or terminal: let the poller finish.
        setPhase('polling');
        return built;
      } catch (err) {
        setPhase('failed');
        setError(
          err instanceof Error ? err.message : 'Failed to run escrow op'
        );
        return null;
      }
    },
    [scope, signXdr]
  );

  const isTerminal = status !== 'IDLE' && isTerminalEscrowStatus(status);

  return {
    run,
    reset,
    op,
    status,
    phase,
    isRunning:
      phase === 'starting' ||
      phase === 'signing' ||
      phase === 'submitting' ||
      (phase === 'polling' && !isTerminal),
    isCompleted: status === 'COMPLETED',
    isFailed:
      status === 'FAILED' || status === 'CANCELLED' || phase === 'failed',
    isTerminal,
    error,
    txHash: op?.txHash ?? null,
  };
}
