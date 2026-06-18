'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Github, Globe, Video, Twitter } from 'lucide-react';
import type { CampaignWizardData } from '../NewCampaignWizard';

interface Props {
  data: CampaignWizardData;
  onChange: (patch: Partial<CampaignWizardData>) => void;
}

function UrlField({
  id,
  label,
  placeholder,
  value,
  onChange,
  icon: Icon,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className='space-y-1.5'>
      <Label htmlFor={id} className='text-sm font-medium text-zinc-300'>
        {label}
      </Label>
      <div className='relative'>
        <Icon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
        <Input
          id={id}
          type='url'
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className='border-zinc-800 bg-zinc-950 pl-9 text-white placeholder:text-zinc-600'
        />
      </div>
    </div>
  );
}

export default function LinksStep({ data, onChange }: Props) {
  const social = data.socialLinks;

  const addSocial = () => {
    onChange({ socialLinks: [...social, { platform: 'twitter', url: '' }] });
  };

  const removeSocial = (idx: number) => {
    onChange({ socialLinks: social.filter((_, i) => i !== idx) });
  };

  const updateSocial = (
    idx: number,
    patch: Partial<{ platform: string; url: string }>
  ) => {
    onChange({
      socialLinks: social.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    });
  };

  return (
    <div className='space-y-6'>
      <UrlField
        id='githubUrl'
        label='GitHub / repository'
        placeholder='https://github.com/yourorg/yourrepo'
        value={data.githubUrl}
        onChange={v => onChange({ githubUrl: v })}
        icon={Github}
      />

      <UrlField
        id='gitlabUrl'
        label='GitLab (optional)'
        placeholder='https://gitlab.com/...'
        value={data.gitlabUrl}
        onChange={v => onChange({ gitlabUrl: v })}
        icon={Github}
      />

      <UrlField
        id='websiteUrl'
        label='Website'
        placeholder='https://yourproject.xyz'
        value={data.websiteUrl}
        onChange={v => onChange({ websiteUrl: v })}
        icon={Globe}
      />

      <UrlField
        id='demoVideoUrl'
        label='Demo video URL'
        placeholder='https://youtube.com/...'
        value={data.demoVideoUrl}
        onChange={v => onChange({ demoVideoUrl: v })}
        icon={Video}
      />

      <div className='space-y-3 border-t border-zinc-800/50 pt-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-zinc-300'>Social links</p>
            <p className='text-xs text-zinc-600'>Twitter/X, Discord, etc.</p>
          </div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={addSocial}
            className='gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
          >
            <Plus className='h-3.5 w-3.5' />
            Add
          </Button>
        </div>

        {social.map((s, idx) => (
          <div key={idx} className='flex items-center gap-2'>
            <div className='relative flex-1'>
              <Twitter className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500' />
              <Input
                type='url'
                placeholder='https://twitter.com/...'
                value={s.url}
                onChange={e => updateSocial(idx, { url: e.target.value })}
                className='border-zinc-800 bg-zinc-950 pl-9 text-white placeholder:text-zinc-600'
              />
            </div>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={() => removeSocial(idx)}
              className='h-9 w-9 text-zinc-600 hover:text-red-400'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
