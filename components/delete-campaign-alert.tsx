'use client';

import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { deleteCrowdfundingProject } from '@/features/projects/api';

interface DeleteCampaignAlertProps {
  campaignId: string;
  campaignTitle: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
}

export function DeleteCampaignAlert({
  campaignId,
  campaignTitle,
  onSuccess,
  onError,
  children,
}: DeleteCampaignAlertProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteCrowdfundingProject(campaignId);

      toast.success('Campaign deleted successfully', {
        description: `"${campaignTitle}" has been permanently removed.`,
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete campaign';

      toast.error('Failed to delete campaign', {
        description: errorMessage,
      });

      onError?.(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button
            variant='ghost'
            size='sm'
            className='text-error-400 hover:bg-error-400/10'
          >
            <Trash2 className='mr-2 h-4 w-4' />
            Delete Campaign
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className='bg-background border-border'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-foreground'>
            Delete Campaign
          </AlertDialogTitle>
          <AlertDialogDescription className='text-muted-foreground'>
            Are you sure you want to delete <strong>"{campaignTitle}"</strong>?
            This action cannot be undone. Only campaigns in draft/reviewing
            phase without contributions can be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className='bg-background border-border text-foreground hover:bg-muted/50'
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className='bg-error-500 hover:bg-error-600 text-white'
          >
            {isDeleting ? 'Deleting...' : 'Delete Campaign'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
