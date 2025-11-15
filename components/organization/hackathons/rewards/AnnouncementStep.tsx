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
    <div className='space-y-4'>
      <div>
        <Label className='mb-2 block text-white'>Announcement Message</Label>
        <MinimalTiptap
          content={announcement}
          onChange={onAnnouncementChange}
          placeholder='Leave your winners and community a message from the host (optional)'
          className='border-gray-800 bg-[#1C1C1C] text-white'
        />
        <p className='mt-2 text-xs text-gray-500'>
          This message will be displayed publicly with the winners announcement.
        </p>
      </div>
    </div>
  );
};
