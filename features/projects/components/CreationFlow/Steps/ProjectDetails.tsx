'use client';

import React from 'react';
import { CreationTextarea } from '../CreationUI';
import MDEditor from '@uiw/react-md-editor';

interface ProjectDetailsProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export default function ProjectDetails({
  formData,
  updateFormData,
}: ProjectDetailsProps) {
  return (
    <div className='flex flex-col gap-10'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-4xl font-black tracking-tight text-white'>
          Tell us more
        </h2>
        <p className='text-sm font-medium text-white/30'>
          What's the vision? What problem are you solving?
        </p>
      </div>

      <div className='flex flex-col gap-8'>
        <CreationTextarea
          label='Executive Summary'
          placeholder='A brief executive summary — what does your project do in 2-3 sentences?'
          value={formData.summary}
          onChange={e => updateFormData({ summary: e.target.value })}
        />

        <CreationTextarea
          label='Short Description'
          placeholder='A more detailed description of your project (required, e.g. 200-500 characters)'
          value={formData.description}
          onChange={e => updateFormData({ description: e.target.value })}
          required
        />

        <div className='flex w-full flex-col gap-3'>
          <label className='text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase'>
            Full Project Description
          </label>
          <div className='overflow-hidden rounded-2xl border border-white/5'>
            <MDEditor
              value={formData.details}
              onChange={val => updateFormData({ details: val || '' })}
              height={420}
              data-color-mode='dark'
              preview='edit'
              hideToolbar={false}
              visibleDragbar={false}
              textareaProps={{
                placeholder:
                  "Tell your project's full story...\n\nUse headings, lists, code blocks, links, or images to bring your vision to life.",
                style: {
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: '#ffffff',
                  backgroundColor: '#0a0a0a',
                  fontFamily: 'inherit',
                  padding: '20px 24px',
                },
              }}
              style={{
                backgroundColor: '#0a0a0a',
                color: '#ffffff',
              }}
            />
          </div>
          <p className='text-[10px] font-medium text-white/20 italic'>
            Markdown supported — use headings, bold, code blocks, links, and
            more.
          </p>
        </div>
      </div>
    </div>
  );
}
