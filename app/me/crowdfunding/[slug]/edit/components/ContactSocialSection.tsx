'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface ContactSocialSectionProps {
  data: {
    contact: {
      primary: string;
      backup: string;
    };
    socialLinks: Array<{ platform: string; url: string }>;
  };
  onChange: (field: string, value: any) => void;
}

export function ContactSocialSection({
  data,
  onChange,
}: ContactSocialSectionProps) {
  const [backupType, setBackupType] = React.useState<'discord' | 'whatsapp'>(
    'whatsapp'
  );

  const getSocialLink = (platform: string) => {
    if (!Array.isArray(data.socialLinks)) return '';
    const link = data.socialLinks.find((l: any) => l.platform === platform);
    return link?.url || '';
  };

  const updateSocialLink = (platform: string, url: string) => {
    if (!Array.isArray(data.socialLinks)) {
      onChange('socialLinks', [{ platform, url }]);
      return;
    }
    const updated = [...data.socialLinks];
    const index = updated.findIndex((l: any) => l.platform === platform);
    if (index >= 0) {
      updated[index] = { platform, url };
    } else {
      updated.push({ platform, url });
    }
    onChange('socialLinks', updated);
  };

  return (
    <div className='space-y-6'>
      {/* Header with info */}
      <div>
        <div className='mb-3 flex items-center gap-2'>
          <svg
            width='20'
            height='20'
            viewBox='0 0 36 36'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='text-[#DBF936]'
          >
            <path
              d='M17.9987 24.6668V18.0002M17.9987 11.3335H18.0154M34.6654 18.0002C34.6654 27.2049 27.2034 34.6668 17.9987 34.6668C8.79395 34.6668 1.33203 27.2049 1.33203 18.0002C1.33203 8.79542 8.79395 1.3335 17.9987 1.3335C27.2034 1.3335 34.6654 8.79542 34.6654 18.0002Z'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <p className='text-xs text-[#B5B5B5]'>
            Your Project contact information will be used for Project
            verification and for Boundless staff to contact you. The contact
            information can only be accessed by Boundless staff.
          </p>
        </div>
      </div>

      {/* Primary Contact */}
      <div className='space-y-2'>
        <Label htmlFor='telegram' className='text-sm font-medium text-white'>
          Telegram <span className='text-red-500'>*</span>
        </Label>
        <div className='relative'>
          <span className='absolute top-1/2 left-3 -translate-y-1/2 text-[#B5B5B5]'>
            @
          </span>
          <Input
            id='telegram'
            placeholder='username'
            value={data.contact.primary.replace('@', '')}
            onChange={e =>
              onChange('contact', {
                ...data.contact,
                primary: `@${e.target.value.replace('@', '')}`,
              })
            }
            className='h-10 border-[#484848] bg-[#1A1A1A] pl-8 text-white placeholder:text-[#919191] focus:border-[#DBF936]'
          />
        </div>
      </div>

      {/* Backup Contact - Compact Radio Select */}
      <div className='space-y-2'>
        <Label className='text-sm font-medium text-white'>
          Backup <span className='text-red-500'>*</span>
        </Label>
        <RadioGroup
          value={backupType}
          onValueChange={value =>
            setBackupType(value as 'discord' | 'whatsapp')
          }
          className='flex gap-2'
        >
          {/* Discord Option */}
          <div
            className={cn(
              'flex h-10 flex-1 items-center overflow-hidden rounded-lg border transition-all duration-200',
              backupType === 'discord'
                ? 'border-[#DBF936] bg-[#DBF936]/5'
                : 'border-[#2B2B2B] bg-[#101010]'
            )}
          >
            <label
              className={cn(
                'flex flex-1 cursor-pointer items-center gap-2 px-3 py-2 text-sm',
                backupType === 'discord' ? 'text-[#DBF936]' : 'text-[#B5B5B5]'
              )}
            >
              <RadioGroupItem
                value='discord'
                id='discord'
                className={cn(
                  'border-2',
                  backupType === 'discord'
                    ? 'border-[#DBF936]'
                    : 'border-[#484848]'
                )}
              />
              Discord
            </label>
            <Input
              placeholder='user'
              value={backupType === 'discord' ? data.contact.backup : ''}
              onChange={e => {
                if (backupType === 'discord') {
                  onChange('contact', {
                    ...data.contact,
                    backup: e.target.value,
                  });
                }
              }}
              className='h-full border-0 bg-transparent px-2 text-xs text-white placeholder:text-[#919191] focus-visible:ring-0 focus-visible:ring-offset-0'
            />
          </div>

          {/* WhatsApp Option */}
          <div
            className={cn(
              'flex h-10 flex-1 items-center overflow-hidden rounded-lg border transition-all duration-200',
              backupType === 'whatsapp'
                ? 'border-[#DBF936] bg-[#DBF936]/5'
                : 'border-[#2B2B2B] bg-[#101010]'
            )}
          >
            <label
              className={cn(
                'flex flex-1 cursor-pointer items-center gap-2 px-3 py-2 text-sm',
                backupType === 'whatsapp' ? 'text-[#DBF936]' : 'text-[#B5B5B5]'
              )}
            >
              <RadioGroupItem
                value='whatsapp'
                id='whatsapp'
                className={cn(
                  'border-2',
                  backupType === 'whatsapp'
                    ? 'border-[#DBF936]'
                    : 'border-[#484848]'
                )}
              />
              WhatsApp
            </label>
            <Input
              placeholder='+1234567890'
              value={backupType === 'whatsapp' ? data.contact.backup : ''}
              onChange={e => {
                if (backupType === 'whatsapp') {
                  onChange('contact', {
                    ...data.contact,
                    backup: e.target.value,
                  });
                }
              }}
              className='h-full border-0 bg-transparent px-2 text-xs text-white placeholder:text-[#919191] focus-visible:ring-0 focus-visible:ring-offset-0'
            />
          </div>
        </RadioGroup>
      </div>

      {/* Social Links - Compact Grid */}
      <div className='space-y-2'>
        <Label className='text-sm font-medium text-white'>Social Links</Label>
        <div className='grid grid-cols-1 gap-2 md:grid-cols-3'>
          {/* Twitter */}
          <div className='space-y-1'>
            <Label htmlFor='twitter' className='text-xs text-[#919191]'>
              Twitter
            </Label>
            <Input
              id='twitter'
              placeholder='@username'
              value={getSocialLink('twitter')}
              onChange={e => updateSocialLink('twitter', e.target.value)}
              className='h-9 border-[#484848] bg-[#1A1A1A] text-sm text-white placeholder:text-[#919191] focus:border-[#DBF936]'
            />
          </div>

          {/* Discord */}
          <div className='space-y-1'>
            <Label htmlFor='discord-social' className='text-xs text-[#919191]'>
              Discord
            </Label>
            <Input
              id='discord-social'
              placeholder='Server/invite link'
              value={getSocialLink('discord')}
              onChange={e => updateSocialLink('discord', e.target.value)}
              className='h-9 border-[#484848] bg-[#1A1A1A] text-sm text-white placeholder:text-[#919191] focus:border-[#DBF936]'
            />
          </div>

          {/* Telegram Channel */}
          <div className='space-y-1'>
            <Label htmlFor='telegram-social' className='text-xs text-[#919191]'>
              Telegram
            </Label>
            <Input
              id='telegram-social'
              placeholder='@channel'
              value={getSocialLink('telegram')}
              onChange={e => updateSocialLink('telegram', e.target.value)}
              className='h-9 border-[#484848] bg-[#1A1A1A] text-sm text-white placeholder:text-[#919191] focus:border-[#DBF936]'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
