'use client';

import React from 'react';
import { CheckCircle, XCircle, ExternalLink, Copy } from 'lucide-react';
import { Button } from '../ui/button';
import { useWalletStore } from '@/hooks/use-wallet';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getTransactionExplorerUrl } from '@/lib/wallet-utils';

interface TxResultToastProps {
  hash: string;
  success: boolean;
  message?: string;
  onClose?: () => void;
}

const TxResultToast: React.FC<TxResultToastProps> = ({
  hash,
  success,
  message,
  onClose,
}) => {
  const { network } = useWalletStore();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      toast.success('Transaction hash copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy hash', {
        description: (error as Error)?.message || 'Please try again',
        action: {
          label: 'Dismiss',
          onClick: () => {},
        },
      });
    }
  };

  const getExplorerUrl = () => {
    return getTransactionExplorerUrl(hash, network as any);
  };

  const formatHash = (txHash: string) => {
    return `${txHash.slice(0, 8)}...${txHash.slice(-8)}`;
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        success
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
          : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
      )}
    >
      <div className='flex-shrink-0'>
        {success ? (
          <CheckCircle className='h-5 w-5 text-green-500' />
        ) : (
          <XCircle className='h-5 w-5 text-red-500' />
        )}
      </div>

      <div className='min-w-0 flex-1'>
        <div className='mb-2 flex items-center justify-between'>
          <h4
            className={cn(
              'text-sm font-medium',
              success
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            )}
          >
            {success ? 'Transaction Successful' : 'Transaction Failed'}
          </h4>
          {onClose && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onClose}
              className='h-6 w-6 p-0 text-gray-500 hover:text-gray-700'
            >
              ×
            </Button>
          )}
        </div>

        {message && (
          <p
            className={cn(
              'mb-2 text-sm',
              success
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            )}
          >
            {message}
          </p>
        )}

        <div className='flex items-center gap-2'>
          <code className='rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800'>
            {formatHash(hash)}
          </code>

          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={copyToClipboard}
              className='h-6 w-6 p-0 text-gray-500 hover:text-gray-700'
              title='Copy hash'
            >
              <Copy className='h-3 w-3' />
            </Button>

            <Button
              variant='ghost'
              size='sm'
              asChild
              className='h-6 w-6 p-0 text-gray-500 hover:text-gray-700'
              title='View on StellarExpert'
            >
              <a
                href={getExplorerUrl()}
                target='_blank'
                rel='noopener noreferrer'
              >
                <ExternalLink className='h-3 w-3' />
              </a>
            </Button>
          </div>
        </div>

        <div className='mt-2 text-xs text-gray-500'>
          Network: {network === 'testnet' ? 'Testnet' : 'Public'}
        </div>
      </div>
    </div>
  );
};

export default TxResultToast;
