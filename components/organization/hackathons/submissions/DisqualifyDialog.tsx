'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface DisqualifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => Promise<void>;
  isSubmitting: boolean;
}

export function DisqualifyDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: DisqualifyDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (reason.length < 10) {
      setError('Reason must be at least 10 characters long');
      return;
    }
    setError(null);
    await onSubmit(reason);
    setReason('');
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason('');
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='border-gray-800 bg-gray-950 sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='text-white'>
            Disqualify Submission
          </DialogTitle>
          <DialogDescription className='text-gray-400'>
            Please provides a reason for disqualifying this submission. This
            will be visible to the participant.
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='reason' className='text-white'>
              Reason
            </Label>
            <Textarea
              id='reason'
              value={reason}
              onChange={e => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder='Enter disqualification reason...'
              className='col-span-3 min-h-[100px] border-gray-800 bg-gray-900 text-white placeholder:text-gray-500 focus:border-red-500/50 focus:ring-red-500/50'
            />
            {error && (
              <div className='flex items-center gap-2 text-sm text-red-400'>
                <AlertCircle className='h-4 w-4' />
                <span>{error}</span>
              </div>
            )}
            <p className='text-xs text-gray-500'>
              Minimum 10 characters. Maximum 500 characters.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className='border-gray-800 bg-transparent text-gray-300 hover:bg-gray-900 hover:text-white'
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleSubmit}
            disabled={isSubmitting || reason.length < 10}
            className='bg-red-600 text-white hover:bg-red-700'
          >
            {isSubmitting ? 'Disqualifying...' : 'Disqualify'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
