import { useState, useEffect, useCallback } from 'react';
import { Drawer } from 'vaul';
import { motion, AnimatePresence } from 'motion/react';
import { useWalletStore } from '@/lib/stores/walletStore';
import { useDisconnect } from '@/hooks/wallet/useDisconnect';
import { useBalances } from '@/hooks/assets/useBalances';
import { useTransactions } from '@/hooks/transactions/useTransactions';
import { useTransfer } from '@/hooks/wallet/useTransfer';
import { type AssetSymbol } from '@/lib/smartwallet/config';
import {
  formatAddress,
  getExplorerUrl,
  getTransactionExplorerUrl,
} from '@/lib/wallet-utils';
import { validateStellarAddress } from '@/lib/utils/stellar-address-validation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Wallet,
  Copy,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  LogOut,
  X,
  ExternalLink,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import type { ApiError } from '@/lib/api/api';
import { AssetIcon } from './AssetIcon';
import { cn } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

export type DrawerView = 'main' | 'receive' | 'send' | 'activity' | 'assets';

interface FamilyWalletDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: DrawerView;
}

export function FamilyWalletDrawer({
  open,
  onOpenChange,
  initialView,
}: FamilyWalletDrawerProps) {
  const [view, setView] = useState<DrawerView>('main');
  const isRestoring = useWalletStore(s => s.isRestoring);
  const disconnect = useDisconnect();
  const contractId = useWalletStore(s => s.contractId);
  const { balances, totalUsd } = useBalances();
  const { transactions } = useTransactions();
  const transfer = useTransfer();
  const walletAddress = contractId;
  const walletType = 'smart';
  const walletName = 'Smart Wallet';
  const [copied, setCopied] = useState(false);

  // Send form state
  const [sendDestination, setSendDestination] = useState('');
  const [sendCurrency, setSendCurrency] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [validateLoading, setValidateLoading] = useState(false);
  const [validateResult, setValidateResult] = useState<
    'idle' | 'valid' | 'invalid'
  >('idle');
  const [validateError, setValidateError] = useState('');
  const [validateErrorDetails, setValidateErrorDetails] = useState<string[]>(
    []
  );
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendErrorDetails, setSendErrorDetails] = useState<string[]>([]);

  const getErrorDisplay = useCallback(
    (err: unknown): { message: string; details: string[] } => {
      if (err && typeof err === 'object' && 'message' in err) {
        const apiErr = err as ApiError;
        const message =
          typeof apiErr.message === 'string'
            ? apiErr.message
            : 'Something went wrong.';
        const rawDetails = Array.isArray(apiErr.errors)
          ? apiErr.errors
              .map(e => e?.message)
              .filter((m): m is string => typeof m === 'string')
          : [];
        const details = rawDetails.filter(d => d !== message);
        return { message, details };
      }
      if (err instanceof Error) return { message: err.message, details: [] };
      return { message: 'Something went wrong.', details: [] };
    },
    []
  );

  const resetSendForm = useCallback(() => {
    setSendDestination('');
    setSendAmount('');
    setValidateResult('idle');
    setValidateError('');
    setValidateErrorDetails([]);
    setSendError('');
    setSendErrorDetails([]);
  }, []);

  // Sync view with initialView when the drawer opens
  useEffect(() => {
    if (open && initialView) {
      setView(initialView);
    }
  }, [open, initialView]);

  // Default send currency to first balance when entering send view
  useEffect(() => {
    if (view === 'send' && !sendCurrency && balances.length > 0) {
      const first = balances[0];
      setSendCurrency(first?.code ?? '');
    }
  }, [view, sendCurrency, balances]);

  const handleValidateDestination = useCallback(async () => {
    const dest = sendDestination.trim();
    const currency = sendCurrency || 'XLM';
    if (!dest) {
      setValidateResult('invalid');
      setValidateError('Enter a destination address');
      return;
    }
    if (!validateStellarAddress(dest)) {
      setValidateResult('invalid');
      setValidateError(
        'Invalid Stellar address format (G... or C... address, 56 characters)'
      );
      return;
    }
    setValidateLoading(true);
    setValidateError('');
    setValidateResult('idle');
    try {
      if (sendDestination.trim() !== dest) return;
      setValidateResult('valid');
      setValidateError('');
    } catch (err: unknown) {
      // Protect against stale responses
      if (sendDestination.trim() !== dest) return;

      const { message, details } = getErrorDisplay(err);
      setValidateResult('invalid');
      setValidateError(message);
      setValidateErrorDetails(details);
    } finally {
      // We still want to clear loading if it's the latest call
      if (sendDestination.trim() === dest) {
        setValidateLoading(false);
      }
    }
  }, [sendDestination, sendCurrency, getErrorDisplay]);

  // Auto-validate destination address
  useEffect(() => {
    const trimmedDest = sendDestination.trim();

    // Reset state if empty
    if (!trimmedDest) {
      setValidateResult('idle');
      setValidateError('');
      return;
    }

    // Immediate trigger if 56 chars
    if (trimmedDest.length === 56) {
      handleValidateDestination();
      return;
    }

    const timer = setTimeout(() => {
      handleValidateDestination();
    }, 500);

    return () => clearTimeout(timer);
  }, [sendDestination, sendCurrency, handleValidateDestination]);

  const handleSendSubmit = useCallback(async () => {
    const dest = sendDestination.trim();
    const currency = sendCurrency || 'XLM';
    const amount = parseFloat(sendAmount);
    if (!dest || !validateStellarAddress(dest)) {
      setSendError('Enter a valid Stellar destination address');
      return;
    }
    if (validateResult !== 'valid') {
      setSendError('Validate the destination first');
      return;
    }
    if (!currency) {
      setSendError('Select an asset');
      return;
    }
    if (Number.isNaN(amount) || amount <= 0) {
      setSendError('Enter a valid amount');
      return;
    }
    const selectedBalance = balances.find(b => b.code === currency);
    const maxAmount = selectedBalance
      ? parseFloat(selectedBalance.formatted)
      : 0;
    if (amount > maxAmount) {
      setSendError(
        `Amount exceeds balance (max ${formatBalance(String(maxAmount))} ${currency})`
      );
      return;
    }
    setSendLoading(true);
    setSendError('');
    try {
      await transfer.mutateAsync({
        asset: currency as AssetSymbol,
        recipient: dest,
        amount,
      });

      toast.success('Send submitted successfully');
      resetSendForm();
      setView('main');
    } catch (err: unknown) {
      const { message, details } = getErrorDisplay(err);
      setSendError(message);
      setSendErrorDetails(details);
    } finally {
      setSendLoading(false);
    }
  }, [
    sendDestination,
    sendCurrency,
    sendAmount,
    validateResult,
    balances,
    transfer,
    resetSendForm,
    getErrorDisplay,
  ]);

  const resetView = () => setView('main');

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    // Resetting after close is handled by the useEffect on open
  };

  const handleCopyAddress = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Address copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDisconnectClick = async () => {
    try {
      await disconnect.mutateAsync();
      handleOpenChange(false);
      toast.success('Wallet disconnected');
    } catch {
      toast.error('Failed to disconnect');
    }
  };

  // Helper to format balance for display
  const formatBalance = (amount: string) => {
    const value = parseFloat(amount);
    if (isNaN(value)) return '0.00';

    // Format with commas and appropriate decimals
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7,
    }).format(value);
  };

  // Helper to format USD values
  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!walletAddress && !isRestoring) return null;

  if (!walletAddress && isRestoring) {
    return (
      <Drawer.Root
        shouldScaleBackground
        open={open}
        onOpenChange={handleOpenChange}
      >
        <Drawer.Portal>
          <Drawer.Overlay className='fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]' />
          <Drawer.Content className='fixed right-0 bottom-0 left-0 z-50 mt-24 flex max-h-[90vh] flex-col outline-none'>
            <div className='bg-background mx-auto w-full max-w-md rounded-t-[20px] shadow-2xl ring-1 ring-black/5 dark:ring-white/10'>
              <div className='bg-muted/50 mx-auto mt-4 h-1.5 w-12 rounded-full' />
              <div className='flex flex-col items-center justify-center gap-4 py-16'>
                <Loader2 className='text-primary h-10 w-10 animate-spin' />
                <p className='text-muted-foreground text-sm'>Loading wallet…</p>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  const address = walletAddress as string;

  return (
    <Drawer.Root
      shouldScaleBackground
      open={open}
      onOpenChange={handleOpenChange}
    >
      <Drawer.Portal>
        <Drawer.Overlay className='fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]' />
        <Drawer.Content className='fixed right-0 bottom-0 left-0 z-50 mt-24 flex max-h-[90vh] flex-col outline-none'>
          <div className='bg-background mx-auto w-full max-w-md rounded-t-[20px] shadow-2xl ring-1 ring-black/5 dark:ring-white/10'>
            {/* Handle */}
            <div className='bg-muted/50 mx-auto mt-4 h-1.5 w-12 rounded-full' />

            <div className='overflow-hidden rounded-t-[10px]'>
              <AnimatePresence mode='wait' initial={false}>
                {view === 'main' && (
                  <motion.div
                    key='main'
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '-100%', opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className='p-4 pt-2'
                  >
                    <div className='flex items-center justify-between pb-4'>
                      <div className='flex items-center gap-2'>
                        <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full'>
                          <Wallet className='h-4 w-4' />
                        </div>
                        <span className='font-semibold'>
                          {walletName || 'My Wallet'}
                        </span>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleOpenChange(false)}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>

                    <div className='space-y-6'>
                      <div className='flex-1 text-center'>
                        <div className='text-muted-foreground text-sm'>
                          Portfolio Value
                        </div>
                        <div className='text-3xl font-bold'>
                          {formatUSD(parseFloat(totalUsd))}
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <Button
                          className='h-auto flex-col gap-1 py-3'
                          onClick={() => setView('receive')}
                        >
                          <div className='rounded-full bg-white/20 p-2'>
                            <ArrowDownLeft className='h-5 w-5' />
                          </div>
                          Receive
                        </Button>
                        <Button
                          className='h-auto flex-col gap-1 py-3'
                          variant='outline'
                          onClick={() => setView('send')}
                        >
                          <div className='rounded-full bg-black/5 p-2 dark:bg-white/10'>
                            <ArrowUpRight className='h-5 w-5' />
                          </div>
                          Send
                        </Button>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>Assets</span>
                        </div>
                        <div className='space-y-2'>
                          {balances.length === 0 ? (
                            <div className='text-muted-foreground p-4 text-center text-xs'>
                              No assets found
                            </div>
                          ) : (
                            balances.map((asset, index) => {
                              const isNative = asset.code === 'XLM';
                              const code = asset.code;
                              const name = asset.name;

                              return (
                                <div
                                  key={index}
                                  className='hover:border-border/50 hover:bg-muted/50 flex items-center justify-between rounded-xl border border-transparent p-3 transition-colors'
                                >
                                  <div className='flex items-center gap-3'>
                                    <AssetIcon
                                      assetCode={
                                        isNative ? 'native' : asset.code
                                      }
                                      size={40}
                                    />
                                    <div>
                                      <div className='font-medium'>{name}</div>
                                      <div className='text-muted-foreground text-xs'>
                                        {formatBalance(asset.formatted)} {code}
                                      </div>
                                    </div>
                                  </div>
                                  <div className='font-medium'>
                                    {formatBalance(asset.formatted)}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>
                            Recent Activity
                          </span>
                          <Button
                            variant='link'
                            size='sm'
                            className='text-muted-foreground h-auto p-0'
                            onClick={() => setView('activity')}
                          >
                            View All
                          </Button>
                        </div>
                        <div className='space-y-2'>
                          {transactions.length === 0 ? (
                            <div className='text-muted-foreground p-4 text-center text-xs'>
                              No recent activity
                            </div>
                          ) : (
                            transactions.slice(0, 3).map((tx, index) => {
                              const isReceive = tx.to === walletAddress;
                              const txHash = tx.hash;
                              const hasTxHash = !!txHash;
                              const explorerUrl = hasTxHash
                                ? getTransactionExplorerUrl(txHash)
                                : address
                                  ? getExplorerUrl(address)
                                  : null;
                              const Wrapper = explorerUrl ? 'a' : 'div';
                              const wrapperProps = explorerUrl
                                ? {
                                    href: explorerUrl,
                                    target: '_blank' as const,
                                    rel: 'noopener noreferrer',
                                  }
                                : {};

                              return (
                                <Wrapper
                                  key={index}
                                  {...wrapperProps}
                                  className='hover:bg-muted/50 group flex cursor-pointer items-center justify-between rounded-xl p-3'
                                >
                                  <div className='flex items-center gap-3'>
                                    <div
                                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                        isReceive
                                          ? 'bg-green-500/10 text-green-500'
                                          : 'bg-orange-500/10 text-orange-500'
                                      }`}
                                    >
                                      {isReceive ? (
                                        <ArrowDownLeft className='h-5 w-5' />
                                      ) : (
                                        <ArrowUpRight className='h-5 w-5' />
                                      )}
                                    </div>
                                    <div>
                                      <div className='flex items-center gap-1 text-sm font-medium'>
                                        {isReceive ? 'Received' : 'Sent'}
                                        {explorerUrl && (
                                          <ExternalLink className='h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60' />
                                        )}
                                      </div>
                                      <div className='text-muted-foreground text-xs'>
                                        {new Date(
                                          tx.createdAt
                                        ).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className={`text-sm font-medium ${
                                      isReceive
                                        ? 'text-green-600'
                                        : 'text-foreground'
                                    }`}
                                  >
                                    {isReceive ? '+' : '-'} {tx.amountFormatted}{' '}
                                    {tx.asset}
                                  </div>
                                </Wrapper>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className='pt-2'>
                        <Button
                          variant='ghost'
                          className='text-destructive hover:bg-destructive/10 hover:text-destructive w-full'
                          onClick={handleDisconnectClick}
                        >
                          <LogOut className='mr-2 h-4 w-4' />
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {view === 'receive' && (
                  <motion.div
                    key='receive'
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className='p-4 pt-2'
                  >
                    <div className='flex items-center gap-2 pb-4'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setView('main')}
                      >
                        <ChevronLeft className='h-5 w-5' />
                      </Button>
                      <h3 className='font-semibold'>Receive Assets</h3>
                    </div>
                    <div className='flex flex-col items-center gap-6 py-6'>
                      <div className='rounded-xl bg-white p-4 shadow-sm'>
                        <QRCodeSVG
                          value={address}
                          size={192}
                          level='H'
                          marginSize={0}
                          className='h-48 w-48'
                        />
                      </div>
                      <div className='bg-muted/50 w-full space-y-2 rounded-xl p-4'>
                        <div className='text-muted-foreground text-center text-xs font-medium uppercase'>
                          Your Address
                        </div>
                        <div className='flex items-center gap-2'>
                          <code className='flex-1 text-center font-mono text-sm break-all'>
                            {address}
                          </code>
                        </div>
                        <Button
                          className='w-full'
                          variant='secondary'
                          onClick={handleCopyAddress}
                        >
                          {copied ? (
                            <>
                              <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className='mr-2 h-4 w-4' />
                              Copy Address
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {view === 'activity' && (
                  <motion.div
                    key='activity'
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className='flex h-[400px] flex-col' // Fixed height for scroll area
                  >
                    <div className='flex items-center gap-2 p-4 pt-2 pb-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setView('main')}
                      >
                        <ChevronLeft className='h-5 w-5' />
                      </Button>
                      <h3 className='font-semibold'>Activity</h3>
                    </div>
                    <ScrollArea className='flex-1 px-4'>
                      <div className='space-y-3 pb-6'>
                        {transactions.length === 0 ? (
                          <div className='text-muted-foreground py-10 text-center text-sm'>
                            No transactions found
                          </div>
                        ) : (
                          transactions.map((tx, index) => {
                            const isReceive = tx.to === walletAddress;
                            const txHash = tx.hash;
                            const explorerUrl =
                              txHash && /^[a-f0-9]{64}$/i.test(txHash)
                                ? getTransactionExplorerUrl(txHash)
                                : null;
                            const Wrapper = explorerUrl ? 'a' : 'div';
                            const wrapperProps = explorerUrl
                              ? {
                                  href: explorerUrl,
                                  target: '_blank' as const,
                                  rel: 'noopener noreferrer',
                                }
                              : {};

                            return (
                              <Wrapper
                                key={index}
                                {...wrapperProps}
                                className='bg-muted/30 hover:bg-muted/50 group flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors'
                              >
                                <div className='flex items-center gap-3'>
                                  <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                      isReceive
                                        ? 'bg-green-500/10 text-green-500'
                                        : 'bg-orange-500/10 text-orange-500'
                                    }`}
                                  >
                                    {isReceive ? (
                                      <ArrowDownLeft className='h-5 w-5' />
                                    ) : (
                                      <ArrowUpRight className='h-5 w-5' />
                                    )}
                                  </div>
                                  <div>
                                    <div className='flex items-center gap-1 text-sm font-medium'>
                                      {isReceive ? 'Received' : 'Sent'}
                                      {explorerUrl && (
                                        <ExternalLink className='h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60' />
                                      )}
                                    </div>
                                    <div className='text-muted-foreground text-xs'>
                                      {new Date(
                                        tx.createdAt
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className='text-right'>
                                  <div
                                    className={`text-sm font-medium ${
                                      isReceive
                                        ? 'text-green-600'
                                        : 'text-foreground'
                                    }`}
                                  >
                                    {isReceive ? '+' : '-'} {tx.amountFormatted}{' '}
                                    {tx.asset}
                                  </div>
                                  <div className='text-muted-foreground text-xs'>
                                    {tx.successful ? 'success' : 'failed'}
                                  </div>
                                </div>
                              </Wrapper>
                            );
                          })
                        )}
                        <Button variant='outline' className='w-full' asChild>
                          <a
                            href={getExplorerUrl(address)}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <ExternalLink className='mr-2 h-4 w-4' />
                            View on Explorer
                          </a>
                        </Button>
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}

                {view === 'send' && (
                  <motion.div
                    key='send'
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className='p-4 pt-2'
                  >
                    <div className='flex items-center gap-2 pb-4'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setView('main')}
                      >
                        <ChevronLeft className='h-5 w-5' />
                      </Button>
                      <h3 className='font-semibold'>Send Assets</h3>
                    </div>

                    <div className='space-y-4'>
                      <Alert className='mx-1 border-orange-500/20 bg-orange-500/10 text-orange-600'>
                        <AlertCircle className='h-4 w-4 text-orange-600' />
                        <AlertTitle>Important Withdrawal Notice</AlertTitle>
                        <AlertDescription className='text-xs leading-relaxed'>
                          <p className='mt-1 text-orange-700 dark:text-orange-400'>
                            Do not withdraw directly to a Centralized Exchange
                            (e.g., Binance, Coinbase) wallet. This wallet does
                            not support memos, and your funds will be lost if
                            you use one. You must use a self-custodial wallet
                            that does not require a memo.
                          </p>
                          <p className='mt-2'>
                            <a
                              href='https://docs.boundlessfi.xyz/how-to-guides/withdraw-funds'
                              target='_blank'
                              rel='noopener noreferrer'
                              className='font-semibold underline underline-offset-2 hover:text-orange-800 dark:hover:text-orange-300'
                            >
                              Read our withdrawal guide here.
                            </a>
                          </p>
                        </AlertDescription>
                      </Alert>

                      <div className='space-y-2'>
                        <Label htmlFor='send-destination'>
                          Destination Address
                        </Label>
                        <div className='relative'>
                          <Input
                            id='send-destination'
                            placeholder={
                              walletType === 'smart'
                                ? 'G... or C...'
                                : 'GABCD...'
                            }
                            value={sendDestination}
                            onChange={e => {
                              setSendDestination(e.target.value);
                            }}
                            className='pr-10 font-mono text-sm'
                          />
                          <div className='absolute top-1/2 right-3 -translate-y-1/2'>
                            {validateLoading ? (
                              <Loader2 className='text-muted-foreground h-4 w-4 animate-spin' />
                            ) : validateResult === 'valid' ? (
                              <CheckCircle className='h-4 w-4 text-green-600' />
                            ) : validateResult === 'invalid' &&
                              sendDestination.trim().length >= 56 ? (
                              <AlertCircle className='text-destructive h-4 w-4' />
                            ) : null}
                          </div>
                        </div>
                        {validateResult === 'invalid' && validateError && (
                          <Alert variant='destructive' className='mt-2'>
                            <AlertCircle className='h-4 w-4' />
                            <AlertTitle>Validation failed</AlertTitle>
                            <AlertDescription>
                              <div className='space-y-1'>
                                <p>{validateError}</p>
                                {validateErrorDetails.length > 0 && (
                                  <ul className='list-inside list-disc text-xs'>
                                    {validateErrorDetails.map((detail, i) => (
                                      <li key={i}>{detail}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}
                        {validateResult === 'valid' && (
                          <p className='text-muted-foreground flex items-center gap-1 text-xs'>
                            <CheckCircle className='h-3.5 w-3.5 text-green-600' />
                            Destination validated
                          </p>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='send-asset'>Asset</Label>
                        <Select
                          value={sendCurrency}
                          onValueChange={v => {
                            setSendCurrency(v);
                            setValidateResult('idle');
                            setValidateError('');
                          }}
                        >
                          <SelectTrigger id='send-asset' className='w-full'>
                            <SelectValue placeholder='Select asset' />
                          </SelectTrigger>
                          <SelectContent>
                            {balances.map((asset, index) => {
                              const isNative = asset.code === 'XLM';
                              const code = asset.code;
                              return (
                                <SelectItem
                                  key={index}
                                  value={code}
                                  disabled={!code}
                                >
                                  <span className='flex items-center gap-2'>
                                    <AssetIcon
                                      assetCode={
                                        isNative ? 'native' : asset.code
                                      }
                                      size={20}
                                    />
                                    {code} — {formatBalance(asset.formatted)}
                                  </span>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='send-amount'>Amount</Label>
                        <Input
                          id='send-amount'
                          type='number'
                          min={0}
                          step='any'
                          placeholder='0.00'
                          value={sendAmount}
                          onChange={e => setSendAmount(e.target.value)}
                        />
                        {sendCurrency &&
                          (() => {
                            const sel = balances.find(
                              b => b.code === sendCurrency
                            );
                            const max = sel ? parseFloat(sel.formatted) : 0;
                            return (
                              <p className='text-muted-foreground text-xs'>
                                Max: {formatBalance(String(max))} {sendCurrency}
                              </p>
                            );
                          })()}
                      </div>

                      {sendError && (
                        <Alert variant='destructive' className='mt-2'>
                          <AlertCircle className='h-4 w-4' />
                          <AlertTitle>Send failed</AlertTitle>
                          <AlertDescription>
                            <div className='space-y-1'>
                              <p>{sendError}</p>
                              {sendErrorDetails.length > 0 && (
                                <ul className='list-inside list-disc text-xs'>
                                  {sendErrorDetails.map((detail, i) => (
                                    <li key={i}>{detail}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className='w-full'
                            disabled={
                              sendLoading ||
                              validateResult !== 'valid' ||
                              !sendAmount ||
                              parseFloat(sendAmount) <= 0
                            }
                          >
                            {sendLoading ? (
                              <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Sending…
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className='mr-2 h-4 w-4' />
                                Send
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className='z-100 max-w-[90vw] sm:max-w-md'>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirm Withdrawal
                            </AlertDialogTitle>
                            <AlertDialogDescription className='space-y-3 text-left'>
                              <span className='block text-sm'>
                                You are about to send{' '}
                                <strong className='text-foreground'>
                                  {sendAmount} {sendCurrency}
                                </strong>{' '}
                                to{' '}
                                <strong className='text-foreground font-mono break-all'>
                                  {sendDestination}
                                </strong>
                                .
                              </span>
                              <span className='text-destructive mt-4 block text-sm font-semibold'>
                                ⚠️ WARNING: Do not withdraw to Centralized
                                Exchanges (e.g. Binance, Coinbase).
                              </span>
                              <span className='block text-sm'>
                                Exchanges require a memo, which this wallet does
                                NOT support. Doing so will result in permanent
                                loss of your funds.
                              </span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className='mt-4 gap-2 sm:gap-0'>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleSendSubmit}
                              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            >
                              Yes, I confirm this is a self-custodial wallet
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
