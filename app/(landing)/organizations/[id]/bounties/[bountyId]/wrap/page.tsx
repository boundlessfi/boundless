'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  Trophy,
  Archive,
  Share2,
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
import { useBounty, useBountyPayout } from '@/hooks/use-bounty';
import { archiveBounty } from '@/lib/api/bounties';
import { getTransactionExplorerUrl } from '@/lib/wallet-utils';
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

export default function WrapPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const bountyId = params.bountyId as string;

  const { bounty, loading: bountyLoading } = useBounty({ organizationId, bountyId });
  const { winners, loading: payoutLoading, error } = useBountyPayout({
    organizationId,
    bountyId,
  });

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const res = await archiveBounty(organizationId, bountyId);
      if (res.success) {
        toast.success('Bounty archived successfully');
      } else {
        toast.error(res.message || 'Failed to archive bounty');
      }
    } catch (err) {
      reportError(err, { context: 'wrap-archive', bountyId });
      toast.error('Failed to archive bounty');
    } finally {
      setArchiving(false);
      setArchiveOpen(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/bounties/${bounty?.slug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const isLoading = bountyLoading || payoutLoading;
  const isCompleted = bounty?.status === 'COMPLETED';

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='min-h-screen bg-black'>
        {/* Header */}
        <div className='border-b border-gray-900 p-4'>
          <div className='mx-auto max-w-7xl flex items-center justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-light tracking-tight text-white sm:text-4xl'>
                Wrap
              </h1>
              <p className='mt-2 text-sm text-gray-400'>
                Announce results and archive the bounty
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                className='border-zinc-700 text-zinc-300'
                onClick={handleCopyLink}
                disabled={!bounty}
              >
                <Share2 className='mr-2 h-4 w-4' />
                Share results
              </Button>
              {!isCompleted && (
                <Button
                  variant='outline'
                  className='border-zinc-700 text-zinc-300 hover:bg-zinc-900'
                  onClick={() => setArchiveOpen(true)}
                  disabled={isLoading}
                >
                  <Archive className='mr-2 h-4 w-4' />
                  Archive
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className='mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12 space-y-8'>
          {error && (
            <Alert variant='destructive' className='border-red-900/20 bg-red-950/20'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className='flex items-center justify-center py-20'>
              <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
            </div>
          ) : (
            <>
              {/* Completion banner */}
              {isCompleted && (
                <Alert className='border-green-500/20 bg-green-500/5'>
                  <CheckCircle2 className='h-4 w-4 text-green-500' />
                  <AlertTitle className='text-green-400'>
                    Bounty completed
                  </AlertTitle>
                  <AlertDescription className='text-zinc-400'>
                    This bounty has been settled on-chain and rewards distributed
                    to winners.
                  </AlertDescription>
                </Alert>
              )}

              {/* Winners podium */}
              <section>
                <div className='mb-6 flex items-center gap-2'>
                  <Trophy className='h-4 w-4 text-zinc-500' />
                  <h2 className='text-sm font-medium text-zinc-500 uppercase tracking-wider'>
                    Winners
                  </h2>
                </div>

                {winners.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-16 text-zinc-500 rounded-xl border border-zinc-800 bg-zinc-900/30'>
                    <Trophy className='h-10 w-10 mb-3 opacity-40' />
                    <p className='text-sm'>
                      No winners selected yet. Complete payout first.
                    </p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {winners
                      .slice()
                      .sort((a, b) => a.rank - b.rank)
                      .map(w => (
                        <div
                          key={w.submissionId}
                          className='flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'
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
                                href={getTransactionExplorerUrl(w.txHash)}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-zinc-400 hover:text-white transition-colors'
                              >
                                <ArrowUpRight className='h-4 w-4' />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
          <AlertDialogContent className='border-zinc-800 bg-zinc-950'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-white'>
                Archive bounty
              </AlertDialogTitle>
              <AlertDialogDescription className='text-zinc-400'>
                Archiving marks this bounty as completed and removes it from
                active listings. The results page will remain publicly accessible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='border-zinc-700 text-zinc-300'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleArchive}
                disabled={archiving}
                className='bg-primary hover:bg-primary/90'
              >
                {archiving ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Archiving…
                  </>
                ) : (
                  'Archive bounty'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
}
