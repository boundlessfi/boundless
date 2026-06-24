'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthGuard } from '@/components/auth';
import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useEffect } from 'react';
import {
  getBountyDisputes,
  resolveDispute,
  type BountyDispute,
  type DisputeStatus,
} from '@/lib/api/bounties';
import { reportError } from '@/lib/error-reporting';

const STATUS_CONFIG: Record<DisputeStatus, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'bg-orange-500/20 text-orange-400' },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-blue-500/20 text-blue-400',
  },
  RESOLVED: { label: 'Resolved', className: 'bg-green-500/20 text-green-400' },
  DISMISSED: { label: 'Dismissed', className: 'bg-zinc-700/40 text-zinc-400' },
};

function DisputeCard({
  dispute,
  onResolveClick,
}: {
  dispute: BountyDispute;
  onResolveClick: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[dispute.status];
  const isActionable =
    dispute.status === 'OPEN' || dispute.status === 'UNDER_REVIEW';

  return (
    <div className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-3'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-sm font-medium text-white'>
            Raised by {dispute.raisedByUserName}
          </p>
          <p className='text-xs text-zinc-500'>
            {new Date(dispute.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
        >
          {cfg.label}
        </span>
      </div>

      <p className='text-sm text-zinc-400'>{dispute.description}</p>

      {dispute.resolution && (
        <div className='rounded-lg border border-green-500/20 bg-green-500/5 p-3'>
          <p className='text-xs font-medium text-green-400 mb-1 uppercase tracking-wider'>
            Resolution
          </p>
          <p className='text-sm text-zinc-300'>{dispute.resolution}</p>
        </div>
      )}

      {isActionable && (
        <Button
          size='sm'
          variant='outline'
          className='border-zinc-700 text-zinc-300 hover:bg-zinc-800'
          onClick={() => onResolveClick(dispute.id)}
        >
          <MessageSquare className='mr-1.5 h-3.5 w-3.5' />
          Add resolution
        </Button>
      )}
    </div>
  );
}

export default function DisputesPage() {
  const params = useParams();
  const organizationId = params.id as string;
  const bountyId = params.bountyId as string;

  const [disputes, setDisputes] = useState<BountyDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolveDialogId, setResolveDialogId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBountyDisputes(organizationId, bountyId);
      if (res.success && res.data) {
        setDisputes(res.data);
      } else {
        setError(res.message || 'Failed to load disputes');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load disputes';
      setError(msg);
      reportError(err, { context: 'disputes-fetch', bountyId });
    } finally {
      setLoading(false);
    }
  }, [organizationId, bountyId]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleResolve = async () => {
    if (!resolveDialogId || !resolution.trim()) return;
    setResolving(true);
    try {
      const res = await resolveDispute(
        organizationId,
        bountyId,
        resolveDialogId,
        resolution.trim()
      );
      if (res.success && res.data) {
        setDisputes(prev =>
          prev.map(d => (d.id === resolveDialogId ? res.data! : d))
        );
        toast.success('Resolution added');
        setResolveDialogId(null);
        setResolution('');
      } else {
        toast.error(res.message || 'Failed to add resolution');
      }
    } catch (err) {
      reportError(err, { context: 'disputes-resolve', resolveDialogId });
      toast.error('Failed to add resolution');
    } finally {
      setResolving(false);
    }
  };

  const openCount = disputes.filter(d => d.status === 'OPEN').length;
  const underReviewCount = disputes.filter(
    d => d.status === 'UNDER_REVIEW'
  ).length;
  const resolvedCount = disputes.filter(d => d.status === 'RESOLVED').length;

  return (
    <AuthGuard redirectTo='/auth?mode=signin' fallback={<Loading />}>
      <div className='min-h-screen bg-black'>
        {/* Header */}
        <div className='border-b border-gray-900 p-4'>
          <div className='mx-auto max-w-7xl'>
            <h1 className='text-3xl font-light tracking-tight text-white sm:text-4xl'>
              Disputes
            </h1>
            <p className='mt-2 text-sm text-gray-400'>
              Review and resolve disputes raised by participants
            </p>
          </div>
        </div>

        <div className='mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12 space-y-8'>
          {/* Stats */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <div className='rounded-xl border border-orange-500/20 bg-orange-500/5 p-5'>
              <div className='flex items-center gap-2 text-xs text-orange-400 uppercase tracking-wider mb-2'>
                <ShieldAlert className='h-3.5 w-3.5' />
                Open
              </div>
              <p className='text-2xl font-light text-white'>
                {loading ? '—' : openCount}
              </p>
            </div>
            <div className='rounded-xl border border-blue-500/20 bg-blue-500/5 p-5'>
              <div className='flex items-center gap-2 text-xs text-blue-400 uppercase tracking-wider mb-2'>
                <MessageSquare className='h-3.5 w-3.5' />
                Under Review
              </div>
              <p className='text-2xl font-light text-white'>
                {loading ? '—' : underReviewCount}
              </p>
            </div>
            <div className='rounded-xl border border-green-500/20 bg-green-500/5 p-5'>
              <div className='flex items-center gap-2 text-xs text-green-400 uppercase tracking-wider mb-2'>
                <CheckCircle2 className='h-3.5 w-3.5' />
                Resolved
              </div>
              <p className='text-2xl font-light text-white'>
                {loading ? '—' : resolvedCount}
              </p>
            </div>
          </div>

          {error && (
            <Alert variant='destructive' className='border-red-900/20 bg-red-950/20'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className='flex items-center justify-center py-20'>
              <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
            </div>
          ) : disputes.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-20 text-zinc-500 rounded-xl border border-zinc-800 bg-zinc-900/30'>
              <ShieldAlert className='h-10 w-10 mb-3 opacity-40' />
              <p className='text-sm'>No disputes raised</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {disputes.map(d => (
                <DisputeCard
                  key={d.id}
                  dispute={d}
                  onResolveClick={setResolveDialogId}
                />
              ))}
            </div>
          )}
        </div>

        <Dialog
          open={!!resolveDialogId}
          onOpenChange={open => {
            if (!open) {
              setResolveDialogId(null);
              setResolution('');
            }
          }}
        >
          <DialogContent className='border-zinc-800 bg-zinc-950'>
            <DialogHeader>
              <DialogTitle className='text-white'>Add resolution</DialogTitle>
              <DialogDescription className='text-zinc-400'>
                Describe how this dispute has been resolved. This will be visible
                to the participant who raised it.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder='Describe the resolution...'
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              rows={4}
              className='bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500'
            />
            <DialogFooter>
              <Button
                variant='outline'
                className='border-zinc-700 text-zinc-300'
                onClick={() => {
                  setResolveDialogId(null);
                  setResolution('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResolve}
                disabled={resolving || !resolution.trim()}
                className='bg-primary hover:bg-primary/90'
              >
                {resolving ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving…
                  </>
                ) : (
                  'Submit resolution'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
