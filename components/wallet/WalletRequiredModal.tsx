import React, { useEffect } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { XIcon } from 'lucide-react';
import { WalletButton } from './WalletButton';
import Image from 'next/image';
import { useWalletContext } from '@/components/providers/wallet-provider';

interface WalletRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionName: string;
  onWalletConnected?: () => void;
}

const WalletRequiredModal: React.FC<WalletRequiredModalProps> = ({
  open,
  onOpenChange,
  actionName,
  onWalletConnected,
}) => {
  const { walletAddress } = useWalletContext();

  // Call onWalletConnected when wallet is connected while modal is open
  useEffect(() => {
    if (open && walletAddress && onWalletConnected) {
      onWalletConnected();
      // Close the modal after wallet is connected
      onOpenChange(false);
    }
  }, [open, walletAddress, onWalletConnected, onOpenChange]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='max-h-[90vh] !w-[95vw] !max-w-[552px] gap-6 overflow-hidden rounded-[16px] border-none bg-[#030303] p-4 shadow-[0_1px_4px_0_rgba(72,72,72,0.14),0_0_4px_1px_#484848] sm:p-6'
      >
        <DialogHeader>
          <DialogClose
            className='absolute top-2 right-2 rounded-full p-1'
            asChild
          >
            <XIcon className='h-8 w-8 text-white' />
          </DialogClose>
        </DialogHeader>

        <div className='flex flex-col items-center space-y-4'>
          <Image
            src={'/warning.svg'}
            alt='wallet-required'
            width={100}
            height={100}
            unoptimized={true}
          />
          <DialogTitle className='flex items-center justify-center gap-2 text-center'>
            <DialogDescription className='text-center text-white/80'>
              You need to connect your wallet to{' '}
              <span className='font-bold text-white'>{actionName}</span>. This
              ensures secure and transparent transactions on the blockchain.
            </DialogDescription>
          </DialogTitle>
          <div className='flex flex-col gap-3'>
            <WalletButton />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletRequiredModal;
