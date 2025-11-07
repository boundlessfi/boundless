'use client';

import React, { useState } from 'react';
import { X, Megaphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { MinimalTiptap } from '@/components/ui/shadcn-io/minimal-tiptap';
import { BoundlessButton } from '@/components/buttons';

interface AnnounceWinnersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (announcement: string) => void;
  initialAnnouncement?: string;
}

export default function AnnounceWinnersModal({
  open,
  onOpenChange,
  onContinue,
  initialAnnouncement = '',
}: AnnounceWinnersModalProps) {
  const [announcement, setAnnouncement] = useState(initialAnnouncement);

  const handleContinue = () => {
    onContinue(announcement);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='bg-background-card !max-w-3xl border-gray-900 p-0'
        showCloseButton={false}
      >
        <DialogHeader className='flex flex-row items-center gap-3 border-b border-gray-900 p-6'>
          <Megaphone className='h-5 w-5 text-white' />
          <DialogTitle className='text-white'>Announcement</DialogTitle>
          <DialogClose asChild>
            <button className='ml-auto text-gray-400 transition-colors hover:text-white'>
              <X className='h-5 w-5' />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className='p-6'>
          <MinimalTiptap
            content={announcement}
            onChange={setAnnouncement}
            placeholder='Leave your winners and community a message from the host (optional)'
            className='pl border-gray-800 bg-[#1C1C1C] text-white'
          />
        </div>

        <div className='flex justify-end gap-3 border-t border-gray-900 p-6'>
          <BoundlessButton
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='border-gray-700 text-white hover:bg-gray-800'
          >
            Cancel
          </BoundlessButton>
          <BoundlessButton
            variant='default'
            onClick={handleContinue}
            className='bg-primary hover:bg-primary/90'
          >
            Continue
          </BoundlessButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
