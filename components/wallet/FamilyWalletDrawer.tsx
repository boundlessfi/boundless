import { useState, useEffect, useCallback } from 'react';
import { Drawer } from 'vaul';
import { motion, AnimatePresence } from 'motion/react';
import { useWallet } from '@/hooks/use-wallet';
import { useWalletContext } from '@/components/providers/wallet-provider';
import {
  validateSendDestination,
  sendFunds,
  type SupportedTrustlineAsset,
} from '@/lib/api/wallet';
import { formatAddress, getExplorerUrl } from '@/lib/wallet-utils';
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
  QrCode,
  History,
  Coins,
  ExternalLink,
  CheckCircle,
  RefreshCw,
  Loader2,
  Plus,
  CheckCircle2,
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
  const { handleDisconnect } = useWallet();
  const {
    walletAddress,
    walletName,
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
  const [sendMemo, setSendMemo] = useState('');
  const [sendMemoRequired, setSendMemoRequired] = useState(false);
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
    setSendMemo('');
    setSendMemoRequired(false);
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
        'Invalid Stellar address format (must start with G, 56 characters)'
      );
      return;
    }
    setValidateLoading(true);
    setValidateError('');
    setValidateResult('idle');
    try {
      const result = await validateSendDestination(dest, currency);
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
      const { message, details } = getErrorDisplay(err);
      setValidateResult('invalid');
      setValidateError(message);
      setValidateErrorDetails(details);
    } finally {
      setValidateLoading(false);
    }
  }, [sendDestination, sendCurrency, getErrorDisplay]);

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
    if (sendMemoRequired && !sendMemo.trim()) {
      setSendError('Memo is required by the recipient');
      return;
    }
    const memoBytes = new TextEncoder().encode(sendMemo).length;
    if (sendMemo && memoBytes > 28) {
      setSendError('Memo must be 28 bytes or less (UTF-8)');
      return;
    }
    setSendLoading(true);
    setSendError('');
    try {
      await sendFunds({
        destinationPublicKey: dest,
        amount,
        currency,
        memo: sendMemo.trim() || undefined,
        memoRequired: sendMemoRequired || undefined,
        idempotencyKey: crypto.randomUUID(),
      });
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
    sendMemo,
    sendMemoRequired,
    validateResult,
    balances,
    refreshWallet,
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
      await handleDisconnect();
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

  if (!walletAddress && !hasWalletFromSession) return null;

  if (!walletAddress && hasWalletFromSession) {
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
                      <div className='flex items-center justify-between gap-2'>
                        <div className='flex-1 text-center'>
                          <div className='text-muted-foreground text-sm'>
                            Portfolio Value
                          </div>
                          <div className='text-3xl font-bold'>
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
                              const isNative = asset.asset_type === 'native';
                              const code = isNative ? 'XLM' : asset.asset_code;
                              const name = isNative
                                ? 'Stellar Lumens'
                                : asset.asset_code;

                              return (
                                <div
                                  key={index}
                                  className='hover:border-border/50 hover:bg-muted/50 flex items-center justify-between rounded-xl border border-transparent p-3 transition-colors'
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
                                    {asset.usdValue !== undefined
                                      ? formatUSD(asset.usdValue)
                                      : formatBalance(asset.balance)}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                        {supportedTrustlines.length > 0 && (
                          <div className='mt-3 space-y-2'>
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
                              const isReceive =
                                tx.type === 'DEPOSIT' || tx.type === 'receive';
                              return (
                                <div
                                  key={index}
                                  className='hover:bg-muted/50 flex items-center justify-between rounded-xl p-3'
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
                                      <div className='text-sm font-medium'>
                                        {isReceive ? 'Received' : 'Sent'}
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
                                    {isReceive ? '+' : '-'} {tx.amount}{' '}
                                    {tx.currency}
                                  </div>
                                </div>
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
                            const isReceive =
                              tx.type === 'DEPOSIT' || tx.type === 'receive';
                            return (
                              <div
                                key={index}
                                className='bg-muted/30 flex items-center justify-between rounded-xl p-3'
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
                                    <div className='text-sm font-medium'>
                                      {isReceive ? 'Received' : 'Sent'}
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
                                    {isReceive ? '+' : '-'} {tx.amount}{' '}
                                    {tx.currency}
                                  </div>
                                  <div className='text-muted-foreground text-xs'>
                                    {tx.state}
                                  </div>
                                </div>
                              </div>
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
                      <div className='space-y-2'>
                        <Label htmlFor='send-destination'>
                          Destination (Stellar G...)
                        </Label>
                        <div className='flex gap-2'>
                          <Input
                            id='send-destination'
                            placeholder='GABCD...'
                            value={sendDestination}
                            onChange={e => {
                              setSendDestination(e.target.value);
                              setValidateResult('idle');
                              setValidateError('');
                            }}
                            className='font-mono text-sm'
                          />
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={handleValidateDestination}
                            disabled={
                              validateLoading ||
                              !sendDestination.trim() ||
                              !sendCurrency
                            }
                          >
                            {validateLoading ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : validateResult === 'valid' ? (
                              <CheckCircle className='h-4 w-4 text-green-600' />
                            ) : (
                              'Validate'
                            )}
                          </Button>
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

                      <div className='space-y-2'>
                        <Label htmlFor='send-memo'>
                          Memo (optional, max 28 bytes)
                        </Label>
                        <Input
                          id='send-memo'
                          placeholder='Memo for exchange/deposit'
                          value={sendMemo}
                          onChange={e => setSendMemo(e.target.value)}
                        />
                        <div className='flex items-center gap-2'>
                          <Checkbox
                            id='send-memo-required'
                            checked={sendMemoRequired}
                            onCheckedChange={c =>
                              setSendMemoRequired(c === true)
                            }
                          />
                          <Label
                            htmlFor='send-memo-required'
                            className='text-muted-foreground cursor-pointer text-sm font-normal'
                          >
                            Memo required by recipient (e.g. exchange)
                          </Label>
                        </div>
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

                      <Button
                        className='w-full'
                        onClick={handleSendSubmit}
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
