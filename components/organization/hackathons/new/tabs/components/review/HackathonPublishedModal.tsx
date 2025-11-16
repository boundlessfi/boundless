import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BoundlessButton } from '@/components/buttons';
import { Check, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HackathonPublishedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hackathonUrl?: string;
}

export default function HackathonPublishedModal({
  open,
  onOpenChange,
  hackathonUrl,
}: HackathonPublishedModalProps) {
  const router = useRouter();

  const handleOpenInNewTab = () => {
    if (hackathonUrl) {
      window.open(hackathonUrl, '_blank', 'noopener,noreferrer');
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
            <div className='bg-success-400/30 absolute inset-0 rounded-full blur-sm' />
            <div className='relative flex h-20 w-20 items-center justify-center rounded-full'>
              <Check strokeWidth={1.5} className='text-success-400 h-10 w-10' />
            </div>
          </div>

          {/* Title */}
          <DialogTitle className='text-center text-xl font-medium text-white'>
            Hackathon Published Successfully
          </DialogTitle>

          {/* Description */}
          <DialogDescription className='text-center leading-relaxed text-gray-500'>
            Your hackathon is now published. You can{' '}
            {hackathonUrl && (
              <>
                <button
                  onClick={handleOpenInNewTab}
                  className='text-primary underline hover:no-underline'
                >
                  open it in a new tab
                </button>{' '}
                to preview or{' '}
              </>
            )}
            head back home to manage it.
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
