import { useState, useEffect, useCallback } from 'react';
import {
  getRewardDistributionStatus,
  type RewardDistributionStatusResponse,
} from '@/lib/api/hackathons';

interface UseRewardDistributionStatusReturn {
  distributionStatus: RewardDistributionStatusResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRewardDistributionStatus = (
  organizationId: string,
  hackathonId: string
): UseRewardDistributionStatusReturn => {
  const [distributionStatus, setDistributionStatus] =
    useState<RewardDistributionStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!organizationId || !hackathonId) {
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRewardDistributionStatus(
        organizationId,
        hackathonId
      );
      setDistributionStatus(data);
    } catch (err: any) {
      // 404 means "no active distribution" – treat as NOT_TRIGGERED silently
      if (err?.response?.status === 404 || err?.status === 404) {
        setDistributionStatus({
          distributionId: null,
          status: 'NOT_TRIGGERED',
          snapshot: {
            idempotencyKey: '',
            winners: [],
            totalPrizePool: 0,
            platformFee: 0,
            totalRequired: 0,
            currency: 'USDC',
            escrowAddress: '',
            winnersChecksum: '',
            snapshotAt: '',
            organizerNote: null,
          },
          triggeredAt: '',
          adminDecisionAt: null,
          adminNote: null,
          adminUserId: null,
          rejectionReason: null,
          updatedAt: '',
        });
      } else {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch distribution status'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, hackathonId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { distributionStatus, isLoading, error, refetch: fetchStatus };
};
