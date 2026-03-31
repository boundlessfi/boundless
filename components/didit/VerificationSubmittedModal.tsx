'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface VerificationSubmittedModalProps {
  open: boolean;
  onClose: () => void;
}

export function VerificationSubmittedModal({
  open,
  onClose,
}: VerificationSubmittedModalProps) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className='flex flex-col items-center gap-0 border-zinc-800 bg-zinc-900 p-8 text-center sm:max-w-sm'
      >
        {/* Animated icon */}
        <div className='relative mb-6 flex items-center justify-center'>
          <span className='absolute inline-flex h-20 w-20 animate-ping rounded-full bg-amber-500/20' />
          <span className='relative flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/30'>
            <Clock className='h-8 w-8 text-amber-400' />
          </span>
        </div>

        <DialogHeader className='w-full'>
          <DialogTitle className='text-center text-xl text-white'>
            Verification submitted
          </DialogTitle>
          <DialogDescription className='mt-2 text-center text-sm text-zinc-400'>
            Your identity is under review. This usually takes a few minutes. We
            will notify you by email once it is complete.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className='mt-6 w-full'>
          <Button onClick={onClose} className='w-full'>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
