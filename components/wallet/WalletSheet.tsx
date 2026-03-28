import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Wallet,
  Copy,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Coins,
  LogOut,
  CheckCircle,
  RefreshCw,
  Loader2,
  Plus,
  CheckCircle2,
  ChevronLeft,
  X,
  QrCode,
  AlertCircle,
  Fingerprint,
  Flame,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import { AssetIcon } from './AssetIcon';
import { useWallet } from '@/hooks/use-wallet';
import { useWalletContext } from '@/components/providers/wallet-provider';
import {
  validateSendDestination,
  sendFunds,
  confirmSend,
  type SupportedTrustlineAsset,
} from '@/lib/api/wallet';
import { signTransaction } from '@/lib/config/wallet-kit';
import {
  formatAddress,
  getExplorerUrl,
  getTransactionExplorerUrl,
} from '@/lib/wallet-utils';
import { validateStellarAddress } from '@/lib/utils/stellar-address-validation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
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
import { QRCodeSVG } from 'qrcode.react';

/**
 * Map transaction type to display properties: label, icon, colors.
 */
function getTxDisplay(type: string, note?: string | null) {
  switch (type) {
    case 'DEPOSIT':
      return {
        label: 'Received',
        icon: <ArrowDownLeft className='h-5 w-5' />,
        bgColor: 'bg-green-500/10 text-green-500',
        amountColor: 'text-green-600',
        sign: '+',
      };
    case 'WITHDRAWAL':
      return {
        label: note?.startsWith('approved') ? 'Approval' : 'Sent',
        icon: <ArrowUpRight className='h-5 w-5' />,
        bgColor: 'bg-orange-500/10 text-orange-500',
        amountColor: 'text-foreground',
        sign: '-',
      };
    case 'FEE':
      return {
        label: 'Network Fee',
        icon: <Flame className='h-5 w-5' />,
        bgColor: 'bg-red-500/10 text-red-400',
        amountColor: 'text-red-400',
        sign: '-',
      };
    case 'PAYOUT':
      return {
        label: 'Payout',
        icon: <Coins className='h-5 w-5' />,
        bgColor: 'bg-blue-500/10 text-blue-500',
        amountColor: 'text-blue-500',
        sign: '+',
      };
    case 'REFUND':
      return {
        label: 'Refund',
        icon: <Undo2 className='h-5 w-5' />,
        bgColor: 'bg-purple-500/10 text-purple-500',
        amountColor: 'text-purple-500',
        sign: '+',
      };
    default:
      return {
        label: type.charAt(0) + type.slice(1).toLowerCase(),
        icon: <History className='h-5 w-5' />,
        bgColor: 'bg-muted text-muted-foreground',
        amountColor: 'text-foreground',
        sign: '',
      };
  }
}

export type DrawerView = 'main' | 'receive' | 'send';

interface WalletSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: DrawerView;
}

