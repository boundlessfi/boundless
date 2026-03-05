'use client';

import { useState } from 'react';
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
  const { walletAddress, hasWalletFromSession, isLoading } = useWalletContext();
  const [open, setOpen] = useState(false);

  // Wallet is managed by backend; no "Connect Wallet" flow. Show trigger only when
  // we have a wallet (from API) or session says user has a wallet (e.g. while loading).
  const showWalletEntry = !!walletAddress || hasWalletFromSession;
  if (!showWalletEntry) return null;

  // While loading and no address yet, show a minimal trigger that opens the drawer (loading state inside)
  if (!walletAddress && hasWalletFromSession) {
    const triggerButton = (
      <Button
        onClick={() => setOpen(true)}
        size='icon'
        className={cn(
          variant === 'floating' || variant === 'family-button'
            ? 'fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-lg'
            : '',
          'bg-muted text-muted-foreground',
          className
        )}
        disabled={isLoading}
        aria-label='Wallet'
      >
        <Wallet className='h-5 w-5' />
      </Button>
    );
    return (
      <>
        {triggerButton}
        {drawerType === 'family' ? (
          <FamilyWalletDrawer open={open} onOpenChange={setOpen} />
        ) : (
          <WalletSheet open={open} onOpenChange={setOpen} />
        )}
      </>
    );
  }

  const address = walletAddress as string;

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
              {formatAddress(address, 4)}
            </span>
            <ChevronDown className='text-muted-foreground h-3 w-3' />
          </div>
        </Button>
      )}

      {variant === 'family-button' && (
        <Button
          onClick={() => setOpen(true)}
          size='icon'
          className={cn(
            'fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-lg',
            'bg-card text-foreground border-border hover:bg-muted border',
            'transition-transform hover:scale-105',
            className
          )}
          aria-label='Wallet'
        >
          <WalletCards className='text-primary h-6 w-6' />
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
