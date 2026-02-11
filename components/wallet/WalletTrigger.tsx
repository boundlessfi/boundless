'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { Button } from '@/components/ui/button';
import { WalletSheet } from './WalletSheet';
import { FamilyWalletDrawer } from './FamilyWalletDrawer';
import { Wallet, ChevronDown, WalletCards } from 'lucide-react';
import { formatAddress } from '@/lib/wallet-utils';
import { cn } from '@/lib/utils';
import { GlowingEffect } from '../ui/glowing-effect';

interface WalletTriggerProps {
  variant?: 'icon' | 'balance' | 'floating' | 'family-button';
  className?: string;
  drawerType?: 'sheet' | 'family';
}

export function WalletTrigger({
  variant = 'icon',
  className,
  drawerType = 'sheet',
}: WalletTriggerProps) {
  const { handleConnect } = useWallet();
  const { walletAddress } = useWalletContext();
  const [open, setOpen] = useState(false);

  // If not connected, show connect button
  if (!walletAddress) {
    if (variant === 'floating' || variant === 'family-button') {
      return (
        <Button
          onClick={handleConnect}
          size='icon'
          className={cn(
            'fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-lg',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'transition-transform hover:scale-105',
            className
          )}
        >
          <Wallet className='h-6 w-6' />
        </Button>
      );
    }

    return (
      <Button
        onClick={handleConnect}
        className={cn('gap-2', className)}
        variant='default'
      >
        <Wallet className='h-4 w-4' />
        <span className='hidden sm:inline'>Connect Wallet</span>
      </Button>
    );
  }

  return (
    <>
      {variant === 'floating' && (
        <Button
          onClick={() => setOpen(true)}
          size='icon'
          className={cn(
            'fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-lg',
            'bg-card text-foreground border-border hover:bg-muted border',
            'transition-transform hover:scale-105',
            className
          )}
        >
          <WalletCards className='text-primary h-6 w-6' />
        </Button>
      )}

      {variant === 'icon' && (
        <Button
          onClick={() => setOpen(true)}
          variant='ghost'
          size='icon'
          className={cn('relative rounded-sm', className)}
        >
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
          />
          <Wallet className='h-5 w-5' />
        </Button>
      )}

      {variant === 'balance' && (
        <Button
          onClick={() => setOpen(true)}
          variant='outline'
          className={cn('gap-2 rounded-full px-4', className)}
        >
          <div className='flex items-center gap-2'>
            <div className='h-2 w-2 animate-pulse rounded-full bg-green-500' />
            <span className='hidden font-medium sm:inline-block'>
              {formatAddress(walletAddress, 4)}
            </span>
            <ChevronDown className='text-muted-foreground h-3 w-3' />
          </div>
        </Button>
      )}

      {drawerType === 'family' ? (
        <FamilyWalletDrawer open={open} onOpenChange={setOpen} />
      ) : (
        <WalletSheet open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}
