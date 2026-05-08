import { SmartAccountKit, IndexedDBStorage } from 'smart-account-kit';
import { walletConfig } from './config';
import { useWalletStore } from '@/lib/stores/walletStore';

let _kit: SmartAccountKit | null = null;

export function getKit(): SmartAccountKit {
  if (typeof window === 'undefined') {
    throw new Error('SmartAccountKit is browser-only.');
  }

  if (!_kit) {
    _kit = new SmartAccountKit({
      ...walletConfig,
      storage: new IndexedDBStorage(),
    });
  }

  return _kit;
}

/**
 * Returns the kit with an active wallet connection, prompting the user if
 * needed. Throws if the user cancels or the connection fails.
 */
export async function getConnectedKit(): Promise<SmartAccountKit> {
  const kit = getKit();
  if (kit.isConnected && useWalletStore.getState().isConnected) return kit;

  await useWalletStore.getState().connect();

  if (!useWalletStore.getState().isConnected) {
    throw new Error(
      useWalletStore.getState().error || 'Wallet connection was cancelled.'
    );
  }
  return kit;
}
