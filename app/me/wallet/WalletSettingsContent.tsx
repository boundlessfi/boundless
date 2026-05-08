'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Wallet,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  Building2,
  AlertCircle,
  Receipt,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetIcon } from '@/components/wallet/AssetIcon';
import { useSmartWallet } from '@/hooks/use-smart-wallet';
import { useBalances } from '@/hooks/assets/useBalances';
import { useTransactions } from '@/hooks/transactions/useTransactions';
import {
  formatAddress,
  getExplorerUrl,
  getTransactionExplorerUrl,
} from '@/lib/wallet-utils';

const TRANSACTIONS_PER_PAGE = 8;

function formatBalance(amount: string): string {
  const value = parseFloat(amount);
  if (Number.isNaN(value)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  }).format(value);
}

function formatUsd(amount: string | number): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Math.max(0, Date.now() - date.getTime());
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

type DisconnectedProps = {
  connecting: boolean;
  onConnect: () => void;
};

function DisconnectedState({ connecting, onConnect }: DisconnectedProps) {
  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-10 sm:px-6'>
      <div className='rounded-2xl border border-white/10 bg-white/2 p-8 text-center'>
        <div className='bg-primary/10 border-primary/20 mx-auto flex h-14 w-14 items-center justify-center rounded-full border'>
          <Wallet className='text-primary h-6 w-6' />
        </div>
        <h2 className='mt-4 text-lg font-semibold text-white'>
          Connect your wallet
        </h2>
        <p className='mt-1 text-sm text-white/50'>
          Sign in with your passkey to view your balances and activity.
        </p>
        <Button
          onClick={onConnect}
          disabled={connecting}
          className='bg-primary hover:bg-primary/90 mt-4 text-black'
        >
          {connecting ? 'Connecting…' : 'Connect wallet'}
        </Button>
      </div>
    </div>
  );
}

