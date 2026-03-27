'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Link2,
  Plus,
  Loader2,
  Trash2,
  Wallet,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  connectExternalWallet,
  disconnectExternalWallet,
  getConnectedExternalWallets,
  type ConnectedWallet,
} from '@/lib/smart-wallet/client';

export default function ExternalWalletsTab() {
  const [wallets, setWallets] = useState<ConnectedWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    try {
      const w = await getConnectedExternalWallets();
      setWallets(w);
    } catch {
      toast.error('Failed to load external wallets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const result = await connectExternalWallet();
      if (result) {
        toast.success(`Connected ${result.walletName || 'external wallet'}`);
        await fetchWallets();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to connect wallet'
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (address: string, walletName: string) => {
    try {
      await disconnectExternalWallet(address);
      toast.success(`Disconnected ${walletName}`);
      await fetchWallets();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to disconnect wallet'
      );
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 className='h-6 w-6 animate-spin text-white/40' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-white'>External Wallets</h3>
          <p className='text-sm text-white/50'>
            Connect Stellar wallets (Freighter, Lobstr, etc.) as delegated
            signers for multi-signature operations.
          </p>
        </div>
        <Button
          size='sm'
          onClick={handleConnect}
          disabled={connecting}
          className='bg-primary hover:bg-primary/90 gap-2 text-black'
        >
          {connecting ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Plus className='h-4 w-4' />
          )}
          Connect Wallet
        </Button>
      </div>

      {wallets.length === 0 ? (
        <div className='rounded-2xl border border-white/5 bg-white/2 p-8 text-center'>
          <Link2 className='mx-auto h-12 w-12 text-white/20' />
          <p className='mt-4 text-sm text-white/40'>
            No external wallets connected. Connect a Stellar wallet to use it as
            a signer for multi-signature transactions.
          </p>
          <Button
            variant='outline'
            onClick={handleConnect}
            disabled={connecting}
            className='mt-4 gap-2 border-white/10 bg-transparent text-white hover:bg-white/5'
          >
            <Plus className='h-4 w-4' />
            Connect Your First Wallet
          </Button>
        </div>
      ) : (
        <div className='space-y-3'>
          {wallets.map(wallet => (
            <div
              key={wallet.address}
              className='flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-5'
            >
              <div className='flex items-center gap-4'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5'>
                  <Wallet className='text-primary h-5 w-5' />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-semibold text-white'>
                      {wallet.walletName}
                    </span>
                    <span className='rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400'>
                      Connected
                    </span>
                  </div>
                  <p className='mt-0.5 font-mono text-xs text-white/40'>
                    {wallet.address.slice(0, 8)}...
                    {wallet.address.slice(-8)}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${wallet.address}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='rounded-lg p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white'
                >
                  <ExternalLink className='h-4 w-4' />
                </a>
                <button
                  onClick={() =>
                    handleDisconnect(wallet.address, wallet.walletName)
                  }
                  className='rounded-lg p-2 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info card */}
      <div className='rounded-2xl border border-white/5 bg-white/2 p-5'>
        <h4 className='text-sm font-semibold text-white'>
          How external wallets work
        </h4>
        <ul className='mt-2 space-y-1 text-sm text-white/40'>
          <li>
            External wallets act as delegated signers on your smart wallet.
          </li>
          <li>
            They can co-sign transactions alongside your passkey for
            multi-signature security.
          </li>
          <li>
            Add them to context rules to define what operations they can
            authorize.
          </li>
        </ul>
      </div>
    </div>
  );
}
