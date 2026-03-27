/**
 * Smart wallet client — wraps smart-account-kit's SmartAccountKit
 * for passkey-based Soroban smart account operations.
 */
import {
  SmartAccountKit,
  IndexedDBStorage,
  getCredentialIdFromSigner,
  STROOPS_PER_XLM,
} from 'smart-account-kit';
import type {
  SmartAccountKit as SmartAccountKitType,
  StoredCredential,
  ConnectedWallet,
  SelectedSigner,
  ContractSigner,
  ContextRule,
  ContextRuleType,
  ExternalWalletAdapter,
} from 'smart-account-kit';
import { rpc, xdr, Address, scValToNative } from '@stellar/stellar-sdk';
import { smartWalletConfig, nativeTokenContract } from './config';

export type {
  StoredCredential,
  ConnectedWallet,
  SelectedSigner,
  ContractSigner,
  ContextRule,
};
export { getCredentialIdFromSigner };

let _kit: SmartAccountKitType | null = null;
let _walletAdapter: ExternalWalletAdapter | null = null;

/**
 * Try to load and initialize the StellarWalletsKitAdapter.
 * Returns null if @creit-tech/stellar-wallets-kit is not installed (optional peer dep).
 */
async function tryInitWalletAdapter(): Promise<ExternalWalletAdapter | null> {
  try {
    const { StellarWalletsKitAdapter } = await import('smart-account-kit');
    const adapter = new StellarWalletsKitAdapter({
      network: smartWalletConfig.networkPassphrase,
    });
    await adapter.init();
    return adapter;
  } catch {
    // @creit-tech/stellar-wallets-kit not installed — external wallet features unavailable
    return null;
  }
}

/**
 * Lazily create and return the singleton SmartAccountKit instance.
 * Must be called client-side only (uses WebAuthn browser APIs).
 */
