import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, Loader2 } from 'lucide-react';

interface TransactionSigningScreenProps {
  onSign: () => void;
  isSigning?: boolean;
  flowStep?: 'signing' | 'confirming';
  onRetry?: () => void;
  hasError?: boolean;
  errorMessage?: string;
}

const TransactionSigningScreen: React.FC<TransactionSigningScreenProps> = ({
  onSign,
  isSigning = false,
  flowStep = 'signing',
  onRetry,
  hasError = false,
  errorMessage,
}) => {
  return (
    <TooltipProvider>
      <div className='flex h-full items-center justify-center'>
        <div className='flex flex-col items-center space-y-4'>
          {hasError && errorMessage && (
            <div className='max-w-md rounded-lg border border-red-500/40 bg-red-500/10 p-4'>
              <div className='flex items-start gap-2'>
                <Info className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-500' />
                <div>
                  <h4 className='text-sm font-medium text-red-300'>Error</h4>
                  <p className='text-sm text-red-200'>{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          <div className='flex items-center gap-2'>
            <Button
              onClick={onSign}
              className='w-full max-w-md'
              size='lg'
              disabled={isSigning || flowStep === 'confirming'}
            >
              {isSigning || flowStep === 'confirming' ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {flowStep === 'confirming'
                    ? 'Creating Project...'
                    : 'Signing...'}
                </>
              ) : (
                'Sign Transaction'
              )}
            </Button>

            {!isSigning && flowStep === 'signing' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-10 w-10'>
                    <Info className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className='w-80' align='end'>
                  <div className='space-y-2'>
                    <h4 className='font-medium'>What happens when you sign?</h4>
                    <div className='space-y-2 text-sm text-gray-600'>
                      <p>• Your project will be created on the blockchain</p>
                      <p>• An escrow contract will be set up for funding</p>
                      <p>• Team members will receive invitations</p>
                      <p>• Your project will be visible to the community</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {hasError && onRetry && (
            <Button
              onClick={onRetry}
              variant='outline'
              className='w-full max-w-md'
              size='lg'
            >
              Try Again
            </Button>
          )}

          {(isSigning || flowStep === 'confirming') && (
            <p className='max-w-md text-center text-sm text-gray-400'>
              {flowStep === 'confirming'
                ? 'Please wait while we create your project...'
                : 'Please check your wallet for the transaction prompt.'}
            </p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TransactionSigningScreen;
