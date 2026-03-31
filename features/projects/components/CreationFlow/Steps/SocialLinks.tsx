'use client';

import React, { useState } from 'react';
import { CreationInput } from '../CreationUI';
import { Info, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialLinksProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export default function SocialLinks({
  formData,
  updateFormData,
}: SocialLinksProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const contact = formData.contact ?? {};

  const markTouched = (field: string) =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const updateContact = (field: string, value: string) => {
    updateFormData({
      contact: { ...formData.contact, [field]: value },
    });
  };

  // Validation
  const errors: Record<string, string | undefined> = {};

  if (touched.telegram) {
    const tg = (contact.telegram ?? '').replace(/^@/, '').trim();
    if (!tg) {
      errors.telegram = 'Telegram username is required';
    } else if (tg.length < 5) {
      errors.telegram = 'Must be at least 5 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(tg)) {
      errors.telegram = 'Only letters, numbers, and underscores allowed';
    }
  }

  if (touched.email) {
    const email = (contact.email ?? '').trim();
    if (!email) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
  }

  const backupType = contact.backupType ?? 'discord';

  return (
    <div className='flex flex-col gap-8 sm:gap-10'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-xl font-semibold text-white sm:text-2xl'>
          Contact Information
        </h2>
        <p className='text-xs text-white/40 sm:text-sm'>
          How can the Boundless team and potential backers reach you?
        </p>
      </div>

      {/* Privacy notice */}
      <div className='flex items-start gap-3 rounded-xl border border-amber-500/15 bg-amber-500/5 p-4'>
        <Shield className='mt-0.5 h-4 w-4 shrink-0 text-amber-400' />
        <div className='flex flex-col gap-0.5'>
          <p className='text-sm font-medium text-amber-200'>
            Your contact info is private
          </p>
          <p className='text-xs text-amber-400/70'>
            Contact details are only visible to the Boundless team for
            verification. They will not be shown publicly.
          </p>
        </div>
      </div>

      <div className='flex flex-col gap-8'>
        {/* Primary Contact */}
        <section className='flex flex-col gap-5'>
          <h3 className='text-sm font-semibold text-white sm:text-base'>
            Primary Contact
          </h3>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <CreationInput
              label='Email Address'
              placeholder='hello@yourproject.com'
              type='email'
              value={contact.email ?? ''}
              onChange={e => updateContact('email', e.target.value)}
              onBlur={() => markTouched('email')}
              error={errors.email}
              required
              helperText='Used for verification and important updates'
            />
            <CreationInput
              label='Telegram Username'
              placeholder='username (without @)'
              value={contact.telegram ?? ''}
              onChange={e => updateContact('telegram', e.target.value)}
              onBlur={() => markTouched('telegram')}
              error={errors.telegram}
              required
              helperText='Primary channel for team communication'
            />
          </div>
        </section>

        {/* Backup Contact */}
        <section className='flex flex-col gap-5'>
          <div className='flex items-baseline gap-2'>
            <h3 className='text-sm font-semibold text-white sm:text-base'>
              Backup Contact
            </h3>
            <span className='text-xs text-white/30'>recommended</span>
          </div>

          {/* Backup type selector */}
          <div className='flex flex-wrap gap-2'>
            {(['discord', 'whatsapp'] as const).map(type => (
              <button
                key={type}
                type='button'
                onClick={() => updateContact('backupType', type)}
                className={cn(
                  'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                  backupType === type
                    ? 'border-primary/30 bg-primary/5 text-primary'
                    : 'border-white/10 bg-white/2 text-white/40 hover:border-white/20 hover:text-white/60'
                )}
              >
                {type === 'discord' ? 'Discord' : 'WhatsApp'}
              </button>
            ))}
          </div>

          <CreationInput
            label={
              backupType === 'discord' ? 'Discord Username' : 'WhatsApp Number'
            }
            placeholder={backupType === 'discord' ? 'username' : '+1234567890'}
            value={contact.backup ?? ''}
            onChange={e => updateContact('backup', e.target.value)}
            helperText={
              backupType === 'discord'
                ? 'Your Discord username for backup communication'
                : 'International format with country code'
            }
          />
        </section>
      </div>

      {/* Info note */}
      <div className='flex items-start gap-2.5 rounded-lg border border-blue-500/10 bg-blue-500/5 p-3.5'>
        <Info className='mt-0.5 h-4 w-4 shrink-0 text-blue-400/60' />
        <p className='text-xs text-blue-400/60'>
          Project social profiles (X/Twitter, GitHub, etc.) are configured in
          the <span className='font-medium text-blue-300'>Basic Info</span>{' '}
          step. This section is for personal/team contact details only.
        </p>
      </div>
    </div>
  );
}
