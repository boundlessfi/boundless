'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Github,
  Globe,
  Video,
  Twitter,
  Link2,
  Share2,
  MessageCircle,
  Send,
  Code2,
} from 'lucide-react';
import type { CampaignWizardData } from '../NewCampaignWizard';

const SOCIAL_PLATFORMS = [
  { value: 'twitter', label: 'Twitter / X', Icon: Twitter },
  { value: 'linkedin', label: 'LinkedIn', Icon: Share2 },
  { value: 'discord', label: 'Discord', Icon: MessageCircle },
  { value: 'telegram', label: 'Telegram', Icon: Send },
  { value: 'youtube', label: 'YouTube', Icon: Video },
  { value: 'facebook', label: 'Facebook', Icon: Globe },
  { value: 'instagram', label: 'Instagram', Icon: Globe },
  { value: 'other', label: 'Other', Icon: Link2 },
] as const;

type Platform = (typeof SOCIAL_PLATFORMS)[number]['value'];

function platformIcon(platform: string) {
  const found = SOCIAL_PLATFORMS.find(p => p.value === platform);
  const Icon = found?.Icon ?? Link2;
  return <Icon className='h-4 w-4 text-zinc-500' />;
}

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
          type='text'
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className='focus:border-primary/50 border-zinc-800 bg-zinc-950 pl-9 text-white placeholder:text-zinc-600'
        />
      </div>
    </div>
  );
}

export default function LinksStep({ data, onChange }: Props) {
  const social = data.socialLinks;
  const usedPlatforms = new Set(social.map(s => s.platform));

  const addSocial = () => {
    const nextPlatform =
      (SOCIAL_PLATFORMS.find(p => !usedPlatforms.has(p.value))
        ?.value as Platform) ?? 'other';
    onChange({ socialLinks: [...social, { platform: nextPlatform, url: '' }] });
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
    <div className='space-y-8'>
      {/* Project links */}
      <section className='space-y-5'>
        <div className='flex items-center gap-2 border-b border-zinc-800/60 pb-3'>
          <Code2 className='h-4 w-4 text-zinc-500' />
          <span className='text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
            Project links
          </span>
          <span className='ml-auto text-xs text-zinc-600'>All optional</span>
        </div>

        <UrlField
          id='githubUrl'
          label='GitHub repository'
          placeholder='https://github.com/yourorg/yourrepo'
          value={data.githubUrl}
          onChange={v => onChange({ githubUrl: v })}
          icon={Github}
        />

        <UrlField
          id='gitlabUrl'
          label='GitLab'
          placeholder='https://gitlab.com/...'
          value={data.gitlabUrl}
          onChange={v => onChange({ gitlabUrl: v })}
          icon={Github}
        />

        <UrlField
          id='websiteUrl'
          label='Project website'
          placeholder='https://yourproject.xyz'
          value={data.websiteUrl}
          onChange={v => onChange({ websiteUrl: v })}
          icon={Globe}
        />

        <UrlField
          id='demoVideoUrl'
          label='Demo video'
          placeholder='https://youtube.com/watch?v=...'
          value={data.demoVideoUrl}
          onChange={v => onChange({ demoVideoUrl: v })}
          icon={Video}
        />
      </section>

      {/* Social links */}
      <section className='space-y-4'>
        <div className='flex items-center gap-2 border-b border-zinc-800/60 pb-3'>
          <Share2 className='h-4 w-4 text-zinc-500' />
          <span className='text-xs font-semibold tracking-wider text-zinc-500 uppercase'>
            Social links
          </span>
          <span className='ml-auto text-xs text-zinc-600'>Optional</span>
        </div>

        {social.length === 0 ? (
          <button
            type='button'
            onClick={addSocial}
            className='group hover:border-primary/40 flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 py-6 text-center transition hover:bg-zinc-900/30'
          >
            <div className='group-hover:bg-primary/10 group-hover:text-primary flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-500 transition'>
              <Plus className='h-4 w-4' />
            </div>
            <span className='text-sm text-zinc-400'>Add social link</span>
            <span className='text-xs text-zinc-600'>
              Twitter/X, Discord, LinkedIn, etc.
            </span>
          </button>
        ) : (
          <div className='space-y-3'>
            {social.map((s, idx) => {
              const isDuplicate =
                social.findIndex(x => x.platform === s.platform) !== idx;
              return (
                <div key={idx} className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <Select
                      value={s.platform}
                      onValueChange={v => updateSocial(idx, { platform: v })}
                    >
                      <SelectTrigger className='w-[155px] flex-shrink-0 border-zinc-800 bg-zinc-950 text-white'>
                        <SelectValue placeholder='Platform' />
                      </SelectTrigger>
                      <SelectContent className='border-zinc-800 bg-zinc-950 text-white'>
                        {SOCIAL_PLATFORMS.map(p => (
                          <SelectItem key={p.value} value={p.value}>
                            <div className='flex items-center gap-2'>
                              <p.Icon className='h-3.5 w-3.5 text-zinc-400' />
                              <span>{p.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className='relative flex-1'>
                      <span className='absolute top-1/2 left-3 -translate-y-1/2'>
                        {platformIcon(s.platform)}
                      </span>
                      <Input
                        type='text'
                        placeholder='https://...'
                        value={s.url}
                        onChange={e =>
                          updateSocial(idx, { url: e.target.value })
                        }
                        className='focus:border-primary/50 border-zinc-800 bg-zinc-950 pl-9 text-white placeholder:text-zinc-600'
                      />
                    </div>

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => removeSocial(idx)}
                      className='h-9 w-9 flex-shrink-0 text-zinc-600 hover:text-red-400'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                  {isDuplicate && (
                    <p className='pl-1 text-xs text-amber-400'>
                      Duplicate platform — only the first entry will be saved.
                    </p>
                  )}
                </div>
              );
            })}

            {social.length < SOCIAL_PLATFORMS.length && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={addSocial}
                className='gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              >
                <Plus className='h-3.5 w-3.5' />
                Add another
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
