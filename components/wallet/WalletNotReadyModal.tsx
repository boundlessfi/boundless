import React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { XIcon, AlertCircle, CheckCircle2, Wallet, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { WalletNotReadyReason } from '@/hooks/use-wallet-readiness';

interface WalletNotReadyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reasons: WalletNotReadyReason[];
  onOpenWallet: () => void;
  actionName: string;
}

const WalletNotReadyModal: React.FC<WalletNotReadyModalProps> = ({
  open,
  onOpenChange,
  reasons,
  onOpenWallet,
  actionName,
}) => {
  const handleOpenWallet = () => {
    onOpenChange(false);
    onOpenWallet();
  };

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

        <div className='flex flex-col items-center space-y-6'>
          <div className='relative'>
            <div className='absolute -inset-1 animate-pulse rounded-full bg-yellow-500/20 blur-md' />
            <AlertCircle className='relative h-16 w-16 text-yellow-500' />
          </div>

          <div className='space-y-2 text-center'>
            <DialogTitle className='text-2xl font-bold text-white'>
              Wallet Not Ready
            </DialogTitle>
            <DialogDescription className='text-white/60 text-base'>
              Your wallet needs a few steps before you can{' '}
              <span className='font-semibold text-white'>{actionName}</span>.
            </DialogDescription>
          </div>

          <div className='w-full space-y-4 rounded-xl border border-white/10 bg-white/5 p-4'>
            {reasons.includes('not_activated') && (
              <StepItem
                title="Activate Stellar Account"
                description="Your account isn't on-chain yet. Send at least 2 XLM to this address."
              />
            )}
            {reasons.includes('no_usdc_trustline') && (
              <StepItem
                title="Add USDC Trustline"
                description="Stellar requires a trustline to hold USDC. You can add this in your wallet."
              />
            )}
            {(reasons.includes('insufficient_xlm') && !reasons.includes('not_activated')) && (
              <StepItem
                title="Low XLM Balance"
                description="You need a small amount of XLM for transaction fees and reserves."
              />
            )}
            {reasons.includes('insufficient_usdc') && (
              <StepItem
                title="Insufficient USDC Balance"
                description="You don't have enough USDC to complete this transaction."
              />
            )}
          </div>

          <div className='flex w-full flex-col gap-3 sm:flex-row'>
            <Button
              onClick={handleOpenWallet}
              className='h-12 flex-1 gap-2 bg-primary text-lg font-bold text-black hover:bg-primary/90'
            >
              <Wallet className='h-5 w-5' />
              Open Wallet
            </Button>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='h-12 flex-1 border-white/10 bg-transparent text-lg font-bold text-white hover:bg-white/5'
            >
              Cancel
            </Button>
          </div>

          <a 
            href="https://developers.stellar.org/docs/glossary/minimum-balance" 
            target="_blank" 
            rel="noopener noreferrer"
            className='flex items-center gap-1 text-xs text-white/40 hover:text-white/60'
          >
            Learn more about Stellar account requirements
            <ExternalLink className='h-3 w-3' />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StepItem = ({ title, description }: { title: string; description: string }) => (
  <div className='flex gap-3'>
    <div className='mt-1 shrink-0'>
      <div className='flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500/20'>
        <div className='h-2 w-2 rounded-full bg-yellow-500' />
      </div>
    </div>
    <div className='space-y-1'>
      <h4 className='text-sm font-bold text-white'>{title}</h4>
      <p className='text-xs leading-relaxed text-white/60'>{description}</p>
    </div>
  </div>
);

export default WalletNotReadyModal;
