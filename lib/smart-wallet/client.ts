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

async function tryInitWalletAdapter(): Promise<ExternalWalletAdapter | null> {
  try {
    const { StellarWalletsKitAdapter } = await import('smart-account-kit');
    const adapter = new StellarWalletsKitAdapter({
      network: smartWalletConfig.networkPassphrase,
    });
    await adapter.init();
    return adapter;
  } catch {
    return null;
  }
}

export async function getSmartAccountKit(): Promise<SmartAccountKitType> {
  if (!_kit) {
    if (!smartWalletConfig.accountWasmHash) {
      throw new Error(
        'NEXT_PUBLIC_SMART_ACCOUNT_WASM_HASH is not set. Configure the smart account WASM hash first.'
      );
    }
    if (!smartWalletConfig.webauthnVerifierAddress) {
      throw new Error(
        'NEXT_PUBLIC_WEBAUTHN_VERIFIER_ADDRESS is not set. Configure the WebAuthn verifier contract address first.'
      );
    }

    _walletAdapter = await tryInitWalletAdapter();

    _kit = new SmartAccountKit({
      ...smartWalletConfig,
      storage: new IndexedDBStorage(),
      rpName: 'Boundless',
      ...(_walletAdapter ? { externalWallet: _walletAdapter } : {}),
    });

    try {
      await _kit.credentials.syncAll();
    } catch {
      // non-critical
    }

    try {
      await _kit.connectWallet();
    } catch {
      // no stored session
    }
  }
  return _kit;
}

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

export async function restoreWalletSession(
  contractId: string,
  credentialId: string
): Promise<boolean> {
  try {
    const kit = await getSmartAccountKit();
    const result = await kit.connectWallet({ contractId, credentialId });
    return !!result;
  } catch {
    return false;
  }
}

export async function connectSmartWallet(credentialId?: string): Promise<{
  contractId: string;
  credentialId: string;
} | null> {
  const kit = await getSmartAccountKit();

  if (credentialId) {
    const contracts = await kit.discoverContractsByCredential(credentialId);

    if (contracts && contracts.length > 0) {
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

    const result = await kit.connectWallet({ credentialId });
    if (!result) return null;
    return { contractId: result.contractId, credentialId: result.credentialId };
  }

  const { credentialId: authedCredId } = await kit.authenticatePasskey();
  const contracts = await kit.discoverContractsByCredential(authedCredId);

  if (contracts && contracts.length > 0) {
    const result = await kit.connectWallet({
      contractId: contracts[0].contract_id,
      credentialId: authedCredId,
    });
    if (!result) return null;
    return { contractId: result.contractId, credentialId: result.credentialId };
  }

  const result = await kit.connectWallet({ credentialId: authedCredId });
  if (!result) return null;
  return { contractId: result.contractId, credentialId: result.credentialId };
}

export async function getConnectedKit(): Promise<SmartAccountKitType> {
  const kit = await getSmartAccountKit();
  if (!kit.isConnected) {
    throw new Error(
      'Smart wallet is not connected. Call connectSmartWallet() first.'
    );
  }
  return kit;
}

export async function disconnectSmartWallet(): Promise<void> {
  const kit = await getSmartAccountKit();
  await kit.disconnect();
}

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
    return '0.00';
  }
}

export async function fetchNativeBalance(
  walletContractId: string
): Promise<string> {
  return fetchSacTokenBalance(nativeTokenContract, walletContractId);
}

export async function getAvailableSigners(): Promise<ContractSigner[]> {
  const kit = await getSmartAccountKit();
  if (!kit.isConnected) return [];
  return kit.multiSigners.getAvailableSigners();
}

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

export async function addDelegatedSigner(
  contextRuleId: number,
  publicKey: string
) {
  const kit = await getSmartAccountKit();
  return kit.signers.addDelegated(contextRuleId, publicKey);
}

export async function removeSigner(
  contextRuleId: number,
  signer: ContractSigner
) {
  const kit = await getSmartAccountKit();
  return kit.signers.remove(contextRuleId, signer);
}

export async function connectExternalWallet(): Promise<ConnectedWallet | null> {
  const kit = await getSmartAccountKit();
  return kit.externalSigners.addFromWallet();
}

export async function disconnectExternalWallet(address: string): Promise<void> {
  const kit = await getSmartAccountKit();
  kit.externalSigners.remove(address);
}

export async function disconnectAllExternalWallets(): Promise<void> {
  const kit = await getSmartAccountKit();
  await kit.externalSigners.removeAll();
}

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

export async function getStoredCredentials(): Promise<StoredCredential[]> {
  const kit = await getSmartAccountKit();
  return kit.credentials.getAll();
}

export async function getPendingCredentials(): Promise<StoredCredential[]> {
  const kit = await getSmartAccountKit();
  return kit.credentials.getPending();
}

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

export async function deletePendingCredential(
  credentialId: string
): Promise<void> {
  const kit = await getSmartAccountKit();
  await kit.credentials.delete(credentialId);
}

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

export async function transfer(
  tokenContract: string,
  recipient: string,
  amount: number,
  credentialId?: string
) {
  const kit = await getSmartAccountKit();
  return kit.transfer(tokenContract, recipient, amount, { credentialId });
}

export type ContextTypeOption = 'default' | 'call_contract' | 'create_contract';

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
  threshold?: number;
  spendingLimit?: string;
  spendingPeriodDays?: number;
  weightedThreshold?: number;
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
      policiesMap.set(
        pp.policy.address,
        kit.convertPolicyParams(pp.policy.type, nativeParams)
      );
    } else {
      policiesMap.set(pp.policy.address, nativeParams);
    }
  }

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

export async function removeContextRule(
  ruleId: number
): Promise<{ success: boolean; error?: string }> {
  const kit = await getSmartAccountKit();
  if (!kit.isConnected) throw new Error('Smart wallet not connected');

  const tx = await kit.rules.remove(ruleId);
  return kit.signAndSubmit(tx);
}

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

export async function createCredential(
  nickname: string
): Promise<StoredCredential> {
  const kit = await getSmartAccountKit();
  return kit.credentials.create({ nickname, appName: 'Boundless' });
}

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

export async function removePolicyFromRule(
  ruleId: number,
  policyAddress: string
): Promise<{ success: boolean; error?: string }> {
  const kit = await getSmartAccountKit();
  if (!kit.isConnected) throw new Error('Smart wallet not connected');

  const tx = await kit.policies.remove(ruleId, policyAddress);
  return kit.signAndSubmit(tx);
}

export async function removeSignerFromRule(
  contextRuleId: number,
  signer: ContractSigner
): Promise<{ success: boolean; error?: string }> {
  const kit = await getSmartAccountKit();
  if (!kit.isConnected) throw new Error('Smart wallet not connected');

  const tx = await kit.signers.remove(contextRuleId, signer);
  return kit.signAndSubmit(tx);
}
