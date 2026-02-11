'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  WalletCards,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Maximize2,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallet } from '@/hooks/use-wallet';
import { useWalletContext } from '@/components/providers/wallet-provider';

interface FamilyWalletButtonProps {
  onOpenDrawer: (view?: 'main' | 'receive' | 'send') => void;
  className?: string;
}

export function FamilyWalletButton({
  onOpenDrawer,
  className,
}: FamilyWalletButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { handleConnect } = useWallet();
  const { walletAddress } = useWalletContext();

  const toggleOpen = () => {
    if (!walletAddress) {
      handleConnect();
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={cn(
        'fixed right-6 bottom-6 z-50 flex items-end justify-end',
        className
      )}
    >
      <AnimatePresence>
        {isOpen && walletAddress && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className='mb-4 flex flex-col gap-2'
          >
            <div className='flex items-center gap-2'>
              <span className='rounded-md bg-black/80 px-2 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md dark:bg-white/90 dark:text-black'>
                Receive
              </span>
              <Button
                size='icon'
                className='h-10 w-10 rounded-full shadow-lg'
                onClick={() => {
                  onOpenDrawer('receive');
                  setIsOpen(false);
                }}
              >
                <ArrowDownLeft className='h-5 w-5' />
              </Button>
            </div>
            <div className='flex items-center gap-2'>
              <span className='rounded-md bg-black/80 px-2 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md dark:bg-white/90 dark:text-black'>
                Send
              </span>
              <Button
                size='icon'
                className='h-10 w-10 rounded-full shadow-lg'
                onClick={() => {
                  onOpenDrawer('send');
                  setIsOpen(false);
                }}
              >
                <ArrowUpRight className='h-5 w-5' />
              </Button>
            </div>
            <div className='flex items-center gap-2'>
              <span className='rounded-md bg-black/80 px-2 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md dark:bg-white/90 dark:text-black'>
                Open Wallet
              </span>
              <Button
                size='icon'
                className='h-10 w-10 rounded-full shadow-lg'
                onClick={() => {
                  onOpenDrawer('main');
                  setIsOpen(false);
                }}
              >
                <Maximize2 className='h-5 w-5' />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        layout
        onClick={toggleOpen}
        className={cn(
          'bg-primary text-primary-foreground hover:bg-primary/90 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-colors',
          isOpen && 'bg-muted text-foreground hover:bg-muted/90'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode='wait' initial={false}>
          {isOpen && walletAddress ? (
            <motion.div
              key='close'
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className='h-6 w-6' />
            </motion.div>
          ) : (
            <motion.div
              key='open'
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {!walletAddress ? (
                <Plus className='h-6 w-6' />
              ) : (
                <WalletCards className='h-6 w-6' />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
