'use client';

import { useState } from 'react';
import * as React from 'react';
import {
  FileText,
  ExternalLink,
  Loader2,
  Upload,
  X,
  AlertCircle,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

interface SubmitEvidenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneId?: string;
  milestoneName: string;
  isSubmitting?: boolean;
  onSubmit?: (data: {
    status: string;
    submissionNotes: string;
    proofOfWorkLinks: string[];
    documents?: File[];
  }) => Promise<void>;
}

export function SubmitEvidenceModal({
  open,
  onOpenChange,
  milestoneName,
  isSubmitting: externalIsSubmitting,
  onSubmit,
}: SubmitEvidenceModalProps) {
  const [status, setStatus] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [proofOfWorkLinks, setProofOfWorkLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submitting = externalIsSubmitting || isSubmitting;

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
  const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15MB total

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    const invalidFiles = files.filter(
      file => !allowedTypes.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      setError('Please upload only valid documents (PDF, Word, or Images)');
      return;
    }

    // Check individual file sizes
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setError(
        'Some files exceed 5MB limit. Please reduce file size and try again.'
      );
      return;
    }

    // Calculate total size including existing files
    const newTotalSize = [...documents, ...files].reduce(
      (sum, file) => sum + file.size,
      0
    );

    if (newTotalSize > MAX_TOTAL_SIZE) {
      setError('Total file size must be less than 15MB');
      return;
    }

    setError('');
    setDocuments(prev => [...prev, ...files]);

    // Reset input to allow selecting the same files again if needed
    e.target.value = '';
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const addLink = () => {
    if (!newLink) return;
    try {
      new URL(newLink);
      setProofOfWorkLinks([...proofOfWorkLinks, newLink]);
      setNewLink('');
      setError('');
    } catch {
      setError('Please enter a valid URL');
    }
  };

  const removeLink = (index: number) => {
    setProofOfWorkLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!status) {
      setError('Please select a status');
      return;
    }

    if (!submissionNotes.trim()) {
      setError('Please provide submission notes');
      return;
    }

    if (submissionNotes.trim().length < 10) {
      setError('Submission notes must be at least 10 characters');
      return;
    }

    if (proofOfWorkLinks.length === 0 && documents.length === 0) {
      setError('At least one proof of work (file or link) is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          status,
          submissionNotes,
          proofOfWorkLinks,
          documents: documents.length > 0 ? documents : undefined,
        });
      }

      // Reset form
      setStatus('');
      setSubmissionNotes('');
      setProofOfWorkLinks([]);
      setDocuments([]);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit evidence'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setStatus('');
    setSubmissionNotes('');
    setProofOfWorkLinks([]);
    setDocuments([]);
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Submit Milestone Evidence
          </DialogTitle>
          <DialogDescription>
            Provide proof of work for{' '}
            <strong className='text-white'>{milestoneName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* Help Link */}
          <Alert className='border-blue-500/30 bg-blue-500/10'>
            <AlertDescription className='flex items-start gap-2 text-xs'>
              <span>
                Need help?{' '}
                <Link
                  href='/docs/how-to-write-evidence'
                  target='_blank'
                  className='text-primary inline-flex items-center gap-1 hover:underline'
                >
                  View guide
                  <ExternalLink className='h-3 w-3' />
                </Link>
              </span>
            </AlertDescription>
          </Alert>

          {/* Status Select */}
          <div className='space-y-2'>
            <Label htmlFor='status' className='text-sm'>
              Status *
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id='status' className='h-9'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='in_progress'>In Progress</SelectItem>
                <SelectItem value='submitted'>Submit for Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submission Notes */}
          <div className='space-y-2'>
            <Label htmlFor='submissionNotes' className='text-sm'>
              Submission Notes *
            </Label>
            <Textarea
              id='submissionNotes'
              value={submissionNotes}
              onChange={e => setSubmissionNotes(e.target.value)}
              placeholder='Describe work completed, achievements, and other notes...'
              className='min-h-[100px] resize-none text-sm'
              disabled={submitting}
              maxLength={2000}
            />
            <div className='flex items-center justify-between text-xs'>
              <p className='text-muted-foreground'>
                Min 10 • Max 2000 characters
              </p>
              <p
                className={`font-mono tabular-nums ${
                  submissionNotes.length < 10
                    ? 'text-amber-500'
                    : submissionNotes.length > 1800
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                }`}
              >
                {submissionNotes.length}/2000
              </p>
            </div>
          </div>

          {/* Proof of Work Links */}
          <div className='space-y-3'>
            <Label htmlFor='links'>Proof of Work Links</Label>
            <div className='flex gap-2'>
              <Input
                id='links'
                value={newLink}
                onChange={e => setNewLink(e.target.value)}
                placeholder='https://github.com/...'
                className='text-sm'
                disabled={submitting}
              />
              <Button
                type='button'
                onClick={addLink}
                disabled={submitting}
                variant='secondary'
              >
                Add
              </Button>
            </div>
            {proofOfWorkLinks.length > 0 && (
              <ul className='space-y-2'>
                {proofOfWorkLinks.map((link, index) => (
                  <li
                    key={index}
                    className='bg-muted/20 flex items-center justify-between rounded px-3 py-2 text-sm'
                  >
                    <span className='truncate text-white/80'>{link}</span>
                    <button
                      type='button'
                      onClick={() => removeLink(index)}
                      className='text-gray-400 hover:text-red-400'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Document Upload (Optional) */}
          <div className='space-y-3'>
            <Label htmlFor='documents'>Supporting Documents (Optional)</Label>
            <Input
              id='documents'
              type='file'
              onChange={handleFileChange}
              accept='.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp'
              className='hidden'
              disabled={submitting}
              multiple
            />
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                const input = window.document.getElementById(
                  'documents'
                ) as HTMLInputElement;
                input?.click();
              }}
              disabled={submitting}
              className='w-full'
            >
              <Upload className='mr-2 h-4 w-4' />
              {documents.length > 0 ? 'Add More Files' : 'Upload Documents'}
            </Button>

            {documents.length > 0 && (
              <div className='space-y-3'>
                <div className='flex flex-wrap gap-2'>
                  {documents.map((doc, index) => {
                    const isOversized = doc.size > MAX_FILE_SIZE;
                    const sizeInMB = (doc.size / (1024 * 1024)).toFixed(2);

                    return (
                      <div
                        key={index}
                        className={`relative inline-flex max-w-[280px] items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                          isOversized
                            ? 'border border-red-500/30 bg-red-500/15 text-red-300'
                            : 'bg-background-main-bg/50 border border-gray-600/50 text-gray-100 hover:bg-gray-600/50'
                        }`}
                      >
                        <FileText className='h-3.5 w-3.5 shrink-0' />
                        <span className='min-w-0 flex-1 truncate'>
                          {doc.name}
                        </span>
                        <span
                          className={`shrink-0 font-mono text-xs ${
                            isOversized ? 'text-red-300' : 'text-gray-400'
                          }`}
                        >
                          {sizeInMB}MB
                        </span>
                        <button
                          type='button'
                          onClick={() => removeDocument(index)}
                          disabled={submitting}
                          className={`inline-flex shrink-0 items-center justify-center rounded-full p-0.5 transition-colors ${
                            isOversized
                              ? 'text-red-300 hover:bg-red-600/30 hover:text-red-200'
                              : 'text-gray-400 hover:bg-gray-500/30 hover:text-gray-300'
                          }`}
                          aria-label={`Remove ${doc.name}`}
                        >
                          <X className='h-3.5 w-3.5' />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {documents.some(doc => doc.size > MAX_FILE_SIZE) && (
                  <div className='flex gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3'>
                    <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-red-400' />
                    <p className='text-xs text-red-300'>
                      Some files exceed the 5MB limit. Please remove or replace
                      them.
                    </p>
                  </div>
                )}
              </div>
            )}

            <p className='text-muted-foreground text-xs'>
              PDF, Word documents, or images • Max 5MB per file • 15MB total
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert
              variant='destructive'
              className='border-red-500/30 bg-red-500/10'
            >
              <AlertCircle className='h-4 w-4' />
              <AlertDescription className='ml-2 text-sm text-red-300'>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Footer Actions */}
          <DialogFooter className='gap-2 pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={submitting}
              className='h-9'
            >
              Cancel
            </Button>
            <Button type='submit' disabled={submitting} className='h-9'>
              {submitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Submitting...
                </>
              ) : (
                'Submit Evidence'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
