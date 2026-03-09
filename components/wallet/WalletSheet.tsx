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
} from 'lucide-react';
import { AssetIcon } from './AssetIcon';
import { useWallet } from '@/hooks/use-wallet';
import { useWalletContext } from '@/components/providers/wallet-provider';
import type { SupportedTrustlineAsset } from '@/lib/api/wallet';
import { formatAddress, getExplorerUrl } from '@/lib/wallet-utils';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface WalletSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletSheet({ open, onOpenChange }: WalletSheetProps) {
  const { handleDisconnect } = useWallet();
  const {
    walletAddress,
    walletName,
    balances,
    transactions,
    totalPortfolioValue,
    syncWallet,
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
      onOpenChange(false);
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
      <Sheet open={open} onOpenChange={onOpenChange}>
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex h-full w-full flex-col gap-0 p-0 sm:max-w-md'>
        <SheetHeader className='border-border/50 border-b p-6 pb-2'>
          <div className='flex items-center justify-between'>
            <SheetTitle className='flex items-center gap-2 text-lg font-semibold'>
              <Wallet className='text-primary h-5 w-5' />
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
              <Button variant='ghost' size='icon' className='h-6 w-6' asChild>
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
            <Button className='w-full gap-2' variant='default'>
              <ArrowDownLeft className='h-4 w-4' /> Receive
            </Button>
            <Button className='w-full gap-2' variant='outline'>
              <ArrowUpRight className='h-4 w-4' /> Send
            </Button>
          </div>
        </SheetHeader>

        <div className='flex-1 overflow-hidden'>
          <Tabs defaultValue='assets' className='flex h-full w-full flex-col'>
            <div className='px-6 pt-2'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='assets'>Assets</TabsTrigger>
                <TabsTrigger value='activity'>Activity</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value='assets' className='mt-4 h-full flex-1 p-0'>
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
                      const name = isNative
                        ? 'Stellar Lumens'
                        : asset.asset_code;

                      return (
                        <div
                          key={index}
                          className='hover:bg-muted/50 hover:border-border/50 flex items-center justify-between rounded-xl border border-transparent p-3 transition-colors'
                        >
                          <div className='flex items-center gap-3'>
                            <AssetIcon
                              assetCode={
                                isNative ? 'native' : (asset.asset_code ?? '')
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

                  {supportedTrustlines.length > 0 && (
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
                                hasTrustline || addingAsset === asset.assetCode
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

            <TabsContent value='activity' className='mt-4 h-full flex-1 p-0'>
              <ScrollArea className='h-[calc(100vh-380px)] px-6'>
                <div className='space-y-4 pb-6'>
                  {transactions.length === 0 ? (
                    <div className='text-muted-foreground py-8 text-center text-sm'>
                      No transactions found
                    </div>
                  ) : (
                    transactions.map((tx, index) => {
                      const isReceive =
                        tx.type === 'DEPOSIT' || tx.type === 'receive'; // Handle both formats if legacy

                      return (
                        <div
                          key={index}
                          className='hover:bg-muted/50 flex items-center justify-between rounded-xl p-3 transition-colors'
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
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className='text-right'>
                            <div
                              className={`text-sm font-medium ${
                                isReceive ? 'text-green-600' : 'text-foreground'
                              }`}
                            >
                              {isReceive ? '+' : '-'} {tx.amount} {tx.currency}
                            </div>
                            <div className='text-muted-foreground text-xs'>
                              {tx.state}
                            </div>
                          </div>
                        </div>
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
      </SheetContent>
    </Sheet>
  );
}
