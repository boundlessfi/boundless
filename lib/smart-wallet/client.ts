/**
 * Smart wallet client — wraps smart-account-kit's SmartAccountKit
 * for passkey-based Soroban smart account operations.
 */
import {
  SmartAccountKit,
  IndexedDBStorage,
  getCredentialIdFromSigner,
  STROOPS_PER_XLM,
  LEDGERS_PER_DAY,
  createDelegatedSigner,
  createWebAuthnSigner,
  createDefaultContext,
  createCallContractContext,
  createCreateContractContext,
  createThresholdParams,
  createSpendingLimitParams,
  createWeightedThresholdParams,
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
import type { PolicyInfo } from './config';

export type {
  StoredCredential,
  ConnectedWallet,
  SelectedSigner,
  ContractSigner,
  ContextRule,
  PolicyInfo,
};
export {
  getCredentialIdFromSigner,
  STROOPS_PER_XLM,
  LEDGERS_PER_DAY,
  createDelegatedSigner,
  createWebAuthnSigner,
};

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

    // Sync credentials — clean up deployed ones, keep pending for retry
    try {
      await _kit.credentials.syncAll();
    } catch {
      // Non-critical — sync can be retried later
    }

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
 * Throws if deployment fails so the caller can handle it.
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

  // Check deployment result — if it failed, throw so caller can handle it
  if (result.submitResult && !result.submitResult.success) {
    throw new Error(
      `Smart wallet deployment failed: ${result.submitResult.error || 'Unknown error'}. ` +
        'The passkey was created but the contract was not deployed. You can retry from wallet settings.'
    );
  }

  return {
    contractId: result.contractId,
    credentialId: result.credentialId,
  };
}

/**
 * Connect to an existing smart wallet via passkey authentication.
 * Prompts the browser's passkey UI, discovers contracts via indexer,
 * and returns the contract address.
 *
 * If multiple contracts are found for the same passkey, the first one
 * is used (a future UX improvement could let the user pick).
 */