export default function WalletSettingsContent() {
  const { contractId, connect, isLoading: connecting } = useSmartWallet();
  const balances = useBalances();
  const transactions = useTransactions();
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const handleCopy = () => {
    if (!contractId) return;
    navigator.clipboard.writeText(contractId);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const totalLoaded = transactions.transactions.length;
  const pageTransactions = useMemo(
    () =>
      transactions.transactions.slice(
        currentPage * TRANSACTIONS_PER_PAGE,
        (currentPage + 1) * TRANSACTIONS_PER_PAGE
      ),
    [transactions.transactions, currentPage]
  );
  const loadedPages = Math.max(
    1,
    Math.ceil(totalLoaded / TRANSACTIONS_PER_PAGE)
  );
  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < loadedPages - 1 || transactions.hasNextPage;
  const showPagination =
    totalLoaded > TRANSACTIONS_PER_PAGE || transactions.hasNextPage;

  const handleNext = () => {
    const startOfNext = (currentPage + 1) * TRANSACTIONS_PER_PAGE;
    if (startOfNext >= totalLoaded && transactions.hasNextPage) {
      transactions.fetchNextPage();
    }
    setCurrentPage(p => p + 1);
  };

  const handlePrev = () => {
    setCurrentPage(p => Math.max(0, p - 1));
  };

  if (!contractId) {
    return (
      <DisconnectedState connecting={connecting} onConnect={() => connect()} />
    );
  }

  return (
    <div className='mx-auto w-full px-4 pb-10 sm:px-6 lg:px-8'>
      {/* Sticky page header */}
      <div className='bg-background/80 sticky top-12 z-10 -mx-4 mb-6 border-b border-white/5 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8'>
        <div className='flex items-center justify-between gap-3'>
          <div className='min-w-0'>
            <h1 className='text-xl font-bold text-white sm:text-2xl'>
              My Wallet
            </h1>
          </div>
          <div className='flex items-center gap-1'>
            <div className='hidden items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-white/60 sm:flex'>
              {formatAddress(contractId, 6)}
            </div>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleCopy}
              className='h-8 w-8 text-white/50 hover:text-white'
              title='Copy address'
            >
              {copied ? (
                <Check className='h-4 w-4 text-green-400' />
              ) : (
                <Copy className='h-4 w-4' />
              )}
            </Button>
            <Button
              variant='ghost'
              size='icon'
              asChild
              className='h-8 w-8 text-white/50 hover:text-white'
            >
              <a
                href={getExplorerUrl(contractId)}
                target='_blank'
                rel='noopener noreferrer'
                title='View on explorer'
              >
                <ExternalLink className='h-4 w-4' />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
        {/* Left column */}
        <div className='space-y-4 lg:col-span-2'>
          {/* Portfolio hero */}
          <section className='from-primary/5 relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br via-transparent to-transparent p-5 sm:p-6'>
            <div className='flex items-start justify-between gap-2'>
              <div className='flex flex-wrap items-center gap-2'>
                {balances.isLoading && balances.balances.length === 0 ? (
                  <Skeleton className='h-10 w-40 bg-white/5' />
                ) : (
                  <div className='text-4xl font-bold text-white'>
                    {formatUsd(balances.totalUsd)}
                  </div>
                )}
                <Badge
                  variant='outline'
                  className='border-white/10 bg-white/5 text-[11px] font-medium text-white/40'
                >
                  -- 24h
                </Badge>
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => balances.refetch()}
                className='-mt-1 -mr-1 h-8 w-8 text-white/30 hover:text-white'
                title='Refresh balances'
              >
                <RefreshCw
                  className={`h-4 w-4 ${balances.isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
            <p className='mt-2 text-sm text-white/40'>Total portfolio value</p>
          </section>

          {/* Address pill */}
          <section className='rounded-xl border border-white/10 bg-white/5 px-3 py-2'>
            <div className='text-[10px] font-medium tracking-widest text-white/30 uppercase'>
              Smart Wallet
            </div>
            <div className='mt-1 flex items-center justify-between gap-2'>
              <span className='truncate font-mono text-xs text-white/70'>
                {formatAddress(contractId, 8)}
              </span>
              <div className='flex items-center gap-0.5'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleCopy}
                  className='h-7 w-7 text-white/40 hover:text-white'
                  title='Copy address'
                >
                  {copied ? (
                    <Check className='h-3.5 w-3.5 text-green-400' />
                  ) : (
                    <Copy className='h-3.5 w-3.5' />
                  )}
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  asChild
                  className='h-7 w-7 text-white/40 hover:text-white'
                >
                  <a
                    href={getExplorerUrl(contractId)}
                    target='_blank'
                    rel='noopener noreferrer'
                    title='View on explorer'
                  >
                    <ExternalLink className='h-3.5 w-3.5' />
                  </a>
                </Button>
              </div>
            </div>
          </section>

          {/* Balances */}
          <section className='rounded-2xl border border-white/5 bg-white/2 p-4 sm:p-5'>
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <h2 className='text-sm font-semibold text-white'>Assets</h2>
                {!balances.isLoading && balances.balances.length > 0 && (
                  <Badge
                    variant='outline'
                    className='border-white/10 bg-white/5 px-1.5 py-0 text-[10px] text-white/50'
                  >
                    {balances.balances.length}
                  </Badge>
                )}
              </div>
            </div>

            {balances.isError ? (
              <div className='rounded-xl border border-red-500/30 bg-red-500/5 p-4'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-red-400' />
                  <div className='flex-1'>
                    <p className='text-sm text-red-200'>
                      Could not load balances
                    </p>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => balances.refetch()}
                      className='mt-2 h-7 border border-white/10 bg-white/5 text-xs text-white/70 hover:bg-white/10 hover:text-white'
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            ) : balances.isLoading && balances.balances.length === 0 ? (
              <div className='space-y-1'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between rounded-lg p-2.5'
                  >
                    <div className='flex items-center gap-3'>
                      <Skeleton className='h-10 w-10 rounded-full bg-white/5' />
                      <div className='space-y-1.5'>
                        <Skeleton className='h-3 w-24 bg-white/5' />
                        <Skeleton className='h-2.5 w-12 bg-white/5' />
                      </div>
                    </div>
                    <div className='space-y-1.5 text-right'>
                      <Skeleton className='ml-auto h-3 w-20 bg-white/5' />
                      <Skeleton className='ml-auto h-2.5 w-14 bg-white/5' />
                    </div>
                  </div>
                ))}
              </div>
            ) : balances.balances.length === 0 ? (
              <p className='py-4 text-center text-sm text-white/40'>
                No balances found.
              </p>
            ) : (
              <div className='space-y-0.5'>
                {balances.balances.map(asset => {
                  const isNative = asset.code === 'XLM';
                  const isZero = parseFloat(asset.formatted) === 0;
                  return (
                    <div
                      key={asset.code}
                      className='flex cursor-default items-center justify-between rounded-lg p-2.5 transition-colors duration-150 hover:bg-white/5'
                    >
                      <div className='flex min-w-0 items-center gap-3'>
                        <AssetIcon
                          assetCode={isNative ? 'native' : asset.code}
                          size={40}
                        />
                        <div className='flex min-w-0 items-center gap-1.5'>
                          <div className='truncate text-sm font-medium text-white'>
                            {asset.name}
                          </div>
                          <span className='rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/50'>
                            {asset.code}
                          </span>
                        </div>
                      </div>
                      <div className='ml-2 shrink-0 text-right'>
                        <div
                          className={`font-mono text-sm ${isZero ? 'text-white/30' : 'text-white'}`}
                        >
                          {formatBalance(asset.formatted)}
                        </div>
                        <div className='text-xs text-white/40'>
                          {formatUsd(asset.valueUsd)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right column — Transactions */}
        <div className='lg:col-span-3'>
          <section className='rounded-2xl border border-white/5 bg-white/2 p-4 sm:p-5'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-sm font-semibold text-white'>
                Recent Activity
              </h2>
              <a
                href={getExplorerUrl(contractId)}
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-primary flex items-center gap-1 text-xs text-white/40 transition-colors'
              >
                View on explorer <ExternalLink className='h-3 w-3' />
              </a>
            </div>

            {transactions.isLoading && totalLoaded === 0 ? (
              <div className='space-y-1'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between rounded-lg p-3'
                  >
                    <div className='flex items-center gap-3'>
                      <Skeleton className='h-10 w-10 rounded-full bg-white/5' />
                      <div className='space-y-1.5'>
                        <Skeleton className='h-3 w-20 bg-white/5' />
                        <Skeleton className='h-2.5 w-32 bg-white/5' />
                      </div>
                    </div>
                    <div className='space-y-1.5 text-right'>
                      <Skeleton className='ml-auto h-3 w-24 bg-white/5' />
                      <Skeleton className='ml-auto h-2.5 w-12 bg-white/5' />
                    </div>
                  </div>
                ))}
              </div>
            ) : transactions.isError && totalLoaded === 0 ? (
              <div className='rounded-xl border border-red-500/30 bg-red-500/5 p-4'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-red-400' />
                  <p className='text-sm text-red-200'>
                    Could not load transactions
                  </p>
                </div>
              </div>
            ) : totalLoaded === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5'>
                  <Receipt className='h-5 w-5 text-white/40' />
                </div>
                <p className='mt-3 text-sm text-white/60'>
                  No transactions yet
                </p>
                <p className='mt-1 text-xs text-white/30'>
                  Your activity will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className='space-y-0.5'>
                  {pageTransactions.map(tx => {
                    const isReceive = tx.to === contractId;
                    const counterparty = isReceive ? tx.from : tx.to;
                    const explorerUrl = tx.hash
                      ? getTransactionExplorerUrl(tx.hash)
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
                        key={tx.id}
                        {...wrapperProps}
                        className='group flex items-center justify-between rounded-lg p-3 transition-colors duration-150 hover:bg-white/5'
                      >
                        <div className='flex min-w-0 items-center gap-3'>
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
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
                          <div className='min-w-0'>
                            <div className='flex items-center gap-1.5 text-sm font-medium text-white'>
                              <span>{isReceive ? 'Received' : 'Sent'}</span>
                              <span className='text-xs font-normal text-white/40'>
                                · {formatRelativeDate(tx.createdAt)}
                              </span>
                              {explorerUrl && (
                                <ExternalLink className='h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60' />
                              )}
                            </div>
                            {counterparty && (
                              <div className='truncate font-mono text-xs text-white/30'>
                                {isReceive ? 'from' : 'to'}{' '}
                                {formatAddress(counterparty, 6)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className='ml-2 flex shrink-0 flex-col items-end gap-1'>
                          <div
                            className={`text-sm font-medium ${
                              isReceive ? 'text-green-400' : 'text-white'
                            }`}
                          >
                            {isReceive ? '+' : '-'}
                            {tx.amountFormatted} {tx.asset}
                          </div>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
                              tx.successful
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {tx.successful ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      </Wrapper>
                    );
                  })}
                </div>

                {showPagination && (
                  <div className='mt-4 flex items-center justify-between border-t border-white/5 pt-4'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handlePrev}
                      disabled={!canGoPrev}
                      className='h-8 gap-1 text-xs text-white/60 hover:text-white disabled:opacity-30'
                    >
                      <ArrowLeft className='h-3.5 w-3.5' />
                      Previous
                    </Button>
                    <span className='text-xs text-white/40'>
                      Page {currentPage + 1}
                    </span>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleNext}
                      disabled={!canGoNext || transactions.isFetchingNextPage}
                      className='h-8 gap-1 text-xs text-white/60 hover:text-white disabled:opacity-30'
                    >
                      {transactions.isFetchingNextPage ? 'Loading…' : 'Next'}
                      <ArrowRight className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* Fiat ramp — full width */}
        <section className='rounded-2xl border border-dashed border-white/10 bg-white/2 p-4 sm:p-6 lg:col-span-5'>
          <div className='flex items-start gap-4'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5'>
              <Building2 className='text-primary h-5 w-5' />
            </div>
            <div className='flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <h2 className='text-base font-semibold text-white sm:text-lg'>
                  Fiat On/Off-Ramp
                </h2>
                <Badge
                  variant='outline'
                  className='border-white/10 bg-white/5 px-2 py-0.5 text-[10px] tracking-wide text-white/50 uppercase'
                >
                  Coming soon
                </Badge>
              </div>
              <p className='mt-1 text-sm text-white/50'>
                Top up with a card or bank transfer, and cash out back to fiat —
                directly from this page. Currently in the works.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
