'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2, Trophy } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BoundlessButton } from '@/components/buttons';
import EmptyState from '@/components/EmptyState';
import { SealedUntilDeadline } from '@/components/bounties/SealedUntilDeadline';
import { useDeadlinePassed } from '@/components/bounties/use-deadline-passed';
import {
  useAllBountySubmissions,
  ESCROW_PHASE_LABEL,
  type BountyOperateOverview,
  type BountyWinnerSelection,
  type OrganizerBountySubmission,
} from '@/features/bounties';
import { useBountyPayout } from '@/hooks/use-bounty-payout';
import { formatPublicKey, ordinal } from '@/lib/utils';
import { getTransactionExplorerUrl } from '@/lib/wallet-utils';

const PHASE_LABEL = {
  ...ESCROW_PHASE_LABEL,
  starting: 'Preparing payout…',
  polling: 'Paying winners on-chain…',
};

const NONE = '__none__';

/** Token amounts arrive as decimal strings; show full Stellar precision. */
function formatAmount(amount: string | number): string {
  const n = Number(amount);
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 7 })
    : String(amount);
}

export default function BountyPayoutPanel({
  organizationId,
  bountyId,
  overview,
  staged,
}: {
  organizationId: string;
  bountyId: string;
  overview: BountyOperateOverview;
  /** Submissions staged on the Submissions tab; pinned first in the pickers. */
  staged: Set<string>;
}) {
  const isCompleted = overview.status === 'completed';
  const deadlinePassed = useDeadlinePassed(overview.submissionDeadline ?? null);
  // UX gate only, mirroring the Submissions tab. Publish validation guarantees
  // live competitions have a deadline, so a null deadline does not gate.
  const gated =
    overview.submissionVisibility === 'HIDDEN_UNTIL_DEADLINE' &&
    overview.submissionDeadline != null &&
    !deadlinePassed;

  // Winner selection must see the COMPLETE pool, never one review page.
  const {
    data: allSubmissions,
    isLoading,
    error,
  } = useAllBountySubmissions(organizationId, bountyId, { enabled: !gated });
  const submissions = useMemo(() => allSubmissions ?? [], [allSubmissions]);

  const payout = useBountyPayout({ organizationId, bountyId });

  // position -> submissionId
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const prizeTiers = useMemo(
    () => overview.prizeTiers.slice().sort((a, b) => a.position - b.position),
    [overview.prizeTiers]
  );

  // Payable: anchored on-chain, not rejected or disputed in review, and with
  // a payout address. (Server-side validation of the review axis is pending;
  // the UI must not offer submissions the organizer has turned down.)
  const eligible = useMemo(
    () =>
      submissions.filter(
        s =>
          s.escrowAnchorStatus === 'active' &&
          s.status !== 'rejected' &&
          s.status !== 'disputed' &&
          !!s.applicantAddress
      ),
    [submissions]
  );

  // Single source of truth for what the payout will contain: a tier counts
  // only while its assigned submission is still payable, so the summary, the
  // request body, and the total can never disagree.
  const resolved = useMemo(() => {
    const out: Array<{
      position: number;
      amount: string;
      sub: OrganizerBountySubmission;
    }> = [];
    for (const tier of prizeTiers) {
      const sub = eligible.find(s => s.id === assignments[tier.position]);
      if (sub) {
        out.push({
          position: tier.position,
          amount: String(tier.amount),
          sub,
        });
      }
    }
    return out;
  }, [assignments, prizeTiers, eligible]);

  const selections: BountyWinnerSelection[] = resolved.map(r => ({
    applicantAddress: r.sub.applicantAddress as string,
    position: r.position,
  }));
  const totalPayout = resolved.reduce((sum, r) => sum + Number(r.amount), 0);
  // The on-chain op is one-shot and completion strands unpaid tiers' escrow,
  // so every tier must have a winner before the payout can run.
  const allAssigned =
    prizeTiers.length > 0 && resolved.length === prizeTiers.length;

  // ── Completed: show the winners the backend recorded ──
  if (isCompleted) {
    const winners = submissions
      .filter(s => s.tierPosition != null)
      .sort((a, b) => (a.tierPosition as number) - (b.tierPosition as number));
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3'>
          <CheckCircle2 className='h-5 w-5 text-emerald-400' />
          <div>
            <p className='text-sm font-medium text-white'>Paid out</p>
            <p className='text-xs text-zinc-400'>
              This bounty is completed and rewards were pushed on-chain.
            </p>
          </div>
        </div>
        {winners.length === 0 ? (
          <EmptyState
            title='No winner records'
            description='This bounty completed without recorded winners.'
            type='compact'
          />
        ) : (
          winners.map(w => (
            <WinnerRow key={w.id} s={w} currency={overview.rewardCurrency} />
          ))
        )}
      </div>
    );
  }

  if (gated && overview.submissionDeadline) {
    return (
      <SealedUntilDeadline
        deadline={overview.submissionDeadline}
        title='Winner selection opens at the deadline'
        description='Competition submissions stay sealed until then.'
      />
    );
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <Loader2 className='h-5 w-5 animate-spin text-zinc-500' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-12'>
        <EmptyState
          title="Couldn't load submissions"
          description='Try again in a moment.'
          type='compact'
        />
      </div>
    );
  }

  if (prizeTiers.length === 0) {
    return (
      <EmptyState
        title='No prize tiers'
        description='This bounty has no prize tiers to award.'
        type='compact'
      />
    );
  }

  if (eligible.length === 0) {
    return (
      <EmptyState
        title='No eligible submissions'
        description='Winners are chosen from anchored submissions that are not rejected or disputed. None are available yet.'
        type='compact'
      />
    );
  }

  const setWinner = (position: number, submissionId: string) =>
    setAssignments(prev => {
      const next = { ...prev };
      if (submissionId === NONE) delete next[position];
      else next[position] = submissionId;
      return next;
    });

  // One applicant can win at most one tier: hide submissions whose id OR
  // payout address is already resolved to another tier (the backend rejects
  // duplicate addresses, so don't offer them).
  const optionsFor = (position: number) => {
    const takenIds = new Set<string>();
    const takenAddresses = new Set<string>();
    for (const r of resolved) {
      if (r.position === position) continue;
      takenIds.add(r.sub.id);
      if (r.sub.applicantAddress) takenAddresses.add(r.sub.applicantAddress);
    }
    return eligible
      .filter(
        s =>
          !takenIds.has(s.id) &&
          !(s.applicantAddress && takenAddresses.has(s.applicantAddress))
      )
      .slice()
      .sort((a, b) => Number(staged.has(b.id)) - Number(staged.has(a.id)));
  };

  const running = payout.isRunning;

  return (
    <div className='space-y-5'>
      <p className='text-sm text-zinc-400'>
        Assign a submission to every prize tier, then pay out in one signed
        transaction. On settle the bounty completes and rewards go on-chain.
      </p>

      <div className='space-y-3'>
        {prizeTiers.map(tier => (
          <div
            key={tier.position}
            className='flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4'
          >
            <div className='flex items-center gap-2'>
              <Trophy className='text-primary h-4 w-4' />
              <div>
                <p className='text-sm font-medium text-white'>
                  {ordinal(tier.position)} place
                </p>
                <p className='text-primary text-xs font-semibold'>
                  {formatAmount(tier.amount)} {overview.rewardCurrency}
                </p>
              </div>
            </div>
            <div className='flex-1'>
              <Select
                value={assignments[tier.position] ?? NONE}
                onValueChange={v => setWinner(tier.position, v)}
                disabled={running}
              >
                <SelectTrigger className='border-zinc-800 bg-zinc-900/50 text-white'>
                  <SelectValue placeholder='Choose a winner' />
                </SelectTrigger>
                <SelectContent className='border-zinc-800 bg-zinc-900 text-white'>
                  <SelectItem value={NONE}>No winner</SelectItem>
                  {optionsFor(tier.position).map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.submittedBy.name}
                      {s.submittedBy.username
                        ? ` (@${s.submittedBy.username})`
                        : ''}
                      {` · ${s.status}`}
                      {staged.has(s.id) ? ' · staged' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      {payout.isCompleted ? (
        <div className='space-y-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4'>
          <div className='flex items-center gap-2 text-sm text-white'>
            <CheckCircle2 className='h-4 w-4 text-emerald-400' />
            Winners paid out. The bounty is now completed.
          </div>
          {payout.txHash && (
            <a
              href={getTransactionExplorerUrl(payout.txHash)}
              target='_blank'
              rel='noreferrer'
              className='text-primary inline-flex items-center gap-1 text-xs hover:underline'
            >
              View payout transaction
              <ExternalLink className='h-3 w-3' />
            </a>
          )}
        </div>
      ) : running ? (
        <div className='flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-300'>
          <Loader2 className='text-primary h-4 w-4 animate-spin' />
          {PHASE_LABEL[payout.phase] || 'Working…'}
        </div>
      ) : (
        <div className='flex items-center justify-between gap-3 border-t border-zinc-800 pt-4'>
          <span className='text-sm text-zinc-400'>
            {allAssigned
              ? `Paying ${formatAmount(totalPayout)} ${overview.rewardCurrency} to ${resolved.length} winner${resolved.length > 1 ? 's' : ''}`
              : `Assign a winner to every tier (${resolved.length}/${prizeTiers.length}). The payout runs once; unassigned tiers can never be paid afterwards.`}
          </span>
          <BoundlessButton
            disabled={!allAssigned}
            onClick={() => setConfirmOpen(true)}
          >
            Select winners &amp; pay
          </BoundlessButton>
        </div>
      )}

      {/* Review + confirm before the irreversible on-chain payout. */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className='border-zinc-800 bg-zinc-950 text-white'>
          <DialogHeader>
            <DialogTitle>Confirm payout</DialogTitle>
            <DialogDescription>
              This pays every winner on-chain in one transaction. It cannot be
              undone, changed, or run again.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            {resolved.map(r => (
              <div
                key={r.position}
                className='flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm'
              >
                <span className='text-zinc-300'>
                  {ordinal(r.position)} place · {r.sub.submittedBy.name}
                </span>
                <span className='text-right'>
                  <span className='text-primary font-semibold'>
                    {formatAmount(r.amount)} {overview.rewardCurrency}
                  </span>
                  <span className='block font-mono text-xs text-zinc-500'>
                    {formatPublicKey(r.sub.applicantAddress as string)}
                  </span>
                </span>
              </div>
            ))}
            <div className='flex items-center justify-between px-3 pt-2 text-sm'>
              <span className='text-zinc-400'>Total</span>
              <span className='font-semibold text-white'>
                {formatAmount(totalPayout)} {overview.rewardCurrency}
              </span>
            </div>
          </div>
          <DialogFooter>
            <BoundlessButton
              variant='outline'
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </BoundlessButton>
            <BoundlessButton
              onClick={() => {
                setConfirmOpen(false);
                void payout.selectWinners(selections);
              }}
            >
              Confirm &amp; pay
            </BoundlessButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WinnerRow({
  s,
  currency,
}: {
  s: OrganizerBountySubmission;
  currency: string;
}) {
  const user = s.submittedBy;
  return (
    <div className='flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4'>
      <div className='flex items-center gap-2.5'>
        <Avatar className='h-8 w-8'>
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
          <AvatarFallback className='text-xs'>
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className='text-sm font-medium text-white'>{user.name}</p>
          <p className='text-xs text-zinc-500'>
            {ordinal(s.tierPosition as number)} place
          </p>
        </div>
      </div>
      <span className='text-primary text-sm font-semibold'>
        {s.tierAmount ? `${formatAmount(s.tierAmount)} ${currency}` : ''}
      </span>
    </div>
  );
}
