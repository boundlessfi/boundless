'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useSmartWallet } from '@/components/providers/smart-wallet-provider';
import { useWalletContext } from '@/components/providers/wallet-provider';
import {
  Wallet,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { getExplorerUrl } from '@/lib/wallet-utils';

interface WalletOverviewTabProps {
  walletAddress: string | null;
  walletType: 'smart' | 'custodial' | null;
  smartWalletAddress: string | null;
  smartWalletAvailable: boolean;
}

export default function WalletOverviewTab({
  walletAddress,
  walletType,
  smartWalletAddress,
  smartWalletAvailable,
}: WalletOverviewTabProps) {
  const { register, connect, isLoading: smartWalletLoading } = useSmartWallet();
  const {
    balances,
    totalPortfolioValue,
    custodialWalletAddress,
    refreshWallet,
    syncWallet,
    isRealtimeConnected,
    lastRealtimeUpdate,
  } = useWalletContext();

  const [copied, setCopied] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [updateFlash, setUpdateFlash] = useState(false);
  const prevUpdateRef = useRef(lastRealtimeUpdate);

  // Trigger flash animation on new real-time update
  useEffect(() => {
    if (lastRealtimeUpdate && lastRealtimeUpdate !== prevUpdateRef.current) {
      prevUpdateRef.current = lastRealtimeUpdate;
      setUpdateFlash(true);
      const timeout = setTimeout(() => setUpdateFlash(false), 1_500);
      return () => clearTimeout(timeout);
    }
  }, [lastRealtimeUpdate]);

  const copyAddress = (address: string, label: string) => {
    navigator.clipboard.writeText(address);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncWallet();
      toast.success('Wallet synced');
    } catch {
      toast.error('Failed to sync wallet');
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateSmartWallet = async () => {
    try {
      await register('Boundless User');
      await refreshWallet();
      toast.success('Smart wallet created successfully!');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create smart wallet'
      );
    }
  };

  const handleConnectSmartWallet = async () => {
    try {
      const result = await connect();
      if (result) {
        await refreshWallet();
        toast.success('Smart wallet connected!');
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to connect smart wallet'
      );
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

  return (
    <div className='space-y-6'>
      {/* Wallet Status Card */}
      <div className='rounded-2xl border border-white/5 bg-white/2 p-4 sm:p-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 sm:h-12 sm:w-12'>
              <Wallet className='text-primary h-5 w-5 sm:h-6 sm:w-6' />
            </div>
            <div>
              <h3 className='text-base font-semibold text-white sm:text-lg'>
                {walletType === 'smart' ? 'Smart Wallet' : 'Custodial Wallet'}
              </h3>
              <p className='text-xs text-white/50 sm:text-sm'>
                {walletType === 'smart'
                  ? 'Passkey-secured Soroban smart account'
                  : 'Platform-managed Stellar wallet'}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 sm:gap-3'>
            {/* Real-time connection status */}
            <div
              className='flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/3 px-2.5 py-1.5'
              title={
                isRealtimeConnected
                  ? 'Live updates active — balances update automatically'
                  : 'Live updates disconnected — using manual sync'
              }
            >
              {isRealtimeConnected ? (
                <>
                  <span className='relative flex h-2 w-2'>
                    <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75' />
                    <span className='relative inline-flex h-2 w-2 rounded-full bg-green-500' />
                  </span>
                  <span className='hidden text-xs text-green-400 sm:inline'>
                    Live
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className='h-3 w-3 text-white/30' />
                  <span className='hidden text-xs text-white/30 sm:inline'>
                    Offline
                  </span>
                </>
              )}
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={handleSync}
              disabled={syncing}
              className='w-full gap-2 border-white/10 bg-transparent text-white hover:bg-white/5 sm:w-auto'
            >
              <RefreshCw
                className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`}
              />
              Sync
            </Button>
          </div>
        </div>

        {/* Addresses */}
        <div className='mt-4 space-y-3 sm:mt-6'>
          {smartWalletAddress && (
            <AddressRow
              label='Smart Wallet (C-address)'
              address={smartWalletAddress}
              copied={copied === 'smart'}
              onCopy={() => copyAddress(smartWalletAddress, 'smart')}
              isPrimary={walletType === 'smart'}
            />
          )}
          {custodialWalletAddress && (
            <AddressRow
              label='Custodial Wallet (G-address)'
              address={custodialWalletAddress}
              copied={copied === 'custodial'}
              onCopy={() => copyAddress(custodialWalletAddress, 'custodial')}
              isPrimary={walletType === 'custodial'}
            />
          )}
        </div>
      </div>

      {/* Balances */}
      <div
        className={`rounded-2xl border p-4 transition-all duration-500 sm:p-6 ${
          updateFlash
            ? 'border-green-500/30 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
            : 'border-white/5 bg-white/2'
        }`}
      >
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h3 className='text-base font-semibold text-white sm:text-lg'>
              Balances
            </h3>
            {updateFlash && (
              <span className='rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400'>
                Updated
              </span>
            )}
          </div>
          {totalPortfolioValue > 0 && (
            <span
              className={`text-lg font-bold transition-colors duration-500 sm:text-xl ${
                updateFlash ? 'text-green-400' : 'text-white'
              }`}
            >
              ${totalPortfolioValue.toFixed(2)}
            </span>
          )}
        </div>

        {balances.length > 0 ? (
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3'>
            {balances.map((b, i) => (
              <div
                key={i}
                className='flex items-center justify-between rounded-xl bg-white/3 p-3 sm:p-4'
              >
                <div className='min-w-0'>
                  <span className='text-sm font-medium text-white'>
                    {b.asset_name ??
                      (b.asset_type === 'native'
                        ? 'Stellar Lumens'
                        : b.asset_code || 'XLM')}
                  </span>
                  <span className='ml-1 hidden text-xs text-white/40 sm:inline'>
                    ({b.asset_code || 'XLM'})
                  </span>
                </div>
                <div className='ml-2 shrink-0 text-right'>
                  <div className='font-mono text-sm text-white'>
                    {formatBalance(b.balance)}
                  </div>
                  {b.usdValue != null && b.usdValue > 0 && (
                    <div className='text-xs text-white/40'>
                      ${b.usdValue.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-sm text-white/40'>No balances found</p>
        )}
      </div>

      {/* Smart Wallet Setup */}
      {!smartWalletAddress && smartWalletAvailable && (
        <div className='border-primary/20 bg-primary/5 rounded-2xl border p-4 sm:p-6'>
          <h3 className='text-base font-semibold text-white sm:text-lg'>
            Upgrade to Smart Wallet
          </h3>
          <p className='mt-1 text-xs text-white/50 sm:text-sm'>
            Create a passkey-secured smart account on Soroban. No seed phrases
            needed — your wallet is secured by your device&apos;s biometrics.
          </p>
          <div className='mt-4 flex flex-col gap-3 sm:flex-row'>
            <Button
              onClick={handleCreateSmartWallet}
              disabled={smartWalletLoading}
              className='bg-primary hover:bg-primary/90 w-full text-black sm:w-auto'
            >
              {smartWalletLoading ? 'Creating...' : 'Create Smart Wallet'}
            </Button>
            <Button
              variant='outline'
              onClick={handleConnectSmartWallet}
              disabled={smartWalletLoading}
              className='w-full border-white/10 bg-transparent text-white hover:bg-white/5 sm:w-auto'
            >
              Connect Existing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddressRow({
  label,
  address,
  copied,
  onCopy,
  isPrimary,
}: {
  label: string;
  address: string;
  copied: boolean;
  onCopy: () => void;
  isPrimary: boolean;
}) {
  return (
    <div className='flex flex-col gap-2 rounded-xl bg-white/3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4'>
      <div className='min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-medium text-white sm:text-sm'>
            {label}
          </span>
          {isPrimary && (
            <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-xs'>
              Active
            </span>
          )}
        </div>
        <span className='mt-0.5 block truncate font-mono text-xs text-white/50'>
          <span className='sm:hidden'>
            {address.slice(0, 6)}...{address.slice(-6)}
          </span>
          <span className='hidden sm:inline lg:hidden'>
            {address.slice(0, 10)}...{address.slice(-10)}
          </span>
          <span className='hidden lg:inline'>{address}</span>
        </span>
      </div>
      <div className='flex shrink-0 items-center gap-1'>
        <button
          onClick={onCopy}
          className='rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white'
        >
          {copied ? (
            <Check className='h-4 w-4 text-green-400' />
          ) : (
            <Copy className='h-4 w-4' />
          )}
        </button>
        <a
          href={getExplorerUrl(address)}
          target='_blank'
          rel='noopener noreferrer'
          className='rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white'
        >
          <ExternalLink className='h-4 w-4' />
        </a>
      </div>
    </div>
  );
}
