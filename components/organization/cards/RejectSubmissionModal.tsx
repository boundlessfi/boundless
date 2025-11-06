'use client';

import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { BoundlessButton } from '@/components/buttons';
import { cn } from '@/lib/utils';

interface RejectSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissionName?: string;
  onConfirm?: (comment?: string) => void;
}

export default function RejectSubmissionModal({
  open,
  onOpenChange,
  onConfirm,
}: RejectSubmissionModalProps) {
  const [comment, setComment] = useState('');
  const maxCommentLength = 300;

  const handleConfirm = () => {
    onConfirm?.(comment.trim() || undefined);
    setComment('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setComment('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='bg-background-card max-w-md gap-0 border-gray-800 p-0'>
        <AlertDialogHeader className='relative overflow-hidden px-0'>
          <Image
            src='/metric-image.svg'
            alt='Background'
            width={100}
            height={100}
            className='absolute top-0 right-0 h-full w-1/2 object-cover'
          />
          <div className='bg-background-card/30 absolute top-0 right-0 bottom-0 left-0 h-full w-full rounded-t-[8px] backdrop-blur-[2px]' />

          <div className='relative z-20 flex items-center gap-4 p-4'>
            <Image
              src='/warning.png'
              alt='Warning'
              width={74}
              height={64}
              className='h-[64px] w-[74px]'
            />

            <div className='flex-1'>
              <AlertDialogTitle className='mb-2 text-left text-xl font-medium text-white'>
                Mark submission as disqualified
              </AlertDialogTitle>
              <AlertDialogDescription className='text-left text-xs text-gray-400'>
                This will mark the submission as DISQUALIFIED. The participant
                will remain in your organization and can appeal this decision.
                This action can be reversed by an organizer.
              </AlertDialogDescription>
            </div>
          </div>
          <div className='relative z-20 px-4 pb-4'>
            <div className='mb-2 flex items-center justify-between'>
              <label className='text-xs text-white'>
                Leave a comment (optional)
              </label>
              <span
                className={cn(
                  'text-xs',
                  comment.length > maxCommentLength
                    ? 'text-red-500'
                    : 'text-gray-400'
                )}
              >
                {comment.length}/{maxCommentLength}
              </span>
            </div>
            <Textarea
              value={comment}
              onChange={e => {
                if (e.target.value.length <= maxCommentLength) {
                  setComment(e.target.value);
                }
              }}
              placeholder='Your comment...'
              className='bg-background-card min-h-[170px] resize-none border-gray-900 text-white placeholder:text-gray-500'
              rows={4}
            />
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className='flex flex-row justify-between gap-3 border-t border-gray-900 p-4'>
          <AlertDialogCancel asChild>
            <BoundlessButton
              variant='outline'
              onClick={handleCancel}
              fullWidth
              className='border-gray-700 bg-transparent text-white hover:bg-gray-800 hover:text-white'
            >
              CANCEL
            </BoundlessButton>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <BoundlessButton
              onClick={handleConfirm}
              fullWidth
              className='gap-2 bg-red-500 text-white hover:bg-red-600'
            >
              MARK AS DISQUALIFIED
              <Delete className='h-4 w-4' />
            </BoundlessButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
