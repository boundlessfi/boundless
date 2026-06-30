import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useWalletContext } from '@/components/providers/wallet-provider';
import { getTokenAddress } from '@/lib/config/tokens';
import { signXdrWithKit } from '@/lib/wallet/wallet-kit';
import {
  clearPublishOpId,
  persistPublishOpId,
  readPublishOpId,
} from '@/lib/utils/publish-op-storage';
import {
  getBountyEscrowOp,
  resetBountyEscrowToDraft,
  useEscrowOpRunner,
  usePublishBountyEscrow,
  type FundingMode,
  type PublishBountyEscrowRequest,
} from '@/features/bounties';
import {
  getBountyPrizePool,
  getBountyTotalFunding,
  buildBountyWinnerDistribution,
} from '@/lib/utils/bounty-escrow';
import { getBountyDraft } from '@/features/bounties';
import type { BountyFormData } from '@/components/organization/bounties/new/constants';

interface UseBountyPublishProps {
  organizationId: string;
  stepData: BountyFormData;
  draftId?: string | null;
  /** Signing path. Defaults to MANAGED (custodial). */
  fundingMode?: FundingMode;
  /**
   * For EXTERNAL funding, the connected wallet that funds + signs (Stellar
   * Wallets Kit). Becomes the on-chain owner. Ignored for MANAGED.
   */
  externalOwnerAddress?: string | null;
  /**
   * For MANAGED funding from an organization treasury wallet: the treasury
   * wallet to fund + sign with (backend signs custodially). When set, its
   * address becomes the on-chain owner and we forward its id as sourceWalletId.
   * Omit to fund from the caller's personal managed wallet.
   */
  treasurySource?: { walletId: string; address: string } | null;
}

export interface BountyPublishResponse {
  id: string;
  message: string;
  transactionHash: string | null;
}

/** Lowercase bounty statuses that mean the bounty has left DRAFT already. */
const PUBLISHED_STATUSES = new Set([
  'open',
  'in_progress',
  'submitted',
  'under_review',
  'completed',
  'cancelled',
  'disputed',
]);

/**
 * Publishes a bounty draft onto the boundless-events contract. The draft IS a
 * Bounty row in `draft` status, so we hit the v2 escrow surface directly:
 *
 *   1. POST .../bounties/:draftId/escrow/publish (CREATE_EVENT). MANAGED has the
 *      backend sign + submit (op comes back PENDING_CONFIRM); EXTERNAL returns
 *      an unsigned XDR the connected wallet signs.
 *   2. Poll the op to COMPLETED; the backend subscriber flips the bounty
 *      draft_awaiting_funding -> open on settle.
 *
 * Mirrors useHackathonPublish, including managed-treasury and external-wallet
 * funding sources (the funding modal picks one).
 */
