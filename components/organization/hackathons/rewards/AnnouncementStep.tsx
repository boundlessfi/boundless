'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { MinimalTiptap } from '@/components/ui/shadcn-io/minimal-tiptap';

interface AnnouncementStepProps {
  announcement: string;
  onAnnouncementChange: (value: string) => void;
}

export const AnnouncementStep: React.FC<AnnouncementStepProps> = ({
  announcement,
  onAnnouncementChange,
}) => {
  return (
    <div className='mx-auto max-w-lg space-y-3'>
      <div>
        <Label className='mb-1.5 block text-xs font-medium text-gray-300'>
          Announcement Message
        </Label>
        <MinimalTiptap
          content={announcement}
          onChange={onAnnouncementChange}
          placeholder='Leave your winners and community a message (optional)'
          className='border-gray-800 bg-[#1C1C1C] text-sm text-white'
        />
        <p className='mt-1.5 text-[11px] text-gray-500'>
          Displayed publicly with the winners announcement.
        </p>
      </div>
    </div>
  );
};
