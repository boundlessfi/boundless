import { PLATFORM_FEE } from '@/lib/utils/hackathon-escrow';

/**
 * Crowdfunding fee model.
 *
 * The platform fee is borne by the creator: it comes out of the funding goal,
 * not added on top of what backers pay. A creator asking for $7,000 has the
 * fee deducted from that $7,000 and receives the remainder, released equally
 * across milestones. Backers contribute toward the goal and pay no extra.
 */
export { PLATFORM_FEE };

export interface FeeBreakdown {
  /** What the creator asks backers to fund. */
  goal: number;
  /** Boundless fee, deducted from the goal. */
  fee: number;
  /** What the creator receives after the fee. */
  net: number;
  feePercent: number;
}

export function feeBreakdown(goal: number): FeeBreakdown {
  const safeGoal = goal > 0 ? goal : 0;
  const fee = parseFloat((safeGoal * (PLATFORM_FEE / 100)).toFixed(2));
  const net = parseFloat((safeGoal - fee).toFixed(2));
  return { goal: safeGoal, fee, net, feePercent: PLATFORM_FEE };
}

/**
 * Even split of the net (post-fee) amount across milestones. The escrow
 * contract releases funds with dynamic "remaining / milestones left" math, so
 * we store the even split to match what the creator sees.
 */
export function equalSplit(goal: number, nMilestones: number) {
  const n = Math.max(1, nMilestones);
  const { net } = feeBreakdown(goal);
  return {
    percentage: parseFloat((100 / n).toFixed(2)),
    amount: parseFloat((net / n).toFixed(2)),
  };
}

export function money(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
