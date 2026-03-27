'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useSmartWallet } from '@/components/providers/smart-wallet-provider';
import { useWalletContext } from '@/components/providers/wallet-provider';
import { Wallet, Copy, Check, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { fetchSacTokenBalance } from '@/lib/smart-wallet/client';
import { networkCurrencies } from '@/lib/smart-wallet/config';

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
  } = useWalletContext();

  const [copied, setCopied] = useState<string | null>(null);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>(
    {}
  );
  const [syncing, setSyncing] = useState(false);

  const currencies = Object.values(networkCurrencies);

  const fetchAllBalances = useCallback(
    async (address: string) => {
      const results: Record<string, string> = {};
      await Promise.all(
        currencies.map(async currency => {
          try {
            results[currency.code] = await fetchSacTokenBalance(
              currency.tokenAddress,
              address
            );
          } catch {
            results[currency.code] = '0.00';
          }
        })
      );
      setTokenBalances(results);
    },
    // currencies is derived from a module-level constant, so no dep needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (smartWalletAddress) {
      fetchAllBalances(smartWalletAddress);
    }
  }, [smartWalletAddress, fetchAllBalances]);

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
      if (smartWalletAddress) {
        await fetchAllBalances(smartWalletAddress);
      }
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

  return (
    <div className='space-y-6'>
      {/* Wallet Status Card */}
      <div className='rounded-2xl border border-white/5 bg-white/2 p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5'>
              <Wallet className='text-primary h-6 w-6' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-white'>
                {walletType === 'smart' ? 'Smart Wallet' : 'Custodial Wallet'}
              </h3>
              <p className='text-sm text-white/50'>
                {walletType === 'smart'
                  ? 'Passkey-secured Soroban smart account'
                  : 'Platform-managed Stellar wallet'}
              </p>
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={handleSync}
            disabled={syncing}
            className='gap-2 border-white/10 bg-transparent text-white hover:bg-white/5'
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>

        {/* Addresses */}
        <div className='mt-6 space-y-3'>
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
      <div className='rounded-2xl border border-white/5 bg-white/2 p-6'>
        <h3 className='mb-4 text-lg font-semibold text-white'>Balances</h3>
        {walletType === 'smart' && Object.keys(tokenBalances).length > 0 && (
          <div className='mb-3 space-y-2'>
            {currencies.map(currency => {
              const bal = tokenBalances[currency.code];
              if (!bal || bal === '0.00') return null;
              return (
                <div
                  key={currency.code}
                  className='flex items-center justify-between rounded-xl bg-white/3 p-4'
                >
                  <div>
                    <span className='text-sm font-medium text-white'>
                      {currency.code}
                    </span>
                    <span className='ml-2 text-xs text-white/40'>
                      ({currency.name})
                    </span>
                  </div>
                  <span className='font-mono text-sm text-white'>{bal}</span>
                </div>
              );
            })}
          </div>
        )}
        {balances.length > 0 ? (
          <div className='space-y-2'>
            {balances.map((b, i) => (
              <div
                key={i}
                className='flex items-center justify-between rounded-xl bg-white/3 p-4'
              >
                <div>
                  <span className='text-sm font-medium text-white'>
                    {b.asset_name ??
                      (b.asset_type === 'native'
                        ? 'Stellar Lumens'
                        : b.asset_code || 'XLM')}
                  </span>
                  <span className='ml-2 text-xs text-white/40'>
                    ({b.asset_code || 'XLM'})
                  </span>
                </div>
                <div className='text-right'>
                  <div className='font-mono text-sm text-white'>
                    {b.balance}
                  </div>
                  {b.usdValue != null && (
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
        {totalPortfolioValue > 0 && (
          <div className='mt-4 flex items-center justify-between border-t border-white/5 pt-4'>
            <span className='text-sm font-medium text-white/60'>
              Total Portfolio
            </span>
            <span className='text-lg font-bold text-white'>
              ${totalPortfolioValue.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Smart Wallet Setup */}
      {!smartWalletAddress && smartWalletAvailable && (
        <div className='border-primary/20 bg-primary/5 rounded-2xl border p-6'>
          <h3 className='text-lg font-semibold text-white'>
            Upgrade to Smart Wallet
          </h3>
          <p className='mt-1 text-sm text-white/50'>
            Create a passkey-secured smart account on Soroban. No seed phrases
            needed — your wallet is secured by your device&apos;s biometrics.
          </p>
          <div className='mt-4 flex gap-3'>
            <Button
              onClick={handleCreateSmartWallet}
              disabled={smartWalletLoading}
              className='bg-primary hover:bg-primary/90 text-black'
            >
              {smartWalletLoading ? 'Creating...' : 'Create Smart Wallet'}
            </Button>
            <Button
              variant='outline'
              onClick={handleConnectSmartWallet}
              disabled={smartWalletLoading}
              className='border-white/10 bg-transparent text-white hover:bg-white/5'
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
  const truncated = `${address.slice(0, 8)}...${address.slice(-8)}`;

  return (
    <div className='flex items-center justify-between rounded-xl bg-white/3 p-4'>
      <div>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-white'>{label}</span>
          {isPrimary && (
            <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium'>
              Active
            </span>
          )}
        </div>
        <span className='mt-1 block font-mono text-xs text-white/50'>
          {truncated}
        </span>
      </div>
      <div className='flex items-center gap-2'>
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
          href={`https://stellar.expert/explorer/testnet/account/${address}`}
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