export function WalletSheet({
  open,
  onOpenChange,
  initialView,
}: WalletSheetProps) {
  const [view, setView] = useState<DrawerView>('main');
  const { handleDisconnect } = useWallet();
  const {
    walletAddress,
    walletName,
    walletType,
    balances,
    transactions,
    totalPortfolioValue,
    syncWallet,
    refreshWallet,
    getSupportedTrustlineAssets,
    addTrustline,
    isLoading,
    hasWalletFromSession,
  } = useWalletContext();
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [supportedTrustlines, setSupportedTrustlines] = useState<
    SupportedTrustlineAsset[]
  >([]);
  const [addingAsset, setAddingAsset] = useState<string | null>(null);

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

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await syncWallet();
      toast.success('Wallet synced');
    } catch {
      toast.error('Sync failed. Try again.');
    } finally {
      setIsSyncing(false);
    }
  }, [syncWallet]);

  const handleAddTrustline = useCallback(
    async (assetCode: string) => {
      setAddingAsset(assetCode);
      try {
        await addTrustline(assetCode);
        toast.success(`${assetCode} trustline added`);
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'Could not add trustline. Wallet may need activation or more XLM.';
        toast.error(message);
      } finally {
        setAddingAsset(null);
      }
    },
    [addTrustline]
  );

  useEffect(() => {
    if (open && walletAddress) {
      getSupportedTrustlineAssets()
        .then(setSupportedTrustlines)
        .catch(() => setSupportedTrustlines([]));
    }
  }, [open, walletAddress, getSupportedTrustlineAssets]);

  useEffect(() => {
    if (open && initialView) {
      setView(initialView);
    }
  }, [open, initialView]);

  useEffect(() => {
    if (view === 'send' && !sendCurrency && balances.length > 0) {
      const first = balances[0];
      setSendCurrency(
        first?.asset_type === 'native' ? 'XLM' : (first?.asset_code ?? '')
      );
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
      const result = await validateSendDestination(dest, currency);

      if (sendDestination.trim() !== dest) return;

      if (result.valid) {
        setValidateResult('valid');
        setValidateError('');
      } else {
        setValidateResult('invalid');
        setValidateError(
          'Destination not valid: may be unactivated or missing trustline for this asset.'
        );
      }
    } catch (err: unknown) {
      if (sendDestination.trim() !== dest) return;

      const { message, details } = getErrorDisplay(err);
      setValidateResult('invalid');
      setValidateError(message);
      setValidateErrorDetails(details);
    } finally {
      if (sendDestination.trim() === dest) {
        setValidateLoading(false);
      }
    }
  }, [sendDestination, sendCurrency, getErrorDisplay]);

  useEffect(() => {
    const trimmedDest = sendDestination.trim();

    if (!trimmedDest) {
      setValidateResult('idle');
      setValidateError('');
      return;
    }

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
    const selectedBalance = balances.find(
      b =>
        (b.asset_type === 'native' && currency === 'XLM') ||
        b.asset_code === currency
    );
    const maxAmount = selectedBalance ? parseFloat(selectedBalance.balance) : 0;
    if (amount > maxAmount) {
      setSendError(
        `Amount exceeds balance (max ${formatBalance(String(maxAmount))} ${currency})`
      );
      return;
    }
    setSendLoading(true);
    setSendError('');
    try {
      const result = await sendFunds({
        destinationPublicKey: dest,
        amount,
        currency,
        idempotencyKey: crypto.randomUUID(),
      });

      // Smart wallet: two-step flow — sign unsigned XDR, then confirm
      if (
        result &&
        'step' in result &&
        result.step === 'sign_transfer' &&
        typeof result.unsignedXdr === 'string'
      ) {
        toast.info('Please approve with your passkey…');
        const signedXdr = await signTransaction({
          unsignedTransaction: result.unsignedXdr,
          address: walletAddress!,
        });
        await confirmSend(signedXdr);
      }

      toast.success('Send submitted successfully');
      refreshWallet();
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
    walletAddress,
    refreshWallet,
    resetSendForm,
    getErrorDisplay,
  ]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(() => setView('main'), 300);
    }
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
      await handleDisconnect();
      handleOpenChange(false);
      toast.success('Wallet disconnected');
    } catch {
      toast.error('Failed to disconnect');
    }
  };

  const formatBalance = (amount: string) => {
    const value = parseFloat(amount);
    if (isNaN(value)) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7,
    }).format(value);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!walletAddress && !hasWalletFromSession) return null;

  if (!walletAddress && hasWalletFromSession) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className='flex h-full w-full flex-col gap-0 p-0 sm:max-w-md'>
          <div className='flex flex-col items-center justify-center gap-4 py-16'>
            <Loader2 className='text-primary h-10 w-10 animate-spin' />
            <p className='text-muted-foreground text-sm'>Loading wallet…</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const address = walletAddress as string;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className='flex h-full w-full flex-col gap-0 p-0 sm:max-w-md'>
        <div className='flex h-full flex-col overflow-hidden'>
          <AnimatePresence mode='wait' initial={false}>
            {view === 'main' && (
              <motion.div
                key='main'
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className='flex h-full flex-col'
              >
                <SheetHeader className='border-border/50 border-b p-6 pb-2'>
                  <div className='flex items-center justify-between'>
                    <SheetTitle className='flex items-center gap-2 text-lg font-semibold'>
                      {walletType === 'smart' ? (
                        <Fingerprint className='text-primary h-5 w-5' />
                      ) : (
                        <Wallet className='text-primary h-5 w-5' />
                      )}
                      {walletName || 'My Wallet'}
                    </SheetTitle>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='text-muted-foreground hover:text-destructive h-8 w-8'
                      onClick={handleDisconnectClick}
                      title='Disconnect Wallet'
                    >
                      <LogOut className='h-4 w-4' />
                    </Button>
                  </div>

                  <div className='bg-card border-border mt-4 rounded-xl border p-4 shadow-sm'>
                    <div className='flex items-start justify-between gap-2'>
                      <div>
                        <div className='text-muted-foreground mb-1 text-sm'>
                          Portfolio Value
                        </div>
                        <div className='text-3xl font-bold tracking-tight'>
                          {formatUSD(totalPortfolioValue)}
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={handleSync}
                        disabled={isSyncing}
                        title='Sync wallet'
                        aria-label='Sync wallet'
                      >
                        {isSyncing ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <RefreshCw className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                    <div className='bg-muted/50 mt-3 flex items-center gap-2 rounded-lg p-2'>
                      <code className='text-foreground/80 flex-1 truncate font-mono text-xs'>
                        {formatAddress(address, 12)}
                      </code>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6'
                        onClick={handleCopyAddress}
                      >
                        {copied ? (
                          <CheckCircle className='h-3.5 w-3.5 text-green-500' />
                        ) : (
                          <Copy className='text-muted-foreground h-3.5 w-3.5' />
                        )}
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6'
                        asChild
                      >
                        <a
                          href={getExplorerUrl(address)}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <ExternalLink className='text-muted-foreground h-3.5 w-3.5' />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className='mt-4 grid grid-cols-2 gap-3'>
                    <Button
                      className='w-full gap-2'
                      variant='default'
                      onClick={() => setView('receive')}
                    >
                      <ArrowDownLeft className='h-4 w-4' /> Receive
                    </Button>
                    <Button
                      className='w-full gap-2'
                      variant='outline'
                      onClick={() => setView('send')}
                    >
                      <ArrowUpRight className='h-4 w-4' /> Send
                    </Button>
                  </div>
                </SheetHeader>

                <div className='flex-1 overflow-hidden'>
                  <Tabs
                    defaultValue='assets'
                    className='flex h-full w-full flex-col'
                  >
                    <div className='px-6 pt-2'>
                      <TabsList className='grid w-full grid-cols-2'>
                        <TabsTrigger value='assets'>Assets</TabsTrigger>
                        <TabsTrigger value='activity'>Activity</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent
                      value='assets'
                      className='mt-4 h-full flex-1 p-0'
                    >
                      <ScrollArea className='h-[calc(100vh-380px)] px-6'>
                        <div className='space-y-4 pb-6'>
                          {balances.length === 0 ? (
                            <div className='text-muted-foreground py-8 text-center text-sm'>
                              No assets found
                            </div>
                          ) : (
                            balances.map((asset, index) => {
                              const isNative = asset.asset_type === 'native';
                              const code = isNative ? 'XLM' : asset.asset_code;
                              const name =
                                asset.asset_name ??
                                (isNative
                                  ? 'Stellar Lumens'
                                  : asset.asset_code);

                              return (
                                <div
                                  key={index}
                                  className='hover:bg-muted/50 hover:border-border/50 flex items-center justify-between rounded-xl border border-transparent p-3 transition-colors'
                                >
                                  <div className='flex items-center gap-3'>
                                    <AssetIcon
                                      assetCode={
                                        isNative
                                          ? 'native'
                                          : (asset.asset_code ?? '')
                                      }
                                      size={40}
                                    />
                                    <div>
                                      <div className='font-medium'>{name}</div>
                                      <div className='text-muted-foreground text-xs'>
                                        {formatBalance(asset.balance)} {code}
                                      </div>
                                    </div>
                                  </div>
                                  <div className='font-medium'>
                                    {asset.usdValue != null
                                      ? formatUSD(asset.usdValue)
                                      : formatBalance(asset.balance)}
                                  </div>
                                </div>
                              );
                            })
                          )}

                          {walletType !== 'smart' &&
                            supportedTrustlines.length > 0 && (
                              <div className='mt-4 space-y-2'>
                                <span className='text-muted-foreground text-xs font-medium'>
                                  Add trustline
                                </span>
                                <div className='space-y-1'>
                                  {supportedTrustlines.map(asset => {
                                    const hasTrustline = balances.some(
                                      b =>
                                        (b.asset_type === 'native' &&
                                          asset.assetCode === 'XLM') ||
                                        (b.asset_type !== 'native' &&
                                          b.asset_code === asset.assetCode)
                                    );
                                    return (
                                      <Button
                                        key={asset.assetCode}
                                        variant='outline'
                                        size='sm'
                                        className='w-full justify-start gap-2 border-dashed'
                                        onClick={() =>
                                          handleAddTrustline(asset.assetCode)
                                        }
                                        disabled={
                                          hasTrustline ||
                                          addingAsset === asset.assetCode
                                        }
                                      >
                                        {addingAsset === asset.assetCode ? (
                                          <Loader2 className='h-3.5 w-3.5 shrink-0 animate-spin' />
                                        ) : hasTrustline ? (
                                          <CheckCircle2 className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                                        ) : (
                                          <AssetIcon
                                            assetCode={asset.assetCode}
                                            size={20}
                                            className='shrink-0'
                                          />
                                        )}
                                        {hasTrustline
                                          ? `${asset.assetCode} trustline added`
                                          : `Enable ${asset.assetCode}${asset.name ? ` (${asset.name})` : ''}`}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent
                      value='activity'
                      className='mt-4 h-full flex-1 p-0'
                    >
                      <ScrollArea className='h-[calc(100vh-380px)] px-6'>
                        <div className='space-y-4 pb-6'>
                          {transactions.length === 0 ? (
                            <div className='text-muted-foreground py-8 text-center text-sm'>
                              No transactions found
                            </div>
                          ) : (
                            transactions.map((tx, index) => {
                              const txMeta = getTxDisplay(tx.type, tx.note);
                              const txHash =
                                tx.metadata?.txHash ||
                                tx.metadata?.hash ||
                                tx.externalTxId;
                              const hasTxHash =
                                txHash &&
                                typeof txHash === 'string' &&
                                /^[a-f0-9]{64}$/i.test(txHash);
                              const explorerUrl = hasTxHash
                                ? getTransactionExplorerUrl(txHash)
                                : walletAddress
                                  ? getExplorerUrl(walletAddress)
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
                                  className='hover:bg-muted/50 group flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors'
                                >
                                  <div className='flex items-center gap-3'>
                                    <div
                                      className={`flex h-10 w-10 items-center justify-center rounded-full ${txMeta.bgColor}`}
                                    >
                                      {txMeta.icon}
                                    </div>
                                    <div>
                                      <div className='flex items-center gap-1 text-sm font-medium'>
                                        {txMeta.label}
                                        {explorerUrl && (
                                          <ExternalLink className='h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60' />
                                        )}
                                      </div>
                                      {tx.note && (
                                        <div className='text-muted-foreground max-w-[180px] truncate text-[11px]'>
                                          {tx.note}
                                        </div>
                                      )}
                                      <div className='text-muted-foreground text-xs'>
                                        {new Date(
                                          tx.createdAt
                                        ).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className='text-right'>
                                    <div
                                      className={`text-sm font-medium ${txMeta.amountColor}`}
                                    >
                                      {txMeta.sign}
                                      {tx.amount} {tx.currency}
                                    </div>
                                    <div className='text-muted-foreground text-xs'>
                                      {tx.state}
                                    </div>
                                  </div>
                                </Wrapper>
                              );
                            })
                          )}
                          <div className='flex justify-center pt-2 pb-4'>
                            <Button
                              variant='link'
                              size='sm'
                              className='text-muted-foreground'
                              asChild
                            >
                              <a
                                href={getExplorerUrl(address)}
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                <History className='mr-2 h-3 w-3' /> View all on
                                Explorer
                              </a>
                            </Button>
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
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
                className='flex h-full flex-col p-6'
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

            {view === 'send' && (
              <motion.div
                key='send'
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className='flex h-full flex-col p-6'
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

                <div className='flex-1 space-y-4 overflow-y-auto pr-1 pb-10'>
                  <Alert className='border-orange-500/20 bg-orange-500/10 text-orange-600'>
                    <AlertCircle className='h-4 w-4 text-orange-600' />
                    <AlertTitle>Important Withdrawal Notice</AlertTitle>
                    <AlertDescription className='text-xs leading-relaxed'>
                      <p className='mt-1 text-orange-700 dark:text-orange-400'>
                        Do not withdraw directly to a Centralized Exchange
                        (e.g., Binance, Coinbase) wallet. This wallet does not
                        support memos, and your funds will be lost if you use
                        one. You must use a self-custodial wallet that does not
                        require a memo.
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
                          walletType === 'smart' ? 'G... or C...' : 'GABCD...'
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
                      <SelectContent className='z-100'>
                        {balances.map((asset, index) => {
                          const isNative = asset.asset_type === 'native';
                          const code = isNative ? 'XLM' : asset.asset_code;
                          return (
                            <SelectItem
                              key={index}
                              value={code ?? ''}
                              disabled={!code}
                            >
                              <span className='flex items-center gap-2'>
                                <AssetIcon
                                  assetCode={
                                    isNative
                                      ? 'native'
                                      : (asset.asset_code ?? '')
                                  }
                                  size={20}
                                />
                                {code} — {formatBalance(asset.balance)}
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
                          b =>
                            (b.asset_type === 'native' &&
                              sendCurrency === 'XLM') ||
                            b.asset_code === sendCurrency
                        );
                        const max = sel ? parseFloat(sel.balance) : 0;
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

                  <div className='pt-4 pb-2'>
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
