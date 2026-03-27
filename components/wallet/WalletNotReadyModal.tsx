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
import {
  XIcon,
  Wallet,
  ExternalLink,
  Activity,
  Coins,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { WalletNotReadyReason } from '@/hooks/use-wallet-readiness';

interface WalletNotReadyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reasons: WalletNotReadyReason[];
  onOpenWallet: () => void;
  actionName: string;
  /** When true, hides trustline/activation steps (smart wallets don't need them). */
  isSmartWallet?: boolean;
}

const WalletNotReadyModal: React.FC<WalletNotReadyModalProps> = ({
  open,
  onOpenChange,
  reasons,
  onOpenWallet,
  actionName,
  isSmartWallet = false,
}) => {
  // Smart wallets don't need activation or trustlines — filter those out
  const filteredReasons = isSmartWallet
    ? reasons.filter(
        r =>
          r !== 'not_activated' &&
          r !== 'no_usdc_trustline' &&
          r !== 'insufficient_xlm'
      )
    : reasons;
  const handleOpenWallet = () => {
    onOpenChange(false);
    onOpenWallet();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className='bg-background-main-bg max-h-[90vh] w-[95vw]! max-w-[552px]! gap-6 overflow-hidden rounded-[16px] border-none p-4 shadow-[0_1px_4px_0_rgba(72,72,72,0.14),0_0_4px_1px_#484848] sm:p-6'
      >
        <DialogHeader>
          <DialogClose
            className='absolute top-4 right-4 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100'
            asChild
          >
            <XIcon className='h-6 w-6 text-white' />
          </DialogClose>
        </DialogHeader>

        <div className='flex flex-col items-center space-y-8'>
          {/* Header Icon with Glow */}
          <div className='relative pt-4'>
            <div className='bg-primary/10 absolute -inset-4 animate-pulse rounded-full blur-xl' />
            <div className='border-primary/20 bg-primary/5 relative flex h-20 w-20 items-center justify-center rounded-full border shadow-[0_0_20px_rgba(46,237,170,0.1)]'>
              <Wallet className='text-primary h-10 w-10' />
            </div>
          </div>

          {/* Title & Description */}
          <div className='space-y-3 text-center'>
            <DialogTitle className='text-3xl font-bold tracking-tight text-white'>
              Wallet Not Ready
            </DialogTitle>
            <DialogDescription className='mx-auto max-w-[400px] text-base leading-relaxed text-white/60'>
              A few quick steps are needed before you can{' '}
              <span className='font-semibold text-white'>{actionName}</span>.
            </DialogDescription>
          </div>

          {/* Steps Section */}
          <div className='w-full space-y-3 rounded-2xl border border-white/5 bg-white/2 p-2'>
            {filteredReasons.includes('not_activated') && (
              <StepItem
                icon={<Activity className='text-primary h-5 w-5' />}
                title='Activate Stellar Account'
                description="Your account isn't on-chain. Send at least 2 XLM to this address to activate it."
              />
            )}
            {filteredReasons.includes('no_usdc_trustline') && (
              <StepItem
                icon={<ShieldCheck className='text-primary h-5 w-5' />}
                title='Add USDC Trustline'
                description='Required to hold USDC on Stellar. Open your wallet to add the trustline.'
              />
            )}
            {filteredReasons.includes('insufficient_xlm') &&
              !filteredReasons.includes('not_activated') && (
                <StepItem
                  icon={<Coins className='text-primary h-5 w-5' />}
                  title='Low XLM Balance'
                  description='Transaction fees and reserve requirements need a small amount of XLM.'
                />
              )}
            {filteredReasons.includes('insufficient_usdc') && (
              <StepItem
                icon={<AlertCircle className='text-primary h-5 w-5' />}
                title='Insufficient USDC Balance'
                description='You need more USDC in your wallet to complete this transaction.'
              />
            )}
          </div>

          {/* Actions */}
          <div className='flex w-full flex-col gap-3 pt-2 sm:flex-row'>
            <Button
              onClick={handleOpenWallet}
              className='bg-primary hover:bg-primary/90 h-14 flex-1 gap-3 text-lg font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98]'
            >
              <Wallet className='h-5 w-5' />
              Open Wallet
            </Button>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='h-14 flex-1 border-white/10 bg-transparent text-lg font-bold text-white transition-all hover:bg-white/5'
            >
              Close
            </Button>
          </div>

          <a
            href='https://developers.stellar.org/docs/glossary/minimum-balance'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-2 text-sm font-medium text-white/30 transition-colors hover:text-white/60'
          >
            Why is this required?
            <ExternalLink className='h-3.5 w-3.5' />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StepItem = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className='flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-white/3'>
    <div className='mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5'>
      {icon}
    </div>
    <div className='space-y-1'>
      <h4 className='text-base font-bold text-white'>{title}</h4>
      <p className='text-sm leading-relaxed text-white/50'>{description}</p>
    </div>
  </div>
);

export default WalletNotReadyModal;
