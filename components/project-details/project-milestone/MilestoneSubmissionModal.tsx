'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { updateMilestone } from '@/features/projects/api';
import { useCrowdfundContract } from '@/hooks/use-crowdfund-contract';
import {
  Loader2,
  Plus,
  X,
  FileText,
  Link as LinkIcon,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

interface MilestoneSubmissionModalProps {
  campaignId: string;
  onChainId: string;
  milestoneIndex: number;
  milestoneTitle: string;
  onSuccess?: () => void;
  children: React.ReactNode;
}

export function MilestoneSubmissionModal({
  campaignId,
  onChainId,
  milestoneIndex,
  milestoneTitle,
  onSuccess,
  children,
}: MilestoneSubmissionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [proofOfWorkLinks, setProofOfWorkLinks] = useState<string[]>(['']);
  const [proofOfWorkFiles, setProofOfWorkFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'signing' | 'confirming'>('input');
  const [error, setError] = useState<string | null>(null);
  const { isConnected, submitMilestone, parseCrowdfundError } =
    useCrowdfundContract();

  const addLink = () => setProofOfWorkLinks(prev => [...prev, '']);
  const removeLink = (index: number) =>
    setProofOfWorkLinks(prev => prev.filter((_, i) => i !== index));
  const updateLink = (index: number, value: string) =>
    setProofOfWorkLinks(prev => prev.map((l, i) => (i === index ? value : l)));

  const addFile = () => setProofOfWorkFiles(prev => [...prev, '']);
  const removeFile = (index: number) =>
    setProofOfWorkFiles(prev => prev.filter((_, i) => i !== index));
  const updateFile = (index: number, value: string) =>
    setProofOfWorkFiles(prev => prev.map((f, i) => (i === index ? value : f)));

  const resetForm = () => {
    setSubmissionNotes('');
    setProofOfWorkLinks(['']);
    setProofOfWorkFiles([]);
    setStep('input');
    setError(null);
  };

  const handleSubmit = async () => {
    const validLinks = proofOfWorkLinks.filter(l => l.trim());
    const validFiles = proofOfWorkFiles.filter(f => f.trim());

    if (
      !submissionNotes &&
      validLinks.length === 0 &&
      validFiles.length === 0
    ) {
      setError(
        'Please provide at least one proof of work (notes, link, or file URL)'
      );
      return;
    }

    if (submissionNotes && submissionNotes.length < 10) {
      setError('Submission notes must be at least 10 characters');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet to submit a milestone');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Sign the submit_milestone transaction on-chain
      setStep('signing');
      const transactionHash = await submitMilestone(onChainId, milestoneIndex);

      // Step 2: Record the submission in the backend
      setStep('confirming');
      await updateMilestone(campaignId, milestoneIndex, {
        proofOfWorkLinks: validLinks,
        proofOfWorkFiles: validFiles,
        submissionNotes: submissionNotes || undefined,
      });

      toast.success('Milestone submitted successfully!', {
        description: `"${milestoneTitle}" has been submitted for review. Tx: ${transactionHash.slice(0, 8)}...`,
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

  const getStepMessage = () => {
    switch (step) {
      case 'signing':
        return 'Please approve the transaction in your wallet';
      case 'confirming':
        return 'Recording your milestone submission...';
      default:
        return 'Provide proof of work for this milestone';
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
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[560px]'>
        <DialogHeader>
          <DialogTitle className='text-foreground flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            Submit Milestone
          </DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            {getStepMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5'>
          {/* Milestone Info */}
          <div className='border-border bg-muted/30 rounded-lg border p-4'>
            <p className='text-foreground text-sm font-medium'>
              {milestoneTitle}
            </p>
            <p className='text-muted-foreground text-xs'>
              Milestone #{milestoneIndex + 1}
            </p>
          </div>

          {step === 'input' && (
            <div className='space-y-5'>
              {/* Submission Notes */}
              <div className='space-y-2'>
                <Label className='flex items-center gap-2 text-sm font-medium'>
                  <FileText className='h-4 w-4' />
                  Submission Notes
                  <span className='text-muted-foreground text-xs font-normal'>
                    (min 10 characters)
                  </span>
                </Label>
                <Textarea
                  placeholder='Describe what was accomplished for this milestone...'
                  value={submissionNotes}
                  onChange={e => {
                    setSubmissionNotes(e.target.value);
                    if (error) setError(null);
                  }}
                  className='min-h-[100px] resize-none'
                />
              </div>

              {/* Proof of Work Links */}
              <div className='space-y-2'>
                <Label className='flex items-center gap-2 text-sm font-medium'>
                  <LinkIcon className='h-4 w-4' />
                  Proof of Work Links
                  <span className='text-muted-foreground text-xs font-normal'>
                    (GitHub PRs, demos, etc.)
                  </span>
                </Label>
                {proofOfWorkLinks.map((link, index) => (
                  <div key={index} className='flex gap-2'>
                    <Input
                      placeholder='https://github.com/...'
                      value={link}
                      onChange={e => updateLink(index, e.target.value)}
                      className='flex-1'
                    />
                    {proofOfWorkLinks.length > 1 && (
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => removeLink(index)}
                        className='shrink-0'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={addLink}
                  className='w-full'
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add Link
                </Button>
              </div>

              {/* Proof of Work Files (URL inputs) */}
              <div className='space-y-2'>
                <Label className='flex items-center gap-2 text-sm font-medium'>
                  <FileText className='h-4 w-4' />
                  File URLs
                  <span className='text-muted-foreground text-xs font-normal'>
                    (IPFS, cloud storage, etc.)
                  </span>
                </Label>
                {proofOfWorkFiles.map((file, index) => (
                  <div key={index} className='flex gap-2'>
                    <Input
                      placeholder='https://... or ipfs://...'
                      value={file}
                      onChange={e => updateFile(index, e.target.value)}
                      className='flex-1'
                    />
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => removeFile(index)}
                      className='shrink-0'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={addFile}
                  className='w-full'
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add File URL
                </Button>
              </div>

              {!isConnected && (
                <div className='rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-600'>
                  Please connect your wallet to submit this milestone.
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
                  onClick={handleSubmit}
                  disabled={isLoading || !isConnected}
                  className='flex-1'
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Processing...
                    </>
                  ) : (
                    'Submit Milestone'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Signing/Confirming State */}
          {(step === 'signing' || step === 'confirming') && (
            <div className='space-y-4 py-8 text-center'>
              <div className='bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
                <Loader2 className='text-primary h-8 w-8 animate-spin' />
              </div>
              <div className='space-y-1'>
                <p className='text-foreground font-medium'>
                  {getStepMessage()}
                </p>
                <p className='text-muted-foreground text-sm'>
                  {step === 'signing'
                    ? 'Check your wallet to approve the transaction'
                    : 'This may take a few moments'}
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
