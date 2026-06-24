'use client';

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

interface DeleteBountyDraftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftTitle: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteBountyDraftDialog({
  open,
  onOpenChange,
  draftTitle,
  onConfirm,
  isDeleting = false,
}: DeleteBountyDraftDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='border-zinc-800 bg-zinc-950'>
        <AlertDialogHeader className='items-center'>
          <div className='flex size-12 items-center justify-center rounded-full bg-red-500/10'>
            <AlertTriangle className='size-6 text-red-500' />
          </div>
          <AlertDialogTitle className='text-xl text-white'>
            Delete this draft?
          </AlertDialogTitle>
          <AlertDialogDescription className='text-center text-zinc-400'>
            {draftTitle ? (
              <>
                <span className='font-semibold text-white'>
                  &quot;{draftTitle}&quot;
                </span>{' '}
                will be permanently deleted. This cannot be undone.
              </>
            ) : (
              'This draft will be permanently deleted. This cannot be undone.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className='border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className='bg-red-500 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isDeleting ? 'Deleting...' : 'Delete draft'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
