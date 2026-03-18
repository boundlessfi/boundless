'use client';

import React from 'react';
import { CreationInput } from '../CreationUI';
import { Share2 } from 'lucide-react';

interface SocialLinksProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export default function SocialLinks({
  formData,
  updateFormData,
}: SocialLinksProps) {
  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-2'>
        <h2 className='text-3xl font-bold text-white'>How can we reach you?</h2>
        <p className='text-white/40'>
          Provide your contact information so potential backers and partners can
          get in touch.
        </p>
      </div>

      <div className='mt-4 flex flex-col gap-8'>
        <div className='flex flex-col gap-6'>
          <h3 className='border-b border-white/5 pb-2 text-xs font-black tracking-[0.2em] text-white/50 uppercase'>
            Direct Contact
          </h3>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <CreationInput
              label='Email Address'
              placeholder='hello@yourproject.com'
              value={formData.contact.email}
              onChange={e =>
                updateFormData({
                  contact: { ...formData.contact, email: e.target.value },
                })
              }
              required
            />
            <CreationInput
              label='Telegram Username'
              placeholder='@project_lead'
              value={formData.contact.telegram}
              onChange={e =>
                updateFormData({
                  contact: { ...formData.contact, telegram: e.target.value },
                })
              }
            />
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <CreationInput
              label='Discord Username'
              placeholder='username'
              value={formData.contact.discord}
              onChange={e =>
                updateFormData({
                  contact: { ...formData.contact, discord: e.target.value },
                })
              }
            />
            <CreationInput
              label='Alternative Contact'
              placeholder='Telegram, Email, or Signal'
              value={formData.contact.primary}
              onChange={e =>
                updateFormData({
                  contact: { ...formData.contact, primary: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div className='rounded-xl border border-blue-500/20 bg-blue-500/5 p-6'>
          <div className='flex gap-4'>
            <Share2 className='mt-0.5 h-5 w-5 shrink-0 text-blue-400' />
            <div className='flex flex-col gap-1'>
              <p className='text-sm font-bold text-blue-100'>
                Looking for Social Links?
              </p>
              <p className='text-xs leading-relaxed font-medium text-blue-400/80'>
                X/Twitter, GitHub, and other project-wide social profiles have
                been moved to the{' '}
                <span className='font-bold text-blue-200 underline'>
                  Basic Info
                </span>{' '}
                tab. This section is specifically for your personal or team
                contact handles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
