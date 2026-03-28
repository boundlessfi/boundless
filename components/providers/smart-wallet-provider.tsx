'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { walletApi } from '@/lib/api/wallet';
import { useAuthContext } from '@/components/providers/AuthProvider';

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
  /** Disconnect and clear stored session */
  disconnect: () => Promise<void>;
  /** Whether smart wallet feature is available */
  isAvailable: boolean;
}

const SmartWalletContext = createContext<SmartWalletContextType | undefined>(
  undefined
);

const STORAGE_PREFIX = 'boundless:smart-wallet';

function storageKey(userId: string | null): string {
  return userId ? `${STORAGE_PREFIX}:${userId}` : STORAGE_PREFIX;
}

function loadPersistedState(
  userId: string | null
): Pick<SmartWalletState, 'contractId' | 'credentialId'> {
  if (typeof window === 'undefined' || !userId)
    return { contractId: null, credentialId: null };
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { contractId: null, credentialId: null };
}

function persistState(
  userId: string | null,
  contractId: string | null,
  credentialId: string | null
) {
  if (typeof window === 'undefined' || !userId) return;
  if (contractId && credentialId) {
    localStorage.setItem(
      storageKey(userId),
      JSON.stringify({ contractId, credentialId })
    );
  } else {
    localStorage.removeItem(storageKey(userId));
  }
}

export function SmartWalletProvider({ children }: { children: ReactNode }) {
  const { session } = useAuthContext();
  const userId = session.data?.user?.id ?? null;
  const prevUserIdRef = useRef<string | null>(userId);

  const [contractId, setContractId] = useState<string | null>(null);
  const [credentialId, setCredentialId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load persisted state when userId becomes available or changes
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (!userId) {
      // Logged out — clear state
      setContractId(null);
      setCredentialId(null);
      return;
    }

    // User changed or first load — load this user's persisted wallet
    if (userId !== prevUserId) {
      const persisted = loadPersistedState(userId);
      setContractId(persisted.contractId);
      setCredentialId(persisted.credentialId);
    }
  }, [userId]);

  // Available when config has the required values (either from env or testnet defaults)
  const [isAvailable, setIsAvailable] = useState(false);
  useEffect(() => {
    import('@/lib/smart-wallet/config').then(({ smartWalletConfig: cfg }) => {
      setIsAvailable(!!cfg.accountWasmHash && !!cfg.webauthnVerifierAddress);
    });
  }, []);

  const register = useCallback(
    async (userName: string): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        const { createSmartWallet } = await import('@/lib/smart-wallet/client');
        const result = await createSmartWallet('Boundless', userName);

        setContractId(result.contractId);
        setCredentialId(result.credentialId);
        persistState(userId, result.contractId, result.credentialId);

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
    },
    [userId]
  );

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
      persistState(userId, result.contractId, result.credentialId);

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
  }, [userId]);

  const disconnect = useCallback(async () => {
    setContractId(null);
    setCredentialId(null);
    setError(null);
    persistState(userId, null, null);
    // Disconnect the kit session and clear stored credentials
    try {
      const { disconnectSmartWallet } =
        await import('@/lib/smart-wallet/client');
      await disconnectSmartWallet();
    } catch {
      // Best-effort cleanup
    }
  }, [userId]);

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
