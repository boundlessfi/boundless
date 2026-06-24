'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle,
  XCircle,
  Loader2,
  ArrowLeft,
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
import { useBounty } from '@/hooks/use-bounty';
import { cancelBounty } from '@/lib/api/bounties';
import { reportError } from '@/lib/error-reporting';

export default function CancelPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;
  const bountyId = params.bountyId as string;

  const { bounty, loading } = useBounty({ organizationId, bountyId });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const canCancel =
    bounty &&
    !['COMPLETED', 'CANCELLED'].includes(bounty.status);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await cancelBounty(organizationId, bountyId);
      if (res.success) {
        setTxHash(res.data?.txHash ?? null);
        toast.success('Bounty cancelled — escrow funds will be refunded');
        router.push(`/organizations/${organizationId}/bounties/${bountyId}`);
      } else {
        toast.error(res.message || 'Failed to cancel bounty');
      }
    } catch (err) {
      reportError(err, { context: 'cancel-bounty', bountyId });
      toast.error('Failed to cancel bounty');
    } finally {
      setCancelling(false);
      setConfirmOpen(false);
    }
  };

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='min-h-screen bg-black'>
        {/* Header */}
        <div className='border-b border-gray-900 p-4'>
          <div className='mx-auto max-w-7xl'>
            <h1 className='text-3xl font-light tracking-tight text-white sm:text-4xl'>
              Cancel Bounty
            </h1>
            <p className='mt-2 text-sm text-gray-400'>
              Terminate this bounty and refund escrowed funds
            </p>
          </div>
        </div>

        <div className='mx-auto max-w-3xl px-6 py-12 sm:px-8'>
          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
            </div>
          ) : !bounty ? null : !canCancel ? (
            <Alert className='border-zinc-700/50 bg-zinc-900/50'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle className='text-white'>Cannot cancel</AlertTitle>
              <AlertDescription className='text-zinc-400'>
                This bounty is already{' '}
                <span className='font-medium text-white'>{bounty.status.toLowerCase()}</span>{' '}
                and cannot be cancelled.
              </AlertDescription>
            </Alert>
          ) : (
            <div className='space-y-6'>
              <Alert variant='destructive' className='border-red-900/30 bg-red-950/20'>
                <XCircle className='h-4 w-4' />
                <AlertTitle>This action is irreversible</AlertTitle>
                <AlertDescription className='text-zinc-300'>
                  Cancelling will call the <code>cancel</code> function on the
                  escrow contract. All locked funds will be returned to the
                  organizer wallet. Any active applications or submissions will
                  be closed.
                </AlertDescription>
              </Alert>

              <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-2'>
                <p className='text-xs text-zinc-500 uppercase tracking-wider'>
                  Bounty
                </p>
                <p className='text-base font-medium text-white'>{bounty.title}</p>
                <p className='text-sm text-zinc-400'>
                  Status:{' '}
                  <span className='text-white capitalize'>
                    {bounty.status.toLowerCase()}
                  </span>
                </p>
                <p className='text-sm text-zinc-400'>
                  Reward:{' '}
                  <span className='text-white'>
                    {bounty.rewardAmount} {bounty.rewardToken}
                  </span>
                </p>
              </div>

              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  className='border-zinc-700 text-zinc-300'
                  onClick={() => router.back()}
                >
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Go back
                </Button>
                <Button
                  variant='destructive'
                  onClick={() => setConfirmOpen(true)}
                  disabled={cancelling}
                >
                  <XCircle className='mr-2 h-4 w-4' />
                  Cancel bounty &amp; refund
                </Button>
              </div>
            </div>
          )}
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent className='border-zinc-800 bg-zinc-950'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-white'>
                Confirm cancellation
              </AlertDialogTitle>
              <AlertDialogDescription className='text-zinc-400'>
                Are you sure you want to cancel <strong className='text-white'>{bounty?.title}</strong>?
                Escrowed funds will be returned to your wallet. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='border-zinc-700 text-zinc-300'>
                Keep bounty
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                disabled={cancelling}
                className='bg-destructive hover:bg-destructive/90 text-white'
              >
                {cancelling ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Cancelling…
                  </>
                ) : (
                  'Yes, cancel & refund'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
}
