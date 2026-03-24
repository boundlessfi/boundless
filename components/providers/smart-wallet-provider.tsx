'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { walletApi } from '@/lib/api/wallet';

interface SmartWalletState {
  /** The on-chain smart wallet contract address (C...) */
  contractId: string | null;
  /** The passkey credential ID (base64url) */
  credentialId: string | null;
  /** Whether a smart wallet operation is in progress */
  isLoading: boolean;
  /** Last error message */
  error: string | null;
}

interface SmartWalletContextType extends SmartWalletState {
  /** Register a new passkey and deploy a smart wallet */
  register: (userName: string) => Promise<string>;
  /** Connect to an existing smart wallet via passkey */
  connect: () => Promise<string | null>;
  /** Disconnect (clear local state only) */
  disconnect: () => void;
  /** Whether smart wallet feature is available */
  isAvailable: boolean;
}

const SmartWalletContext = createContext<SmartWalletContextType | undefined>(
  undefined
);

const STORAGE_KEY = 'boundless:smart-wallet';

function loadPersistedState(): Pick<
  SmartWalletState,
  'contractId' | 'credentialId'
> {
  if (typeof window === 'undefined')
    return { contractId: null, credentialId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { contractId: null, credentialId: null };
}

function persistState(contractId: string | null, credentialId: string | null) {
  if (typeof window === 'undefined') return;
  if (contractId && credentialId) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ contractId, credentialId })
    );
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function SmartWalletProvider({ children }: { children: ReactNode }) {
  const persisted = loadPersistedState();
  const [contractId, setContractId] = useState<string | null>(
    persisted.contractId
  );
  const [credentialId, setCredentialId] = useState<string | null>(
    persisted.credentialId
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available when config has the required values (either from env or testnet defaults)
  const [isAvailable, setIsAvailable] = useState(false);
  useEffect(() => {
    import('@/lib/smart-wallet/config').then(({ smartWalletConfig: cfg }) => {
      setIsAvailable(!!cfg.accountWasmHash && !!cfg.webauthnVerifierAddress);
    });
  }, []);

  const register = useCallback(async (userName: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const { createSmartWallet } = await import('@/lib/smart-wallet/client');
      const result = await createSmartWallet('Boundless', userName);

      setContractId(result.contractId);
      setCredentialId(result.credentialId);
      persistState(result.contractId, result.credentialId);

      // Register the smart wallet address with the backend
      try {
        await walletApi.registerSmartWallet(
          result.contractId,
          result.credentialId
        );
      } catch {
        // Non-critical: backend registration can be retried later
      }

      return result.contractId;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create smart wallet';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connect = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { connectSmartWallet } = await import('@/lib/smart-wallet/client');
      const result = await connectSmartWallet();

      if (!result) {
        return null;
      }

      setContractId(result.contractId);
      setCredentialId(result.credentialId);
      persistState(result.contractId, result.credentialId);

      // Sync with backend
      try {
        await walletApi.registerSmartWallet(
          result.contractId,
          result.credentialId
        );
      } catch {
        // Non-critical
      }

      return result.contractId;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to connect smart wallet';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setContractId(null);
    setCredentialId(null);
    setError(null);
    persistState(null, null);
    // Also disconnect the kit session
    import('@/lib/smart-wallet/client').then(({ disconnectSmartWallet }) =>
      disconnectSmartWallet().catch(() => {})
    );
  }, []);

  return (
    <SmartWalletContext.Provider
      value={{
        contractId,
        credentialId,
        isLoading,
        error,
        isAvailable,
        register,
        connect,
        disconnect,
      }}
    >
      {children}
    </SmartWalletContext.Provider>
  );
}

export function useSmartWallet() {
  const context = useContext(SmartWalletContext);
  if (!context) {
    throw new Error('useSmartWallet must be used within SmartWalletProvider');
  }
  return context;
}
