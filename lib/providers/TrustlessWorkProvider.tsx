'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  TrustlessWorkConfig,
  development,
  mainNet,
} from '@trustless-work/escrow';

interface TrustlessWorkProviderProps {
  children: React.ReactNode;
}

interface TrustlessWorkContextValue {
  apiKey: string;
  network: 'testnet' | 'public';
  baseURL: string;
  isConfigured: boolean;
}

const TrustlessWorkContext = createContext<
  TrustlessWorkContextValue | undefined
>(undefined);

/**
 * Trustless Work Provider
 *
 * Provides Trustless Work SDK configuration to the application.
 * Automatically syncs with wallet network (testnet/public).
 *
 * @example
 * ```tsx
 * <TrustlessWorkProvider>
 *   <App />
 * </TrustlessWorkProvider>
 * ```
 */
export function TrustlessWorkProvider({
  children,
}: TrustlessWorkProviderProps) {
  const [apiKey, setApiKey] = useState<string>('');
  // Default to testnet - can be configured via environment variable if needed
  const [network, setNetwork] = useState<'testnet' | 'public'>('testnet');

  // Get API key from environment variable
  useEffect(() => {
    const key =
      process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY ||
      'hFEAgfWW4Ez6NhbE-GaDEw.fff0e0a685f168f7ea5f61ed580ad952d9b6e224f5be9775be4912e79fcb4ab4';
    setApiKey(key);

    // Warn in development if API key is missing
    if (process.env.NODE_ENV === 'development' && !key) {
    }
  }, []);

  // Network can be configured via environment variable
  // Default to testnet for development
  useEffect(() => {
    const envNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK;
    if (envNetwork === 'public' || envNetwork === 'mainnet') {
      setNetwork('public');
    } else {
      setNetwork('testnet');
    }
  }, []);

  // Determine base URL based on network
  const baseURL = network === 'testnet' ? development : mainNet;

  const contextValue: TrustlessWorkContextValue = {
    apiKey,
    network,
    baseURL,
    isConfigured: Boolean(apiKey),
  };

  return (
    <TrustlessWorkContext.Provider value={contextValue}>
      <TrustlessWorkConfig
        baseURL={baseURL}
        apiKey={
          'hFEAgfWW4Ez6NhbE-GaDEw.fff0e0a685f168f7ea5f61ed580ad952d9b6e224f5be9775be4912e79fcb4ab4'
        }
      >
        {children}
      </TrustlessWorkConfig>
    </TrustlessWorkContext.Provider>
  );
}

/**
 * Hook to access Trustless Work configuration
 *
 * @returns TrustlessWorkContextValue - The Trustless Work context value
 * @throws Error if used outside of TrustlessWorkProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { apiKey, network, baseURL, isConfigured } = useTrustlessWorkConfig();
 *
 *   if (!isConfigured) {
 *     return <div>Trustless Work not configured</div>;
 *   }
 *
 *   return <div>Network: {network}</div>;
 * }
 * ```
 */
export function useTrustlessWorkConfig(): TrustlessWorkContextValue {
  const context = useContext(TrustlessWorkContext);

  if (context === undefined) {
    throw new Error(
      'useTrustlessWorkConfig must be used within a TrustlessWorkProvider'
    );
  }

  return context;
}

export { TrustlessWorkContext };
