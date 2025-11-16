'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, Copy, LogOut, CheckCircle, ChevronDown } from 'lucide-react';
import { formatAddress } from '@/lib/wallet-utils';
import { toast } from 'sonner';
import { BoundlessButton } from '../buttons';

/**
 * Wallet connection/disconnection button component with dropdown
 * Shows wallet info in a dropdown menu when connected
 */
export const WalletButton = () => {
  const { handleConnect, handleDisconnect } = useWallet();
  const { walletAddress, walletName } = useWalletContext();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy address');
    }
  };

  const handleDisconnectClick = async () => {
    try {
      await handleDisconnect();
      toast.success('Wallet disconnected');
    } catch {
      toast.error('Failed to disconnect wallet');
    }
  };

  // If wallet is connected, show dropdown with wallet info
  if (walletAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <BoundlessButton
            variant='outline'
            className='flex items-center gap-2'
          >
            <Wallet className='h-4 w-4' />
            {formatAddress(walletAddress, 3)}
            <ChevronDown className='h-4 w-4' />
          </BoundlessButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='bg-background-card w-64 border-gray-900'
        >
          <DropdownMenuLabel className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <Wallet className='text-primary h-4 w-4' />
              <span className='text-primary font-semibold'>
                {walletName || 'Wallet'}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className='bg-gray-800' />
          <div className='px-2 py-1.5'>
            <div className='text-muted-foreground mb-1 text-xs font-medium'>
              Address
            </div>
            <div className='bg-background flex items-center gap-2 rounded-md p-2'>
              <code className='text-muted-foreground flex-1 truncate font-mono text-xs'>
                {formatAddress(walletAddress, 6)}
              </code>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleCopyAddress}
                className='h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700'
                title={copied ? 'Copied!' : 'Copy address'}
              >
                {copied ? (
                  <CheckCircle className='h-3.5 w-3.5 text-green-500' />
                ) : (
                  <Copy className='h-3.5 w-3.5 text-gray-500' />
                )}
              </Button>
            </div>
          </div>
          <DropdownMenuSeparator className='bg-gray-800' />
          <DropdownMenuItem
            onClick={handleDisconnectClick}
            className='text-destructive focus:text-error-500 focus:bg-error-500/10 cursor-pointer'
          >
            <LogOut className='mr-2 h-4 w-4 text-white' />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If wallet is not connected, show connect button
  return (
    <Button
      onClick={handleConnect}
      className='bg-primary hover:bg-primary/60 flex items-center gap-2 text-black dark:bg-blue-600 dark:hover:bg-blue-700'
    >
      <Wallet className='h-4 w-4' />
      Connect Wallet
    </Button>
  );
};
