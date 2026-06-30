'use client';

import { Sparkles } from 'lucide-react';

import { BoundlessButton } from '@/components/buttons';
import LoadingSpinner from '@/components/LoadingSpinner';

export interface PreviewField {
  label: string;
  /** Present once the field has streamed in; null shows a shimmer placeholder. */
  value: string | null;
}

interface AiStreamPreviewProps {
  fields: PreviewField[];
  onCancel: () => void;
}

/**
 * Live "draft taking shape" view for the Generate dialogs. Renders each field as
 * it streams in (shimmer until it arrives) with a Cancel button so the organizer
 * can bail early if it's heading the wrong way. Shared by both wizards.
 */
export default function AiStreamPreview({
  fields,
  onCancel,
}: AiStreamPreviewProps) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 text-sm text-gray-300'>
        <LoadingSpinner size='sm' variant='spinner' color='primary' />
        <span className='flex items-center gap-1.5'>
          <Sparkles className='text-primary h-4 w-4' />
          Drafting — you can edit everything after.
        </span>
      </div>

      <div className='space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4'>
        {fields.map(f => (
          <div key={f.label} className='space-y-1'>
            <p className='text-xs font-medium text-gray-500'>{f.label}</p>
            {f.value ? (
              <p className='line-clamp-3 text-sm whitespace-pre-wrap text-white'>
                {f.value}
              </p>
            ) : (
              <div className='h-3 w-2/3 animate-pulse rounded bg-zinc-800' />
            )}
          </div>
        ))}
      </div>

      <div className='flex justify-end'>
        <BoundlessButton type='button' variant='outline' onClick={onCancel}>
          Cancel
        </BoundlessButton>
      </div>
    </div>
  );
}
