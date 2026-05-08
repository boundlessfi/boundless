import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getKit } from '@/lib/smartwallet/client';
import { parseWalletError } from '@/lib/smartwallet/errors';

type WalletState = {
  contractId: string | null;
  isConnected: boolean;
  isRestoring: boolean;
  error: string | null;
};

type WalletActions = {
  restoreSession: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setConnected: (contractId: string) => void;
  clearError: () => void;
};

export const useWalletStore = create<WalletState & WalletActions>()(
  devtools(
    set => ({
      contractId: null,
      isConnected: false,
      isRestoring: true,
      error: null,

      restoreSession: async () => {
        set({ isRestoring: true, error: null });
        try {
          const result = await getKit().connectWallet();
          set({
            contractId: result?.contractId ?? null,
            isConnected: !!result,
          });
        } catch {
          // No stored session — not an error on first visit
        } finally {
          set({ isRestoring: false });
        }
      },

      connect: async () => {
        set({ error: null });
        try {
          const result = await getKit().connectWallet({ prompt: true });
          if (result) {
            set({ contractId: result.contractId, isConnected: true });
          }
        } catch (e) {
          set({ error: parseWalletError(e) });
        }
      },

      disconnect: async () => {
        try {
          await getKit().disconnect();
        } finally {
          set({ contractId: null, isConnected: false, error: null });
        }
      },

      setConnected: contractId => {
        set({ contractId, isConnected: true, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'wallet-store' }
  )
);
