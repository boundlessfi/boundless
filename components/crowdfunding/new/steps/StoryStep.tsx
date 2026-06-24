'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AnnouncementEditor } from '@/components/ui/shadcn-io/announcement-editor';
import { Lightbulb, AlignLeft } from 'lucide-react';
import type { CampaignWizardData } from '../NewCampaignWizard';

interface Props {
  data: CampaignWizardData;
  onChange: (patch: Partial<CampaignWizardData>) => void;
}

export default function StoryStep({ data, onChange }: Props) {
  return (
    <div className='space-y-8'>
      {/* Vision */}
      <section className='space-y-5'>
        <div className='flex items-center gap-2 border-b border-zinc-800/60 pb-3'>
          <Lightbulb className='h-4 w-4 text-zinc-500' />
          <span className='text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
            Vision
          </span>
        </div>

        <div className='space-y-1.5'>
          <Label
            htmlFor='tagline'
            className='text-sm font-medium text-zinc-300'
          >
            Vision statement <span className='text-red-400'>*</span>
          </Label>
          <p className='text-xs text-zinc-500'>
            One sentence that captures what you are building and why it matters.
          </p>
          <Input
            id='tagline'
            placeholder='e.g. The payment layer that lets any business accept and settle money across every chain'
            maxLength={120}
            value={data.tagline}
            onChange={e => onChange({ tagline: e.target.value })}
            className='focus:border-primary/50 border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600'
          />
          <p className='text-right text-xs text-zinc-600'>
            {data.tagline.length}/120
          </p>
        </div>
      </section>

      {/* Description */}
      <section className='space-y-5'>
        <div className='flex items-center gap-2 border-b border-zinc-800/60 pb-3'>
          <AlignLeft className='h-4 w-4 text-zinc-500' />
          <span className='text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
            Description
          </span>
        </div>

        <div className='rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-4 text-sm text-zinc-400'>
          Tell potential backers why this project matters. Cover the problem you
          are solving, your approach, the tech, and what success looks like.
          Markdown formatting is supported.
        </div>

        <div className='space-y-1.5'>
          <Label className='text-sm font-medium text-zinc-300'>
            Project description <span className='text-red-400'>*</span>
          </Label>
          <AnnouncementEditor
            content={data.vision}
            onChange={v => onChange({ vision: v })}
            placeholder='Share your vision, the problem you are solving, your approach, and what success looks like...'
          />
          <div className='flex justify-between text-xs text-zinc-600'>
            <span>
              {data.vision.length < 50
                ? `${50 - data.vision.length} more characters needed`
                : ''}
            </span>
            <span>{data.vision.length} characters</span>
          </div>
        </div>
      </section>
    </div>
  );
}
