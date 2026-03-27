/**
 * Reputation Registry contract client with passkey signing.
 *
 * Uses the generated TypeScript bindings and smart-account-kit
 * to build, sign, and submit transactions via the user's passkey.
 */
import * as ReputationClient from 'reputation-registry';
import { getConnectedKit } from '@/lib/smart-wallet/client';
import { smartWalletConfig } from '@/lib/smart-wallet/config';

const REPUTATION_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS ||
  'CBVQEDH4T5KOJQSESL2HEFI2YZWXPSZQ5TASKRNWAVZFIWAKEU74RFF4';

function getClient() {
  return new ReputationClient.Client({
    contractId: REPUTATION_REGISTRY_ADDRESS,
    networkPassphrase: smartWalletConfig.networkPassphrase,
    rpcUrl: smartWalletConfig.rpcUrl,
  });
}

/**
 * Initialize an on-chain reputation profile for a smart wallet.
 *
 * Builds the `init_profile` transaction, then signs and submits
 * it using the connected passkey via smart-account-kit.
 *
 * @param walletAddress - The smart wallet C-address (contributor)
 * @returns The signed & submitted transaction result
 */
export async function initReputationProfile(walletAddress: string) {
  const client = getClient();

  // Build and simulate the transaction
  const tx = await client.init_profile({ contributor: walletAddress });

  // Sign and submit via passkey
  const kit = await getConnectedKit();
  const result = await kit.signAndSubmit(tx);

  return result;
}