export async function getSmartAccountKit(): Promise<SmartAccountKitType> {
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

    // Try to initialize external wallet adapter (optional — requires @creit-tech/stellar-wallets-kit)
    _walletAdapter = await tryInitWalletAdapter();

    _kit = new SmartAccountKit({
      ...smartWalletConfig,
      storage: new IndexedDBStorage(),
      rpName: 'Boundless',
      ...(_walletAdapter ? { externalWallet: _walletAdapter } : {}),
    });

    // Attempt silent session restore from IndexedDB (no prompt)
    try {
      await _kit.connectWallet();
    } catch {
      // No stored session — that's fine, user will connect explicitly
    }
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
  const kit = await getSmartAccountKit();
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
  const kit = await getSmartAccountKit();
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
export async function getConnectedKit(): Promise<SmartAccountKitType> {
  const kit = await getSmartAccountKit();
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
  const kit = await getSmartAccountKit();
  await kit.disconnect();
}

// ---------------------------------------------------------------------------
// Balance fetching — queries SAC token contracts directly via Soroban RPC
// ---------------------------------------------------------------------------

/**
 * Fetch the balance of a SAC token for a smart wallet contract.
 * @param tokenContract - The SAC token contract address (e.g. native XLM SAC)
 * @param walletContractId - The smart wallet C-address
 * @returns Balance as a human-readable string (e.g. "123.45")
 */
export async function fetchSacTokenBalance(
  tokenContract: string,
  walletContractId: string
): Promise<string> {
  const server = new rpc.Server(smartWalletConfig.rpcUrl);
  console.log(smartWalletConfig.rpcUrl);
  const key = xdr.ScVal.scvVec([
    xdr.ScVal.scvSymbol('Balance'),
    new Address(walletContractId).toScVal(),
  ]);

  try {
    const result = await server.getContractData(
      tokenContract,
      key,
      rpc.Durability.Persistent
    );

    const val = result.val.contractData().val();
    const nativeVal = scValToNative(val);

    let amount = nativeVal;
    if (
      typeof nativeVal === 'object' &&
      nativeVal !== null &&
      'amount' in nativeVal
    ) {
      amount = nativeVal.amount;
    }
    console.log(`3333311`);
    return (Number(amount) / STROOPS_PER_XLM).toFixed(2);
  } catch {
    // Key not found means 0 balance
    return '0.00';
  }
}

/**
 * Fetch native XLM balance for a smart wallet.
 */
export async function fetchNativeBalance(
  walletContractId: string
): Promise<string> {
  return fetchSacTokenBalance(nativeTokenContract, walletContractId);
}

// ---------------------------------------------------------------------------
// Signer management
// ---------------------------------------------------------------------------

/**
 * Get all unique signers from on-chain context rules.
 */
export async function getAvailableSigners(): Promise<ContractSigner[]> {
  const kit = await getSmartAccountKit();
  if (!kit.isConnected) return [];
  return kit.multiSigners.getAvailableSigners();
}

/**
 * Add a new passkey signer to a context rule.
 */
export async function addPasskeySigner(
  contextRuleId: number,
  userName: string,
  nickname?: string
) {
  const kit = await getSmartAccountKit();
  return kit.signers.addPasskey(contextRuleId, 'Boundless', userName, {
    nickname,
  });
}

/**
 * Add a delegated (G-address) signer to a context rule.
 */
export async function addDelegatedSigner(
  contextRuleId: number,
  publicKey: string
) {
  const kit = await getSmartAccountKit();
  return kit.signers.addDelegated(contextRuleId, publicKey);
}

/**
 * Remove a signer from a context rule.
 */
export async function removeSigner(
  contextRuleId: number,
  signer: ContractSigner
) {
  const kit = await getSmartAccountKit();
  return kit.signers.remove(contextRuleId, signer);
}

// ---------------------------------------------------------------------------
// External wallet management
// ---------------------------------------------------------------------------

/**
 * Connect an external Stellar wallet (Freighter, Lobstr, etc.)
 * via the StellarWalletsKit modal.
 */
export async function connectExternalWallet(): Promise<ConnectedWallet | null> {
  const kit = await getSmartAccountKit();
  return kit.externalSigners.addFromWallet();
}

/**
 * Disconnect a specific external wallet by address.
 */
export async function disconnectExternalWallet(address: string): Promise<void> {
  const kit = await getSmartAccountKit();
  kit.externalSigners.remove(address);
}

/**
 * Disconnect all external wallets.
 */
export async function disconnectAllExternalWallets(): Promise<void> {
  const kit = await getSmartAccountKit();
  await kit.externalSigners.removeAll();
}

/**
 * Get all connected external wallets.
 */
export async function getConnectedExternalWallets(): Promise<
  ConnectedWallet[]
> {
  const kit = await getSmartAccountKit();
  const signers = kit.externalSigners.getAll();
  return signers.map(s => ({
    address: s.address,
    walletId: s.walletId || (s.type === 'keypair' ? 'keypair' : 'unknown'),
    walletName:
      s.walletName || (s.type === 'keypair' ? 'Secret Key' : 'Unknown Wallet'),
  }));
}

// ---------------------------------------------------------------------------
// Context rules management
// ---------------------------------------------------------------------------

/**
 * Get all context rules of a given type.
 * Defaults to fetching Default rules.
 */
export async function getContextRules(
  contextType?: ContextRuleType
): Promise<ContextRule[]> {
  const kit = await getSmartAccountKit();
  if (!kit.isConnected) return [];

  const type: ContextRuleType = contextType ?? {
    tag: 'Default',
    values: undefined,
  };
  const tx = await kit.rules.getAll(type);
  const result = await tx.simulate();
  return result.result;
}

/**
 * Get stored credentials from IndexedDB.
 */
export async function getStoredCredentials(): Promise<StoredCredential[]> {
  const kit = await getSmartAccountKit();
  return kit.credentials.getAll();
}

// ---------------------------------------------------------------------------
// Multi-signer transfer
// ---------------------------------------------------------------------------

/**
 * Execute a multi-signer token transfer.
 */
export async function multiSignerTransfer(
  tokenContract: string,
  recipient: string,
  amount: number,
  selectedSigners: SelectedSigner[],
  onLog?: (msg: string) => void
) {
  const kit = await getSmartAccountKit();
  return kit.multiSigners.transfer(
    tokenContract,
    recipient,
    amount,
    selectedSigners,
    { onLog }
  );
}

/**
 * Execute a single-signer token transfer.
 */
export async function transfer(
  tokenContract: string,
  recipient: string,
  amount: number,
  credentialId?: string
) {
  const kit = await getSmartAccountKit();
  return kit.transfer(tokenContract, recipient, amount, { credentialId });
}
