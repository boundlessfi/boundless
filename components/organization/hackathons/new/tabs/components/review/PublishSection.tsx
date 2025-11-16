'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { BoundlessButton } from '@/components/buttons';

interface PublishSectionProps {
  walletAddress: string | null;
  isLoading: boolean;
  isSavingDraft: boolean;
  onPublish: () => void;
  onSaveDraft?: () => void;
  organizationId?: string;
  draftId?: string | null;
}

export const PublishSection: React.FC<PublishSectionProps> = ({
  walletAddress,
  isLoading,
  isSavingDraft,
  onPublish,
  onSaveDraft,
  organizationId,
  draftId,
}) => {
  const router = useRouter();

  const handlePreview = () => {
    if (organizationId && draftId) {
      router.push(`/hackathons/preview/${organizationId}/${draftId}`);
    }
  };

  const canPreview = organizationId && draftId;

  return (
    <div className='from-primary/10 to-primary/5 border-primary/20 rounded-xl border bg-gradient-to-br p-6'>
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <div className='flex-1'>
          <h3 className='mb-1 text-lg font-semibold text-white'>
            Ready to Publish?
          </h3>
          <p className='text-sm text-gray-400'>
            {walletAddress
              ? 'Review all sections above and publish your hackathon when ready. Funds will be locked in escrow.'
              : 'Please connect your wallet to publish and lock funds in escrow.'}
          </p>
        </div>
        <div className='flex w-full flex-wrap items-center gap-3 sm:w-auto'>
          {canPreview && (
            <BoundlessButton
              onClick={handlePreview}
              size='xl'
              disabled={isSavingDraft || isLoading}
              variant='outline'
              className='flex-1 border-gray-700 hover:border-gray-600 hover:bg-gray-800 sm:flex-none'
            >
              <Eye className='mr-2 h-4 w-4' />
              Preview
            </BoundlessButton>
          )}
          {onSaveDraft && (
            <BoundlessButton
              onClick={onSaveDraft}
              size='xl'
              disabled={isSavingDraft || isLoading}
              variant='outline'
              className='flex-1 border-gray-700 hover:border-gray-600 hover:bg-gray-800 sm:flex-none'
            >
              {isSavingDraft ? 'Saving...' : 'Save as Draft'}
            </BoundlessButton>
          )}
          <BoundlessButton
            onClick={onPublish}
            size='xl'
            disabled={isLoading || isSavingDraft || !walletAddress}
            className='flex-1 sm:flex-none'
          >
            {isLoading ? 'Publishing...' : 'Publish Hackathon'}
          </BoundlessButton>
        </div>
      </div>
    </div>
  );
};