export async function connectSmartWallet(): Promise<{
  contractId: string;
  credentialId: string;
} | null> {
  const kit = await getSmartAccountKit();

  // Step 1: Authenticate with passkey to get credential ID
  const { credentialId } = await kit.authenticatePasskey();

  // Step 2: Try to discover contracts via indexer
  const contracts = await kit.discoverContractsByCredential(credentialId);

  if (contracts && contracts.length > 0) {
    // Use the first (or only) contract found via indexer
    const result = await kit.connectWallet({
      contractId: contracts[0].contract_id,
      credentialId,
    });
    if (!result) return null;
    return {
      contractId: result.contractId,
      credentialId: result.credentialId,
    };
  }

  // Step 3: No indexed contracts — fall back to derived contract ID
  const result = await kit.connectWallet({ credentialId });
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

/**
 * Get pending (not yet deployed) credentials.
 */
export async function getPendingCredentials(): Promise<StoredCredential[]> {
  const kit = await getSmartAccountKit();
  return kit.credentials.getPending();
}

/**
 * Deploy a pending credential (retry failed deployment).
 */
export async function deployPendingCredential(
  credentialId: string
): Promise<{ contractId: string; success: boolean; error?: string }> {
  const kit = await getSmartAccountKit();
  const result = await kit.credentials.deploy(credentialId, {
    autoSubmit: true,
  });

  if (result.submitResult?.success) {
    return { contractId: result.contractId, success: true };
  }

  return {
    contractId: result.contractId,
    success: false,
    error: result.submitResult?.error || 'Deployment failed',
  };
}

/**
 * Delete a pending credential from IndexedDB.
 */
export async function deletePendingCredential(
  credentialId: string
): Promise<void> {
  const kit = await getSmartAccountKit();
  await kit.credentials.delete(credentialId);
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

// ---------------------------------------------------------------------------
// Context rule creation & management
// ---------------------------------------------------------------------------

export type ContextTypeOption = 'default' | 'call_contract' | 'create_contract';

/**
 * Build a ContextRuleType from user selection.
 */
function buildContextType(
  contextType: ContextTypeOption,
  contractAddress?: string,
  wasmHash?: string
): ContextRuleType {
  if (contextType === 'call_contract' && contractAddress) {
    return createCallContractContext(contractAddress);
  }
  if (contextType === 'create_contract' && wasmHash) {
    return createCreateContractContext(wasmHash);
  }
  return createDefaultContext();
}

export interface PolicyParams {
  policy: PolicyInfo;
  /** Threshold (M-of-N) */
  threshold?: number;
  /** Spending limit in XLM */
  spendingLimit?: string;
  /** Spending limit period in days */
  spendingPeriodDays?: number;
  /** Weighted threshold minimum weight */
  weightedThreshold?: number;
  /** Signer weights for weighted threshold: Map<signer index, weight> */
  signerWeights?: Map<number, number>;
}

export interface CreateRuleOptions {
  name: string;
  contextType: ContextTypeOption;
  contractAddress?: string;
  wasmHash?: string;
  signers: ContractSigner[];
  policies: PolicyParams[];
  validUntilLedgers?: number;
}

/**
 * Create a new context rule on-chain.
 */
export async function addContextRule(
  options: CreateRuleOptions
): Promise<{ success: boolean; error?: string }> {
  const kit = await getSmartAccountKit();
  if (!kit.isConnected) throw new Error('Smart wallet not connected');

  const ctxType = buildContextType(
    options.contextType,
    options.contractAddress,
    options.wasmHash
  );

  // Build policies map
  const policiesMap = new Map<string, unknown>();
  for (const pp of options.policies) {
    let nativeParams: unknown;
    if (pp.policy.type === 'threshold') {
      nativeParams = createThresholdParams(pp.threshold || 1);
    } else if (pp.policy.type === 'spending_limit') {
      const limitStroops = BigInt(
        Math.floor(parseFloat(pp.spendingLimit || '1000') * STROOPS_PER_XLM)
      );
      const periodLedgers = (pp.spendingPeriodDays || 1) * LEDGERS_PER_DAY;
      nativeParams = createSpendingLimitParams(limitStroops, periodLedgers);
    } else if (pp.policy.type === 'weighted_threshold') {
      nativeParams = createWeightedThresholdParams(
        pp.weightedThreshold || 1,
        new Map()
      );
    } else {
      nativeParams = {};
    }

    if (
      pp.policy.type === 'threshold' ||
      pp.policy.type === 'spending_limit' ||
      pp.policy.type === 'weighted_threshold'
    ) {
      const scValParams = kit.convertPolicyParams(pp.policy.type, nativeParams);
      policiesMap.set(pp.policy.address, scValParams);
    } else {
      policiesMap.set(pp.policy.address, nativeParams);
    }
  }

  // Sort policies by address (Soroban requires sorted ScMap keys)
  const sortedPolicies = new Map(
    [...policiesMap.entries()].sort(([a], [b]) => a.localeCompare(b))
  );

  const tx = await kit.rules.add(
    ctxType,
    options.name.trim(),
    options.signers,
    sortedPolicies,
    options.validUntilLedgers
  );

  return kit.signAndSubmit(tx);
}

/**
 * Remove a context rule by ID.
 */
export async function removeContextRule(
  ruleId: number
): Promise<{ success: boolean; error?: string }> {
  const kit = await getSmartAccountKit();
  if (!kit.isConnected) throw new Error('Smart wallet not connected');

  const tx = await kit.rules.remove(ruleId);
  return kit.signAndSubmit(tx);
}

/**
 * Add a passkey signer to a context rule, creating a new WebAuthn credential.
 */
export async function createPasskeyForRule(
  contextRuleId: number,
  userName: string,
  nickname?: string
) {
  const kit = await getSmartAccountKit();
  if (!kit.isConnected) throw new Error('Smart wallet not connected');

  return kit.signers.addPasskey(contextRuleId, 'Boundless', userName, {
    nickname,
  });
}

/**
 * Create a new passkey credential (without adding to a rule yet).
 * Useful for the rule builder UI.
 */
export async function createCredential(
  nickname: string
): Promise<StoredCredential> {
  const kit = await getSmartAccountKit();
  return kit.credentials.create({ nickname, appName: 'Boundless' });
}

/**
 * Add a policy to an existing context rule.
 */
type KnownPolicyType = 'threshold' | 'spending_limit' | 'weighted_threshold';

export async function addPolicyToRule(
  ruleId: number,
  policyAddress: string,
  policyType: PolicyInfo['type'],
  params: PolicyParams
): Promise<{ success: boolean; error?: string }> {
  const kit = await getSmartAccountKit();
  if (!kit.isConnected) throw new Error('Smart wallet not connected');

  let nativeParams: unknown;
  if (policyType === 'threshold') {
    nativeParams = createThresholdParams(params.threshold || 1);
  } else if (policyType === 'spending_limit') {
    const limitStroops = BigInt(
      Math.floor(parseFloat(params.spendingLimit || '1000') * STROOPS_PER_XLM)
    );
    const periodLedgers = (params.spendingPeriodDays || 1) * LEDGERS_PER_DAY;
    nativeParams = createSpendingLimitParams(limitStroops, periodLedgers);
  } else if (policyType === 'weighted_threshold') {
    nativeParams = createWeightedThresholdParams(
      params.weightedThreshold || 1,
      new Map()
    );
  } else {
    nativeParams = {};
  }

  let scValParams: unknown;
  if (
    policyType === 'threshold' ||
    policyType === 'spending_limit' ||
    policyType === 'weighted_threshold'
  ) {
    scValParams = kit.convertPolicyParams(
      policyType as KnownPolicyType,
      nativeParams
    );
  } else {
    scValParams = nativeParams;
  }

  const tx = await kit.policies.add(ruleId, policyAddress, scValParams);
  return kit.signAndSubmit(tx);
}

/**
 * Remove a policy from a context rule.
 */
export async function removePolicyFromRule(
  ruleId: number,
  policyAddress: string
): Promise<{ success: boolean; error?: string }> {
  const kit = await getSmartAccountKit();
  if (!kit.isConnected) throw new Error('Smart wallet not connected');

  const tx = await kit.policies.remove(ruleId, policyAddress);
  return kit.signAndSubmit(tx);
}

/**
 * Remove a signer from a context rule.
 */
export async function removeSignerFromRule(
  contextRuleId: number,
  signer: ContractSigner
): Promise<{ success: boolean; error?: string }> {
  const kit = await getSmartAccountKit();
  if (!kit.isConnected) throw new Error('Smart wallet not connected');

  const tx = await kit.signers.remove(contextRuleId, signer);
  return kit.signAndSubmit(tx);
}
