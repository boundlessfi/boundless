'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCrowdfundContract } from '@/hooks/use-crowdfund-contract';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface MilestoneDisputeModalProps {
  campaignId: string;
  onChainId: string;
  milestoneIndex: number;
  milestoneTitle: string;
  onSuccess?: () => void;
  children: React.ReactNode;
}

export function MilestoneDisputeModal({
  campaignId,
  onChainId,
  milestoneIndex,
  milestoneTitle,
  onSuccess,
  children,
}: MilestoneDisputeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'signing'>('input');
  const [error, setError] = useState<string | null>(null);
  const { isConnected, disputeMilestone, parseCrowdfundError } =
    useCrowdfundContract();

  const resetForm = () => {
    setReason('');
    setStep('input');
    setError(null);
  };

  const handleDispute = async () => {
    if (!reason || reason.length < 10) {
      setError(
        'Please provide a reason for the dispute (at least 10 characters)'
      );
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet to dispute this milestone');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Sign the dispute_milestone transaction on-chain
      setStep('signing');
      const transactionHash = await disputeMilestone(onChainId, milestoneIndex);

      toast.success('Milestone disputed successfully', {
        description: `Dispute filed for "${milestoneTitle}". Tx: ${transactionHash.slice(0, 8)}...`,
      });

      setIsOpen(false);
      resetForm();
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = parseCrowdfundError(err);
      setError(errorMessage);
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle className='text-foreground flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-red-400' />
            Dispute Milestone
          </DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            {step === 'signing'
              ? 'Please approve the transaction in your wallet'
              : 'File a dispute for this milestone if you believe the deliverables are not met'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5'>
          {/* Milestone Info */}
          <div className='rounded-lg border border-red-500/30 bg-red-500/10 p-4'>
            <p className='text-foreground text-sm font-medium'>
              {milestoneTitle}
            </p>
            <p className='text-muted-foreground text-xs'>
              Milestone #{milestoneIndex + 1} — This action will be recorded
              on-chain
            </p>
          </div>

          {step === 'input' && (
            <div className='space-y-5'>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  Reason for Dispute
                  <span className='text-muted-foreground ml-1 text-xs font-normal'>
                    (min 10 characters)
                  </span>
                </Label>
                <Textarea
                  placeholder='Explain why you believe this milestone has not been properly completed...'
                  value={reason}
                  onChange={e => {
                    setReason(e.target.value);
                    if (error) setError(null);
                  }}
                  className='min-h-[120px] resize-none'
                />
              </div>

              {!isConnected && (
                <div className='rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-600'>
                  Please connect your wallet to file a dispute.
                </div>
              )}

              {error && (
                <div className='border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm'>
                  {error}
                </div>
              )}

              <div className='flex gap-3 pt-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsOpen(false)}
                  className='flex-1'
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDispute}
                  disabled={isLoading || !isConnected}
                  variant='destructive'
                  className='flex-1'
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Processing...
                    </>
                  ) : (
                    'File Dispute'
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'signing' && (
            <div className='space-y-4 py-8 text-center'>
              <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10'>
                <Loader2 className='h-8 w-8 animate-spin text-red-400' />
              </div>
              <div className='space-y-1'>
                <p className='text-foreground font-medium'>
                  Approve the dispute transaction
                </p>
                <p className='text-muted-foreground text-sm'>
                  Check your wallet to sign the transaction
                </p>
              </div>
              {error && (
                <div className='border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm'>
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
