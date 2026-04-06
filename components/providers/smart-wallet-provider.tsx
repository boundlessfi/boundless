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
  contractId: string | null;
  credentialId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface SmartWalletContextType extends SmartWalletState {
  register: (userName: string) => Promise<string>;
  connect: () => Promise<string | null>;
  disconnect: () => Promise<void>;
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

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (!userId) {
      setContractId(null);
      setCredentialId(null);
      return;
    }

    if (userId !== prevUserId) {
      const persisted = loadPersistedState(userId);

      if (persisted.contractId && persisted.credentialId) {
        setContractId(persisted.contractId);
        setCredentialId(persisted.credentialId);
        import('@/lib/smart-wallet/client').then(({ restoreWalletSession }) => {
          restoreWalletSession(persisted.contractId!, persisted.credentialId!);
        });
      } else {
        walletApi.getSmartWallet().then(remote => {
          if (remote?.contractId && remote?.credentialId) {
            setContractId(remote.contractId);
            setCredentialId(remote.credentialId);
            persistState(userId, remote.contractId, remote.credentialId);
            import('@/lib/smart-wallet/client').then(
              ({ restoreWalletSession }) => {
                restoreWalletSession(remote.contractId!, remote.credentialId!);
              }
            );
          }
        });
      }
    }
  }, [userId]);

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

        await walletApi.registerSmartWallet(
          result.contractId,
          result.credentialId
        );

        setContractId(result.contractId);
        setCredentialId(result.credentialId);
        persistState(userId, result.contractId, result.credentialId);

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
      const storedCredentialId =
        loadPersistedState(userId).credentialId ?? undefined;
      const result = await connectSmartWallet(storedCredentialId);

      if (!result) return null;

      setContractId(result.contractId);
      setCredentialId(result.credentialId);
      persistState(userId, result.contractId, result.credentialId);

      try {
        await walletApi.registerSmartWallet(
          result.contractId,
          result.credentialId
        );
      } catch {
        // non-critical
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
    try {
      const { disconnectSmartWallet } =
        await import('@/lib/smart-wallet/client');
      await disconnectSmartWallet();
    } catch {
      // best-effort
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
