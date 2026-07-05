import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Dispute {
  id: string;
  bountyId: string;
  claimantId: string;
  reason: string;
  evidence: string;
  status: 'pending' | 'resolved' | 'rejected';
  resolution?: 'winner' | 'refund' | 'dismiss';
  createdAt: string;
  updatedAt: string;
}

export interface ResolveDisputeInput {
  disputeId: string;
  resolution: 'winner' | 'refund' | 'dismiss';
}

export function useDisputes(orgId: string, bountyId: string) {
  return useQuery({
    queryKey: ['disputes', orgId, bountyId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/organizations/${orgId}/bounties/${bountyId}/disputes`);
      return res.data as Dispute[];
    },
    enabled: !!orgId && !!bountyId,
  });
}

export function useResolveDispute(orgId: string, bountyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ResolveDisputeInput) => {
      const res = await apiClient.post(
        `/api/organizations/${orgId}/bounties/${bountyId}/disputes/${input.disputeId}/resolve`,
        { resolution: input.resolution }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes', orgId, bountyId] });
    },
  });
}
