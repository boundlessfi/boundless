'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import MDEditor from '@uiw/react-md-editor';
import { cn } from '@/lib/utils';
import './md-editor-custom.css';

interface DetailsFundingSectionProps {
  data: {
    description: string;
    fundingAmount: number;
    fundingCurrency: string;
  };
  onChange: (field: string, value: any) => void;
}

export function DetailsFundingSection({
  data,
  onChange,
}: DetailsFundingSectionProps) {
  return (
    <div className='space-y-8'>
      {/* Details */}
      <div className='space-y-3'>
        <Label className='text-white'>
          Vision <span className='text-red-500'>*</span>
        </Label>
        <div className='space-y-3'>
          <div
            className={cn('overflow-hidden rounded-lg border border-[#484848]')}
          >
            <MDEditor
              value={data.description}
              onChange={value => onChange('description', value || '')}
              height={400}
              data-color-mode='dark'
              preview='edit'
              hideToolbar={false}
              visibleDragbar={true}
              textareaProps={{
                placeholder:
                  "Tell your project's full story...\n\nUse text, images, links, or videos to bring your vision to life. Format freely with headings, lists, and more.",
                style: {
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: '#ffffff',
                  backgroundColor: '#101010',
                  fontFamily: 'inherit',
                },
              }}
              style={{
                backgroundColor: '#101010',
                color: '#ffffff',
              }}
            />
          </div>
        </div>
      </div>

      {/* Funding Goal */}
      <div className='space-y-2'>
        <Label htmlFor='fundingAmount' className='text-white'>
          Funding Amount <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='fundingAmount'
          type='text'
          value={data.fundingAmount}
          onChange={e => {
            const value = e.target.value.replace(/[^0-9.]/g, '');
            onChange('fundingAmount', parseFloat(value) || 0);
          }}
          placeholder='Please enter your fundraising goal'
          className='focus-visible:border-primary border-[#484848] bg-[#1A1A1A] p-4 text-white placeholder:text-[#919191]'
        />
      </div>
    </div>
  );
}
// <option key={currency.value} value={currency.value}>
