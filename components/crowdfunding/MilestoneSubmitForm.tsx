'use client';

import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Plus, X, Loader2, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15 MB

interface SubmitData {
  submissionNotes: string;
  proofOfWorkLinks: string[];
  documents: File[];
}

interface Props {
  milestoneName: string;
  isSubmitting?: boolean;
  onSubmit: (data: SubmitData) => Promise<void>;
}

export function MilestoneSubmitForm({
  milestoneName,
  isSubmitting = false,
  onSubmit,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notes, setNotes] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const [files, setFiles] = useState<File[]>([]);
  const [declared, setDeclared] = useState(false);
  const [fileError, setFileError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  const addLink = () => setLinks(prev => [...prev, '']);
  const removeLink = (idx: number) =>
    setLinks(prev => prev.filter((_, i) => i !== idx));
  const updateLink = (idx: number, val: string) =>
    setLinks(prev => prev.map((l, i) => (i === idx ? val : l)));

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setFileError('');
    const arr = Array.from(incoming);
    const invalid = arr.filter(f => !ACCEPTED_TYPES.includes(f.type));
    if (invalid.length) {
      setFileError('Only PDF, Word, and image files are accepted.');
      return;
    }
    const tooLarge = arr.filter(f => f.size > MAX_FILE_SIZE);
    if (tooLarge.length) {
      setFileError('Each file must be 5 MB or smaller.');
      return;
    }
    const newTotal = totalSize + arr.reduce((s, f) => s + f.size, 0);
    if (newTotal > MAX_TOTAL_SIZE) {
      setFileError('Total upload size must not exceed 15 MB.');
      return;
    }
    setFiles(prev => [...prev, ...arr]);
  };

  const removeFile = (idx: number) =>
    setFiles(prev => prev.filter((_, i) => i !== idx));

  const validLinks = links.filter(l => l.trim());
  const canSubmit =
    notes.trim().length >= 10 &&
    declared &&
    (validLinks.length > 0 || files.length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitted(true);
    try {
      await onSubmit({
        submissionNotes: notes.trim(),
        proofOfWorkLinks: validLinks,
        documents: files,
      });
    } finally {
      setSubmitted(false);
    }
  };

  return (
    <div className='space-y-6 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-6'>
      <div>
        <h3 className='text-base font-semibold text-white'>Submit evidence</h3>
        <p className='mt-0.5 text-sm text-zinc-500'>
          Provide proof that{' '}
          <span className='text-zinc-300'>{milestoneName}</span> is complete.
        </p>
      </div>

      {/* Progress notes */}
      <div className='space-y-1.5'>
        <Label className='text-sm font-medium text-zinc-300'>
          Progress notes <span className='text-red-400'>*</span>
        </Label>
        <Textarea
          placeholder='Describe what was done, how it was verified, and any relevant context for the reviewers (min 10 characters).'
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={5}
          className='resize-none border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600'
        />
        <div className='flex items-center justify-between'>
          {notes.trim().length < 10 && notes.length > 0 && (
            <p className='text-xs text-amber-400'>
              {10 - notes.trim().length} more characters needed
            </p>
          )}
          <p className='ml-auto text-xs text-zinc-600'>{notes.length}/2000</p>
        </div>
      </div>

      {/* Proof of work links */}
      <div className='space-y-2'>
        <Label className='text-sm font-medium text-zinc-300'>
          Proof of work links
        </Label>
        <p className='text-xs text-zinc-600'>
          Link to PRs, demos, deployments, or any public proof of work.
        </p>
        {links.map((l, idx) => (
          <div key={idx} className='flex items-center gap-2'>
            <div className='relative flex-1'>
              <ExternalLink className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
              <Input
                type='url'
                placeholder='https://github.com/...'
                value={l}
                onChange={e => updateLink(idx, e.target.value)}
                className='border-zinc-800 bg-zinc-900 pl-9 text-white placeholder:text-zinc-600'
              />
            </div>
            {links.length > 1 && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => removeLink(idx)}
                className='h-9 w-9 text-zinc-600 hover:text-red-400'
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
        ))}
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={addLink}
          className='gap-2 text-zinc-500 hover:text-zinc-300'
        >
          <Plus className='h-3.5 w-3.5' />
          Add link
        </Button>
      </div>

      {/* File upload */}
      <div className='space-y-2'>
        <Label className='text-sm font-medium text-zinc-300'>
          Supporting files
        </Label>
        <p className='text-xs text-zinc-600'>
          PDF, Word, or images. Max 5 MB per file, 15 MB total.
        </p>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/50 py-8 text-zinc-600 transition hover:border-zinc-700 hover:bg-zinc-900'
          )}
        >
          <Upload className='mb-2 h-6 w-6' />
          <span className='text-sm'>
            Drag & drop or{' '}
            <span className='text-zinc-400 underline'>browse</span>
          </span>
        </div>

        <input
          ref={fileInputRef}
          type='file'
          multiple
          accept='.pdf,.doc,.docx,image/*'
          className='hidden'
          onChange={e => handleFiles(e.target.files)}
        />

        {fileError && <p className='text-sm text-red-400'>{fileError}</p>}

        {files.length > 0 && (
          <div className='space-y-2'>
            {files.map((f, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2'
              >
                <div className='flex items-center gap-2 text-sm'>
                  <FileText className='h-4 w-4 text-zinc-500' />
                  <span className='text-zinc-300'>{f.name}</span>
                  <span className='text-zinc-600'>
                    ({(f.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className='text-zinc-600 hover:text-red-400'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            ))}
            <p className='text-xs text-zinc-600'>
              {(totalSize / 1024 / 1024).toFixed(2)} MB used of 15 MB
            </p>
          </div>
        )}
      </div>

      {/* Declaration */}
      <div className='flex items-start gap-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4'>
        <Checkbox
          id='declaration'
          checked={declared}
          onCheckedChange={v => setDeclared(!!v)}
          className='mt-0.5'
        />
        <label
          htmlFor='declaration'
          className='cursor-pointer text-sm text-zinc-400'
        >
          I confirm this milestone is complete and the evidence submitted
          accurately represents the work done.
        </label>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting || submitted}
        className='bg-primary hover:bg-primary/90 w-full gap-2'
      >
        {isSubmitting || submitted ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin' />
            Submitting...
          </>
        ) : (
          'Submit for review'
        )}
      </Button>
    </div>
  );
}
