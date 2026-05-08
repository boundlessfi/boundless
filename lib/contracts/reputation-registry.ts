import { getKit } from '@/lib/smartwallet/client';
import { walletConfig } from '@/lib/smartwallet/config';
import reputationRegistry from '../stellar/clients/reputationRegistry';

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
  const tx = await reputationRegistry.init_profile({
    contributor: walletAddress,
  });
  const result = await getKit().signAndSubmit(tx as any);
  return result;
}