export const useBountyPublish = ({
  organizationId,
  stepData,
  draftId,
  fundingMode = 'MANAGED',
  externalOwnerAddress,
  treasurySource,
}: UseBountyPublishProps) => {
  const { walletAddress, balances } = useWalletContext();
  const bountyId = draftId || '';
  const isExternal = fundingMode === 'EXTERNAL';
  const usingTreasury = !isExternal && !!treasurySource;

  // The on-chain owner/source. EXTERNAL funds from the connected wallet; a
  // treasury source funds from the org treasury wallet; otherwise the caller's
  // personal platform-held custodial wallet.
  const ownerAddress = isExternal
    ? (externalOwnerAddress ?? null)
    : usingTreasury
      ? treasurySource!.address
      : walletAddress;

  const publishMutation = usePublishBountyEscrow(organizationId, bountyId);
  const runner = useEscrowOpRunner(
    { kind: 'organizer', organizationId, bountyId },
    isExternal ? { signXdr: signXdrWithKit } : undefined
  );

  const [hasStarted, setHasStarted] = useState(false);
  const [publishResponse, setPublishResponse] =
    useState<BountyPublishResponse | null>(null);
  const finalizedRef = useRef(false);

  useEffect(() => {
    if (!hasStarted || finalizedRef.current) return;

    if (runner.isCompleted) {
      finalizedRef.current = true;
      setPublishResponse({
        id: bountyId,
        message: 'Bounty published successfully',
        transactionHash: runner.txHash,
      });
      clearPublishOpId(bountyId);
      toast.success('Bounty published!', { duration: 3000 });
      setHasStarted(false);
    } else if (runner.isFailed) {
      finalizedRef.current = true;
      // The backend returns the bounty to DRAFT on a failed CREATE_EVENT, so
      // drop the stale op id; the next attempt starts a fresh publish.
      clearPublishOpId(bountyId);
      toast.error(runner.error || 'Failed to publish bounty');
      setHasStarted(false);
    }
  }, [
    hasStarted,
    runner.isCompleted,
    runner.isFailed,
    runner.error,
    runner.txHash,
    bountyId,
  ]);

  const publish = async (): Promise<BountyPublishResponse | null> => {
    if (!organizationId) {
      toast.error('Organization ID is required');
      return null;
    }
    if (!bountyId) {
      toast.error('Draft ID is required');
      return null;
    }
    if (!ownerAddress) {
      toast.error(
        isExternal
          ? 'Connect a wallet to fund externally.'
          : 'Please connect your wallet first'
      );
      return null;
    }

    // Pre-flight: a prior publish may have moved the bounty out of draft. The
    // backend rejects re-publishing a draft_awaiting_funding row, so resume the
    // in-flight op (or report the terminal state) instead.
    let currentStatus: string | undefined;
    try {
      const draft = await getBountyDraft(organizationId, bountyId);
      currentStatus = draft.status;
    } catch {
      // Non-fatal: fall through to the normal publish path.
    }

    if (currentStatus && PUBLISHED_STATUSES.has(currentStatus)) {
      clearPublishOpId(bountyId);
      toast.success('This bounty is already published.');
      return null;
    }

    if (currentStatus === 'draft_awaiting_funding') {
      const storedOpRowId = readPublishOpId(bountyId);
      if (storedOpRowId) {
        // A publish op is in flight locally — resume polling it rather than
        // starting a second (double-funding) publish.
        finalizedRef.current = false;
        setHasStarted(true);
        toast.info('Resuming bounty funding…');
        await runner.run(() =>
          getBountyEscrowOp(organizationId, bountyId, storedOpRowId)
        );
        return null;
      }
      // No resumable op locally: the publish stranded the bounty (e.g. the
      // managed sign/submit failed before settling). Try to return it to draft
      // so we can republish. The backend refuses if the op might still settle.
      try {
        await resetBountyEscrowToDraft(organizationId, bountyId);
        clearPublishOpId(bountyId);
        toast.info('Returned to draft — retrying publish…');
        // Status is now draft; fall through to the normal publish path below.
      } catch {
        toast.info(
          'This bounty is still being funded on-chain. It will finish ' +
            'publishing shortly, or return to draft if the transaction fails — ' +
            'refresh in a moment to check.'
        );
        return null;
      }
    }

    // ---- Normal draft publish path ----
    const reward = stepData.reward;
    const submission = stepData.submission;
    if (!reward || (reward.prizeTiers?.length ?? 0) === 0) {
      toast.error('Add at least one prize tier before publishing');
      return null;
    }
    if (!submission?.submissionDeadline) {
      toast.error('A submission deadline is required before publishing');
      return null;
    }

    const budget = getBountyPrizePool(reward);
    if (!(budget > 0)) {
      toast.error('Total prize amount must be greater than zero');
      return null;
    }

    // create_event debits budget + platform fee from the owner's USDC. Catch an
    // insufficient/missing balance here (MANAGED only — EXTERNAL funds from a
    // wallet whose balance we don't track) with a clear message.
    const required = getBountyTotalFunding(reward);
    const usdcEntry = balances.find(b => b.asset_code === 'USDC');
    const usdcBalance = parseFloat(usdcEntry?.balance ?? '0');
    const fmt = (n: number) =>
      n.toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (
      !isExternal &&
      !usingTreasury &&
      balances.length > 0 &&
      usdcBalance < required
    ) {
      toast.error(
        usdcEntry
          ? `Insufficient USDC. Publishing locks ${fmt(required)} USDC ` +
              `(${fmt(budget)} prizes + ${fmt(required - budget)} fee), but ` +
              `your wallet has ${fmt(usdcBalance)} USDC.`
          : `Your wallet has no USDC. Publishing locks ${fmt(required)} USDC. ` +
              `Add USDC (and a USDC trustline) before publishing.`
      );
      return null;
    }

    let tokenAddress: string;
    try {
      tokenAddress = getTokenAddress('USDC');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Prize token is not configured'
      );
      return null;
    }

    const deadlineMs = new Date(submission.submissionDeadline).getTime();
    if (Number.isNaN(deadlineMs)) {
      toast.error('Submission deadline is invalid');
      return null;
    }
    const submissionDeadline = Math.floor(deadlineMs / 1000);

    const body: PublishBountyEscrowRequest = {
      ownerAddress,
      tokenAddress,
      budget: String(budget),
      submissionDeadline,
      winnerDistribution: buildBountyWinnerDistribution(reward),
      fundingMode,
      ...(usingTreasury ? { sourceWalletId: treasurySource!.walletId } : {}),
    };

    finalizedRef.current = false;
    setHasStarted(true);
    setPublishResponse(null);
    toast.info('Publishing bounty...');

    const op = await runner.run(async () => {
      const created = await publishMutation.mutateAsync(body);
      persistPublishOpId(bountyId, created.id);
      return created;
    });

    if (!op) setHasStarted(false);
    return null;
  };

  return {
    isPublishing: hasStarted && (publishMutation.isPending || runner.isRunning),
    publish,
    publishResponse,
    escrowStatus: runner.status,
    escrowPhase: runner.phase,
    escrowError: runner.error,
    escrowTxHash: runner.txHash,
  };
};
