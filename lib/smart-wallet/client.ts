/**
 * Smart wallet client — wraps smart-account-kit's SmartAccountKit
 * for passkey-based Soroban smart account operations.
 */
import { SmartAccountKit } from 'smart-account-kit';
import type { SmartAccountKit as SmartAccountKitType } from 'smart-account-kit';
import { smartWalletConfig, nativeTokenContract } from './config';

let _kit: SmartAccountKitType | null = null;

/**
 * Lazily create and return the singleton SmartAccountKit instance.
 * Must be called client-side only (uses WebAuthn browser APIs).
 */
export function getSmartAccountKit(): SmartAccountKitType {
  if (!_kit) {
    if (!smartWalletConfig.accountWasmHash) {
      throw new Error(
        'NEXT_PUBLIC_SMART_ACCOUNT_WASM_HASH is not set. ' +
          'Configure the smart account WASM hash first.'
      );
    }
    if (!smartWalletConfig.webauthnVerifierAddress) {
      throw new Error(
        'NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS is not set. ' +
          'Configure the WebAuthn verifier contract address first.'
      );
    }
    _kit = new SmartAccountKit(smartWalletConfig);
  }
  return _kit;
}

/**
 * Register a new passkey and deploy a smart wallet contract.
 * Returns the on-chain contract address (C...) and credential ID.
 */
export async function createSmartWallet(
  appName: string,
  userName: string
): Promise<{ contractId: string; credentialId: string }> {
  const kit = getSmartAccountKit();
  const result = await kit.createWallet(appName, userName, {
    autoSubmit: true,
    autoFund: true,
    nativeTokenContract,
  });
  return {
    contractId: result.contractId,
    credentialId: result.credentialId,
  };
}

/**
 * Connect to an existing smart wallet via passkey authentication.
 * Prompts the browser's passkey UI and returns the contract address.
 */
export async function connectSmartWallet(): Promise<{
  contractId: string;
  credentialId: string;
} | null> {
  const kit = getSmartAccountKit();
  const result = await kit.connectWallet({ prompt: true });
  if (!result) return null;
  return {
    contractId: result.contractId,
    credentialId: result.credentialId,
  };
}

/**
 * Get the connected SmartAccountKit instance for transaction signing.
 * The caller should use kit.sign() or kit.signAndSubmit() with
 * AssembledTransaction objects from the Soroban SDK.
 */
export function getConnectedKit(): SmartAccountKitType {
  const kit = getSmartAccountKit();
  if (!kit.isConnected) {
    throw new Error(
      'Smart wallet is not connected. Call connectSmartWallet() first.'
    );
  }
  return kit;
}

/**
 * Disconnect the smart wallet and clear the stored session.
 */
export async function disconnectSmartWallet(): Promise<void> {
  const kit = getSmartAccountKit();
  await kit.disconnect();
}
