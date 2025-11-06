'use client';

import React from 'react';
import { Delete } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { BoundlessButton } from '@/components/buttons';

interface RemoveParticipantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantName?: string;
  onConfirm?: () => void;
}

export default function RemoveParticipantModal({
  open,
  onOpenChange,
  onConfirm,
}: RemoveParticipantModalProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='bg-background-card max-w-md gap-0 border-gray-800 p-0'>
        <AlertDialogHeader className='relative overflow-hidden px-0'>
          <Image
            src='/metric-image.svg'
            alt='User'
            width={100}
            height={100}
            className='absolute top-0 right-0 h-full w-1/2 object-cover'
          />
          <div className='bg-background-card/30 absolute top-0 right-0 bottom-0 left-0 h-full w-full rounded-t-[8px] backdrop-blur-[2px]' />
          <div className='relative z-20 flex items-start gap-4 p-4'>
            <Image
              src='/user-delete.svg'
              alt='User'
              width={50}
              height={50}
              className='h-[87.5px] w-[87.5px] object-cover'
            />

            <div className='flex-1'>
              <AlertDialogTitle className='mb-2 text-left text-xl font-bold text-white'>
                Remove participant from organization
              </AlertDialogTitle>
              <AlertDialogDescription className='text-left text-sm text-white/80'>
                This will mark the participant as REMOVED. They can rejoin by
                registering for any future event. This action can be reversed by
                an organizer. All submission data will be preserved for audit
                purposes.
              </AlertDialogDescription>
            </div>
          </div>
          {/* </div> */}
        </AlertDialogHeader>

        <AlertDialogFooter className='flex flex-row justify-between gap-3 border-t border-gray-900 p-4'>
          <AlertDialogCancel asChild>
            <BoundlessButton
              variant='outline'
              fullWidth
              className='flex-1 border-gray-700 bg-transparent text-white hover:bg-gray-800 hover:text-white'
            >
              CANCEL
            </BoundlessButton>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <BoundlessButton
              onClick={handleConfirm}
              fullWidth
              className='flex-1 gap-2 bg-red-500 text-white hover:bg-red-600'
            >
              REMOVE
              <Delete className='h-4 w-4' />
            </BoundlessButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
