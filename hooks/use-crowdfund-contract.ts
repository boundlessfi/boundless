'use client';

import { useCallback } from 'react';
import { useWalletInfo } from '@/hooks/use-wallet';
import crowdfundRegistry from '@/lib/stellar/clients/crowdfundRegistry';
import { parseCrowdfundError } from '@/lib/stellar/errors';

interface TxResult {
  hash: string;
  success: boolean;
}

export function useCrowdfundContract() {
  const walletInfo = useWalletInfo();
  const address = walletInfo?.address || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signAndSubmit = useCallback(async <T>(tx: any): Promise<TxResult> => {
    const { getConnectedKit } = await import('@/lib/smart-wallet/client');
    const kit = await getConnectedKit();
    const result = await kit.signAndSubmit(tx);

    if (!result.success) {
      throw new Error(`Transaction failed: ${result.error || 'Unknown error'}`);
    }

    return { hash: result.hash, success: true };
  }, []);

  const waitForTx = useCallback(
    async (
      txHash: string
    ): Promise<{ status: string; returnValue?: unknown }> => {
      const stellarRpcUrl =
        process.env.NEXT_PUBLIC_STELLAR_RPC_URL ||
        'https://soroban-testnet.stellar.org';
      const { rpc } = await import('@stellar/stellar-sdk');
      const server = new rpc.Server(stellarRpcUrl);

      let txResponse;
      for (let attempt = 0; attempt < 10; attempt++) {
        txResponse = await server.getTransaction(txHash);
        if (txResponse.status === 'SUCCESS') break;
        if (txResponse.status === 'NOT_FOUND') {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        break;
      }

      return {
        status: txResponse?.status || 'NOT_FOUND',
        returnValue:
          txResponse?.status === 'SUCCESS' ? txResponse.returnValue : undefined,
      };
    },
    []
  );

  const pledge = useCallback(
    async (onChainId: string, amount: number): Promise<string> => {
      if (!address) throw new Error('Wallet not connected');

      const tx = await crowdfundRegistry.pledge({
        backer: address,
        campaign_id: BigInt(onChainId),
        amount: BigInt(Math.round(amount * 10_000_000)),
      });

      const result = await signAndSubmit(tx);
      return result.hash;
    },
    [address, signAndSubmit]
  );

  const submitMilestone = useCallback(
    async (onChainId: string, milestoneIndex: number): Promise<string> => {
      if (!address) throw new Error('Wallet not connected');

      const tx = await crowdfundRegistry.submit_milestone({
        campaign_id: BigInt(onChainId),
        milestone_index: milestoneIndex,
      });

      const result = await signAndSubmit(tx);
      return result.hash;
    },
    [address, signAndSubmit]
  );

  const cancelCampaign = useCallback(
    async (onChainId: string): Promise<string> => {
      if (!address) throw new Error('Wallet not connected');

      const tx = await crowdfundRegistry.cancel_campaign({
        campaign_id: BigInt(onChainId),
      });

      const result = await signAndSubmit(tx);
      return result.hash;
    },
    [address, signAndSubmit]
  );

  const disputeMilestone = useCallback(
    async (onChainId: string, milestoneIndex: number): Promise<string> => {
      if (!address) throw new Error('Wallet not connected');

      const tx = await crowdfundRegistry.dispute_milestone({
        disputer: address,
        campaign_id: BigInt(onChainId),
        milestone_index: milestoneIndex,
      });

      const result = await signAndSubmit(tx);
      return result.hash;
    },
    [address, signAndSubmit]
  );

  const voteCampaign = useCallback(
    async (onChainId: string, optionId: number): Promise<string> => {
      if (!address) throw new Error('Wallet not connected');

      const tx = await crowdfundRegistry.vote_campaign({
        voter: address,
        campaign_id: BigInt(onChainId),
        option_id: optionId,
      });

      const result = await signAndSubmit(tx);
      return result.hash;
    },
    [address, signAndSubmit]
  );

  const getCampaignOnChain = useCallback(async (onChainId: string) => {
    const tx = await crowdfundRegistry.get_campaign({
      campaign_id: BigInt(onChainId),
    });
    return tx.result;
  }, []);

  const getPledgeAmount = useCallback(
    async (onChainId: string, backerAddress?: string) => {
      const backer = backerAddress || address;
      if (!backer) throw new Error('No address provided');

      const tx = await crowdfundRegistry.get_pledge({
        campaign_id: BigInt(onChainId),
        backer,
      });
      return tx.result;
    },
    [address]
  );

  const getMilestoneOnChain = useCallback(
    async (onChainId: string, milestoneIndex: number) => {
      const tx = await crowdfundRegistry.get_milestone({
        campaign_id: BigInt(onChainId),
        milestone_index: milestoneIndex,
      });
      return tx.result;
    },
    []
  );

  return {
    address,
    isConnected: !!address,
    pledge,
    submitMilestone,
    cancelCampaign,
    disputeMilestone,
    voteCampaign,
    getCampaignOnChain,
    getPledgeAmount,
    getMilestoneOnChain,
    waitForTx,
    parseCrowdfundError,
  };
}
