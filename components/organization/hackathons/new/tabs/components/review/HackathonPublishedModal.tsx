import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BoundlessButton } from '@/components/buttons';
import { Check, Building2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NETWORKS, getCurrentNetwork } from '@/lib/wallet-utils';
import type { PublishResponseData } from '@/hooks/use-hackathon-publish';

interface HackathonPublishedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publishResponse?: PublishResponseData | null;
  organizationId?: string;
}

export default function HackathonPublishedModal({
  open,
  onOpenChange,
  publishResponse,
  organizationId,
}: HackathonPublishedModalProps) {
  const router = useRouter();

  const handleViewHackathon = () => {
    if (publishResponse?.slug) {
      onOpenChange(false);
      router.push(`/hackathons/${publishResponse.slug}`);
    }
  };

  const handleGoHome = () => {
    onOpenChange(false);
    if (organizationId) {
      router.push(`/organizations/${organizationId}`);
    } else {
      router.push('/');
    }
  };

  const handleViewEscrow = () => {
    if (publishResponse?.escrowAddress) {
      const network = getCurrentNetwork();
      const explorerUrl = `${NETWORKS[network].explorer}/contract/${publishResponse.escrowAddress}`;
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!publishResponse) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='bg-background-card w-full max-w-[500px] border border-gray-900 p-8 text-center'
      >
        <DialogHeader className='space-y-6'>
          {/* Success Icon */}
          <div className='relative mx-auto'>
            <div className='bg-success-400/30 absolute inset-0 h-20 w-20 rounded-full blur-xl' />
            <div className='bg-success-400/10 border-success-400/30 relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border'>
              <Check strokeWidth={1.5} className='text-success-400 h-10 w-10' />
            </div>
          </div>

          {/* Title */}
          <DialogTitle className='text-center text-2xl font-bold text-white'>
            Hackathon Published Successfully
          </DialogTitle>

          {/* Description */}
          <DialogDescription className='text-center leading-relaxed text-gray-500'>
            Your hackathon is now live and ready for participants to discover
            and join.
          </DialogDescription>

          {/* Action Buttons */}
          <div className='flex flex-col gap-3 pt-4'>
            <BoundlessButton
              onClick={handleViewHackathon}
              size='xl'
              fullWidth
              className='bg-primary hover:bg-primary/90 text-black'
            >
              View Hackathon
            </BoundlessButton>

            {publishResponse.escrowAddress && (
              <BoundlessButton
                onClick={handleViewEscrow}
                size='xl'
                fullWidth
                variant='outline'
                className='border-gray-900'
              >
                <ExternalLink className='mr-2 h-4 w-4' />
                View Escrow Address
              </BoundlessButton>
            )}

            <BoundlessButton
              onClick={handleGoHome}
              size='xl'
              fullWidth
              variant='outline'
              className='border-gray-900'
            >
              <Building2 className='mr-2 h-4 w-4' />
              Back to Organization
            </BoundlessButton>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
