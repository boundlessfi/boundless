'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface DeleteHackathonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hackathonTitle: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteHackathonDialog({
  open,
  onOpenChange,
  hackathonTitle,
  onConfirm,
  isDeleting = false,
}: DeleteHackathonDialogProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset confirmation when dialog closes
      setIsConfirmed(false);
    }
    onOpenChange(newOpen);
  };

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      setIsConfirmed(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className='border-zinc-800 bg-zinc-950'>
        <AlertDialogHeader className='items-center'>
          <div className='flex size-12 items-center justify-center rounded-full bg-red-500/10 dark:bg-red-900/20'>
            <AlertTriangle className='size-6 text-red-500 dark:text-red-400' />
          </div>
          <AlertDialogTitle className='text-xl text-white'>
            Delete Hackathon Permanently
          </AlertDialogTitle>
          <AlertDialogDescription className='text-center text-zinc-400'>
            This is a permanent action. All data associated with{' '}
            <span className='font-semibold text-white'>"{hackathonTitle}"</span>{' '}
            including participants, teams, submissions, and settings will be
            deleted immediately and cannot be recovered.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='flex items-start space-x-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4'>
          <Checkbox
            id='confirm-delete'
            checked={isConfirmed}
            onCheckedChange={checked => setIsConfirmed(checked === true)}
            className='mt-0.5 border-zinc-700 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:text-white'
          />
          <Label
            className='flex-1 cursor-pointer text-sm leading-relaxed font-normal text-zinc-300'
            htmlFor='confirm-delete'
          >
            I understand this action is permanent and irreversible. All
            hackathon data will be permanently deleted.
          </Label>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
            className='border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmed || isDeleting}
            className='bg-red-500 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isDeleting ? 'Deleting...' : 'Delete Hackathon'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
