'use client';

import React, { useState } from 'react';
import { CreationTextarea } from '../CreationUI';
import { AlertCircle, Info } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { cn } from '@/lib/utils';

interface ProjectDetailsProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export default function ProjectDetails({
  formData,
  updateFormData,
}: ProjectDetailsProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const detailsLength = (formData.details ?? '').length;
  const descriptionLength = (formData.description ?? '').length;

  const errors: Record<string, string | undefined> = {};
  if (touched.description) {
    if (!formData.description?.trim()) {
      errors.description = 'Short description is required';
    } else if (descriptionLength < 10) {
      errors.description = 'Must be at least 10 characters';
    }
  }
  if (touched.details) {
    if (detailsLength > 0 && detailsLength < 50) {
      errors.details =
        'Should be at least 50 characters for a meaningful overview';
    }
  }

  return (
    <div className='flex flex-col gap-8 sm:gap-10'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-xl font-semibold text-white sm:text-2xl'>
          Tell us more
        </h2>
        <p className='text-xs text-white/40 sm:text-sm'>
          What problem are you solving? Paint the full picture.
        </p>
      </div>

      <div className='flex flex-col gap-6'>
        <CreationTextarea
          label='Executive Summary'
          placeholder='A brief executive summary — what does your project do in 2-3 sentences?'
          value={formData.summary ?? ''}
          onChange={e => updateFormData({ summary: e.target.value })}
          helperText='Optional but recommended. Helps reviewers quickly understand your project.'
        />

        <CreationTextarea
          label='Short Description'
          placeholder='A detailed description of your project (200-500 characters recommended)'
          value={formData.description ?? ''}
          onChange={e => updateFormData({ description: e.target.value })}
          onBlur={() => markTouched('description')}
          error={errors.description}
          required
          helperText='Shown on your project card in listings.'
          maxLength={500}
        />

        {/* Full markdown editor */}
        <div className='flex w-full flex-col gap-1.5'>
          <div className='flex items-center justify-between'>
            <label className='text-[13px] font-medium text-white/50'>
              Full Project Description
              <span className='ml-0.5 text-red-400'>*</span>
            </label>
            <span
              className={cn(
                'text-xs tabular-nums',
                detailsLength > 0 && detailsLength < 50
                  ? 'text-red-400'
                  : detailsLength > 0
                    ? 'text-white/30'
                    : 'text-white/20'
              )}
            >
              {detailsLength > 0 ? `${detailsLength} chars` : 'min 50 chars'}
            </span>
          </div>
          <div
            className={cn(
              'overflow-hidden rounded-lg border transition-colors',
              touched.details && errors.details
                ? 'border-red-500/60'
                : 'border-white/10'
            )}
          >
            <MDEditor
              value={formData.details ?? ''}
              onChange={val => {
                updateFormData({ details: val || '' });
              }}
              onBlur={() => markTouched('details')}
              height={240}
              data-color-mode='dark'
              preview='edit'
              hideToolbar={false}
              visibleDragbar={false}
              textareaProps={{
                placeholder:
                  "Tell your project's full story...\n\nUse headings, lists, code blocks, links, or images.",
                style: {
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: '#ffffff',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  fontFamily: 'inherit',
                  padding: '16px 20px',
                },
              }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                color: '#ffffff',
              }}
            />
          </div>
          {touched.details && errors.details ? (
            <p className='flex items-center gap-1 text-xs text-red-400'>
              <AlertCircle className='h-3 w-3 shrink-0' />
              {errors.details}
            </p>
          ) : (
            <p className='flex items-center gap-1.5 text-xs text-white/30'>
              <Info className='h-3 w-3 shrink-0' />
              Markdown supported — headings, bold, code blocks, links, and more.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
