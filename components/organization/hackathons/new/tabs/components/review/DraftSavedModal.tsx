import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BoundlessButton } from '@/components/buttons';
import { Archive, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DraftSavedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueEditing?: () => void;
}

export default function DraftSavedModal({
  open,
  onOpenChange,
  onContinueEditing,
}: DraftSavedModalProps) {
  const router = useRouter();

  const handleContinueEditing = () => {
    onOpenChange(false);
    if (onContinueEditing) {
      onContinueEditing();
    }
  };

  const handleGoHome = () => {
    onOpenChange(false);
    router.push('/');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='bg-background-card w-full max-w-[500px] border border-gray-900 p-16 text-center'
      >
        <DialogHeader className='space-y-6'>
          {/* Icon with glow effect */}
          <div className='relative mx-auto'>
            <div className='bg-warning-400/30 absolute inset-0 rounded-full blur-sm' />
            <div className='bgg-warning-500/10 relative flex h-20 w-20 items-center justify-center rounded-full'>
              <Archive
                strokeWidth={1.5}
                className='text-warning-500 h-10 w-10'
              />
            </div>
          </div>

          {/* Title */}
          <DialogTitle className='text-center text-xl font-medium text-white'>
            Hackathon Saved as Draft
          </DialogTitle>

          {/* Description */}
          <DialogDescription className='text-center leading-relaxed text-gray-500'>
            Your progress has been saved. You can{' '}
            <button
              onClick={handleContinueEditing}
              className='text-primary underline hover:no-underline'
            >
              continue editing
            </button>{' '}
            now or return home and revisit it later.
          </DialogDescription>

          {/* Home Button */}
          <div className='flex items-center justify-center pt-4'>
            <BoundlessButton
              onClick={handleGoHome}
              size='xl'
              fullWidth
              className='bg-primary hover:bg-primary/90 text-black'
            >
              <Building2 className='mr-2 h-4 w-4' />
              Home
            </BoundlessButton>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
