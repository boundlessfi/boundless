'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  Trophy,
  Wallet,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBountySubmissions, useBountyPayout } from '@/hooks/use-bounty';
import { selectWinners, type BountySubmission } from '@/lib/api/bounties';
import { reportError } from '@/lib/error-reporting';

function RankBadge({ rank }: { rank: number }) {
  const colors = [
    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'bg-zinc-400/20 text-zinc-300 border-zinc-400/30',
    'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors[rank - 1] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-700/30'}`}
    >
      #{rank}
    </span>
  );
}

function SubmissionRankRow({
  submission,
  selectedRank,
  onRankToggle,
  maxWinners,
  disabled,
}: {
  submission: BountySubmission;
  selectedRank: number | null;
  onRankToggle: (id: string, rank: number | null) => void;
  maxWinners: number;
  disabled: boolean;
}) {
  return (
    <div className='flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'>
      <div className='flex items-center gap-3 min-w-0'>
        {selectedRank ? (
          <RankBadge rank={selectedRank} />
        ) : (
          <span className='inline-flex h-6 w-8 items-center justify-center rounded-full border border-zinc-700/40 text-xs text-zinc-600'>
            —
          </span>
        )}
        <div className='min-w-0'>
          <p className='text-sm font-medium text-white truncate'>
            {submission.title}
          </p>
          <p className='text-xs text-zinc-500'>{submission.userName}</p>
        </div>
      </div>

      <div className='flex gap-1 shrink-0 ml-4'>
        {Array.from({ length: maxWinners }, (_, i) => i + 1).map(rank => (
          <button
            key={rank}
            disabled={disabled}
            onClick={() =>
              onRankToggle(submission.id, selectedRank === rank ? null : rank)
            }
            className={`h-7 w-7 rounded-lg text-xs font-medium transition-all disabled:opacity-40 ${
              selectedRank === rank
                ? 'bg-primary text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {rank}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PayoutPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const bountyId = params.bountyId as string;

  const { submissions, loading: loadingSubs, error: subError } =
    useBountySubmissions({ organizationId, bountyId });
  const { winners, escrow, loading: loadingPayout, error: payoutError, refetch } =
    useBountyPayout({ organizationId, bountyId });

  const [rankMap, setRankMap] = useState<Record<string, number>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const MAX_WINNERS = 3;

  const handleRankToggle = useCallback(
    (submissionId: string, rank: number | null) => {
      setRankMap(prev => {
        const next = { ...prev };
        // Clear existing assignment for this rank slot
        if (rank !== null) {
          Object.keys(next).forEach(id => {
            if (next[id] === rank) delete next[id];
          });
          next[submissionId] = rank;
        } else {
          delete next[submissionId];
        }
        return next;
      });
    },
    []
  );

  const rankedCount = Object.keys(rankMap).length;

  const handleConfirmPayout = async () => {
    setPaying(true);
    try {
      const payload = Object.entries(rankMap).map(([submissionId, rank]) => ({
        submissionId,
        rank,
      }));
      const res = await selectWinners(organizationId, bountyId, {
        winners: payload,
      });
      if (res.success) {
        toast.success('Winners selected — payout initiated on-chain');
        setRankMap({});
        refetch();
      } else {
        toast.error(res.message || 'Failed to initiate payout');
      }
    } catch (err) {
      reportError(err, { context: 'payout-selectWinners', bountyId });
      toast.error('Failed to initiate payout');
    } finally {
      setPaying(false);
      setConfirmOpen(false);
    }
  };

  const isLoading = loadingSubs || loadingPayout;
  const error = subError || payoutError;

  const alreadyPaid = winners.length > 0;

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='min-h-screen bg-black'>
        {/* Header */}
        <div className='border-b border-gray-900 p-4'>
          <div className='mx-auto max-w-7xl flex items-center justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-light tracking-tight text-white sm:text-4xl'>
                Payout
              </h1>
              <p className='mt-2 text-sm text-gray-400'>
                Select winners and trigger on-chain reward distribution
              </p>
            </div>
            {!alreadyPaid && rankedCount > 0 && (
              <Button
                onClick={() => setConfirmOpen(true)}
                className='bg-primary hover:bg-primary/90'
                disabled={paying}
              >
                <Wallet className='mr-2 h-4 w-4' />
                Pay {rankedCount} winner{rankedCount !== 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>

        <div className='mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12 space-y-8'>
          {/* Escrow card */}
          {escrow && (
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 flex items-center justify-between gap-4'>
              <div>
                <p className='text-xs text-zinc-500 uppercase tracking-wider mb-1'>
                  Escrow balance
                </p>
                <p className='text-2xl font-light text-white'>
                  {escrow.balance} {escrow.token}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <span
                  className={`h-2 w-2 rounded-full ${escrow.funded ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span className='text-xs text-zinc-400'>
                  {escrow.funded ? 'Funded' : 'Not funded'}
                </span>
              </div>
            </div>
          )}

          {error && (
            <Alert variant='destructive' className='border-red-900/20 bg-red-950/20'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Already paid winners */}
          {alreadyPaid && (
            <section>
              <div className='mb-4 flex items-center gap-2'>
                <CheckCircle2 className='h-4 w-4 text-green-500' />
                <h2 className='text-sm font-medium text-green-400 uppercase tracking-wider'>
                  Winners paid
                </h2>
              </div>
              <div className='space-y-3'>
                {winners.map(w => (
                  <div
                    key={w.submissionId}
                    className='flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/5 p-4'
                  >
                    <div className='flex items-center gap-3'>
                      <RankBadge rank={w.rank} />
                      <p className='text-sm font-medium text-white'>
                        {w.userName}
                      </p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='text-sm text-zinc-300'>
                        {w.rewardAmount} tokens
                      </span>
                      {w.txHash && (
                        <a
                          href={`https://etherscan.io/tx/${w.txHash}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-zinc-400 hover:text-white'
                        >
                          <ArrowUpRight className='h-4 w-4' />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Rank assignment */}
          {!alreadyPaid && (
            <section>
              <div className='mb-4 flex items-center gap-2'>
                <Trophy className='h-4 w-4 text-zinc-500' />
                <h2 className='text-sm font-medium text-zinc-500 uppercase tracking-wider'>
                  Assign ranks (max {MAX_WINNERS})
                </h2>
              </div>

              {isLoading ? (
                <div className='flex items-center justify-center py-20'>
                  <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
                </div>
              ) : submissions.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-20 text-zinc-500'>
                  <Trophy className='h-10 w-10 mb-3 opacity-40' />
                  <p className='text-sm'>No submissions to rank</p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {submissions.map(sub => (
                    <SubmissionRankRow
                      key={sub.id}
                      submission={sub}
                      selectedRank={rankMap[sub.id] ?? null}
                      onRankToggle={handleRankToggle}
                      maxWinners={MAX_WINNERS}
                      disabled={paying}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent className='border-zinc-800 bg-zinc-950'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-white'>
                Confirm payout
              </AlertDialogTitle>
              <AlertDialogDescription className='text-zinc-400'>
                This will call <code className='text-white'>select-winners</code> on
                the escrow contract and distribute rewards on-chain. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='border-zinc-700 text-zinc-300'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmPayout}
                disabled={paying}
                className='bg-primary hover:bg-primary/90'
              >
                {paying ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Processing…
                  </>
                ) : (
                  'Confirm & pay'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
}
