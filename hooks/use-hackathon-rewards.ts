import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGetEscrowFromIndexerByContractIds } from '@trustless-work/escrow/hooks';
import type {
  GetEscrowFromIndexerByContractIdsParams,
  MultiReleaseEscrow,
} from '@trustless-work/escrow';
import {
  getJudgingSubmissions,
  getHackathon,
  type HackathonEscrowData,
} from '@/lib/api/hackathons';
import { mapJudgingSubmissionsToRewardSubmissions } from '@/lib/utils/rewards-data-mapper';
import { Submission } from '@/components/organization/hackathons/rewards/types';
import { PrizeTier } from '@/components/organization/hackathons/new/tabs/schemas/rewardsSchema';
import { toast } from 'sonner';

const mapEscrowToHackathonEscrowData = (
  escrowData: MultiReleaseEscrow
): HackathonEscrowData => {
  const isFunded = (escrowData.balance || 0) > 0;
  const canUpdate = isFunded;

  return {
    contractId: escrowData.contractId || '',
    escrowAddress: escrowData.contractId || '',
    balance: escrowData.balance || 0,
    milestones:
      escrowData.milestones?.map(milestone => ({
        description: milestone.description || '',
        amount: milestone.amount || 0,
        receiver: milestone.receiver || '',
        status: milestone.status || 'pending',
        evidence: milestone.evidence || '',
        flags: milestone.flags
          ? {
              approved: milestone.flags.approved || false,
              disputed: milestone.flags.disputed || false,
              released: milestone.flags.released || false,
              resolved: milestone.flags.resolved || false,
            }
          : undefined,
      })) || [],
    isFunded,
    canUpdate,
  };
};

const getDefaultPrizeTiers = (): PrizeTier[] => [
  {
    id: 'tier-1',
    place: '1st Place',
    prizeAmount: '0',
    currency: 'USDC',
    passMark: 0,
  },
  {
    id: 'tier-2',
    place: '2nd Place',
    prizeAmount: '0',
    currency: 'USDC',
    passMark: 0,
  },
  {
    id: 'tier-3',
    place: '3rd Place',
    prizeAmount: '0',
    currency: 'USDC',
    passMark: 0,
  },
];

interface UseHackathonRewardsReturn {
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  escrow: HackathonEscrowData | null;
  prizeTiers: PrizeTier[];
  contractId: string | null;
  isLoading: boolean;
  isLoadingEscrow: boolean;
  isLoadingSubmissions: boolean;
  error: string | null;
  refreshEscrow: () => Promise<void>;
}

export const useHackathonRewards = (
  organizationId: string,
  hackathonId: string
): UseHackathonRewardsReturn => {
  const { getEscrowByContractIds } = useGetEscrowFromIndexerByContractIds();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [escrow, setEscrow] = useState<HackathonEscrowData | null>(null);
  const [prizeTiers, setPrizeTiers] = useState<PrizeTier[]>([]);
  const [contractId, setContractId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEscrow, setIsLoadingEscrow] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFetchingEscrowRef = useRef(false);
  const lastFetchedContractIdRef = useRef<string | null>(null);

  const fetchEscrowData = useCallback(
    async (contractIdToFetch: string) => {
      if (
        isFetchingEscrowRef.current ||
        lastFetchedContractIdRef.current === contractIdToFetch
      ) {
        return;
      }

      isFetchingEscrowRef.current = true;
      lastFetchedContractIdRef.current = contractIdToFetch;
      setIsLoadingEscrow(true);

      try {
        const params: GetEscrowFromIndexerByContractIdsParams = {
          contractIds: [contractIdToFetch],
        };

        const response = await getEscrowByContractIds(params);

        let escrows: MultiReleaseEscrow[] = [];

        if (Array.isArray(response)) {
          escrows = response as MultiReleaseEscrow[];
        } else if (
          response &&
          typeof response === 'object' &&
          'escrows' in response
        ) {
          escrows =
            (response as { escrows: MultiReleaseEscrow[] }).escrows || [];
        }

        if (escrows.length > 0) {
          const escrowData = escrows[0] as MultiReleaseEscrow;
          const mappedEscrow = mapEscrowToHackathonEscrowData(escrowData);
          setEscrow(mappedEscrow);
        } else {
          setEscrow(null);
        }
      } catch {
        setEscrow(null);
        lastFetchedContractIdRef.current = null;
      } finally {
        setIsLoadingEscrow(false);
        isFetchingEscrowRef.current = false;
      }
    },
    [getEscrowByContractIds]
  );

  const refreshEscrow = useCallback(async () => {
    if (!contractId) return;
    lastFetchedContractIdRef.current = null;
    await fetchEscrowData(contractId);
  }, [contractId, fetchEscrowData]);

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const response = await getHackathon(organizationId, hackathonId);
        if (response.success) {
          if (response.data.rewards?.prizeTiers) {
            const tiers: PrizeTier[] = response.data.rewards.prizeTiers.map(
              (tier, index) => ({
                id: tier.position || `tier-${index}`,
                place: tier.position || `${index + 1}st Place`,
                prizeAmount: tier.amount?.toString() || '0',
                currency: tier.currency || 'USDC',
                passMark: tier.passMark || 0,
                description: tier.description,
              })
            );
            setPrizeTiers(tiers);
          }

          const hackathonContractId =
            response.data.contractId || response.data.escrowAddress;
          if (hackathonContractId) {
            setContractId(hackathonContractId);
          }
        }
      } catch {
        setPrizeTiers(getDefaultPrizeTiers());
      }
    };

    if (organizationId && hackathonId) {
      fetchHackathon();
    }
  }, [organizationId, hackathonId]);

  useEffect(() => {
    if (contractId) {
      if (escrow && escrow.contractId === contractId) {
        lastFetchedContractIdRef.current = contractId;
        return;
      }
      fetchEscrowData(contractId);
    } else {
      setIsLoadingEscrow(false);
      setEscrow(null);
    }
  }, [contractId, escrow, fetchEscrowData]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoadingSubmissions(true);
      setError(null);
      try {
        const response = await getJudgingSubmissions(
          organizationId,
          hackathonId,
          1,
          100
        );
        if (response.success) {
          const mappedSubmissions = mapJudgingSubmissionsToRewardSubmissions(
            response.data
          );
          setSubmissions(mappedSubmissions);
        } else {
          throw new Error('Failed to fetch submissions');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load submissions';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoadingSubmissions(false);
        setIsLoading(false);
      }
    };

    if (organizationId && hackathonId) {
      fetchSubmissions();
    }
  }, [organizationId, hackathonId]);

  return {
    submissions,
    setSubmissions,
    escrow,
    prizeTiers,
    contractId,
    isLoading,
    isLoadingEscrow,
    isLoadingSubmissions,
    error,
    refreshEscrow,
  };
};
