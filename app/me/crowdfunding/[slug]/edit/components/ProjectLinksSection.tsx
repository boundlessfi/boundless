'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Play } from 'lucide-react';

interface ProjectLinksSectionProps {
  data: {
    projectWebsite: string;
    demoVideo: string;
  };
  onChange: (field: string, value: string) => void;
}

export function ProjectLinksSection({
  data,
  onChange,
}: ProjectLinksSectionProps) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <div className='space-y-2'>
        <Label
          htmlFor='projectWebsite'
          className='flex items-center gap-2 text-white'
        >
          <Globe className='h-4 w-4' />
          Website URL (Optional)
        </Label>
        <Input
          id='projectWebsite'
          value={data.projectWebsite}
          onChange={e => onChange('projectWebsite', e.target.value)}
          placeholder='Link to project website'
          className='focus-visible:border-primary border-[#484848] bg-[#1A1A1A] p-4 text-white placeholder:text-[#919191]'
        />
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='demoVideo'
          className='flex items-center gap-2 text-white'
        >
          <Play className='h-4 w-4' />
          Demo Video URL (Optional)
        </Label>
        <Input
          id='demoVideo'
          value={data.demoVideo}
          onChange={e => onChange('demoVideo', e.target.value)}
          placeholder='Link to demo video'
          className='focus-visible:border-primary border-[#484848] bg-[#1A1A1A] p-4 text-white placeholder:text-[#919191]'
        />
      </div>
    </div>
  );
}
