'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCrowdfundContract } from '@/hooks/use-crowdfund-contract';
import {
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  FileText,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadMilestoneDocuments } from '@/lib/api/upload';
import { submitDisputeEvidence } from '@/features/projects/api';

interface MilestoneDisputeModalProps {
  campaignId: string;
  onChainId: string;
  milestoneIndex: number;
  milestoneTitle: string;
  onSuccess?: () => void;
  children: React.ReactNode;
}

type Step = 'input' | 'uploading' | 'signing' | 'saving';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const STEP_DESCRIPTION: Record<Step, string> = {
  input:
    'File a dispute for this milestone if you believe the deliverables are not met',
  uploading: 'Uploading your evidence files…',
  signing: 'Please approve the transaction in your wallet',
  saving: 'Recording dispute details…',
};

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
  const [evidenceLinks, setEvidenceLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>('input');
  const [error, setError] = useState<string | null>(null);

  const { isConnected, disputeMilestone, parseCrowdfundError } =
    useCrowdfundContract();

  const resetForm = () => {
    setReason('');
    setEvidenceLinks([]);
    setNewLink('');
    setDocuments([]);
    setStep('input');
    setError(null);
  };

  // ── File handling ──────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const invalidFiles = files.filter(f => !ALLOWED_TYPES.includes(f.type));
    if (invalidFiles.length > 0) {
      setError('Please upload only PDF, Word documents, or images.');
      return;
    }

    const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setError('Some files exceed the 5 MB limit.');
      return;
    }

    const newTotal = [...documents, ...files].reduce(
      (sum, f) => sum + f.size,
      0
    );
    if (newTotal > MAX_TOTAL_SIZE) {
      setError('Total file size must be under 15 MB.');
      return;
    }

    setError(null);
    setDocuments(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeDocument = (index: number) =>
    setDocuments(prev => prev.filter((_, i) => i !== index));

  // ── Link handling ──────────────────────────────────────────────────────────
  const addLink = () => {
    if (!newLink.trim()) return;
    try {
      new URL(newLink.trim());
      setEvidenceLinks(prev => [...prev, newLink.trim()]);
      setNewLink('');
      setError(null);
    } catch {
      setError('Please enter a valid URL.');
    }
  };

  const removeLink = (index: number) =>
    setEvidenceLinks(prev => prev.filter((_, i) => i !== index));

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleDispute = async () => {
    if (!reason || reason.trim().length < 10) {
      setError(
        'Please provide a reason for the dispute (at least 10 characters).'
      );
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet to dispute this milestone.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Upload evidence files (if any)
      let uploadedFileUrls: string[] = [];
      if (documents.length > 0) {
        setStep('uploading');
        const uploadResult = await uploadMilestoneDocuments(
          documents,
          campaignId,
          milestoneIndex
        );
        uploadedFileUrls = uploadResult.data.map(f => f.secure_url);
      }

      // 2. Sign the on-chain dispute transaction
      setStep('signing');
      const transactionHash = await disputeMilestone(onChainId, milestoneIndex);

      // 3. Persist evidence to backend (fire-and-forget — gated on #78)
      setStep('saving');
      try {
        await submitDisputeEvidence(campaignId, milestoneIndex, {
          reason: reason.trim(),
          evidenceLinks,
          evidenceFiles: uploadedFileUrls,
          transactionHash,
        });
      } catch {
        // Backend endpoint not yet available (boundlessfi/boundless-nestjs#78)
        // On-chain dispute already recorded; swallow the error silently.
      }

      toast.success('Dispute filed successfully', {
        description: `Dispute filed for "${milestoneTitle}". Tx: ${transactionHash.slice(0, 8)}…`,
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

  const isInputStep = step === 'input';
  const isSpinnerStep = step !== 'input';

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle className='text-foreground flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-red-400' />
            Dispute Milestone
          </DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            {STEP_DESCRIPTION[step]}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5'>
          {/* Milestone info */}
          <div className='rounded-lg border border-red-500/30 bg-red-500/10 p-4'>
            <p className='text-foreground text-sm font-medium'>
              {milestoneTitle}
            </p>
            <p className='text-muted-foreground text-xs'>
              Milestone #{milestoneIndex + 1} — This action will be recorded
              on-chain
            </p>
          </div>

          {isInputStep && (
            <div className='space-y-5'>
              {/* Reason */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  Reason for Dispute
                  <span className='text-muted-foreground ml-1 text-xs font-normal'>
                    (min 10 characters)
                  </span>
                </Label>
                <Textarea
                  placeholder='Explain why you believe this milestone has not been properly completed…'
                  value={reason}
                  onChange={e => {
                    setReason(e.target.value);
                    if (error) setError(null);
                  }}
                  className='min-h-[100px] resize-none'
                  maxLength={2000}
                />
                <div className='flex justify-end'>
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      reason.length < 10
                        ? 'text-amber-500'
                        : reason.length > 1800
                          ? 'text-red-500'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {reason.length}/2000
                  </span>
                </div>
              </div>

              {/* Evidence links */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  Evidence Links
                  <span className='text-muted-foreground ml-1 text-xs font-normal'>
                    (optional)
                  </span>
                </Label>
                <div className='flex gap-2'>
                  <Input
                    value={newLink}
                    onChange={e => setNewLink(e.target.value)}
                    onKeyDown={e =>
                      e.key === 'Enter' && (e.preventDefault(), addLink())
                    }
                    placeholder='https://…'
                    className='text-sm'
                  />
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={addLink}
                    disabled={!newLink.trim()}
                  >
                    Add
                  </Button>
                </div>
                {evidenceLinks.length > 0 && (
                  <ul className='space-y-1.5'>
                    {evidenceLinks.map((link, i) => (
                      <li
                        key={i}
                        className='bg-muted/20 flex items-center justify-between rounded px-3 py-2 text-sm'
                      >
                        <span className='flex items-center gap-2 truncate text-white/80'>
                          <ExternalLink className='h-3 w-3 shrink-0 text-white/40' />
                          {link}
                        </span>
                        <button
                          type='button'
                          onClick={() => removeLink(i)}
                          className='ml-2 shrink-0 text-white/40 hover:text-red-400'
                        >
                          <X className='h-4 w-4' />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Evidence documents */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  Supporting Documents
                  <span className='text-muted-foreground ml-1 text-xs font-normal'>
                    (optional)
                  </span>
                </Label>
                <input
                  id='dispute-docs'
                  type='file'
                  accept='.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp'
                  multiple
                  className='hidden'
                  onChange={handleFileChange}
                />
                <Button
                  type='button'
                  variant='outline'
                  className='w-full'
                  onClick={() =>
                    (
                      window.document.getElementById(
                        'dispute-docs'
                      ) as HTMLInputElement
                    )?.click()
                  }
                >
                  <Upload className='mr-2 h-4 w-4' />
                  {documents.length > 0 ? 'Add More Files' : 'Upload Files'}
                </Button>

                {documents.length > 0 && (
                  <div className='space-y-2'>
                    <div className='flex flex-wrap gap-2'>
                      {documents.map((doc, i) => {
                        const isOversized = doc.size > MAX_FILE_SIZE;
                        return (
                          <div
                            key={i}
                            className={`inline-flex max-w-[260px] items-center gap-2 rounded-full px-3 py-2 text-sm ${
                              isOversized
                                ? 'border border-red-500/30 bg-red-500/15 text-red-300'
                                : 'border border-white/20 bg-white/5 text-white/80'
                            }`}
                          >
                            <FileText className='h-3.5 w-3.5 shrink-0' />
                            <span className='min-w-0 flex-1 truncate'>
                              {doc.name}
                            </span>
                            <span className='shrink-0 font-mono text-xs text-white/40'>
                              {(doc.size / (1024 * 1024)).toFixed(1)}MB
                            </span>
                            <button
                              type='button'
                              onClick={() => removeDocument(i)}
                              className='shrink-0 text-white/40 hover:text-red-400'
                            >
                              <X className='h-3.5 w-3.5' />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {documents.some(d => d.size > MAX_FILE_SIZE) && (
                      <Alert className='border-red-500/30 bg-red-500/10'>
                        <AlertCircle className='h-4 w-4 text-red-400' />
                        <AlertDescription className='ml-2 text-xs text-red-300'>
                          Some files exceed the 5 MB limit.
                        </AlertDescription>
                      </Alert>
                    )}
                    <p className='text-muted-foreground text-xs'>
                      PDF, Word, or images · Max 5 MB per file · 15 MB total
                    </p>
                  </div>
                )}
              </div>

              {!isConnected && (
                <div className='rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-600'>
                  Please connect your wallet to file a dispute.
                </div>
              )}

              {error && (
                <Alert className='border-red-500/30 bg-red-500/10'>
                  <AlertCircle className='h-4 w-4 text-red-400' />
                  <AlertDescription className='ml-2 text-sm text-red-300'>
                    {error}
                  </AlertDescription>
                </Alert>
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
                  disabled={
                    isLoading ||
                    !isConnected ||
                    documents.some(d => d.size > MAX_FILE_SIZE)
                  }
                  variant='destructive'
                  className='flex-1'
                >
                  File Dispute
                </Button>
              </div>
            </div>
          )}

          {isSpinnerStep && (
            <div className='space-y-4 py-8 text-center'>
              <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10'>
                <Loader2 className='h-8 w-8 animate-spin text-red-400' />
              </div>
              <div className='space-y-1'>
                <p className='text-foreground font-medium'>
                  {step === 'uploading' && 'Uploading evidence…'}
                  {step === 'signing' && 'Approve the dispute transaction'}
                  {step === 'saving' && 'Saving dispute details…'}
                </p>
                <p className='text-muted-foreground text-sm'>
                  {step === 'signing'
                    ? 'Check your wallet to sign the transaction'
                    : 'Please wait…'}
                </p>
              </div>
              {error && (
                <Alert className='border-red-500/30 bg-red-500/10'>
                  <AlertCircle className='h-4 w-4 text-red-400' />
                  <AlertDescription className='ml-2 text-sm text-red-300'>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
