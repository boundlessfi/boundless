'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CampaignWizardData } from '../NewCampaignWizard';

interface Props {
  data: CampaignWizardData;
  onChange: (patch: Partial<CampaignWizardData>) => void;
}

export default function StoryStep({ data, onChange }: Props) {
  return (
    <div className='space-y-6'>
      <div className='rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4 text-sm text-zinc-400'>
        Tell potential backers why this project matters. What are you building,
        why now, and what will the world look like when you succeed?
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='vision' className='text-sm font-medium text-zinc-300'>
          Project story <span className='text-red-400'>*</span>
        </Label>
        <Textarea
          id='vision'
          placeholder='Share your vision, the problem you are solving, your approach, and what success looks like...'
          value={data.vision}
          onChange={e => onChange({ vision: e.target.value })}
          rows={16}
          className='resize-none border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600'
        />
        <p className='text-right text-xs text-zinc-600'>
          {data.vision.length} characters
        </p>
      </div>
    </div>
  );
}
