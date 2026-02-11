import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/hooks/use-wallet';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { formatAddress } from '@/lib/wallet-utils';
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
} from 'lucide-react';
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
  } = useWalletContext();
  const [copied, setCopied] = useState(false);

  // Sync view with initialView when the drawer opens
  useEffect(() => {
    if (open && initialView) {
      setView(initialView);
    }
  }, [open, initialView]);

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

  if (!walletAddress) return null;

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
                      <div className='text-center'>
                        <div className='text-muted-foreground text-sm'>
                          Portfolio Value
                        </div>
                        <div className='text-3xl font-bold'>
                          {formatUSD(totalPortfolioValue)}
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
                                    <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full'>
                                      <Coins className='text-primary h-5 w-5' />
                                    </div>
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
                          value={walletAddress}
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
                            {walletAddress}
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
                            href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
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

                    <div className='text-muted-foreground flex h-40 flex-col items-center justify-center rounded-xl border border-dashed text-center'>
                      <Coins className='mb-2 h-8 w-8 opacity-50' />
                      <p>Send form placeholder</p>
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
