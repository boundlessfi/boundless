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
} from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { formatAddress } from '@/lib/wallet-utils';
import { useState } from 'react';
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
  } = useWalletContext();
  const [copied, setCopied] = useState(false);

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

  if (!walletAddress) return null;

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
            <div className='text-muted-foreground mb-1 text-sm'>
              Portfolio Value
            </div>
            {/* TODO: Calculate total value from price feed */}
            <div className='text-3xl font-bold tracking-tight'>
              {formatUSD(totalPortfolioValue)}
            </div>
            <div className='bg-muted/50 mt-3 flex items-center gap-2 rounded-lg p-2'>
              <code className='text-foreground/80 flex-1 truncate font-mono text-xs'>
                {formatAddress(walletAddress, 12)}
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
                  href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
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

                  <Button
                    variant='outline'
                    className='mt-2 w-full border-dashed'
                  >
                    + Add Asset
                  </Button>
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
                        href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
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
